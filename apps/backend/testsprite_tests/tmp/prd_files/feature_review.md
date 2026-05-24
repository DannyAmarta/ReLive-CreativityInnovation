# ReLive — Feature Implementation Review

> Monorepo: **NestJS (GraphQL + REST) backend** · **Next.js 15 App Router frontend** · **Anchor/Solana smart contract**  
> Reviewed: 2026-05-24

---

## 🔐 Authentication & Session

### 1. Email / Password Registration (email-verified)
User registers → backend signs a short-lived JWT carrying the hashed password → activation link is emailed → clicking it creates the actual DB row. Unverified emails never become real accounts.
- Backend: [`auth.service.ts`](file:///c:/Users/VICTUS/coding/GitHub/ReLive-CreativityInnovation/apps/backend/src/auth/auth.service.ts) · [`user.service.ts`](file:///c:/Users/VICTUS/coding/GitHub/ReLive-CreativityInnovation/apps/backend/src/user/user.service.ts)
- Frontend: [`/auth/register`](file:///c:/Users/VICTUS/coding/GitHub/ReLive-CreativityInnovation/apps/frontend/app/auth/register)

### 2. Local Email / Password Login (JWT)
Credentials are validated with Argon2 password verification; on success a signed JWT (containing `userId` + `role`) is returned and stored in an HttpOnly session cookie. The Next.js middleware verifies the cookie on every protected route.
- Backend: `auth.service.ts → validateLocalUser()`, `generateToken()`
- Frontend: [`middleware.ts`](file:///c:/Users/VICTUS/coding/GitHub/ReLive-CreativityInnovation/apps/frontend/middleware.ts) · [`/auth/login`](file:///c:/Users/VICTUS/coding/GitHub/ReLive-CreativityInnovation/apps/frontend/app/auth/login)

### 3. Google OAuth Login
Passport Google strategy handles the OAuth flow; on redirect a one-time opaque handoff code (2-minute TTL) is created server-side so the raw access token never appears in the browser URL. The code is exchanged for the full auth payload via a Next.js API route.
- Backend: [`auth.service.ts → createGoogleAuthHandoff()`](file:///c:/Users/VICTUS/coding/GitHub/ReLive-CreativityInnovation/apps/backend/src/auth/auth.service.ts#L187-L199)
- Frontend: [`/app/api`](file:///c:/Users/VICTUS/coding/GitHub/ReLive-CreativityInnovation/apps/frontend/app/api)

### 4. Forgot Password / Reset Password
User submits their email → a 15-minute signed JWT (purpose-locked to `password_reset`) is emailed as a clickable link → user submits new password → token is verified, Argon2 hash updated. The email is never disclosed even if it doesn't exist (generic response).
- Backend: `auth.service.ts → forgotPassword()`, `resetPassword()`
- Frontend: [`/auth/forgot-password`](file:///c:/Users/VICTUS/coding/GitHub/ReLive-CreativityInnovation/apps/frontend/app/auth/forgot-password) · [`/auth/reset-password`](file:///c:/Users/VICTUS/coding/GitHub/ReLive-CreativityInnovation/apps/frontend/app/auth/reset-password)

### 5. Email Change Flow
Authenticated user requests an email change (optionally with current-password verification) → a verification link is sent to the **new** address → on click the old account is optionally deleted if the new email was already in use → security-alert email sent to the old address.
- Backend: [`user.service.ts → requestEmailChange()`, `verifyEmailChange()`](file:///c:/Users/VICTUS/coding/GitHub/ReLive-CreativityInnovation/apps/backend/src/user/user.service.ts#L204-L331)

### 6. Account Deletion (Code-Confirmed)
User requests deletion → backend emails a 6-digit code and returns a short-lived `verifyToken` → user submits both back → HMAC-verified; on match, the user record is permanently deleted.
- Backend: `user.service.ts → requestAccountDeletionCode()`, `confirmAccountDeletion()`

---

## 👤 User Profile

### 7. View / Edit Profile
`getMe` GraphQL query returns all non-sensitive user fields. `updateProfile` mutation accepts any subset of fields (name, bio, fitnessLevel, dailyActivity, primaryGoal, etc.) and updates them atomically.
- Backend: [`user.service.ts`](file:///c:/Users/VICTUS/coding/GitHub/ReLive-CreativityInnovation/apps/backend/src/user/user.service.ts)
- Frontend: [`/profile`](file:///c:/Users/VICTUS/coding/GitHub/ReLive-CreativityInnovation/apps/frontend/app/(home)/profile)

### 8. Avatar Upload
Multipart upload endpoint saves the file to `/uploads/avatars/`; the avatar URL is written to the user record. Served as a static asset path.
- Backend: `user.service.ts → updateAvatar()` · `user.controller.ts`

### 9. OpenRouter API Key Connection (BYOK)
User initiates a PKCE OAuth flow to OpenRouter → backend exchanges the code server-side → API key is encrypted with AES-256-GCM and stored; only the masked label is shown in the UI. Users can disconnect at any time.
- Backend: [`auth.service.ts → exchangeOpenRouterCode()`](file:///c:/Users/VICTUS/coding/GitHub/ReLive-CreativityInnovation/apps/backend/src/auth/auth.service.ts#L272-L322)
- Frontend: [`/profile/openrouter`](file:///c:/Users/VICTUS/coding/GitHub/ReLive-CreativityInnovation/apps/frontend/app/(home)/profile)

---

## 🏋️ Workout Tracking (Set / Exercise Logging)

### 10. Exercise Catalog
A static in-code catalog (`SET_EXERCISE_CATALOG`) lists all supported exercises with their category (strength vs. cardio) and required formula. Catalog entries are synced into the database on startup.
- Backend: [`set-exercise.catalog.ts`](file:///c:/Users/VICTUS/coding/GitHub/ReLive-CreativityInnovation/apps/backend/src/set/set-exercise.catalog.ts)

### 11. Set Calculation (Estimated 1RM / Cardio Score)
Given weight + reps + RIR (Reps In Reserve), the set strategy calculates the estimated one-rep max using the configured formula (e.g., Epley, Brzycki). For cardio, duration + RPE produces an effort score.
- Backend: [`set.service.ts → calculate()`](file:///c:/Users/VICTUS/coding/GitHub/ReLive-CreativityInnovation/apps/backend/src/set/set.service.ts)

### 12. Workout Set Logging
Persists a `WorkoutSet` record; immediately triggers a `StatisticalAggregatorService` snapshot that recomputes EMA-smoothed 1RM, baseline averages, fatigue flags, and context summaries — all stored on the analytics snapshot.
- Backend: [`set.service.ts → logSet()`](file:///c:/Users/VICTUS/coding/GitHub/ReLive-CreativityInnovation/apps/backend/src/set/set.service.ts)

### 13. Performance Analytics
Reads the latest analytics snapshot for an exercise over N days. Returns `emaOneRepMaxKg`, `latestSessionFlagged` (CNS fatigue), baseline averages, and a plain-language `contextSummary`. Used as input to the AI recommendation engine.
- Backend: [`statistical-aggregator.service.ts`](file:///c:/Users/VICTUS/coding/GitHub/ReLive-CreativityInnovation/apps/backend/src/set/statistical-aggregator.service.ts) · `set.service.ts → getPerformanceAnalytics()`

---

## 🤖 AI Workout Recommendation

### 14. AI-Powered Workout Plan Generation
Given an exercise ID and phase goal (Strength / Hypertrophy / Power / Recovery / Baseline Testing), the server pre-computes a **safety envelope** (min/max weight, sets, reps) from the user's analytics, then prompts the LLM (OpenRouter) to fill in only the values inside that envelope. The AI cannot invent its own safety math.
- Backend: [`recommendation.service.ts → generateWorkoutPlan()`](file:///c:/Users/VICTUS/coding/GitHub/ReLive-CreativityInnovation/apps/backend/src/recommendation/recommendation.service.ts)

### 15. Tiered AI Fallback (Server Key → User BYOK Key → Rule-Based)
If the primary server OpenRouter key fails or is rate-limited, the service automatically falls back to the user's connected BYOK key. If that also fails, a deterministic rule-based plan within the same safety envelope is returned — users always get a safe plan, never an error.
- Backend: `recommendation.service.ts` (lines 124–238)

### 16. Feature/Architecture Threat Analysis (Dev Tool)
A separate `analyzeFeatureThreats` mutation prompts an "elite staff-level architect" system prompt and returns a structured JSON: executive summary, implementation steps, and dangerous security/data-integrity threats with concrete fixes. Used during development.
- Backend: [`recommendation.service.ts → analyzeFeatureThreats()`](file:///c:/Users/VICTUS/coding/GitHub/ReLive-CreativityInnovation/apps/backend/src/recommendation/recommendation.service.ts#L241-L264)

---

## 🥗 Food & Nutrition

### 17. Food Search (Multi-Source with DB Cache)
Searches a 4-layer fallback chain: in-memory response cache (60s) → local `FoodCache` database → USDA FoodData Central API → Open Food Facts API → built-in embedded staple-food catalog. Results from external APIs are upserted into the DB cache for future queries.
- Backend: [`food.service.ts`](file:///c:/Users/VICTUS/coding/GitHub/ReLive-CreativityInnovation/apps/backend/src/food/food.service.ts)
- Frontend: [`/foods`](file:///c:/Users/VICTUS/coding/GitHub/ReLive-CreativityInnovation/apps/frontend/app/(home)/foods) · [`/components/foods`](file:///c:/Users/VICTUS/coding/GitHub/ReLive-CreativityInnovation/apps/frontend/components/foods)

### 18. Food Cache Warmer
A startup service (`FoodCacheWarmerService`) pre-populates the database cache with common queries so the first real users don't always hit the cold USDA path.
- Backend: [`food-cache-warmer.service.ts`](file:///c:/Users/VICTUS/coding/GitHub/ReLive-CreativityInnovation/apps/backend/src/food/food-cache-warmer.service.ts)

---

## 🍳 Recipe Search (Cookbook)

### 19. Recipe Search (Multi-Source with DB Cache)
Same layered pattern as food search: memory cache → DB (`RecipeCache`) → Spoonacular API → TheMealDB fallback. Spoonacular quota-exceeded errors are handled gracefully by dropping to the next source.
- Backend: [`recipe.service.ts`](file:///c:/Users/VICTUS/coding/GitHub/ReLive-CreativityInnovation/apps/backend/src/recipe/recipe.service.ts)
- Frontend: [`/cookbook`](file:///c:/Users/VICTUS/coding/GitHub/ReLive-CreativityInnovation/apps/frontend/app/(home)/cookbook) · [`/components/cookbook`](file:///c:/Users/VICTUS/coding/GitHub/ReLive-CreativityInnovation/apps/frontend/components/cookbook)

### 20. Recipe Cache Warmer
Mirrors the food cache warmer — pre-populates `RecipeCache` with common recipe queries at startup.
- Backend: [`recipe-cache-warmer.service.ts`](file:///c:/Users/VICTUS/coding/GitHub/ReLive-CreativityInnovation/apps/backend/src/recipe/recipe-cache-warmer.service.ts)

---

## 🧑‍🏫 Trainer Marketplace

### 21. Trainer Profile (Create / View / List)
Trainers have a separate `TrainerProfile` record (bio, certifications, rating, wallet addresses). Any user can list all trainer profiles or view a specific one; trainers can manage their own.
- Backend: [`trainer.service.ts`](file:///c:/Users/VICTUS/coding/GitHub/ReLive-CreativityInnovation/apps/backend/src/trainer/trainer.service.ts)
- Frontend: [`/client` → trainer list/detail](file:///c:/Users/VICTUS/coding/GitHub/ReLive-CreativityInnovation/apps/frontend/app/(home)/client)

### 22. Upgrade to Trainer (Crypto Path)
User provides a Solana wallet address + payout ATA address + mint address → backend verifies the ATA exists on-chain and is owned by the wallet (Solana RPC call) → user role is atomically upgraded to `TRAINER` inside a serializable transaction (prevents TOCTOU race condition).
- Backend: [`trainer.service.ts → upgradeToTrainer()`](file:///c:/Users/VICTUS/coding/GitHub/ReLive-CreativityInnovation/apps/backend/src/trainer/trainer.service.ts#L118-L156)
- Frontend: [`/client/become-trainer`](file:///c:/Users/VICTUS/coding/GitHub/ReLive-CreativityInnovation/apps/frontend/app/(home)/client/become-trainer)

### 23. Register as Trainer (Fiat-Only Path)
Alternative trainer registration without requiring a Solana wallet — role upgraded, trainer profile and fiat wallet created in one transaction. Designed for trainers who want to accept IDR payments only.
- Backend: [`trainer.service.ts → registerTrainerFiat()`](file:///c:/Users/VICTUS/coding/GitHub/ReLive-CreativityInnovation/apps/backend/src/trainer/trainer.service.ts#L159-L198)

### 24. Trainer Services (Create / Update / List)
Trainers can create services with an optional crypto price (lamports + mint) and/or a fiat price (IDR). At least one price method must be set. Services can be toggled active/inactive.
- Backend: `trainer.service.ts → createTrainerService()`, `updateTrainerService()`
- Frontend: [`/trainer/services`](file:///c:/Users/VICTUS/coding/GitHub/ReLive-CreativityInnovation/apps/frontend/app/(home)/trainer/services)

### 25. Trainer Availability Rules
Trainers set recurring weekly rules (by `dayOfWeek`) or one-off specific date overrides. The system generates available time slots in configurable increments (default 60 min), subtracting existing bookings and blocked periods.
- Backend: [`trainer-availability.service.ts`](file:///c:/Users/VICTUS/coding/GitHub/ReLive-CreativityInnovation/apps/backend/src/trainer/trainer-availability.service.ts)
- Frontend: [`/trainer/availability`](file:///c:/Users/VICTUS/coding/GitHub/ReLive-CreativityInnovation/apps/frontend/app/(home)/trainer/availability)

### 26. Trainer Reviews
Clients can leave a review on a completed booking. Reviews are included in trainer profile queries, ordered by newest first.
- Backend: `trainer.service.ts → createReview()`

---

## 📅 Booking System

### 27. Booking Creation
Client selects a trainer, service, start/end time → conflict check runs → `Booking` record created with `PENDING` status → trainer receives an in-app notification.
- Backend: [`trainer.service.ts → createBooking()`](file:///c:/Users/VICTUS/coding/GitHub/ReLive-CreativityInnovation/apps/backend/src/trainer/trainer.service.ts#L295-L350)
- Frontend: [`/client/bookings`](file:///c:/Users/VICTUS/coding/GitHub/ReLive-CreativityInnovation/apps/frontend/app/(home)/client/bookings) · [`/trainer/bookings`](file:///c:/Users/VICTUS/coding/GitHub/ReLive-CreativityInnovation/apps/frontend/app/(home)/trainer/bookings)

### 28. Booking Status State Machine (RBAC)
Bookings follow a strict RBAC-gated state machine: TRAINER can accept (`PENDING→ACTIVE`) or cancel; CLIENT can dispute (`ACTIVE→DISPUTED`) or self-cancel pending; ADMIN resolves disputes. Invalid transitions throw `ForbiddenException`. Trainers cannot manually activate an unpaid booking.
- Backend: [`trainer.service.ts → updateBookingStatus()`](file:///c:/Users/VICTUS/coding/GitHub/ReLive-CreativityInnovation/apps/backend/src/trainer/trainer.service.ts#L416-L582)

### 29. Reschedule Proposal Flow
Either party on an ACTIVE booking can propose a new time. Only one pending proposal is allowed at a time. The other party accepts or rejects → on accept the booking timestamps are updated atomically; both parties are notified.
- Backend: `trainer.service.ts → proposeReschedule()`, `resolveReschedule()`

### 30. Mutual Cancellation Request Flow
Either party can request cancellation of an ACTIVE booking. The other party must accept → booking becomes `CANCELLED` atomically → fiat refund hook triggered if applicable → both parties notified.
- Backend: `trainer.service.ts → requestCancellation()`, `resolveCancellation()`

---

## 💳 Payment — Fiat (IDR via Duitku)

### 31. Fiat Payment Invoice Creation
Client initiates IDR payment for a booking → Duitku inquiry API called → `PaymentTransaction` record created → booking updated with gateway fields → payment URL returned to redirect client to Duitku checkout.
- Backend: [`fiat-payment.service.ts → createDeposit()`](file:///c:/Users/VICTUS/coding/GitHub/ReLive-CreativityInnovation/apps/backend/src/fiat-payment/fiat-payment.service.ts)
- Frontend: [`/client/wallet`](file:///c:/Users/VICTUS/coding/GitHub/ReLive-CreativityInnovation/apps/frontend/app/(home)/client/wallet)

### 32. Duitku Payment Webhook (Idempotent, Amount-Verified)
Duitku calls the webhook endpoint on payment result → amount mismatch is detected and rejected (prevents partial-payment exploits) → duplicate webhooks are silently skipped → on success, booking atomically transitions to `ACTIVE`.
- Backend: [`fiat-payment.service.ts → processWebhook()`](file:///c:/Users/VICTUS/coding/GitHub/ReLive-CreativityInnovation/apps/backend/src/fiat-payment/fiat-payment.service.ts#L133-L199)
- Route: [`fiat-payment.webhook.controller.ts`](file:///c:/Users/VICTUS/coding/GitHub/ReLive-CreativityInnovation/apps/backend/src/fiat-payment/fiat-payment.webhook.controller.ts)

### 33. Trainer Fiat Wallet & Earnings Credit
Each trainer has a `FiatWallet` ledger. When a fiat booking is marked `COMPLETED`, the base service price (excluding gateway fee) is atomically credited. On cancellation, pending payments are marked `REFUNDED`.
- Backend: `fiat-payment.service.ts → creditTrainerOnCompletion()`, `handleFiatBookingCancellation()`
- Frontend: [`/trainer/wallet`](file:///c:/Users/VICTUS/coding/GitHub/ReLive-CreativityInnovation/apps/frontend/app/(home)/trainer/wallet)

### 34. Trainer Withdrawal (TOCTOU-Safe)
Trainer requests withdrawal → balance is **deducted first** inside a conditional raw SQL UPDATE (prevents double-spend race condition) → Duitku disbursement API called → on failure, balance is atomically refunded.
- Backend: [`fiat-payment.service.ts → requestWithdrawal()`](file:///c:/Users/VICTUS/coding/GitHub/ReLive-CreativityInnovation/apps/backend/src/fiat-payment/fiat-payment.service.ts#L237-L334)

---

## 🔗 Payment — Crypto (Solana Escrow)

### 35. Escrow Transaction Builder (Initialize Booking)
Backend builds an unsigned Solana transaction that calls `initialize_booking` on the on-chain escrow program. The transaction is serialized to base64 and sent to the frontend for the user to sign with their wallet.
- Backend: [`blockchain-transaction.service.ts → buildInitializeBookingTx()`](file:///c:/Users/VICTUS/coding/GitHub/ReLive-CreativityInnovation/apps/backend/src/blockchain/blockchain-transaction.service.ts)

### 36. Escrow Transaction Builder (Release & Refund)
Backend builds signed transactions for `release_funds` (trainer payout) and `refund_booking` (client refund) using the platform authority keypair as co-signer. Anchor instruction discriminators are derived from SHA-256.
- Backend: `blockchain-transaction.service.ts → buildReleaseTx()`, `buildRefundTx()`

### 37. On-Chain Blockchain Indexer
At startup, the indexer subscribes to Solana program logs for the escrow contract. When a `BookingInitialized` event is detected, it calls `TrainerService.confirmBookingFromChain()` to activate the booking without any frontend action. Idempotent — duplicate events are discarded.
- Backend: [`blockchain-indexer.service.ts`](file:///c:/Users/VICTUS/coding/GitHub/ReLive-CreativityInnovation/apps/backend/src/blockchain/blockchain-indexer.service.ts)

### 38. Solana Escrow Smart Contract (Anchor)
Rust/Anchor program with `initialize_booking`, `release_funds`, and `refund_booking` instructions. Holds SPL tokens in a PDA vault until the platform co-signs a release or refund.
- Contract: [`programs/relive_escrow/src`](file:///c:/Users/VICTUS/coding/GitHub/ReLive-CreativityInnovation/apps/contracts/programs/relive_escrow/src)

---

## 💬 Real-Time Chat / Messaging

### 39. WebSocket Chat (Socket.IO)
JWT-authenticated Socket.IO gateway. Users join conversation rooms (`conv:<id>`); messages are persisted and broadcast to room members. Unauthorized join and send attempts are silently dropped.
- Backend: [`messaging.gateway.ts`](file:///c:/Users/VICTUS/coding/GitHub/ReLive-CreativityInnovation/apps/backend/src/messaging/messaging.gateway.ts) · [`messaging.service.ts`](file:///c:/Users/VICTUS/coding/GitHub/ReLive-CreativityInnovation/apps/backend/src/messaging/messaging.service.ts)
- Frontend: [`/messages`](file:///c:/Users/VICTUS/coding/GitHub/ReLive-CreativityInnovation/apps/frontend/app/(home)/messages) · [`components/chat`](file:///c:/Users/VICTUS/coding/GitHub/ReLive-CreativityInnovation/apps/frontend/components/chat) · [`use-chat.tsx`](file:///c:/Users/VICTUS/coding/GitHub/ReLive-CreativityInnovation/apps/frontend/hooks/use-chat.tsx)

### 40. Real-Time Presence & Status
On WebSocket connect, user status is set to `online` and broadcast. On disconnect (last socket), status becomes `offline`. Manual `update_status` events allow `away` state. New connections receive all current active statuses.
- Backend: `messaging.gateway.ts → handleConnection()`, `handleDisconnect()`, `handleUpdateStatus()`

### 41. Typing Indicators
`typing` WebSocket event is relayed to all other participants in a conversation room in real time, without being stored.
- Backend: `messaging.gateway.ts → handleTyping()`

### 42. New Message Alerts (Cross-Room Push)
When a message is sent, a `new_message_alert` event is emitted directly to all active sockets of the recipient (even if they're not in the conversation room), enabling cross-room notifications.
- Backend: `messaging.gateway.ts → handleMessage()` (lines 142–159)

### 43. Read Receipts
`read_messages` WebSocket event marks all unread messages as read in the DB and broadcasts a `messages_read` event to the conversation room.
- Backend: `messaging.gateway.ts → handleReadMessages()`

---

## 🔔 In-App Notifications

### 44. Notification Creation (System-Wide)
A lightweight `NotificationService` creates persisted notifications for users on key events: new booking, booking accepted/cancelled/completed, dispute raised/resolved, reschedule proposed/resolved, earnings credited.
- Backend: [`notification.service.ts`](file:///c:/Users/VICTUS/coding/GitHub/ReLive-CreativityInnovation/apps/backend/src/core/notification.service.ts)

---

## 📧 Transactional Email

### 45. Email via Event System (Nodemailer / SMTP)
`EventEmitter2` events (`user.registered`, `user.forgot-password`, `user.email-change-request`, etc.) are handled by a dedicated `MailListener` which sends templated HTML emails through a configured SMTP transport.
- Backend: [`mail.listener.ts`](file:///c:/Users/VICTUS/coding/GitHub/ReLive-CreativityInnovation/apps/backend/src/mail/mail.listener.ts) · [`templates/`](file:///c:/Users/VICTUS/coding/GitHub/ReLive-CreativityInnovation/apps/backend/src/mail/templates)

---

## 🏗️ Infrastructure / Cross-Cutting

### 46. Route Protection (Next.js Middleware)
All non-public routes are protected at the Edge via `jwtVerify` in Next.js middleware — no protected page is ever server-rendered for unauthenticated users. Invalid/expired cookies are cleared and the user is redirected.
- Frontend: [`middleware.ts`](file:///c:/Users/VICTUS/coding/GitHub/ReLive-CreativityInnovation/apps/frontend/middleware.ts)

### 47. GraphQL API (NestJS)
All main domain operations (auth, user, trainer, booking, set, recommendation, food, recipe, blockchain, fiat-payment) are exposed as GraphQL mutations/queries through a unified Apollo endpoint.
- Backend: [`graphql/`](file:///c:/Users/VICTUS/coding/GitHub/ReLive-CreativityInnovation/apps/backend/src/graphql) · `app.module.ts`

### 48. Role-Based Access Control (RBAC)
Three roles: `USER`, `TRAINER`, `ADMIN`. JWT payload embeds the role; NestJS guards read it via `@CurrentUser()` decorator without extra DB queries. Booking state machine enforces RBAC at the domain level.
- Backend: [`auth/guards`](file:///c:/Users/VICTUS/coding/GitHub/ReLive-CreativityInnovation/apps/backend/src/auth/guards) · [`core/guards`](file:///c:/Users/VICTUS/coding/GitHub/ReLive-CreativityInnovation/apps/backend/src/core/guards)

### 49. Prisma ORM + PostgreSQL
Single schema with all models. Migrations are tracked. A seed file (`seed.ts`) populates initial data. Prisma is wrapped in a custom `PrismaService` for NestJS injection.
- Backend: [`prisma/schema.prisma`](file:///c:/Users/VICTUS/coding/GitHub/ReLive-CreativityInnovation/apps/backend/prisma/schema.prisma) · [`prisma/seed.ts`](file:///c:/Users/VICTUS/coding/GitHub/ReLive-CreativityInnovation/apps/backend/prisma/seed.ts)

### 50. Frontend State & Hooks
- `worldStore.ts` — Zustand store for world/social feed state
- `use-chat.tsx` — Socket.IO connection management and message state
- `use-toast.ts` — Global toast notification queue
- `food.service.ts` / `recipe.service.ts` — Client-side fetch wrappers for food/recipe API calls
- Frontend: [`hooks/`](file:///c:/Users/VICTUS/coding/GitHub/ReLive-CreativityInnovation/apps/frontend/hooks) · [`store/`](file:///c:/Users/VICTUS/coding/GitHub/ReLive-CreativityInnovation/apps/frontend/store) · [`services/`](file:///c:/Users/VICTUS/coding/GitHub/ReLive-CreativityInnovation/apps/frontend/services)

---

## 📋 Summary Table

| # | Feature | Backend Module | Frontend Route |
|---|---------|---------------|----------------|
| 1–6 | Auth (register, login, Google, reset, email change, delete) | `auth`, `user` | `/auth/*` |
| 7–9 | User Profile + Avatar + OpenRouter BYOK | `user`, `auth` | `/profile` |
| 10–13 | Exercise Catalog + Set Logging + Analytics | `set` | `/set` (hooks) |
| 14–16 | AI Workout Recommendation + Threat Analyzer | `recommendation` | `/set` (AI modal) |
| 17–18 | Food Search + Cache Warmer | `food` | `/foods` |
| 19–20 | Recipe Search + Cache Warmer | `recipe` | `/cookbook` |
| 21–26 | Trainer Profiles + Onboarding + Services + Availability + Reviews | `trainer` | `/client`, `/trainer` |
| 27–30 | Booking CRUD + State Machine + Reschedule + Cancellation | `trainer` | `/client`, `/trainer/bookings` |
| 31–34 | Fiat Payment (Duitku) + Wallet + Withdrawal | `fiat-payment` | `/trainer/wallet`, `/client/wallet` |
| 35–38 | Crypto Escrow (Solana) + Indexer + Smart Contract | `blockchain`, `contracts` | `/trainer/wallet` |
| 39–43 | Real-time Chat, Presence, Typing, Alerts, Read Receipts | `messaging` | `/messages` |
| 44 | In-App Notifications | `core/notification` | (shared) |
| 45 | Transactional Email | `mail` | — |
| 46–50 | Middleware, GraphQL, RBAC, Prisma, Frontend Hooks | all | — |
