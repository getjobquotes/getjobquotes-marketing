// NOTE: password login (signInWithPassword) doesn't go through
// /auth/callback — the user is signed in directly on the page.
// So we do the same profile-existence check here for that flow.
//
// Magic link     → /auth/callback ✅ (welcome handled there)
// Google OAuth   → /auth/callback ✅ (welcome handled there)
// Password login → auth/page.tsx  ✅ (welcome handled below)
// Password signup→ user verifies email → /auth/callback ✅
