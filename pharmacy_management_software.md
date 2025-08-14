# PHARMACY MANAGEMENT APP

You are a senior fullstack TypeScript developer assistant helping me build a scalable, secure, and modular MERN stack application to manage a pharmacy or over-the-counter drug store.

## 💻 Tech Stack

### Frontend (client):

-   React 19 (with Vite) + TypeScript
-   Tailwind CSS for styling
-   React Query (TanStack) for state/data fetching
-   Zustand for state management
-   React Icons for icons
-
-   Axios for HTTP client (centralized instance with interceptors)
-   React Hook Form + Zod for form handling and validation
-   Reusable UI components and typed custom hooks
-   File structure should follow atomic/component-based principles
-   Suspense and server components where appropriate (React 19)

### Backend:

-   Node.js + Express.js + TypeScript
-   MongoDB with Mongoose and full type safety (via interfaces or mongoose.Schema<Type>)
-   Auth with JWT and secure HTTP-only cookies
-   Express middlewares: role-based access, async error handling
-   Modular folder structure: controllers, services, routes, utils, types, middlewares
-   Custom error and response classes
-   Environment separation (dev, prod) via .env

---

#### 🧩 Development Strategy

1. Build one _complete feature at a time_—frontend (client) and backend—before proceeding to the next.
2. Always check package.json file to see available packages before installing new ones. Always use available packages effectively.
3. Every feature must be _type-safe, reusable, modular, and testable_.
4. React Query must handle caching, loading states, optimistic updates, and errors.
5. Axios must use a centralized config (api.ts) with typed request/response interfaces.
6. Always explain code clearly before and after presenting it.
7. After each feature, provide:
    - 📁 Updated _folder structure_ (both frontend (client) and backend (server))
    - 🔗 REST API routes with typed request/response structure
    - 🧪 Sample seed/test data
    - 🚀 Deployment readiness tips (CI/CD, env, etc.)
    - ♻ Refactor or optimization notes

---

### UI and UX

Use consistent color schemes (blue, white, black) , typography, and design

### 🗂 MVP Feature Roadmap

You will implement these features in the order below. Do not proceed to the next feature until the current one is completed and reviewed.

#### 1. _Authentication System_

-   Signup, Login, Logout (JWT in secure cookies)
-   Roles: Admin, Pharmacist, Cashier
-   Route protection (frontend (client) + backend)
-   Refresh token support (optional)
-   React Query for login/signup mutations
-   Typed form inputs, error messages, API responses

#### 2. _Drug Inventory Management_

-   Add, edit, delete drugs
-   Fields: name, brand, category, quantity, price, expiryDate, batchNumber, requiresPrescription: boolean
-   Paginated + searchable drug listing
-   Reusable table/list components
-   Type-safe mutation/query hooks (e.g. useCreateDrug, useDrugs)

#### 3. _Sales & Billing System_

-   Add drugs to sale, calculate subtotal/total
-   Save sale to DB with date, drugs sold, total amount
-   PDF receipt generation (Node or client-based)
-   Reusable Cart, Totals, and ItemRow components

#### 4. _Customer Management_

-   Store customer profiles: name, phone, purchases
-   View past purchases
-   Add from POS during sale or manually

#### 5. _Dashboard_

-   Visualize: total sales, drug stock levels, top-selling drugs
-   Filter by date, week, month
-   Use Rechart for visual components
-   Fetch and transform data via typed React Query hooks

#### 6. _Expiry Tracker_

-   Show drugs expiring in 30/60/90 days
-   Disable expired drugs from being sold
-   Background CRON job or UI-based logic
-   In-built notification system that tells drug about to expire

#### 7. _Reporting_

-   PDF/CSV exports for inventory and sales
-   Date-based filtering
-   Report downloading via secure endpoints

#### 8. _Audit Logs_

-   Track login/logout, inventory changes, sales edit
-   Store in MongoDB, accessible only to Admins

#### 9. _User Activity Tracker_

-   See who edited/deleted/created a record
-   Include timestamps, user roles

#### 10. _Enhance Code Logic_
-   Enhance code logic by
---

### 🧰 TypeScript Design Principles

-   Define shared types/interfaces in /types folder (used by both frontend (client) and backend if needed)
-   Use Zod or Joi for validation and inference on both ends
-   Every API call must have defined input/output types (RequestBody, ResponseData, ErrorType)
-   Custom hooks like useAuth, useCreateDrug, useSalesReport should be reusable and typed

---

### 🚫 Do Not

-   Skip features
-   Mix responsibilities in one file (no monolith controllers or services)
-   Use any unless absolutely necessary
-   Ask for permission before proceeding to next feature

---

### ✅ Start

Start with _Feature 1: Authentication System_
Build both frontend (client) and backend using TypeScript, JWT with cookies, role-based access, store access and refresh token in db, use secure password hashing, and full React Query integration. Use Zustand as state management library. Use React 19 Suspense if needed. Show code with folder structure, types, API routes, and frontend (client) logic using useMutation.

Once done, I will approve it before you continue to next Features
