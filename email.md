# Secure Email Change Feature — Walkthrough

## What Was Implemented

A complete, production-grade secure email change system integrated into the `/profile` page.

---

## Files Created / Modified

### Backend

| File | Action | Description |
|---|---|---|
| [user/dto/request-email-change.input.ts](file:///c:/Users/Jovan/.codex/worktrees/3b23/ReLive-CreativityInnovation/apps/backend/src/user/dto/request-email-change.input.ts) | NEW | DTO for [requestEmailChange](file:///c:/Users/Jovan/.codex/worktrees/3b23/ReLive-CreativityInnovation/apps/backend/src/user/user.service.ts#103-187) mutation: `newEmail`, optional `currentPassword`, optional `overwriteAlternate` |
| [user/dto/request-email-change.response.ts](file:///c:/Users/Jovan/.codex/worktrees/3b23/ReLive-CreativityInnovation/apps/backend/src/user/dto/request-email-change.response.ts) | NEW | Returns `status` (`VERIFICATION_SENT` or `ALTERNATE_ACCOUNT_EXISTS`) and optional message |
| [user/dto/verify-email-change.response.ts](file:///c:/Users/Jovan/.codex/worktrees/3b23/ReLive-CreativityInnovation/apps/backend/src/user/dto/verify-email-change.response.ts) | NEW | Returns confirmation `message` |
| [user/user.service.ts](file:///c:/Users/Jovan/.codex/worktrees/3b23/ReLive-CreativityInnovation/apps/backend/src/user/user.service.ts) | MODIFIED | Added [requestEmailChange](file:///c:/Users/Jovan/.codex/worktrees/3b23/ReLive-CreativityInnovation/apps/backend/src/user/user.service.ts#103-187) and [verifyEmailChange](file:///c:/Users/Jovan/.codex/worktrees/3b23/ReLive-CreativityInnovation/apps/backend/src/user/user.service.ts#188-235) methods |
| [user/user.resolver.ts](file:///c:/Users/Jovan/.codex/worktrees/3b23/ReLive-CreativityInnovation/apps/backend/src/user/user.resolver.ts) | MODIFIED | Exposed [requestEmailChange](file:///c:/Users/Jovan/.codex/worktrees/3b23/ReLive-CreativityInnovation/apps/backend/src/user/user.service.ts#103-187) and [verifyEmailChange](file:///c:/Users/Jovan/.codex/worktrees/3b23/ReLive-CreativityInnovation/apps/backend/src/user/user.service.ts#188-235) mutations, extracts userId from JWT context |
| [mail/templates/emailChange.html](file:///c:/Users/Jovan/.codex/worktrees/3b23/ReLive-CreativityInnovation/apps/backend/src/mail/templates/emailChange.html) | NEW | Styled email sent to **new** email with the verify link |
| [mail/templates/emailChangedAlert.html](file:///c:/Users/Jovan/.codex/worktrees/3b23/ReLive-CreativityInnovation/apps/backend/src/mail/templates/emailChangedAlert.html) | NEW | Security alert sent to **old** email after successful change |

### Frontend

| File | Action | Description |
|---|---|---|
| [lib/gqlQueries.ts](file:///c:/Users/Jovan/.codex/worktrees/3b23/ReLive-CreativityInnovation/apps/frontend/lib/gqlQueries.ts) | MODIFIED | Added `REQUEST_EMAIL_CHANGE_MUTATION` and `VERIFY_EMAIL_CHANGE_MUTATION` |
| [app/api/email-change/route.ts](file:///c:/Users/Jovan/.codex/worktrees/3b23/ReLive-CreativityInnovation/apps/frontend/app/api/email-change/route.ts) | NEW | Server-side proxy that reads the httpOnly session cookie and forwards to backend |
| [app/auth/verify-email/page.tsx](file:///c:/Users/Jovan/.codex/worktrees/3b23/ReLive-CreativityInnovation/apps/frontend/app/auth/verify-email/page.tsx) | NEW | Server page wrapping the client in Suspense for `useSearchParams` |
| [components/auth/VerifyEmailClient.tsx](file:///c:/Users/Jovan/.codex/worktrees/3b23/ReLive-CreativityInnovation/apps/frontend/components/auth/VerifyEmailClient.tsx) | NEW | Auto-verifies the token and shows loading → success/error state |
| [components/profile/ProfilePageClient.tsx](file:///c:/Users/Jovan/.codex/worktrees/3b23/ReLive-CreativityInnovation/apps/frontend/components/profile/ProfilePageClient.tsx) | MODIFIED | Replaced email field with full [ChangeEmailField](file:///c:/Users/Jovan/.codex/worktrees/3b23/ReLive-CreativityInnovation/apps/frontend/components/profile/ProfilePageClient.tsx#496-823) including two modal stages and toast |

---

## Full User Flow

### Normal Email Change

```
User edits email on /profile
  → Clicks "Continue"
  → Password Confirmation Modal appears
  → Enters password → Clicks "Send Verification"
  → POST /api/email-change (server proxy)
  → Backend signs 15-minute JWT, sends email to NEW address
  → Toast: "Verification email sent"
  → User clicks link → /auth/verify-email?token=...
  → Token verified, email updated in DB
  → Security alert sent to OLD email
  → User sees success screen → clicks "Sign In with New Email"
```

### Alternate Account Conflict Flow

```
Same as above, but after password confirmation:
  → Backend returns ALTERNATE_ACCOUNT_EXISTS
  → Overwrite Warning Modal appears (red, destructive UI)
  → User clicks "Confirm & Delete Other Account"
  → Backend deletes alternate account, signs a new JWT
  → Verification email sent to new address
  → On verify: alternate account removed, current account takes email
  → Security alert still sent to OLD email
```

### Security Guards

- **Wrong password** → Rejected immediately with "Invalid current password"  
- **Expired token (>15min)** → Rejected with "Invalid or expired email change link"  
- **Same Email submitted** → Rejected with "New email must be different"  
- **httpOnly cookie** → Cannot be read by client JS; all auth forwarding goes through `/api/email-change` server proxy

---

## Testing Instructions

Run the dev server with:
```
pnpm dev
```

Then follow the test cases from the implementation plan:
1. Normal change flow
2. Wrong password rejection
3. Alternate account modal → Cancel → no change
4. Alternate account modal → Confirm → alternate account deleted
5. Token expiry (wait 16 min) → rejected
