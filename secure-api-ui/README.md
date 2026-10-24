# SecureAPI Frontend (React + TypeScript + Vite + Tailwind CSS)

A clean, modern, minimal frontend for the **SecureAPI** practical project demonstrating JWT Authentication and Role-Based Access Control (RBAC) integrated with a Spring Boot backend.

## 🚀 Technologies

- **React 19** with **TypeScript**
- **Vite**
- **Tailwind CSS v4**
- **React Router v7** (`react-router-dom`)
- **Axios** (Centralized instance with JWT request/response interceptors)
- **Lucide React** (Clean modern icons)
- **ESLint**

## 📂 Project Structure

```
src/
├── components/
│   ├── Layout.tsx             # Main layout container with navbar and footer
│   ├── Navbar.tsx             # Top navigation with role badge and logout
│   └── LoadingSpinner.tsx     # Reusable loading spinner
├── context/
│   └── AuthContext.tsx        # Authentication state (token, username, role, login/logout)
├── pages/
│   ├── Login.tsx              # /login - Login & registration UI
│   ├── Dashboard.tsx          # /dashboard - User status & summary
│   ├── UserProfile.tsx        # /profile - Fetch & display /api/user/profile
│   ├── AdminPanel.tsx         # /admin - List & delete users via /api/admin/users
│   └── AccessDenied.tsx       # /access-denied - 403 error page
├── routes/
│   ├── ProtectedRoute.tsx     # Guards routes requiring authentication
│   └── RoleProtectedRoute.tsx # Guards routes requiring ADMIN role
├── services/
│   └── api.ts                 # Centralized Axios instance & API service functions
├── types/
│   └── auth.ts                # TypeScript interfaces (User, LoginRequest, AuthState, etc.)
├── App.tsx                    # Route definitions and AuthProvider wrapper
└── main.tsx                   # Entry point
```

## ⚙️ Environment Setup

Create a `.env` file in the `secure-api-ui` directory:

```env
VITE_API_URL=http://localhost:5000
```

## 📦 Installation & Running

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run development server:**
   ```bash
   npm run dev
   ```
   The application will run at [http://localhost:5173](http://localhost:5173).

3. **Build for production:**
   ```bash
   npm run build
   ```

## 🔐 Authentication & RBAC Flow

1. **Login (`/login`):**
   - Sends `POST /api/auth/login` with `{ username, password }`.
   - On success, stores `token`, `username`, and `role` in `localStorage` and `AuthContext`, then redirects to `/dashboard`.
2. **Axios Interceptors (`src/services/api.ts`):**
   - Automatically attaches `Authorization: Bearer <JWT_TOKEN>` header to all outgoing requests.
   - Listens for `401 Unauthorized` responses and automatically logs out the user and redirects to `/login`.
   - Listens for `403 Forbidden` responses and redirects to `/access-denied`.
3. **Role-Based Access Control (RBAC):**
   - **`USER` Role:** Can access `/dashboard` and `/profile`. Cannot see or access `/admin` (redirected to `/access-denied`).
   - **`ADMIN` Role:** Can access `/dashboard`, `/profile`, and `/admin`. Can view all users and delete non-admin/user accounts.
