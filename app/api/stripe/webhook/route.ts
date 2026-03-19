import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function updateUserPlan(
  userId: string,
  plan: "free" | "pro",
  status: string,
  customerId?: string
) {
  const update: any = { plan, subscription_status: status };
  if (customerId) update.stripe_customer_id = customerId;
  await supabaseAdmin.from("profiles").update(update).eq("user_id", userId);
}

async function getUserIdFromCustomer(customerId: string): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from("profiles")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .single();
  if (data?.user_id) return data.user_id;
  const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
  return customer.metadata?.supabase_user_id || null;
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error("Webhook signature error:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.supabase_user_id ||
          await getUserIdFromCustomer(session.customer as string);
        if (userId) await updateUserPlan(userId, "pro", "active", session.customer as string);
        break;
      }
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const userId = await getUserIdFromCustomer(invoice.customer as string);
        if (userId) await updateUserPlan(userId, "pro", "active");
        break;
      }
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = await getUserIdFromCustomer(sub.customer as string);
        if (userId) {
          const isActive = ["active", "trialing"].includes(sub.status);
          await updateUserPlan(userId, isActive ? "pro" : "free", sub.status);
        }
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = await getUserIdFromCustomer(sub.customer as string);
        if (userId) await updateUserPlan(userId, "free", "cancelled");
        break;
      }
      default:
        break;
    }
  } catch (err: any) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
