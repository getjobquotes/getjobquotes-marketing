import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);
export const FROM = "GetJobQuotes <hello@getjobquotes.uk>";
export const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://getjobquotes.uk").replace(/\/$/, "");

// Shared branded HTML wrapper
export function emailWrapper(content: string, previewText = "") {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>GetJobQuotes</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  ${previewText ? `<div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#f4f4f6;">${previewText}</div>` : ""}
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f6;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

        <!-- Logo -->
        <tr><td style="padding-bottom:24px;text-align:center;">
          <span style="font-size:22px;font-weight:800;color:#111114;">
            <span style="color:#16a34a;">Get</span>JobQuotes
          </span>
        </td></tr>

        <!-- Card -->
        <tr><td style="background:#ffffff;border-radius:16px;padding:40px;border:1px solid #e2e2e7;">
          ${content}
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding-top:24px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#8a8a93;">
            GetJobQuotes · <a href="${APP_URL}" style="color:#16a34a;text-decoration:none;">getjobquotes.uk</a>
          </p>
          <p style="margin:6px 0 0;font-size:11px;color:#aaaab3;">
            You're receiving this because you have an account at GetJobQuotes.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// Button helper
export function btn(text: string, url: string) {
  return `<a href="${url}" style="display:inline-block;padding:14px 28px;background:#16a34a;color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;border-radius:10px;margin:20px 0;">${text}</a>`;
}

// Heading helper
export function h1(text: string) {
  return `<h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#111114;line-height:1.2;">${text}</h1>`;
}

export function p(text: string, muted = false) {
  return `<p style="margin:12px 0;font-size:15px;line-height:1.6;color:${muted ? "#8a8a93" : "#3a3a45"};">${text}</p>`;
}

export function divider() {
  return `<hr style="border:none;border-top:1px solid #e2e2e7;margin:24px 0;" />`;
}
