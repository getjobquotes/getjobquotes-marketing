#!/bin/bash
# Run from ~/projects/getjobquotes-marketing
# bash fix-draft-autosave.sh

echo "🔧 Adding draft auto-save..."

# Patch the tool page to add auto-save draft functionality
# We'll add it after the existing useEffect for init

cat > /tmp/patch.py << 'PYEOF'
import sys

with open("app/tool/page.tsx", "r") as f:
    content = f.read()

# 1. Add draft state variables after saved state
old = "  const [saved, setSaved] = useState(false);"
new = """  const [saved, setSaved] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);"""
content = content.replace(old, new, 1)

# 2. Add localStorage draft save/load after the init useEffect closing brace
old = "    init();\n  }, []);"
new = """    init();
  }, []);

  // Auto-save draft to localStorage every 30 seconds
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      const draft = { form, lineItems, template, sigData, savedAt: new Date().toISOString() };
      localStorage.setItem("gjq_draft_quote", JSON.stringify(draft));
      setLastSaved(new Date());
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 2000);
    }, 30000);
    return () => clearInterval(interval);
  }, [user, form, lineItems, template, sigData]);

  // Load draft on mount if no editId
  useEffect(() => {
    if (editId) return;
    const raw = localStorage.getItem("gjq_draft_quote");
    if (!raw) return;
    try {
      const draft = JSON.parse(raw);
      const savedAt = new Date(draft.savedAt);
      const ageHours = (Date.now() - savedAt.getTime()) / 1000 / 60 / 60;
      if (ageHours < 24 && draft.form?.clientName) {
        const restore = window.confirm(
          `You have an unfinished quote for "${draft.form.clientName}" from ${savedAt.toLocaleTimeString("en-GB")}. Restore it?`
        );
        if (restore) {
          setForm(draft.form);
          setLineItems(draft.lineItems || [{ description: "", quantity: 1, unitPrice: 0 }]);
          if (draft.template) setTemplate(draft.template);
          if (draft.sigData) { setSigData(draft.sigData); setHasSig(true); }
        } else {
          localStorage.removeItem("gjq_draft_quote");
        }
      }
    } catch {}
  }, [user]);"""
content = content.replace(old, new, 1)

# 3. Clear draft on successful save
old = "    setSaved(true);\n      setTimeout(() => router.push(\"/dashboard\"), 1500);"
new = """    setSaved(true);
      localStorage.removeItem("gjq_draft_quote");
      setTimeout(() => router.push("/dashboard"), 1500);"""
content = content.replace(old, new, 1)

# 4. Add draft indicator before the save button section
old = "        {/* Actions */}"
new = """        {/* Draft indicator */}
        <div className="flex items-center justify-between text-xs text-zinc-600">
          <span>
            {lastSaved
              ? `Draft auto-saved at ${lastSaved.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`
              : "Changes auto-save every 30 seconds"}
          </span>
          {draftSaved && <span className="text-green-500">✓ Draft saved</span>}
        </div>

        {/* Actions */}"""
content = content.replace(old, new, 1)

with open("app/tool/page.tsx", "w") as f:
    f.write(content)

print("✅ Draft auto-save added to tool page")
PYEOF

python3 /tmp/patch.py

git add app/tool/page.tsx
git commit -m "feat: auto-save draft every 30s, restore unfinished quotes, clear on save"
git push origin main

echo ""
echo "✅ Done! Also run this in Supabase SQL Editor if not done yet:"
echo ""
echo "ALTER TABLE documents ADD COLUMN IF NOT EXISTS line_items jsonb DEFAULT '[]';"
echo "ALTER TABLE documents ADD COLUMN IF NOT EXISTS notes text;"
echo "ALTER TABLE documents ADD COLUMN IF NOT EXISTS signature_data text;"
echo "ALTER TABLE documents ADD COLUMN IF NOT EXISTS paid_at timestamptz;"
