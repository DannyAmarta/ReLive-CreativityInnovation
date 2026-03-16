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
