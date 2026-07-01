 # VolunteerConnect (Next.js) — Developer README

## Overview
**VolunteerConnect** is a private **Next.js (v15)** web application focused on connecting volunteers/resources with operational tasks and coordinating communication. It includes:
- A public landing page with a live crisis map
- Firebase-backed authentication (Google sign-in)
- An NGO dashboard with role-based access control
- Real-time dashboard KPIs (Firestore `onSnapshot`)
- Data export utilities (CSV/XLSX/PDF)
- Calendar event generation via Google Calendar URLs
- Firebase-backed activity/audit logging utilities
- NGO messaging UI backed by Firestore

> Note: The repository’s `package.json` identifies the app name as **“mcp”**.

---

## Key Features
- **Authentication & Profiles (Firebase Auth + Firestore)**
  - Google login via popup
  - User state managed through a React context (`AuthProvider`)
  - On first login, creates a Firestore user document (`users/{uid}`)
  - Logout clears auth state and browser storage

- **Role-protected NGO Dashboard**
  - NGO dashboard routes enforce authentication
  - Only these roles are allowed into the NGO dashboard shell:
    - `ngodashboard`, `admin`, `superadmin`
  - Unauthenticated/unauthorized users are redirected to `/login`

- **Real-time Operational KPIs (Firestore live subscriptions)**
  - Dashboard subscribes to:
    - `resources`
    - `tasks`
    - `activities`
  - KPIs include counts such as active/open resources, assigned tasks, resolved today, and a recent activities feed

- **AI Daily Briefing Integration**
  - Dashboard fetches `/api/briefing` to display a “Gemini AI Daily Briefing” card
  - Uses fallback messaging if the request fails

- **Export Utilities for Tabular Data**
  - Export functions for:
    - **CSV** via `papaparse`
    - **XLSX** via `xlsx`
    - **PDF** via `jspdf` + `autotable`
  - Includes helper for downloading generated files in the browser

- **Google Calendar Event Creation**
  - Generates a Google Calendar “render” URL from a task
  - Opens the URL in a new tab to allow users to add events

- **Activity & Audit Logging (Firestore)**
  - `logActivity`: writes to `activities` with server timestamps
  - `logAdminAction`: writes to `auditLog` with admin/audit details; rethrows on failure

- **Messaging UI (Firestore-backed)**
  - NGO messaging page subscribes to `messages` ordered by `createdAt`
  - Admin can send messages to the currently selected coordinator
  - Auto-scrolls to newest messages
  - Includes timestamp rendering and delivered-style indicator for admin messages

- **Modal Workflows (Coordinator Management + Task Assignment)**
  - AssignTask modal:
    - Validates required input fields
    - Creates a new `tasks` document with assignment metadata
  - AddCoordinator modal:
    - Two-step flow collecting account + profile details
    - Validates skills and required fields
    - Generates a unique `coordinatorId`
    - Calls `/api/auth/register-coordinator` to create the coordinator account

---

## Tech Stack
- **Framework / UI**
  - Next.js (App Router), React
  - Tailwind CSS (v4) + Tailwind-related utilities
  - Animations support via UI libraries (e.g., motion/animation dependencies)
- **Backend / Data**
  - **Firebase**
    - Firebase Auth
    - Firestore (real-time via `onSnapshot`)
    - Firebase Storage (initialized/exported even if not used everywhere)
- **Mapping / Visualization**
  - Leaflet + react-leaflet
  - Recharts for charts
- **Exports / Document Generation**
  - CSV: `papaparse`
  - Excel: `xlsx`
  - PDF: `jspdf` + `jspdf-autotable`
  - File saving: `file-saver`
- **Data/Utility Libraries**
  - `uuid` (implied by typical usage; not explicitly summarized)
  - Parsing utilities: `PapaParse` shown in export utils
- **AI / Email**
  - `@google/generative-ai`
  - `resend` (email utility)

---

## Project Architecture
This is an **App Router** Next.js app with shared providers and feature-based route grouping.

### Root Layout & Global Providers
- **`src/app/layout.tsx`**
  - Defines SEO metadata (title/description/keywords)
  - Loads **Plus Jakarta Sans** and applies CSS variables/classes
  - Applies **global CSS** (`src/app/globals.css`)
  - Wraps the entire application in **`AuthProvider`**
  - Renders global background décor and a persistent **`AIChatbot`**
  - Provides a shared `<main>` container for page content

### Authentication Layer
- **`src/lib/firebase.ts`**
  - Initializes Firebase from environment variables
  - Ensures initialization runs only once
  - Exports:
    - `auth`
    - `db` (Firestore)
    - `storage`
- **`src/lib/auth-context.tsx`**
  - Implements authentication state via React context:
    - `user`, `userData`, `loading`
  - Listens to Firebase auth changes via `onAuthStateChanged`
  - Creates a user profile document in `users/{uid}` when missing
  - Exposes:
    - `loginWithGoogle()`
    - `logout()`
    - `useAuth()` hook for consumers

### Dashboard (NGO) — Role Guard + Shell UI
- **`src/app/dashboard/ngo/layout.tsx`**
  - Client-side layout wrapper that:
    - Redirects unauthenticated users to `/login`
    - Redirects users lacking allowed roles to `/login`
  - Renders:
    - Left sidebar (Overview, Resources, Coordinators, Heatmap, plus Settings and Logout)
    - Header with:
      - Search input (updates `?s=` with 500ms debounce)
      - Notifications icon (with badge)
      - Current user info (name/role/photo)
    - Main content area for route children
  - Logout behavior:
    - Calls `logout()`
    - Navigates to `/login`
    - Triggers refresh (with a fallback redirect if necessary)

### NGO Dashboard Pages
- **`src/app/dashboard/ngo/page.tsx`**
  - Client page that renders:
    - Real-time KPI cards using Firestore `onSnapshot`
    - AI daily briefing (`/api/briefing`)
    - Recent resource requests table with `?s=` filtering
    - Live activity feed (`LiveActivityFeed`)
    - Export action (`ExportDataButton`)
  - Uses `Suspense` for loading UX

- **`src/app/dashboard/ngo/messages/page.tsx`**
  - Messaging UI split layout:
    - Coordinator list (select active chat)
    - Main chat panel with Firestore `messages` subscription
    - Desktop right sidebar with static info + decorative card
  - Sends messages by writing to Firestore `messages` with:
    - `sender`, `content`, `role`, `targetId`, `createdAt`

- **`src/app/dashboard/ngo/coordinators/AssignTaskModal.tsx`**
  - Modal to assign a task to a coordinator
  - Validates inputs (e.g., title, target location, resource type/priority)
  - Writes a new document to Firestore `tasks` with assignment metadata

- **`src/app/dashboard/ngo/coordinators/AddCoordinatorModal.tsx`**
  - Two-step modal:
    1. Account details (name/email/phone/initial password)
    2. Profile details (service zone, skills, availability)
  - Validations:
    - Required fields present
    - At least one skill selected
  - Creates a new coordinator via backend endpoint:
    - `POST /api/auth/register-coordinator`
  - On success:
    - Triggers `onSuccess()` and closes via `onClose()`

### Utility Libraries
- **`src/lib/export-utils.ts`**
  - Exports structured tabular data:
    - `exportToCSV(data, filename)`
    - `exportToXLSX(data, filename)`
    - `exportToPDF(data, filename, title)`
  - Calendar helpers:
    - `getGoogleCalendarUrl(task)`
    - `addToGoogleCalendar(task)`
- **`src/lib/activity.ts`**
  - `logActivity({ user, action, target, type })`
  - Writes to Firestore `activities` with server-generated timestamp
  - Fails silently (logs to console)
- **`src/lib/auditLog.ts`**
  - `logAdminAction(action, targetType, targetId, oldValue?, newValue?)`
  - Writes to Firestore `auditLog` with server timestamp
  - Logs errors and **rethrows** on failure (callers can stop related mutations)

---

## Installation
> Placeholder instructions (repo scripts and environment variables are implied by Firebase/AI usage).

1. **Clone the repository**
   bash
   git clone <repository-url>
   cd volunteerconnect
   

2. **Install dependencies**
   bash
   npm install
   

3. **Configure environment variables**
   - The app expects **Firebase configuration via environment variables** (used by `src/lib/firebase.ts`).
   - It also uses AI/email utilities (e

---
 
