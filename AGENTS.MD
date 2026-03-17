<<<<<<< HEAD
# ReLive-CreativityInnovation: Project State & Progress

**Project Aim & Description:**
ReLive-CreativityInnovation is an immersive, full-stack web application designed to blend modern web technologies with rich, interactive 3D experiences. Its primary aim appears to be providing a creative, visually engaging environment (such as a virtual world, interactive portfolio, or storytelling platform) where users can register, log in, and explore dynamic 3D scenes. Do not abuse this since its very lag, ask the promptere before using this thing and wait the to approeThe heavy reliance on 3D rendering libraries like React Three Fiber and BabylonJS, coupled with a robust NestJS backend, indicates a strong focus on high-performance visual innovation and interactive user experiences.

## 1. Project Overview
The project is a full-stack web application structured as a **Monorepo** using `pnpm` workspaces (and turborepo). It is divided into two main applications:
- **Backend:** A NestJS server utilizing GraphQL, Prisma ORM, and PostgreSQL.
- **Frontend:** A Next.js (App Router) application heavily featuring 3D rendering (React Three Fiber/Three.js/BabylonJS) and modern UI (Tailwind CSS, shadcn/ui).

---

## 2. Tech Stack & Non-Functional Capabilities
### Global
- **Package Manager / Workspace:** `pnpm` workspace setup with generic `dev`, `build`, and `lint` scripts running concurrently across apps.
- **Language:** TypeScript 5+ across the entire stack.
- **Linting & Formatting:** ESLint (v9 flat config) and Prettier.

### Backend (`apps/backend`)
- **Framework:** NestJS (v11)
- **API Paradigm:** GraphQL (Code-first approach) via `@nestjs/graphql` and `@apollo/server`.
- **Database & ORM:** PostgreSQL managed via Prisma (`@prisma/client` v6.19.2).
- **Authentication:** Passport.js with JWT (`@nestjs/jwt`) and Google OAuth 2.0 (`passport-google-oauth20`). Password hashing uses `argon2`.
- **Email/Mailing:** `@nestjs-modules/mailer` utilizing Gmail SMTP and `nodemailer`.
- **Validation:** `class-validator` and `class-transformer` for DTOs.
- **Testing:** Jest setup for unit and end-to-end (e2e) tests.

### Frontend (`apps/frontend`)
- **Framework:** Next.js v15 (App Router).
- **Styling:** Tailwind CSS v4, initialized with `shadcn-ui` and `radix-ui` primitives.
- **3D & Canvas Rendering:** Deep integration with 3D technologies including `@react-three/fiber`, `@react-three/drei`, `three`, `@babylonjs/core`, and `pixi.js`.
- **Animations:** Motion/physics via `framer-motion` and `@tsparticles/react`.
- **Icons & Graphics:** `lucide-react`.
- **Data Fetching:** GraphQL parsing with `graphql-tag` (ready to consume the backend API).

---

## 3. Current Functional Capabilities (What is Already Applied)

### Backend Functionality
Based on the GraphQL Schema and implemented modules, the backend currently supports:
- **User Management & Database Schema:** 
  A `User` model exists to store `id`, `email`, `password`, `name`, `bio`, `avatar`, `createdAt`, and `updatedAt`.
- **Authentication Flow:**
  - `register`: Registers a new user.
  - `signIn`: Logs in a user returning an `AuthPayload` (JWT accessToken, user info).
  - `forgotPassword`: Sends an email to initiate a password reset.
  - `resetPassword`: Resets the password using a token.
  - Google OAuth configuration is set up in `GoogleStrategy`.
- **Module Structure Built:**
  - `AuthModule`: Handles JWT token issuance and Google Strategies.
  - `UserModule`: Defines User GraphQL resolvers and services.
  - `PrismaModule`: Database connectivity.
  - `MailModule`: Handles transactional email sending (e.g., for password resets).

### Frontend Functionality
The Next.js App Router exposes the following features:
- **Authentication Pages (`/auth/*`):**
  Distinct routes have been created for:
  - `/auth/login`
  - `/auth/register`
  - `/auth/forgot-password`
  - `/auth/reset-password`
  - `/auth/logout`
- **Landing Page (`/`):**
  The home page features rich UI segments:
  - `<Header />` and `<Hero />` sections.
  - `<AboutUs />` section.
  - A contextual `<SkyComponent />` for visual aesthetics.
  - Previously used components like `<FallingLeaves />` and other previews are conditionally kept in the codebase.
- **Interactive 3D World (`/world`):**
  A dedicated route (`/world`) renders a `<WorldScene />` built on a full-screen canvas (styled heavily with `#87CEEB` sky blue), heavily utilizing the installed 3D dependencies (React Three Fiber / BabylonJS).

---

## 4. Detailed File Structure & Technical Nuances
To fully map out the current boundaries of the codebase, here is a structured summary of the core directories and their roles:

### Monorepo Root (`d:\Coding\Repository\ReLive-CreativityInnovation`)
- **`package.json`**: Orchestrates `pnpm` workspaces, containing global scripts (`dev`, `build`, `lint`) that run concurrently across all applications using `--filter` or `-r`.
- **`pnpm-workspace.yaml`**: Defines the workspace scope (`apps/*`).

### Backend Directory (`apps/backend`)
- **`src/main.ts`**: The entry point bootstraps the NestJS application.
- **`src/app.module.ts`**: The root module importing `GraphQLModule`, `ConfigModule` (global env vars), `MailerModule` (SMTP setup), `PrismaModule`, `AuthModule`, and `UserModule`.
- **`src/auth/`**:
  - Contains `auth.module.ts`, `auth.service.ts`, `auth.controller.ts`, and `auth.resolver.ts`.
  - Implements `GoogleStrategy` for OAuth alongside standard JWT-based local authentication.
- **`src/user/`**:
  - Contains `user.module.ts`, `user.service.ts`, and `user.resolver.ts` for handling CRUD operations via GraphQL.
- **`src/graphql/schema.gql`**: The dynamically generated code-first schema defining inputs (e.g., `CreateUserInput`, `SignInInput`, `ForgotPasswordDto`) and types (`AuthPayload`, `ForgotResetPassword`).
- **`prisma/schema.prisma`**: The single source of truth for the database layout, providing the `User` model over a PostgreSQL provider.

### Frontend Directory (`apps/frontend`)
- **`app/page.tsx`**: The main landing page assembling modular React components (`Header`, `Hero`, `SkyComponent`, `AboutUs`). Certain experimental files (`FallingLeaves`) are commented out but retained.
- **`app/layout.tsx`**: The root Next.js layout governing the global HTML structure and importing `globals.css`.
- **`app/auth/`**: Contains segmented sub-pages for `login`, `register`, `forgot-password`, `reset-password`, and `logout`.
- **`app/world/page.tsx`**: A dedicated 3D canvas route mounting the `<WorldScene />` component in a full-screen `#87CEEB` (sky blue) container.
- **`components/`**:
  - **`landing/`**: UI segments for the root page (`Header.tsx`, `Hero.tsx`, `AboutUs.tsx`, `Sky.tsx`).
  - **`world/`**: Dedicated 3D or scene logic components (e.g., `WorldScene`).
  - **`prev/`**: A depository of previously built or alternative UI concepts (`AboutUsDesignWhite`, `Lorem2`, `Lorem3`) kept for reference or future use.
  - **Standalone Graphics:** `Bird.tsx`, `Cloud.tsx` (suggestive of 3D or animated assets meant for the Canvas/Sky elements).
- **Configuration Defaults:**
  - `tailwind.config` / `postcss` is configured with a rich `shadcn-ui` baseline.
  - Next.js (`next.config.ts`) and TypeScript (`tsconfig.json`) are strictly typed.

---
Next we will implement..
The main goal of this feature is to build a nutrition information system for gym users that can quickly provide reliable food data such as calories, protein, carbohydrates, and fat. In fitness and diet tracking, these values are called macronutrients (macros) and they are essential for users who want to track muscle gain, fat loss, or calorie intake. Instead of manually creating a large database of foods yourself—which would take enormous time and effort—the system will rely on existing public nutrition databases that expose their data through APIs.

An API (Application Programming Interface) is a service that allows your application to request data from another system through the internet. In this context, when a user searches for a food like “chicken breast” or “banana”, your backend will send a request to a nutrition API and receive structured data describing that food. The API responds with information such as calories per 100 grams, protein content, carbohydrate content, fat content, and sometimes additional micronutrients like vitamins and minerals. Your system then processes that response and returns it to your frontend so it can be displayed to the user.

For this project, the primary data source will be USDA FoodData Central, which is an official nutrition database maintained by the United States Department of Agriculture. This dataset is widely used in research, diet apps, and health platforms because it contains scientifically validated nutrition information for thousands of raw foods and ingredients. For a gym-focused application, this is particularly valuable because most fitness diets rely on simple foods such as chicken, rice, eggs, oats, beef, and vegetables, which are all well represented in the USDA dataset.

However, the USDA database focuses heavily on raw ingredients and basic foods, which means it may not always include certain packaged products like protein bars, energy drinks, or branded supplements. To handle those cases, the system will also integrate Open Food Facts, a large open-source food database that contains millions of packaged and branded products collected by a global community. This allows the application to retrieve nutrition information for foods commonly found in supermarkets or used by gym users, such as protein powders or snack products.

In the architecture we discussed earlier, USDA FoodData Central will act as the primary source, meaning it will be queried first whenever a user searches for a food. If the USDA database returns poor results or does not contain the requested item, the system will then query Open Food Facts as a fallback source. This approach ensures the system benefits from the accuracy of the USDA dataset while still maintaining broad food coverage through Open Food Facts. By combining these two APIs and standardizing their responses into a single data format within your backend, your application can provide a consistent and reliable nutrition search experience for gym users.
Step:
=======
# Food Feature Workflow Notes

This file explains how the food feature works end-to-end so future changes are easier to understand.

## Main Goal

The food feature lets a user:

1. Search foods from the `/foods` page.
2. Fetch normalized nutrition data from the backend.
3. Recalculate nutrition totals based on serving size.
4. Add foods to a meal summary.
5. Reuse recent searches and favorite foods.

The system is built so the backend owns source integration and caching, while the frontend owns interaction state and serving-size recalculation.

## High-Level Request Flow

### Frontend Flow

1. User opens `/foods`.
2. [page.tsx](/C:/Users/Jovan/.codex/worktrees/875d/ReLive-CreativityInnovation/apps/frontend/app/foods/page.tsx) renders [FoodSearchPageClient.tsx](/C:/Users/Jovan/.codex/worktrees/875d/ReLive-CreativityInnovation/apps/frontend/components/foods/FoodSearchPageClient.tsx).
3. `FoodSearchPageClient` waits until the page mounts, then renders [FoodSearchExperience.tsx](/C:/Users/Jovan/.codex/worktrees/875d/ReLive-CreativityInnovation/apps/frontend/components/foods/FoodSearchExperience.tsx).
4. `FoodSearchExperience` is the main orchestrator for the whole food page.
5. Search input UI lives in [FoodSearchInput.tsx](/C:/Users/Jovan/.codex/worktrees/875d/ReLive-CreativityInnovation/apps/frontend/components/foods/FoodSearchInput.tsx).
6. Search state and fetch behavior live in [useFoodSearch.ts](/C:/Users/Jovan/.codex/worktrees/875d/ReLive-CreativityInnovation/apps/frontend/hooks/useFoodSearch.ts).
7. `useDebounce` delays the query so typing does not trigger a request on every keystroke.
8. `useFoodSearch` calls [food.service.ts](/C:/Users/Jovan/.codex/worktrees/875d/ReLive-CreativityInnovation/apps/frontend/services/food.service.ts).
9. The frontend service calls backend REST by default, or GraphQL if `NEXT_PUBLIC_FOOD_SEARCH_TRANSPORT=graphql`.
10. Results come back in one unified shape and are rendered by:
    - [FoodResultList.tsx](/C:/Users/Jovan/.codex/worktrees/875d/ReLive-CreativityInnovation/apps/frontend/components/foods/FoodResultList.tsx)
    - [FoodCard.tsx](/C:/Users/Jovan/.codex/worktrees/875d/ReLive-CreativityInnovation/apps/frontend/components/foods/FoodCard.tsx)
    - [FoodDetailsPanel.tsx](/C:/Users/Jovan/.codex/worktrees/875d/ReLive-CreativityInnovation/apps/frontend/components/foods/FoodDetailsPanel.tsx)
    - [MealSummaryPanel.tsx](/C:/Users/Jovan/.codex/worktrees/875d/ReLive-CreativityInnovation/apps/frontend/components/foods/MealSummaryPanel.tsx)

### Backend Flow

1. Frontend sends request to:
   - REST: `/api/foods`
   - or GraphQL: `searchFoods`
2. REST enters [food.controller.ts](/C:/Users/Jovan/.codex/worktrees/875d/ReLive-CreativityInnovation/apps/backend/src/food/food.controller.ts).
3. GraphQL enters [food.resolver.ts](/C:/Users/Jovan/.codex/worktrees/875d/ReLive-CreativityInnovation/apps/backend/src/food/food.resolver.ts).
4. Both call the same service: [food.service.ts](/C:/Users/Jovan/.codex/worktrees/875d/ReLive-CreativityInnovation/apps/backend/src/food/food.service.ts).
5. `FoodService.searchFoods()` does the real workflow:
   - normalize input
   - check short-lived memory cache
   - search local database cache first
   - if local cache is not enough, call USDA
   - store USDA results into database cache
   - if still not enough, call Open Food Facts
   - store Open Food Facts results into database cache
   - return one normalized response shape

## Detailed Workflow By Function

### Frontend Entry

#### `FoodSearchPageClient`

File: [FoodSearchPageClient.tsx](/C:/Users/Jovan/.codex/worktrees/875d/ReLive-CreativityInnovation/apps/frontend/components/foods/FoodSearchPageClient.tsx)

What it does:

- Prevents hydration issues on `/foods` by rendering the full interactive page only after mount.

Why it exists:

- Browser extensions were injecting attributes into the DOM before hydration.
- This wrapper avoids fragile first-paint hydration for the full food page subtree.

### Frontend Page Coordinator

#### `FoodSearchExperience`

File: [FoodSearchExperience.tsx](/C:/Users/Jovan/.codex/worktrees/875d/ReLive-CreativityInnovation/apps/frontend/components/foods/FoodSearchExperience.tsx)

What it does:

- Connects all food UI pieces together.
- Owns selected food state.
- Owns local-storage driven recent queries, favorites, and meal items.
- Passes handlers to the list, details panel, and summary panel.

When user types:

1. `FoodSearchInput` calls `setQuery`.
2. `useFoodSearch` updates internal reducer state.
3. Debounce waits briefly.
4. Fetch starts.
5. Results come back.
6. The first valid result becomes the selected food if needed.

### Frontend Search Hook

#### `useFoodSearch`

File: [useFoodSearch.ts](/C:/Users/Jovan/.codex/worktrees/875d/ReLive-CreativityInnovation/apps/frontend/hooks/useFoodSearch.ts)

What it does:

- Handles food-page search state.
- Debounces the query.
- Calls the frontend food service.
- Logs request lifecycle to console.
- Recalculates result nutrients locally for the chosen serving size.
- Handles pagination state.

Important functions inside:

- `runSearch`
  - starts network request
  - prints logs like `fetch:start`, `fetch:success`, `fetch:error`
  - updates reducer state

- `setQuery`
  - updates the user’s current search term
  - also resets page back to `1`

- `setServingSize`
  - changes serving size locally
  - does not fetch again

- `nextPage` / `previousPage`
  - moves pagination
  - triggers a fetch because page changes

### Frontend Transport Layer

#### `searchFoods`

File: [food.service.ts](/C:/Users/Jovan/.codex/worktrees/875d/ReLive-CreativityInnovation/apps/frontend/services/food.service.ts)

What it does:

- This is the frontend transport function for food search.
- It hides whether the page is using REST or GraphQL.
- It keeps a short in-memory response cache.

Workflow:

1. Normalize incoming query string.
2. Build a response cache key using query + page + limit.
3. Reuse recent cached response if still valid.
4. Choose transport:
   - REST by default
   - GraphQL only if env says so
5. Return normalized backend response.

### Frontend Nutrition Math

File: [food.ts](/C:/Users/Jovan/.codex/worktrees/875d/ReLive-CreativityInnovation/apps/frontend/lib/food.ts)

Important helpers:

- `calculateNutrientsForServing`
  - takes per-100g values and scales them to a custom serving

- `withServingSize`
  - copies a food object and replaces `nutrients` with recalculated values

- `summarizeMealNutrition`
  - combines multiple meal items into a single nutrition summary

- `createMealItem`
  - converts a selected food into a meal-summary item

- `updateMealItemServing`
  - recalculates one meal item if its serving changes

- `rememberRecentValue`
  - updates recent-search list without duplicates

- `toggleFavoriteFood`
  - add/remove a food from favorites

## Backend Food Service Structure

### `FoodController.searchFoods`

File: [food.controller.ts](/C:/Users/Jovan/.codex/worktrees/875d/ReLive-CreativityInnovation/apps/backend/src/food/food.controller.ts)

What it does:

- REST entry point for `/api/foods`.
- Parses query params from the browser.
- Converts page, limit, and serving size to safe integers.
- Passes everything to `FoodService.searchFoods`.

### `FoodResolver.searchFoods`

File: [food.resolver.ts](/C:/Users/Jovan/.codex/worktrees/875d/ReLive-CreativityInnovation/apps/backend/src/food/food.resolver.ts)

What it does:

- GraphQL entry point for the same feature.
- Reuses the same service as REST.

### `FoodService.searchFoods`

File: [food.service.ts](/C:/Users/Jovan/.codex/worktrees/875d/ReLive-CreativityInnovation/apps/backend/src/food/food.service.ts)

This is the main backend workflow.

Exact order:

1. `normalizeArgs(args)`
   - trims query
   - makes page/pageSize/servingSize safe

2. `createResponseCacheKey(normalizedArgs)`
   - creates memory-cache key

3. `getCachedResponse(cacheKey)`
   - returns early if recent result is already in memory

4. `findCachedFoods(normalizedArgs)`
   - searches Prisma `FoodCache` first

5. `hasUsefulResults(cachedFoods)`
   - if local cache has usable data, return it immediately

6. `tryUsda(normalizedArgs)`
   - primary external provider

7. `upsertFoods(usdaFoods)`
   - cache USDA results in database

8. `mergeFoods(cachedFoods, usdaFoods, pageSize)`
   - combine local and USDA results without duplicates

9. `hasUsefulResults(mergedCachedAndUsda)`
   - if enough, return here

10. `tryOpenFoodFacts(normalizedArgs)`
    - fallback provider

11. `upsertFoods(openFoodFactsFoods)`
    - cache fallback results in database

12. `buildResponse(...)`
    - return final unified payload

### Important Backend Helpers

#### `normalizeQuery(value)`

File: [food.service.ts](/C:/Users/Jovan/.codex/worktrees/875d/ReLive-CreativityInnovation/apps/backend/src/food/food.service.ts)

What it is for:

- Makes query strings consistent by trimming, lowercasing, and collapsing spaces.

Where it is used:

- database lookup field matching
- response cache keys
- database cache write data (`normalizedName`)

#### `normalizedQuery`

Used inside `findCachedFoods`.

What it is for:

- This is the normalized version of the user’s raw search text.
- It improves local cache search consistency.

Why not use raw `args.query` only:

- raw user input may contain uppercase/lowercase differences or extra spaces
- normalized form makes cache lookup more stable

#### `getFoodCacheModel`

What it is for:

- Central place to access Prisma `foodCache` model safely.

Why it exists:

- Prisma generated types may not be available consistently in this environment.
- Better to keep the cast in one place than repeat it in many functions.

#### `createFoodCacheRecord`

What it is for:

- Converts unified `Food` response objects into database row shape for `FoodCache`.

Used by:

- `upsertFoods`

## External Provider Layer

### USDA Provider

File: [usda-food.connector.ts](/C:/Users/Jovan/.codex/worktrees/875d/ReLive-CreativityInnovation/apps/backend/src/food/providers/usda-food.connector.ts)

Main functions:

- `searchFoods`
  - calls USDA FoodData Central search API

- `mapFood`
  - maps one USDA record into the unified `Food` object

- `mapPer100gNutrients`
  - creates normalized nutrient payload from USDA nutrient list

- `resolveNutrient`
  - finds the correct USDA nutrient by name or number code

Important note:

- USDA is the primary provider.
- If `USDA_API_KEY` is missing, this path returns no items and the service may fall back.

### Open Food Facts Provider

File: [open-food-facts.connector.ts](/C:/Users/Jovan/.codex/worktrees/875d/ReLive-CreativityInnovation/apps/backend/src/food/providers/open-food-facts.connector.ts)

Main functions:

- `searchFoods`
  - calls Open Food Facts search API

- `mapProduct`
  - maps one Open Food Facts item into the unified `Food` object

- `mapPer100gNutrients`
  - converts OFF nutriments into the shared structure

- `resolveValue`
  - tries several possible OFF field names until one works

Important note:

- Open Food Facts is fallback only.
- This is used when USDA does not give useful enough results.

## Database Cache Workflow

Database model:

- `FoodCache` in Prisma schema

Why it exists:

- avoid repeating the same external API requests
- make later searches faster
- preserve normalized per-100g data in one local format

What gets stored:

- source and sourceId
- name and normalizedName
- description and brand
- reference serving info
- per-100g nutrient columns

How cached foods are reused:

1. user searches term
2. `findCachedFoods` checks `FoodCache`
3. if local results are enough, backend returns immediately
4. if not enough, backend fetches external provider
5. new external results are inserted with `upsertFoods`

## Rendering Workflow On Foods Page

1. User types in `FoodSearchInput`.
2. `useFoodSearch` updates query state.
3. `useDebounce` waits briefly.
4. `searchFoods` frontend service runs.
5. Backend `FoodController.searchFoods` or `FoodResolver.searchFoods` runs.
6. Backend `FoodService.searchFoods` follows cache -> USDA -> OFF flow.
7. Frontend receives normalized response.
8. `withServingSize` recalculates visible nutrient totals for current serving.
9. `FoodResultList` renders cards.
10. Clicking a card updates `selectedFood`.
11. `FoodDetailsPanel` shows complete nutrition and lets user test serving size locally.
12. Clicking `Add to meal` creates a meal item.
13. `MealSummaryPanel` aggregates all meal items.

## Recent Searches / Favorites / Meal Items

Managed in frontend local storage by:

- [useLocalStorageState.ts](/C:/Users/Jovan/.codex/worktrees/875d/ReLive-CreativityInnovation/apps/frontend/hooks/useLocalStorageState.ts)

Stored sections:

- recent searches
- favorite foods
- meal items

This means:

- page reload keeps user context
- no backend storage is needed for these UI-only states yet

## Debugging Tips

Frontend console logs:

- `"[foods] fetch:start"`
- `"[foods] fetch:success"`
- `"[foods] fetch:aborted"`
- `"[foods] fetch:error"`

Where they are:

- [useFoodSearch.ts](/C:/Users/Jovan/.codex/worktrees/875d/ReLive-CreativityInnovation/apps/frontend/hooks/useFoodSearch.ts)

If frontend is not showing expected foods:

1. Check browser console for fetch logs.
2. Check whether backend used `DATABASE`, `USDA`, or `OPEN_FOOD_FACTS`.
3. Check if `USDA_API_KEY` exists.
4. Check if food cache table has rows.
5. Check if the query is being normalized differently than expected.

## Future Improvements

Good next steps for this page:

1. Add backend tests for the exact cache -> USDA -> OFF decision flow.
2. Add optimistic UI or toast feedback when adding foods to meal/favorites.
3. Add server-persisted favorites and meal plans per user.
4. Add better empty-state suggestions based on recent successful foods.
5. Add more nutrient fields like cholesterol, potassium, and saturated fat.
6. Add category filters such as raw food, branded food, and gym staples.
7. Add analytics/debug panel to inspect cache hits and provider usage.
8. Add e2e tests for `/foods` page interactions.

## Rule For Future Edits

When editing this food feature:

1. Keep the unified food shape stable first.
2. Prefer reusing `FoodService.searchFoods` instead of creating parallel backend logic.
3. Keep provider-specific code inside provider connectors.
4. Keep serving-size math based on `per100gNutrients`.
5. Keep the visual layout stable unless there is a very strong reason to redesign.

---

# Authentication And User Workflow Notes

This section explains how authentication and user registration work now after the privacy and safety hardening pass.

## Main Goal

The authentication flow is designed to:

1. Let users register without creating active accounts until email activation.
2. Let users sign in with email/password or Google.
3. Keep raw auth tokens out of browser URLs.
4. Avoid leaking whether an email exists during password reset.
5. Keep the frontend session cookie separate from the backend JWT logic.

## High-Level Auth Flow

### Register Flow

1. User opens `/auth/register`.
2. The register form calls the frontend server action `Register` in [auth.ts](/C:/Users/Jovan/.codex/worktrees/875d/ReLive-CreativityInnovation/apps/frontend/lib/auth.ts).
3. `Register` validates the input with Zod and calls the GraphQL `register` mutation.
4. GraphQL enters [user.resolver.ts](/C:/Users/Jovan/.codex/worktrees/875d/ReLive-CreativityInnovation/apps/backend/src/user/user.resolver.ts).
5. `UserResolver.register()` calls `UserService.register()` in [user.service.ts](/C:/Users/Jovan/.codex/worktrees/875d/ReLive-CreativityInnovation/apps/backend/src/user/user.service.ts).
6. `UserService.register()`:
   - checks whether the email is already registered
   - hashes the password first
   - signs a short-lived activation token
   - sends an email containing `/auth/activate?token=...`
   - does not create the database user yet
7. User clicks the email link.
8. Backend [auth.controller.ts](/C:/Users/Jovan/.codex/worktrees/875d/ReLive-CreativityInnovation/apps/backend/src/auth/auth.controller.ts) handles `GET /auth/activate`.
9. `activate()` verifies the token, checks whether the user already exists, and creates the real user only once.
10. Backend redirects the user back to `/auth/login`.

### Email Login Flow

1. User opens `/auth/login`.
2. The login form calls frontend server action `Login` in [auth.ts](/C:/Users/Jovan/.codex/worktrees/875d/ReLive-CreativityInnovation/apps/frontend/lib/auth.ts).
3. `Login` validates the form and calls GraphQL `signIn`.
4. GraphQL enters [auth.resolver.ts](/C:/Users/Jovan/.codex/worktrees/875d/ReLive-CreativityInnovation/apps/backend/src/auth/auth.resolver.ts).
5. `AuthResolver.signIn()` calls `AuthService.validateLocalUser()`.
6. `validateLocalUser()`:
   - finds the user by email
   - verifies the Argon2 password hash
   - returns one generic auth error if credentials fail
7. `AuthResolver.signIn()` then calls `AuthService.login()`.
8. `login()` creates the backend access token and returns the safe auth payload.
9. Frontend `Login` receives the auth payload and calls `createSession()` in [session.server.ts](/C:/Users/Jovan/.codex/worktrees/875d/ReLive-CreativityInnovation/apps/frontend/lib/session.server.ts).
10. `createSession()` stores an encrypted httpOnly session cookie for Next.js.

### Google Login Flow

1. User clicks the Google button on `/auth/login`.
2. The browser goes to backend `GET /auth/google/login`.
3. `GoogleAuthGuard` starts the Google OAuth flow.
4. Google redirects back to `GET /auth/google/callback`.
5. `AuthController.googleCallback()` calls `AuthService.createGoogleAuthHandoff()`.
6. `createGoogleAuthHandoff()`:
   - creates the normal backend access token
   - stores the final auth payload in a short-lived in-memory handoff map
   - returns only a random opaque code
7. Backend redirects to frontend `/api/auth/google/callback?code=...`.
8. Frontend route [route.ts](/C:/Users/Jovan/.codex/worktrees/875d/ReLive-CreativityInnovation/apps/frontend/app/api/auth/google/callback/route.ts) receives the code.
9. That route posts the code to backend `POST /auth/google/exchange`.
10. `AuthController.exchangeGoogleCode()` calls `AuthService.exchangeGoogleAuthHandoff()`.
11. The handoff code is deleted after one use.
12. Frontend creates the Next.js session cookie from the returned auth payload.

Why this changed:

- The older version placed the raw backend `accessToken` directly in the browser URL.
- That could leak through browser history, logs, analytics tools, screenshots, and referrer headers.
- The new version only exposes a short-lived opaque code in the URL.

### Forgot Password Flow

1. User opens `/auth/forgot-password`.
2. Frontend server action `ForgotPasswordQuery` validates the email and calls GraphQL `forgotPassword`.
3. `AuthResolver.forgotPassword()` calls `AuthService.forgotPassword()`.
4. `forgotPassword()` checks whether the email exists.
5. If the email does exist:
   - it signs a dedicated password-reset token
   - it builds a frontend reset link
   - it sends the reset email
6. If the email does not exist:
   - it still returns the same generic response
7. The UI always shows a privacy-safe message like “If the email exists, a reset link has been sent.”

Why this changed:

- The older version revealed whether the email existed.
- That created a user-enumeration risk.

### Reset Password Flow

1. User opens `/auth/reset-password?token=...` from the email.
2. Frontend server action `ResetPasswordQuery` validates the new password and submits GraphQL `resetPassword`.
3. `AuthResolver.resetPassword()` calls `AuthService.resetPassword()`.
4. `resetPassword()` verifies the token using the dedicated reset-password secret.
5. It also checks the token purpose before updating the password hash.
6. The stored password is replaced with a new Argon2 hash.

## Important Backend Functions

### `UserService.generateActivationToken`

File: [user.service.ts](/C:/Users/Jovan/.codex/worktrees/875d/ReLive-CreativityInnovation/apps/backend/src/user/user.service.ts)

What it does:

- Signs the short-lived activation token used during email verification.

Why it exists:

- Registration should not create active accounts until the email owner confirms the address.

### `UserService.register`

What it does:

- Validates duplicate email checks.
- Hashes the password.
- Sends the activation email.
- Delays real account creation until activation.

### `AuthService.validateLocalUser`

File: [auth.service.ts](/C:/Users/Jovan/.codex/worktrees/875d/ReLive-CreativityInnovation/apps/backend/src/auth/auth.service.ts)

What it does:

- Verifies local sign-in credentials.

Why it matters:

- It now returns one generic error message for bad credentials instead of separate “user not found” vs “wrong password” messages.

### `AuthService.login`

What it does:

- Creates the backend JWT access token and returns the safe auth payload used by the frontend.

Used by:

- GraphQL sign-in
- Google OAuth handoff creation

### `AuthService.validateGoogleUser`

What it does:

- Maps a Google profile into a local user record.

Why it changed:

- OAuth users used to be created with an empty password string.
- Now they get a random hashed placeholder password instead.

### `AuthService.createGoogleAuthHandoff`

What it does:

- Stores the final Google auth payload in memory and returns only a random code.

Used by:

- `AuthController.googleCallback()`

### `AuthService.exchangeGoogleAuthHandoff`

What it does:

- Turns the one-time Google code back into the final auth payload and deletes the code immediately.

Used by:

- `POST /auth/google/exchange`

### `AuthService.forgotPassword`

What it does:

- Starts the password reset email flow with a generic outward response.

Why it matters:

- It avoids user enumeration.
- It uses a reset-specific token secret and purpose.

### `AuthService.resetPassword`

What it does:

- Verifies the reset token and replaces the stored password hash.

Why it matters:

- Reset tokens are now purpose-specific and isolated from normal login JWT usage.

### `AuthController.activate`

File: [auth.controller.ts](/C:/Users/Jovan/.codex/worktrees/875d/ReLive-CreativityInnovation/apps/backend/src/auth/auth.controller.ts)

What it does:

- Verifies the activation token and creates the real database user once.

Why it matters:

- It now checks for existing email first so activation links do not create duplicate users.

## Important Frontend Functions

### `Register`

File: [auth.ts](/C:/Users/Jovan/.codex/worktrees/875d/ReLive-CreativityInnovation/apps/frontend/lib/auth.ts)

What it does:

- Validates register form data.
- Calls the backend register mutation.
- Returns a safe success message instead of logging sensitive form values.

### `Login`

What it does:

- Validates the login form.
- Calls backend `signIn`.
- Creates the frontend encrypted session cookie.

### `ForgotPasswordQuery`

What it does:

- Sends forgot-password requests and only shows generic privacy-safe messages.

### `ResetPasswordQuery`

What it does:

- Sends reset-password requests and shows a success/error message without exposing sensitive values in logs.

### `createSession`

File: [session.server.ts](/C:/Users/Jovan/.codex/worktrees/875d/ReLive-CreativityInnovation/apps/frontend/lib/session.server.ts)

What it does:

- Encrypts and stores the frontend session cookie.

Why it matters:

- The browser keeps an httpOnly session cookie instead of manually managing the raw backend JWT.

### `GET /api/auth/google/callback`

File: [route.ts](/C:/Users/Jovan/.codex/worktrees/875d/ReLive-CreativityInnovation/apps/frontend/app/api/auth/google/callback/route.ts)

What it does:

- Exchanges the short-lived backend Google handoff code for the final auth payload and creates the session cookie.

## Security Changes Made In This Pass

1. Removed backend startup logs that printed email credentials.
2. Removed frontend auth logs that printed raw passwords, tokens, or form bodies.
3. Replaced Google token-in-query flow with a one-time handoff code flow.
4. Switched password reset to a dedicated secret with explicit token purpose.
5. Switched account activation to a dedicated secret with explicit token purpose.
6. Stopped forgot-password responses from revealing whether the email exists.
7. Stopped login responses from revealing whether the email or password was wrong.
8. Stopped Google-created accounts from storing an empty password string.
9. Moved backend URLs and frontend URLs toward config-based helpers instead of hardcoded values.
10. Added comments above important auth functions so the intent is easier to follow later.

## Important Config Expectations

Backend envs that matter for auth:

- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `EMAIL_SECRET` or `ACCOUNT_ACTIVATION_SECRET`
- `RESET_PASSWORD_SECRET`
- `FRONTEND_URL` or `APP_FRONTEND_URL`
- `BACKEND_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_CALLBACK_URL`
- `EMAIL_USER`
- `EMAIL_PASS`

Frontend envs that matter for auth:

- `NEXT_PUBLIC_BACKEND_URL`
- `SESSION_SECRET_KEY`

## Future Improvements

Good next steps for auth and user:

1. Move the Google OAuth handoff store from in-memory to Redis or database storage for multi-instance deployments.
2. Add refresh tokens or rotating sessions instead of one long-lived access token inside the frontend session.
3. Add route protection helpers for protected frontend pages so unauthenticated redirects are fully centralized.
4. Add rate limiting for login, forgot-password, and Google exchange endpoints.
5. Add audit logging for auth events without storing sensitive request bodies.
6. Add email-template localization and better success/error query states on the login page after activation or Google failures.
7. Add automated tests for register activation, forgot-password privacy behavior, and Google exchange code expiry.

## Rule For Future Auth Edits

When editing auth or user flows:

1. Never place raw access tokens in browser URLs.
2. Prefer one generic outward-facing error for credential failures and password reset requests.
3. Keep password reset and account activation tokens separated from normal login JWT secrets when possible.
4. Keep the frontend session cookie httpOnly and let server code create it.
5. Keep visual auth layouts stable unless there is a very strong reason to redesign.

---

# Cookbook Feature Workflow Notes

This section explains how the cookbook and recipe-discovery feature works now, including the newer scroll-based route design.

## Main Goal

The cookbook feature is designed to:

1. Let users search healthy home-cooked recipes from `/cookbook`.
2. Fetch recipe data from the backend using one normalized recipe shape.
3. Reuse local database cache before calling external APIs.
4. Show ingredients, instructions, images, and basic nutrition clues in-app.
5. Link recipe exploration with the `/foods` page so users can move between a dish and its nutrition search.

## Important Route Note

There are now two cookbook frontend implementations on purpose:

1. The older page experience in [CookbookExperience.tsx](/C:/Users/Jovan/.codex/worktrees/875d/ReLive-CreativityInnovation/apps/frontend/components/cookbook/CookbookExperience.tsx)
2. The newer visual route shell in [NewCookbookExperience.tsx](/C:/Users/Jovan/.codex/worktrees/875d/ReLive-CreativityInnovation/apps/frontend/components/cookbook/NewCookbookExperience.tsx)

The current `/cookbook` route renders the new component, but the older one is intentionally kept for reference and comparison.

## High-Level Cookbook Flow

### Frontend Flow

1. User opens `/cookbook`.
2. [page.tsx](/C:/Users/Jovan/.codex/worktrees/875d/ReLive-CreativityInnovation/apps/frontend/app/cookbook/page.tsx) resolves `query` and `recipe` from URL params.
3. The page currently renders [NewCookbookExperience.tsx](/C:/Users/Jovan/.codex/worktrees/875d/ReLive-CreativityInnovation/apps/frontend/components/cookbook/NewCookbookExperience.tsx).
4. `NewCookbookExperience` calls [useRecipeSearch.ts](/C:/Users/Jovan/.codex/worktrees/875d/ReLive-CreativityInnovation/apps/frontend/hooks/useRecipeSearch.ts).
5. `useRecipeSearch` debounces the search term and calls [recipe.service.ts](/C:/Users/Jovan/.codex/worktrees/875d/ReLive-CreativityInnovation/apps/frontend/services/recipe.service.ts).
6. The frontend recipe service calls backend `GET /api/recipes?query=...`.
7. The route renders:
   - search input
   - recent searches
   - result list
   - selected recipe detail panel
   - links back into `/foods`

### Backend Flow

1. Frontend sends request to `/api/recipes`.
2. REST enters [recipe.controller.ts](/C:/Users/Jovan/.codex/worktrees/875d/ReLive-CreativityInnovation/apps/backend/src/recipe/recipe.controller.ts).
3. Controller calls [recipe.service.ts](/C:/Users/Jovan/.codex/worktrees/875d/ReLive-CreativityInnovation/apps/backend/src/recipe/recipe.service.ts).
4. `RecipeService.searchRecipes()` follows the layered strategy:
   - normalize query
   - check local database cache first
   - if missing, call Spoonacular
   - store normalized Spoonacular results in local database
   - if Spoonacular fails or quota is exceeded, call TheMealDB
   - store fallback results in local database
   - return unified recipe objects

## Frontend Component Workflow

### `CookbookPage`

File: [page.tsx](/C:/Users/Jovan/.codex/worktrees/875d/ReLive-CreativityInnovation/apps/frontend/app/cookbook/page.tsx)

What it does:

- Reads `query` and `recipe` from the URL.
- Keeps the old `CookbookExperience` snippet commented for reference.
- Renders `NewCookbookExperience` so the current route uses the new design.

### `NewCookbookExperience`

File: [NewCookbookExperience.tsx](/C:/Users/Jovan/.codex/worktrees/875d/ReLive-CreativityInnovation/apps/frontend/components/cookbook/NewCookbookExperience.tsx)

What it does:

- This is the new styled cookbook page.
- It keeps the same recipe backend logic as the older cookbook page.
- It changes only the presentation layer into a parchment/scroll-style experience.
- It owns:
  - selected recipe state
  - recent search state
  - scroll-based visual animation
  - result selection and pagination controls

How it behaves:

1. User types in the recipe input.
2. `setQuery` updates the hook state.
3. Debounce waits briefly.
4. Recipe fetch starts.
5. Results return from the shared backend recipe flow.
6. If `recipe` exists in the URL, the component tries to select that exact recipe first.
7. Otherwise, it selects the first available recipe.
8. Clicking a recipe card replaces the selected recipe detail.

### `useRecipeSearch`

File: [useRecipeSearch.ts](/C:/Users/Jovan/.codex/worktrees/875d/ReLive-CreativityInnovation/apps/frontend/hooks/useRecipeSearch.ts)

What it does:

- Handles recipe-page search state.
- Debounces the query before fetching.
- Owns page-based pagination state.
- Calls the frontend recipe service.
- Returns normalized result data for the route.

Important functions:

- `setQuery`
  - updates the search term
  - resets page back to `1`

- `runSearch`
  - performs the real fetch using the debounced query

- `nextPage` / `previousPage`
  - paginate recipe search results

### `searchRecipes`

File: [recipe.service.ts](/C:/Users/Jovan/.codex/worktrees/875d/ReLive-CreativityInnovation/apps/frontend/services/recipe.service.ts)

What it does:

- This is the frontend transport layer for recipes.
- It normalizes query input.
- It keeps a short-lived in-memory cache keyed by query + page + limit.
- It hides the backend request details from page components.

## Backend Recipe Flow By Function

### `RecipeController.searchRecipes`

File: [recipe.controller.ts](/C:/Users/Jovan/.codex/worktrees/875d/ReLive-CreativityInnovation/apps/backend/src/recipe/recipe.controller.ts)

What it does:

- REST entry point for `/api/recipes`.
- Reads `query`, `page`, and `limit` from the request.
- Passes safe values into `RecipeService.searchRecipes()`.

### `RecipeService.searchRecipes`

File: [recipe.service.ts](/C:/Users/Jovan/.codex/worktrees/875d/ReLive-CreativityInnovation/apps/backend/src/recipe/recipe.service.ts)

This is the main recipe workflow.

Exact order:

1. Normalize incoming query and limits.
2. Search local `RecipeCache` records first.
3. If local records are enough, return them.
4. If not enough, try Spoonacular.
5. Convert Spoonacular data into the unified `Recipe` shape.
6. Upsert those normalized recipes into local cache.
7. If Spoonacular fails or quota is exceeded, try TheMealDB.
8. Convert TheMealDB results into the same unified `Recipe` shape.
9. Upsert fallback results too.
10. Return one consistent response payload to the frontend.

### `SpoonacularConnector.searchRecipes`

File: [spoonacular.connector.ts](/C:/Users/Jovan/.codex/worktrees/875d/ReLive-CreativityInnovation/apps/backend/src/recipe/providers/spoonacular.connector.ts)

What it does:

- Calls Spoonacular as the primary recipe source.
- Maps image, title, cook time, nutrition, ingredients, and instructions into the shared recipe model.
- Detects quota-limit failures so the service can switch to TheMealDB.

### `TheMealDbConnector.searchRecipes`

File: [themealdb.connector.ts](/C:/Users/Jovan/.codex/worktrees/875d/ReLive-CreativityInnovation/apps/backend/src/recipe/providers/themealdb.connector.ts)

What it does:

- Calls TheMealDB as the fallback recipe source.
- Normalizes its response into the same shared recipe shape.
- Fills in what it can even though it has less nutrition detail than Spoonacular.

## Recipe Database Cache

Database model:

- `RecipeCache` in Prisma schema

What is stored:

- title
- image URL
- calories
- protein
- cook time
- ingredients
- instructions
- source
- normalized title/search fields

Why it exists:

1. Avoid repeating the same external API requests.
2. Reduce Spoonacular quota usage.
3. Return repeated recipe searches faster.
4. Keep recipe rendering stable between `/cookbook` and `/foods`.

## `/cookbook` and `/foods` Relationship

The recipe system is connected both ways now:

1. `/foods` can show related recipes for a searched food.
2. `/foods` can open `/cookbook` with `query` and `recipe` URL params.
3. `/cookbook` can send the user back to `/foods` with the same selected recipe id.
4. Ingredient links inside recipe details can search those ingredient terms inside `/foods`.

Why this matters:

- the food page and recipe page should feel like one connected nutrition-and-cooking system
- searching `rice` should not feel like two unrelated features anymore

## New Scroll Design Notes

The newer cookbook page was intentionally redesigned away from the simpler layout.

Design rules for the new page:

1. Treat `/cookbook` as a fantasy or parchment experience, not a plain dashboard.
2. Keep the backend search flow exactly the same unless there is a real feature reason to change it.
3. Prefer improving presentation in `NewCookbookExperience` instead of rewriting shared recipe logic.
4. Keep the page comfortable for long recipe content, which is why the scroll-like structure exists.
5. Preserve the strong background, warm parchment surfaces, and motion accents unless the team explicitly decides to re-theme it.

## Future Improvements

Good next steps for the cookbook feature:

1. Port the new scroll/fantasy design language into `/foods` so both pages feel like one system.
2. Add explicit fetch logs for recipe search similar to the food search logs.
3. Add filters for high-protein, vegetarian, quick meals, and calorie ranges.
4. Add “save recipe” or favorite recipe state.
5. Add a recipe-by-id backend endpoint if exact direct lookup becomes necessary later.
6. Add richer nutrition support for fallback recipes when data is missing.
7. Add tests for cache -> Spoonacular -> TheMealDB fallback behavior.

## Rule For Future Cookbook Edits

When editing cookbook or recipe discovery:

1. Do not delete the older `CookbookExperience` unless the team explicitly decides to retire it.
2. Prefer adding new visual experiments in separate components rather than rewriting the old one blindly.
3. Keep recipe fetching logic shared through the existing hook and backend service.
4. Keep `/cookbook` and `/foods` linked through shared query and recipe params when possible.
5. Preserve the more stylized scroll direction unless there is a strong product reason to flatten it.

---

# Frontend Visual Style Review Notes

This section is a design review only. It explains the current visual language used by the frontend so future pages can match the project better.

## Overall Conclusion

The frontend is not designed like a plain SaaS dashboard or a minimal utility app.

Its style direction is:

1. Immersive and scene-based
2. Gamified and world-driven
3. Emotional and character-led
4. High-motion, high-atmosphere, and visually expressive
5. More like an interactive fantasy wellness world than a standard fitness admin panel

So when building future pages, the default target should not be:

- flat white cards
- generic gray tables
- standard enterprise layout
- plain form pages with no atmosphere

The better target is:

- cinematic backgrounds
- layered depth
- clear themed surfaces
- playful but intentional motion
- pages that feel like part of the same world

## Auth Style Analysis

Main references:

- [login/page.tsx](/C:/Users/Jovan/.codex/worktrees/875d/ReLive-CreativityInnovation/apps/frontend/app/auth/login/page.tsx)
- [register/page.tsx](/C:/Users/Jovan/.codex/worktrees/875d/ReLive-CreativityInnovation/apps/frontend/app/auth/register/page.tsx)

### What auth looks like

The auth pages feel like a magical winter stage rather than a normal login screen.

The main traits are:

1. Split-scene layout
   - left side is a character stage
   - right side is the actual form area

2. Strong environment background
   - deep navy, icy blue, aurora, stars, and snow motifs
   - the page feels like a cold fantasy night scene

3. Character-driven interaction
   - the animated faces react to focus, typing, and errors
   - the UI is not static; it responds emotionally to user behavior

4. Frosted/glass surfaces
   - forms use translucent, glowing, layered containers
   - highlights, soft borders, and blur are important

5. Rich motion
   - floating motion
   - shaking on error
   - gaze tracking
   - ambient drifting decoration

### Auth design conclusion

The auth style is:

- whimsical
- reactive
- polished
- fantasy-adjacent
- emotionally expressive

It is not minimalist. It intentionally uses theatrical composition and character presence to make basic flows memorable.

## `/world` Style Analysis

Main reference:

- [WorldScene.tsx](/C:/Users/Jovan/.codex/worktrees/875d/ReLive-CreativityInnovation/apps/frontend/components/world/WorldScene.tsx)

### What `/world` looks like

The world page feels like an explorable storybook map or game hub.

The main traits are:

1. Full-screen experience
   - the page acts like a scene, not a document
   - content is placed spatially, not just vertically

2. Worldbuilding first
   - locations are represented as hotspots
   - the user is entering a village, not browsing a menu

3. Environmental motion
   - clouds
   - birds
   - shimmer
   - animated reveals
   - zoom and camera movement

4. Highly visual navigation
   - destinations are cards floating inside the world
   - routing feels like traveling to a place

5. Fantasy-meets-wellness tone
   - “Health World”
   - “Nutrition Hub”
   - “Astral Profile”
   - this is a themed universe, not isolated feature pages

### `/world` design conclusion

The world style is:

- immersive
- playful
- spatial
- game-like
- welcoming and exploratory

It sets the strongest visual identity in the app. Other major feature pages should feel like they belong to this same universe, even if they are more practical.

## Shared Style Language Between Auth And World

Even though auth and `/world` look different on the surface, they share core design DNA:

1. Atmosphere over flatness
   - backgrounds matter
   - pages are scenes, not empty containers

2. Motion with purpose
   - animation is part of storytelling, not decoration only

3. Strong theming
   - each page has a visual identity
   - color, space, and interaction are aligned around a theme

4. Soft fantasy tone
   - not medieval fantasy exactly
   - more like magical wellness, celestial adventure, or storybook health-tech

5. Emotion and delight
   - the UI tries to feel alive
   - it is okay for pages to feel surprising, playful, or dramatic

## Practical Style Rule For Future Pages

When creating or redesigning a major frontend page, the preferred direction is:

1. Start from a strong visual concept first
   - example: parchment, celestial observatory, village workshop, frost-glass sanctuary

2. Build the background and atmosphere intentionally
   - gradients
   - lighting
   - scene layers
   - soft environmental motion

3. Use containers that feel crafted
   - frosted panels
   - parchment cards
   - glowing frames
   - world-themed sections

4. Let interaction feel alive
   - hover state
   - subtle reveal
   - staggered loading
   - visual response to input

5. Avoid generic dashboard styling unless the feature absolutely requires it

## What Future Pages Should Feel Like

If a new page fits the current frontend well, it should feel like:

- a place inside the ReLive world
- visually rich but still readable
- stylized without becoming chaotic
- interactive without being noisy
- useful, but never sterile

## Design Warning

If a page starts looking like:

- plain white background
- generic Tailwind cards
- default input/button stacks
- no atmosphere
- no motion
- no thematic identity

then it is probably drifting away from the established frontend style.

## Recommendation For Future Work

For future features, especially `/foods`, `/cookbook`, and other core wellness pages:

1. Reuse the immersive mindset from `/world`
2. Reuse the crafted, emotionally expressive interaction style from auth
3. Create each feature as a themed environment, not just a data screen
4. Keep usability clear, but do not flatten the experience into generic UI
>>>>>>> codex/implement-food
