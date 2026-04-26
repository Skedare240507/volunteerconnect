# VolunteerConnect — Smart Resource Allocator

> **Google Solution Challenge 2025** | Smart Resource Allocation Track
> SDG 1 · SDG 3 · SDG 10 · SDG 17

**Both names refer to the same platform.** VolunteerConnect (used in mobile app, PRD, matching engine) and Smart Resource Allocator (used in website, admin panel, coordinator assignment) are one unified system.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Platform Architecture](#2-platform-architecture)
3. [All 5 User Roles](#3-all-5-user-roles)
4. [Complete Feature List — 188 Features](#4-complete-feature-list)
   - [Module 1 — Public Website (14)](#module-1--public-website-14-features)
   - [Module 2 — Authentication & Security (12)](#module-2--authentication--security-12-features)
   - [Module 3 — NGO Dashboard (18)](#module-3--ngo-dashboard-18-features)
   - [Module 4 — Coordinator Panel (10)](#module-4--coordinator-panel-10-features)
   - [Module 5 — Admin Panel (88)](#module-5--admin-panel-88-features)
   - [Module 6 — Coordinator ID Card System (8)](#module-6--coordinator-id-card-system-8-features)
   - [Module 7 — AI & Smart Features (10)](#module-7--ai--smart-features-10-features)
   - [Module 8 — Notifications & Communication (8)](#module-8--notifications--communication-8-features)
5. [Phase-Wise Build Plan](#5-phase-wise-build-plan)
   - [Phase 1 — Firebase Setup](#phase-1--firebase-setup--database)
   - [Phase 2 — Gemini AI Module](#phase-2--gemini-ai-module--cloud-functions)
   - [Phase 3 — Authentication](#phase-3--authentication--all-5-roles)
   - [Phase 4 — Public Website](#phase-4--public-website)
   - [Phase 5 — NGO Dashboard](#phase-5--ngo-dashboard)
   - [Phase 6 — Coordinator Panel](#phase-6--coordinator-panel)
   - [Phase 7 — Admin Panel](#phase-7--admin-panel)
   - [Phase 8 — Demo & Deployment](#phase-8--demo-data--deployment)
6. [Project Workflow — End-to-End](#6-project-workflow--end-to-end)
7. [Firestore Database Schema](#7-firestore-database-schema)
8. [Design System](#8-design-system)
9. [Tech Stack](#9-tech-stack)
10. [Non-Functional Requirements](#10-non-functional-requirements)
11. [AI Prompts & Cloud Functions](#11-ai-prompts--cloud-functions)
12. [Admin Panel — Complete Guide](#12-admin-panel--complete-guide)
13. [Demo Data & Testing](#13-demo-data--testing)
14. [Deployment](#14-deployment)
15. [Risk Register](#15-risk-register)

---

## 1. Project Overview

### Mission Statement
> Ensure that no community need goes unaddressed due to coordination failure — by making the right coordinator reach the right place at the right time.

### Problem Statement
Local NGOs in India collect critical community data — food insecurity, medical emergencies, shelter needs — through paper forms and WhatsApp messages. This data is fragmented across dozens of channels, making it impossible to:

- Identify the most urgent problems across multiple areas simultaneously
- Match available coordinators/volunteers to needs based on skills and proximity
- Track whether a need was actually resolved
- Show donors measurable impact with data

### Solution
A three-surface hybrid platform:

| Surface | Name Used | What It Does |
|---|---|---|
| Public website (Next.js) | Smart Resource Allocator | Home, About, Contact, AI Chatbot widget |
| Mobile app (React Native) | VolunteerConnect | Coordinator finds and accepts resource tasks |
| NGO Web Dashboard (Next.js) | Both names | Post resources, assign tasks, heatmap, ID cards |
| Admin Panel (Next.js) | Admin Panel | Super admin controls all users, roles, data, system |
| Firebase Backend | Shared | Firestore, Cloud Functions, FCM, Auth — same project |

### Key Metrics (Success Definition)

| Metric | Target | How Measured |
|---|---|---|
| Volunteer match rate | >80% within 1 hour | Tasks with acceptedAt / total tasks |
| Need resolution rate | >70% reach "completed" | tasks.status = completed |
| Average match time | <30 min from submission | acceptedAt - need.createdAt |
| Volunteer retention | >60% complete 3+ tasks/month | Repeat task count per volunteerId |
| NGO onboarding | 5 partner NGOs within 60 days | ngos collection count |
| Field worker adoption | >80% reports submitted digitally | needs.reportedBy diversity |

---

## 2. Platform Architecture

```
volunteerconnect/
├── website/                    # Next.js 14 — public website + all role dashboards
│   ├── app/
│   │   ├── page.tsx            # Home page
│   │   ├── about/page.tsx      # About Us
│   │   ├── contact/page.tsx    # Contact with AI preview
│   │   ├── login/page.tsx      # 5-role login
│   │   ├── register/page.tsx   # User + NGO registration
│   │   ├── ngo-dashboard/      # NGO Dashboard pages
│   │   ├── coordinator/        # Coordinator web panel
│   │   └── admin/              # Admin panel (all 13 pages)
│   ├── components/
│   │   ├── AIChatbot.tsx       # Floating chatbot widget
│   │   ├── layout/             # Sidebar, Topbar, AdminSidebar
│   │   └── ui/                 # DataTable, ConfirmModal, RoleBadge
│   ├── lib/
│   │   ├── firebase.ts         # Firebase init
│   │   ├── auth.ts             # signInWithEmail/Google/Microsoft, verify2FA
│   │   ├── auditLog.ts         # logAdminAction() — called before every mutation
│   │   └── design-system.ts   # CSS tokens as JS object for Chart.js/Maps
│   └── middleware.ts           # Route protection, role checks, ban checks
│
├── mobile/                     # React Native Expo
│   ├── app/
│   │   ├── (auth)/login.tsx    # 2-tab login (Volunteer / NGO Worker)
│   │   ├── (auth)/register.tsx # 3-step volunteer registration
│   │   ├── (volunteer)/home.tsx      # Map + task feed
│   │   ├── (volunteer)/task/[id].tsx # Full task detail + status flow
│   │   ├── (volunteer)/profile.tsx   # Skills, availability, ID card, stats
│   │   ├── (volunteer)/chat/[taskId].tsx # Real-time task chat
│   │   └── (ngo)/report.tsx    # 3-step need submission form
│   ├── components/
│   │   └── TaskCard.tsx        # Reusable task card with urgency accent
│   └── services/
│       ├── firebase.ts         # Firebase mobile init
│       └── offlineQueue.ts     # AsyncStorage queue for offline submissions
│
├── functions/                  # Firebase Cloud Functions (Node.js)
│   └── src/
│       ├── gemini.ts           # withRetry, safeParseJSON, analyzeResource, matchCoordinators, generateNGOSummary
│       ├── generateIDCard.ts   # PDF ID card generator (pdfmake + QR code)
│       ├── onResourceCreated.ts # Firestore trigger — AI analysis + deduplication + match
│       ├── matchEngine.ts      # matchCoordinatorsForResource — Distance Matrix + Gemini ranking
│       ├── sendNotification.ts # FCM push sender
│       ├── onTaskExpired.ts    # Cloud Scheduler every 5 min — auto-reassign
│       ├── onTaskCompleted.ts  # Firestore trigger — increment stats, resolve resource
│       ├── generateSummary.ts  # HTTP callable + daily 08:00 IST scheduler
│       ├── chatbot.ts          # Role-aware Gemini chatbot callable
│       ├── seedDemoData.ts     # Demo data seeder
│       ├── resetDemoData.ts    # Delete demo-* docs and re-seed
│       └── e2eTest.ts          # Automated 6-check pipeline test
│
├── shared/
│   └── types.ts                # All TypeScript interfaces for all 12 collections
│
├── firestore.rules             # Security rules for all collections
├── firestore.indexes.json      # 5 composite indexes
└── firebase.json               # Project config
```

---

## 3. All 5 User Roles

| Role | Who | Signs In Via | What They Can Do | Cannot Do |
|---|---|---|---|---|
| **Super Admin** | Platform owner | Email + Password + 2FA (TOTP only) | Everything: manage all users, NGOs, resources, coordinators, system settings, audit log, data export, broadcast | Nothing blocked |
| **NGO Dashboard** | NGO coordinator senior | Google / Microsoft / Email + TOTP 2FA | Post resource requests, assign tasks, create coordinator ID cards, view heatmap, export data, manage own coordinators | Access other NGOs data, system settings, user bans |
| **Coordinator** | Field volunteer | Email + Unique ID + 2FA (account created by NGO) | See only own tasks, accept/decline, update status, view own history, upload completion photo, SOS | Post resources, see other coordinators tasks, access dashboard |
| **Admin** | Platform-level admin | Email + Password + 2FA | Manage users, approve NGOs, view analytics, moderate content | System settings, feature flags, delete super admin |
| **Normal User** | Public visitor | Google / Microsoft / Email + optional 2FA | Browse public info, contact NGO via form, view public stats, use AI chatbot | Post resources directly, assign tasks, access dashboard |

> **Note:** Moderator is a 6th sub-role in the admin panel — created by Super Admin, has content review rights only.

### Role Storage in Firestore

```
adminUsers/{uid}:
  uid: string
  role: "superadmin" | "admin" | "ngodashboard" | "coordinator" | "user"
  assignedBy: uid
  assignedAt: Timestamp
  ngoId: string | null    (for NGO Dashboard scoping)
  isActive: boolean
```

---

## 4. Complete Feature List

**Total: 188 features | 67 P0 Critical | 26 P1 Important | 7 P2 Nice-to-have**

### Module 1 — Public Website (14 features)

| # | Feature | Priority | Platform |
|---|---|---|---|
| 1 | Home page — hero section, animated stats, SDG badges, CTA buttons, partner logos | P0 | Next.js |
| 2 | About Us — mission, vision, team, impact numbers (live from Firestore), SDG alignment | P0 | Next.js |
| 3 | Contact Us — form with name, email, subject dropdown, message textarea | P0 | Next.js |
| 4 | Real-time contact form AI preview — Gemini response as user types (debounced 800ms) | P0 | Next.js |
| 5 | AI Chatbot widget — floating bubble on all public pages, answers platform questions | P0 | Next.js |
| 6 | Chatbot role-aware responses — knows logged-in role and current page | P1 | Next.js |
| 7 | Resource stats counter — animated countUp: Resources Allocated, NGOs, Coordinators, Lives Impacted | P0 | Next.js |
| 8 | How It Works — 3-step visual: Post Resource → AI Matches → Task Completed | P0 | Next.js |
| 9 | Join as Coordinator CTA → registration form with skills, area, availability | P0 | Next.js |
| 10 | Join as NGO CTA → NGO registration form → pending admin approval | P0 | Next.js |
| 11 | Mobile-responsive design — Tailwind CSS breakpoints for all screen sizes | P0 | Next.js |
| 12 | SEO meta tags — dynamic OG tags, Twitter cards, sitemap.xml, robots.txt | P1 | Next.js |
| 13 | Dark/light mode toggle — saved to localStorage, respects system preference | P1 | Next.js |
| 14 | Cookie consent banner — GDPR-compliant with accept/reject | P2 | Next.js |

### Module 2 — Authentication & Security (12 features)

| # | Feature | Priority | Roles |
|---|---|---|---|
| 15 | Email + password login via Firebase Auth | P0 | All roles |
| 16 | Google Sign-In (OAuth) via signInWithPopup(GoogleAuthProvider) | P0 | User, NGO Dashboard |
| 17 | Microsoft Sign-In (OAuth) via OAuthProvider("microsoft.com") | P0 | User, NGO Dashboard |
| 18 | 2FA — 6-digit OTP for all roles (mandatory) | P0 | All roles |
| 19 | 2FA — TOTP authenticator app required for Admin + NGO Dashboard (not just email OTP) | P0 | Admin, NGO Dashboard, Super Admin |
| 20 | Coordinator accounts created by NGO Dashboard — no self-registration | P0 | NGO Dashboard only |
| 21 | Forgot password — email reset link, 1-hour expiry | P0 | All roles |
| 22 | Session management — 7-day JWT, refresh on activity, revoke all sessions button | P1 | All roles |
| 23 | Account lockout — 30 minutes after 5 failed login attempts, admin notified | P0 | All roles |
| 24 | Login activity log — timestamp, IP, device, location per login event | P1 | All roles |
| 25 | Role-based route protection — Next.js middleware checks role on every protected route | P0 | All roles |
| 26 | Audit trail — all auth events written to Firestore auditLog (login, logout, password change, 2FA enable) | P0 | All roles |

**Login page design:** 5-role tab switcher (Coordinator / NGO Dashboard / Admin / Super Admin / User). Coordinator tab shows additional Unique ID field. NGO Dashboard and User tabs show Google + Microsoft OAuth buttons. Admin/Super Admin tabs show email+password only with amber warning banner. 2FA OTP screen (6 individual digit inputs) shown after correct password for all roles.

### Module 3 — NGO Dashboard (18 features)

| # | Feature | Priority |
|---|---|---|
| 27 | Resource posting form — category (6 types), urgency (3 levels), GPS, photo, people affected | P0 |
| 28 | AI urgency auto-scoring — Gemini analyzes and assigns urgencyScore 0–10, extracts skills, generates title | P0 |
| 29 | Resource management table — filter by category, urgency, status, date; sortable columns | P0 |
| 30 | Assign task to nearest coordinator — AI ranks by skill+proximity+availability, NGO confirms | P0 |
| 31 | Google Maps resource heatmap — dark-styled, colored pins by urgency, HeatmapLayer for density | P0 |
| 32 | Coordinator ID card generator — printable PDF with photo, name, unique ID, NGO logo, QR code, skills, dates | P0 |
| 33 | Coordinator management — add coordinator (creates account + ID card), edit, deactivate, view task history | P0 |
| 34 | Gemini AI daily summary — auto-generated at 08:00 IST, on-demand refresh, ≤60 words, 1 action recommendation | P0 |
| 35 | Live coordinator tracker — real-time map showing active coordinators and their current task | P1 |
| 36 | Task history & records — who, when, completion status, proof photo for all tasks | P0 |
| 37 | Export PDF — pdfmake cover page + NGO logo + summary stats table + resources table + charts | P0 |
| 38 | Export CSV — filtered data download with all visible columns | P0 |
| 39 | Export to Google Sheets — one-click via Sheets API | P1 |
| 40 | Impact dashboard charts — Chart.js: category bar, resolution rate line, coordinator performance bar | P0 |
| 41 | Broadcast to coordinators — FCM push or in-app message to all assigned coordinators | P1 |
| 42 | Duplicate resource detection — Gemini flags if new resource matches same category + area + 24hrs | P1 |
| 43 | Coordinator performance scores — tasks done, acceptance rate, avg completion time, rating | P1 |
| 44 | Multi-language resource form — Marathi, Hindi, English UI labels | P2 |

**Dashboard layout:** 240px glass sidebar with 8 nav items (Overview, Resources, Coordinators, Tasks, Map View, Reports, Messages, Settings). Topbar with date greeting + notification bell + AI summary refresh button.

### Module 4 — Coordinator Panel (10 features)

| # | Feature | Priority |
|---|---|---|
| 45 | Login with unique coordinator ID — format VC-HCF-2025-0042 validated against Firestore | P0 |
| 46 | Assigned task feed — only own tasks visible, real-time Firestore listener | P0 |
| 47 | Accept or decline task — one tap, decline requires reason, triggers auto-reassignment | P0 |
| 48 | Task detail view — full description, map route, AI match explanation, NGO name | P0 |
| 49 | 4-step task status updates — Assigned → Travelling → In Progress → Completed | P0 |
| 50 | Completion photo upload — required on Mark Complete, saved to Firebase Storage | P1 |
| 51 | Own task history — all past tasks: accepted, declined, completed with dates and NGO names | P0 |
| 52 | Profile — edit skills multi-select + 7-day availability grid (affects future matching) | P0 |
| 53 | In-app chat per task — real-time Firestore listener with NGO Dashboard contact | P1 |
| 54 | SOS emergency button — long-press 2 seconds, captures location, writes to sos/{timestamp}, FCM to NGO | P1 |

**Coordinator web panel layout:** 180px sidebar (My Tasks, Profile, History, Messages, Settings). Topbar shows uniqueId badge.

**Coordinator mobile app:** Home = Google Maps dark top 40% + task feed bottom 60%. Task cards with left urgency accent bar (red/amber/teal). Haptic feedback on Accept (Expo Haptics.impactAsync). "Open in Maps" deep link for navigation.

### Module 5 — Admin Panel (88 features)

> Full separate Next.js app at /admin. Shares same Firebase project. Own auth, own routes, own permissions.

#### Sub-module 5.1 — Dashboard Overview (8 features)

| # | Feature | Priority | Role |
|---|---|---|---|
| A1 | Live platform metrics — 8 KPI cards: total users, active resources, tasks today, match rate, avg response time, resolved%, API calls, uptime | P0 | All |
| A2 | Real-time activity feed — last 20 platform events from auditLog via onSnapshot | P0 | All |
| A3 | System health panel — Firebase quota bars: Firestore reads/writes, Storage, Functions, FCM | P0 | Super Admin |
| A4 | Gemini API status card — calls count, success rate, avg latency, cost estimate, rate limit % | P0 | Super Admin |
| A5 | Maps API status card — Distance Matrix calls, total elements, estimated cost | P1 | Super Admin |
| A6 | Quick action buttons — Add Admin User, Approve Pending NGOs (badge count), Send Broadcast, Maintenance Mode | P0 | Super Admin |
| A7 | Geo distribution map — Google Maps showing need density by city/district across all NGOs | P1 | Super Admin |
| A8 | Recent admin actions — last 10 auditLog events shown inline | P1 | Super Admin |

#### Sub-module 5.2 — User Management (10 features)

| # | Feature | Priority |
|---|---|---|
| A9 | User list — search, filter by role/status/skills/area/join date/tasks completed | P0 |
| A10 | User detail drawer — full profile, all tasks, all resources, login history, ban + delete buttons | P0 |
| A11 | Ban / Unban user — mandatory reason, banned users cannot log in, reason stored in Firestore | P0 |
| A12 | Manually verify volunteer — tick badge shown on their profile | P1 |
| A13 | Edit user details — correct name, email, area, skills, all changes logged to audit trail | P1 |
| A14 | Assign admin role — promote to Moderator, NGO Admin, or Super Admin (Super Admin only) | P0 |
| A15 | View user task history — all tasks with status, NGO, date, matchScore | P1 |
| A16 | Delete user account — permanently delete user + all data, requires confirmation + reason | P0 |
| A17 | Export users CSV — filtered user list as CSV with selected columns | P1 |
| A18 | Bulk actions — select multiple → bulk ban / bulk verify / bulk export | P2 |

#### Sub-module 5.3 — NGO Management (9 features)

| # | Feature | Priority |
|---|---|---|
| A19 | NGO list with approval queue — All / Pending / Suspended tabs | P0 |
| A20 | Approve NGO registration — sets verified:true, notifies coordinator by email | P0 |
| A21 | Reject NGO with reason — mandatory rejection reason, email sent | P0 |
| A22 | Suspend active NGO — hides all their resources from coordinators | P0 |
| A23 | NGO detail page — name, area, coordinator, total resources, resolved%, ratings, join date | P0 |
| A24 | Edit NGO profile — update name, area, coordinator email, verified status | P1 |
| A25 | NGO analytics card — resources/month chart, match rate, avg urgency, top category | P1 |
| A26 | Impersonate NGO dashboard — "View as NGO" without switching accounts (Super Admin only) | P2 |
| A27 | NGO coordinator management — add/remove coordinator emails, set primary coordinator | P1 |

#### Sub-module 5.4 — Needs Management (9 features)

| # | Feature | Priority |
|---|---|---|
| A28 | Full needs table — all needs across ALL NGOs with NGO Name column (cross-NGO view) | P0 |
| A29 | Need detail modal — full description, photo, GPS map, AI analysis, matching history, current task | P0 |
| A30 | Edit need details — category, urgency, description, location, people count, all changes logged | P1 |
| A31 | Force-resolve need — mark resolved without volunteer completion, with admin note | P1 |
| A32 | Delete need — permanently delete need + associated tasks, requires reason + confirmation | P0 |
| A33 | Re-open resolved need — set status back to open for re-matching | P1 |
| A34 | Cluster view — group needs by clusterId in collapsible accordion | P1 |
| A35 | Override AI urgency score — admin sets value 0–10 + reason, saved to adminScoreOverride | P2 |
| A36 | Flag inappropriate need — hides from coordinators, queues for moderation | P0 |

#### Sub-module 5.5 — Task Management (8 features)

| # | Feature | Priority |
|---|---|---|
| A37 | Full tasks table — coordinator name, resource title, NGO, status, matchScore, dates | P0 |
| A38 | Task timeline view — per-task event log with timestamps (assigned → accepted → travelling → in_progress → completed) | P0 |
| A39 | Cancel any task — with reason, volunteers and NGO notified, need re-opened | P0 |
| A40 | Force-reassign task — removes current assignment, re-runs matching engine | P1 |
| A41 | Verify task completion — admin marks ngoVerified:true when coordinator can't submit photo | P1 |
| A42 | Dispute a completion — NGO marks disputed, admin reviews evidence, resolves | P1 |
| A43 | View completion photo — admin can view, download, or flag the proof photo | P1 |
| A44 | Task performance stats — avg matchScore, acceptance rate per coordinator, cancellation reasons pie | P2 |

#### Sub-module 5.6 — AI Analytics (6 features)

| # | Feature | Priority |
|---|---|---|
| A45 | Gemini call log — table: timestamp, function, input tokens, output tokens, latency, success/fail | P0 |
| A46 | Matching accuracy dashboard — histogram of matchScore distribution, % scored >80/>60/<40 | P1 |
| A47 | AI cost estimate — (input tokens × $0.000000075) + (output tokens × $0.0000003) = $X.XX | P1 |
| A48 | Failed AI calls log — all calls where Gemini returned error or invalid JSON, retry count, fallback applied | P0 |
| A49 | Prompt performance tracker — per prompt type: avg latency, success rate, avg token count | P2 |
| A50 | Alert thresholds — email alert when Gemini errors >5/hr, cost >$X/day, match rate drops below 70% | P2 |

#### Sub-module 5.7 — Platform Reports (8 features)

| # | Feature | Priority |
|---|---|---|
| A51 | Platform overview metrics — total resources, resolved, match rate, avg response time; filter by date + NGO | P0 |
| A52 | Needs trend chart — line chart: resources submitted vs resolved per day | P0 |
| A53 | Category breakdown — pie chart + table: resources by category across platform | P0 |
| A54 | Coordinator performance table — ranked by tasks, hours, rating, acceptance rate | P1 |
| A55 | NGO comparison table — side-by-side: resources, tasks, match rate, avg resolution time | P1 |
| A56 | SDG impact report — Gemini maps platform activity to SDG 1, 3, 10, 17 with counts + narrative | P1 |
| A57 | Export to Google Sheets — any report to new Google Sheet via Sheets API | P1 |
| A58 | Scheduled email report — weekly auto-email with PDF report to all Super Admins | P2 |

#### Sub-module 5.8 — Notification Center (6 features)

| # | Feature | Priority |
|---|---|---|
| A59 | System-wide FCM broadcast — push to ALL app users, title + body + optional deep link | P0 |
| A60 | Targeted FCM by role — push to all coordinators / all NGO workers / specific NGO | P1 |
| A61 | Emergency broadcast — one-tap red button, high-priority FCM to all users | P0 |
| A62 | Notification history log — all broadcasts: timestamp, sender, audience, title, delivery rate | P1 |
| A63 | Notification templates — 3 pre-built: "Maintenance tonight", "New feature", "Volunteer appreciation" | P2 |
| A64 | In-app announcement banner — message + duration (hours) → shows across all app pages | P2 |

#### Sub-module 5.9 — Content Moderation (6 features)

| # | Feature | Priority |
|---|---|---|
| A65 | Flagged content queue — all flagged resources, photos, chat messages, sorted by flag count | P0 |
| A66 | Photo review panel — masonry grid of completion + resource photos, Approve/Remove/Flag | P0 |
| A67 | Approve / Remove flagged content — one click with reason | P0 |
| A68 | Volunteer complaint review — complaint text, volunteer history, task context | P1 |
| A69 | NGO complaint review — volunteer reports against NGO, admin reviews with full context | P1 |
| A70 | Auto-flag threshold — set X flags → auto-hide content pending review | P2 |

#### Sub-module 5.10 — System Settings (8 features)

| # | Feature | Priority |
|---|---|---|
| A71 | Maintenance mode toggle — shows maintenance screen to all app users | P0 |
| A72 | Feature flags — toggle SOS / Voice Input / Offline Mode / Leaderboard / NL Search on/off | P1 |
| A73 | API key health check — one-click test of Gemini, Maps, FCM; shows latency + status | P0 |
| A74 | Matching engine config — adjust skill%/proximity%/availability% sliders (must sum to 100) | P1 |
| A75 | Task expiry duration — configure the 30-minute expiry window | P1 |
| A76 | Maximum coordinator distance — configure the 25km search radius (per NGO or global) | P1 |
| A77 | NGO auto-approval toggle — new NGOs auto-approved without manual review | P2 |
| A78 | App force update — set minimum app version, older versions see forced update screen | P2 |

#### Sub-module 5.11 — Audit Log (5 features)

| # | Feature | Priority |
|---|---|---|
| A79 | Full audit log table — admin UID, role, action type, target, old value, new value, timestamp | P0 |
| A80 | Filter audit log — by admin name, action type, date range, target type | P0 |
| A81 | Login / logout log — all admin login attempts with IP + device + success/fail badge | P0 |
| A82 | Export audit log — filtered CSV for compliance review | P1 |
| A83 | Tamper protection — auditLog has `allow write: if false` in Firestore rules, Cloud Functions write only | P0 |

#### Sub-module 5.12 — Data Export (5 features)

| # | Feature | Priority |
|---|---|---|
| A84 | Export all needs — filtered CSV or JSON with all fields | P0 |
| A85 | Export all coordinators — volunteer profiles with stats, PII-safe option strips emails/phone | P0 |
| A86 | Export all tasks — full task history with matchScore, explanation, completion status | P1 |
| A87 | Export to Google Sheets — any export sent directly to new Google Sheet | P1 |
| A88 | Scheduled export — set weekly/monthly auto-export to designated Google Drive folder | P2 |

### Module 6 — Coordinator ID Card System (8 features)

| # | Feature | Priority |
|---|---|---|
| 75 | Auto-generate ID card on coordinator creation — PDF stored in Firebase Storage | P0 |
| 76 | Unique coordinator ID number — format: VC-[NGO_CODE]-[YEAR]-[4-DIGIT-SEQUENCE] e.g. VC-HCF-2025-0042 | P0 |
| 77 | ID card contents — coordinator photo, full name, unique ID, NGO name + logo, skills chips, area/zone, issue date, expiry (2 years), QR code | P0 |
| 78 | QR code — encodes coordinatorId + ngoId + issuedAt as JSON string, scannable for authenticity verification | P0 |
| 79 | Printable A6-size PDF — generated with pdfmake + qrcode npm, download button in NGO Dashboard | P0 |
| 80 | Digital ID card in-app — coordinator views own ID card in mobile app, shareable as image | P0 |
| 81 | Revoke / expire ID card — NGO Dashboard or Admin can revoke; QR scan shows "Revoked" status | P0 |
| 82 | Regenerate ID card — re-generate with updated photo/details, old card auto-expires | P1 |

**ID card visual design:** Dark navy background #0A1628. Header: "VolunteerConnect" + "Smart Resource Allocator" subtitle in teal. Coordinator photo (circular). Name 18px bold white. Unique ID 14px teal badge. NGO name + logo. Skills as small teal pills. Issue + expiry dates. QR code 60×60px bottom-right. Gradient strip decoration at bottom. "VALID COORDINATOR" watermark at 45° very low opacity.

### Module 7 — AI & Smart Features (10 features)

| # | Feature | Priority |
|---|---|---|
| 83 | AI Chatbot — Gemini floating widget on website and dashboard, answers platform questions | P0 |
| 84 | Role-aware chatbot context — knows logged-in role and current page ("You have 3 pending tasks") | P0 |
| 85 | Resource auto-analysis — urgency score (0–10), required skills array, AI title (≤6 words), keywords | P0 |
| 86 | AI coordinator matching — score = skill match (40%) + proximity (35%) + availability (25%) | P0 |
| 87 | Match explanation — Gemini generates 1-sentence reason shown to coordinator on task detail | P0 |
| 88 | NGO daily AI briefing — 2–3 sentence Gemini summary of most urgent resources + action recommendation | P0 |
| 89 | Contact form AI response preview — real-time suggested reply as user types (debounced 800ms) | P0 |
| 90 | Trend spike detection — alert NGO Dashboard when resource category spikes >40% in 48hrs same area | P1 |
| 91 | Duplicate resource detection — flag if new resource similar to existing (same category + area + 24hrs) | P1 |
| 92 | AI weekly digest email — auto-generated weekly email to NGO Dashboard with Gemini summary + key stats | P2 |

### Module 8 — Notifications & Communication (8 features)

| # | Feature | Priority |
|---|---|---|
| 93 | FCM push — coordinator matched to task: resource title + distance + urgency level | P0 |
| 94 | FCM push — task expiry warning at 25 minutes if not yet accepted | P1 |
| 95 | FCM push — NGO Dashboard notified when coordinator marks task complete | P1 |
| 96 | In-app notification center — bell icon, unread badge count, all past notifications | P1 |
| 97 | Email notifications — account creation, 2FA code, task assignment, task completion, weekly digest | P0 |
| 98 | Task-specific chat — real-time Firestore chat between coordinator and NGO Dashboard per task | P1 |
| 99 | Admin broadcast — Super Admin sends push/email to all users or by role | P0 |
| 100 | In-app announcement banner — admin adds banner across all app pages for X hours | P1 |

---

## 5. Phase-Wise Build Plan

**Total estimated time:** ~15 days solo / 4 days with team of 4 (parallelized)

### Phase 1 — Firebase Setup & Database

**Time:** ~1.5 days | **Owner:** Backend Dev | **Week 1, Days 1–2**

**Files to create:**
- `shared/types.ts` — all TypeScript interfaces
- `firestore.rules` — complete security rules for all 12 collections
- `firestore.indexes.json` — all 5 composite indexes
- `firebase.json` — project config

**Key deliverables:**
- Firestore security rules deployed with role-based access for all 12 collections
- 5 composite indexes created and READY
- All TypeScript interfaces compiling without errors
- 8 Google Cloud APIs enabled in console

**Google Cloud APIs to enable:**
1. Maps JavaScript API
2. Maps SDK for Android
3. Maps SDK for iOS
4. Distance Matrix API
5. Geocoding API
6. Identity Toolkit API (Firebase Auth)
7. Cloud Functions API
8. Cloud Scheduler API

**Test Checkpoint (8 cases):**

| Test | Steps | Expected |
|---|---|---|
| T1.1 | Open Firebase Console → Firestore, Auth, Storage | All 3 show green status |
| T1.2 | Firestore Console → Rules tab | Security rules visible (not default) |
| T1.3 | `firebase firestore:indexes` in CLI | All 5 indexes show READY |
| T1.4 | `npx tsc --noEmit` from root | Zero TypeScript errors |
| T1.5 | Write to /resources from browser console without auth | PERMISSION_DENIED error |
| T1.6 | Set isBanned:true on test user → try to read resources | PERMISSION_DENIED error |
| T1.7 | Log in as coordinator → query all tasks | Only own tasks returned |
| T1.8 | Try to update an auditLog document from console | PERMISSION_DENIED error |

---

### Phase 2 — Gemini AI Module + Cloud Functions

**Time:** ~2 days | **Owner:** AI Dev + Backend | **Week 1, Days 3–4**

**Files to create:**

| File | Purpose |
|---|---|
| `functions/src/gemini.ts` | withRetry, safeParseJSON, analyzeResource, matchCoordinators, generateNGOSummary |
| `functions/src/generateIDCard.ts` | PDF + QR code generation, Firebase Storage upload |
| `functions/src/onResourceCreated.ts` | Firestore trigger: AI analysis + deduplication + match trigger |
| `functions/src/matchEngine.ts` | Distance Matrix + Gemini ranking + task creation + FCM |
| `functions/src/sendNotification.ts` | FCM push sender |
| `functions/src/onTaskExpired.ts` | Cloud Scheduler every 5 min: auto-reassign expired tasks |
| `functions/src/onTaskCompleted.ts` | Increment coordinator stats, resolve resource |
| `functions/src/generateSummary.ts` | HTTP callable + daily 08:00 IST scheduler |
| `functions/src/chatbot.ts` | Role-aware Gemini chatbot |
| `functions/src/testAI.ts` | Standalone test script (4 tests) |
| `functions/src/index.ts` | Export all functions with Firebase Secrets |

**Set production secrets:**
```bash
firebase functions:secrets:set GEMINI_API_KEY
firebase functions:secrets:set GOOGLE_MAPS_API_KEY
firebase deploy --only functions
```

**Test Checkpoint (9 cases):**

| Test | Expected |
|---|---|
| T2.1 | `firebase functions:list` → all 8 functions ACTIVE |
| T2.2 | testAI.ts test 1 → urgencyScore number, aiTitle string, requiredSkills array |
| T2.3 | testAI.ts test 2 → rankings array with coordinatorId, score 0–100, explanation |
| T2.4 | testAI.ts test 4 → reply string ≤3 sentences, suggestedActions array |
| T2.5 | Add test resource → urgencyScore/aiTitle/requiredSkills populated within 15s |
| T2.6 | 30s after T2.5 → task document with matchScore/matchExplanation/coordinatorId |
| T2.7 | Call generateIDCard → PDF in Firebase Storage, idCards document created |
| T2.8 | Set wrong GEMINI key → 3 retry logs in Functions console, then throws |
| T2.9 | Test safeParseJSON with ```json fenced string → returns clean parsed object |

---

### Phase 3 — Authentication (All 5 Roles)

**Time:** ~1.5 days | **Owner:** Mobile + Web Dev | **Week 1, Days 4–5**

**Files to create:**
- `website/app/login/page.tsx` — 5-role tab login page
- `website/app/register/page.tsx` — User (3-step) + NGO (4-step) registration
- `website/middleware.ts` — route protection for all roles
- `website/lib/auth.ts` — signInWithEmail, signInWithGoogle, signInWithMicrosoft, verify2FA, signOut

**Role routing after successful login:**
```
superadmin → /admin
admin      → /admin
ngodashboard → /ngo-dashboard
coordinator → /coordinator
user        → / (home page)
```

**Test Checkpoint (10 cases):**

| Test | Expected |
|---|---|
| T3.1 | Login page → 5 tabs visible: Coordinator, NGO Dashboard, Admin, Super Admin, User |
| T3.2 | Enter VC-HCF-2025-0042 + email + password → validated against Firestore, 2FA shown |
| T3.3 | Google button on User tab → Firebase popup, user created in Firestore with role:user |
| T3.4 | Microsoft button on NGO tab → Firebase Microsoft popup, NGO user authenticated |
| T3.5 | Valid email+password on any role → password replaced with 6-box OTP input |
| T3.6 | Login as coordinator via Admin tab → error: "This account does not have admin access" |
| T3.7 | Set isBanned:true → try login → redirect to /banned page |
| T3.8 | Open /ngo-dashboard without login → redirect to /login |
| T3.9 | Complete NGO registration → users doc role:ngodashboard + ngos doc verified:false |
| T3.10 | After password but before 2FA → try to access /admin → redirect to /verify-2fa |

---

### Phase 4 — Public Website

**Time:** ~2 days | **Owner:** Web Dev | **Week 2, Days 1–2**

**Files to create:**
- `website/app/page.tsx` — Home page
- `website/app/about/page.tsx` — About Us
- `website/app/contact/page.tsx` — Contact with AI preview
- `website/components/AIChatbot.tsx` — Floating chatbot widget (add to root layout)

**Chatbot specs:**
- Fixed bottom-right: right:24px, bottom:24px. Teal circle 56px.
- Panel: 380px wide × 520px tall glassmorphism
- Welcome message + quick reply chips: "How do I join?", "What is a coordinator?", "Post a resource"
- Max 20 messages in React state (not persisted between sessions)
- On send: call chatbot Cloud Function with {message, userRole, currentPage}

**Test Checkpoint (10 cases):**

| Test | Expected |
|---|---|
| T4.1 | Open / → dark #0A1628 bg, glass cards, 3 decoration circles, gradient buttons |
| T4.2 | Scroll to stats → numbers count up from 0 to targets with animation |
| T4.3 | Add test resource → home page counter reflects real count |
| T4.4 | Type >20 chars in contact form (wait 800ms) → AI response preview box appears |
| T4.5 | Fill all fields → Send Message → contactMessages document created + success animation |
| T4.6 | Click floating chat bubble → panel opens with welcome message + quick chips |
| T4.7 | Send "How do I join?" → AI reply within 3 seconds |
| T4.8 | Navigate to /about → Mission, vision, SDG section all visible |
| T4.9 | Scroll down on home page + resize to mobile → navbar stays fixed, hamburger appears |
| T4.10 | Click Sign In in navbar → redirected to /login |

---

### Phase 5 — NGO Dashboard

**Time:** ~2.5 days | **Owner:** Web Dev | **Week 2, Days 3–5**

**Pages to create:**
- `/ngo-dashboard` — Overview (metrics, AI summary, chart, coordinator tracker)
- `/ngo-dashboard/resources` — Resource table + 4-step post drawer + manual assign
- `/ngo-dashboard/coordinators` — Coordinator table + 3-step create drawer + ID card modal
- `/ngo-dashboard/tasks` — Task history table
- `/ngo-dashboard/map` — Dark Google Maps with HeatmapLayer, real-time pins
- `/ngo-dashboard/reports` — Charts, KPIs, export PDF/CSV/Sheets
- `/ngo-dashboard/messages` — Task-based chat with broadcast button

**Test Checkpoint (11 cases):**

| Test | Expected |
|---|---|
| T5.1 | Login as NGO Dashboard → /ngo-dashboard, sidebar visible, 4 metric cards load |
| T5.2 | Complete 4-step resource form → submit | Resource in Firestore, AI fields populated in 15s |
| T5.3 | Step 4 confirmation card | urgencyScore, aiTitle, requiredSkills all visible |
| T5.4 | Complete Create Coordinator form | Firestore coordinator doc + PDF in Storage + ID card modal |
| T5.5 | Check coordinator uniqueId field | Format: VC-[3LETTERS]-[YEAR]-[4DIGITS] |
| T5.6 | Click Download PDF | A6-size PDF downloads with photo, name, QR code, skills, dates |
| T5.7 | Open Map View | Dark Google Map with colored resource pins visible |
| T5.8 | Click Assign on resource → select coordinator → confirm | Task in Firestore + FCM to coordinator |
| T5.9 | Click Export PDF on Reports | PDF downloads with summary stats and resources table |
| T5.10 | Click Export CSV | CSV file with correct headers and filtered data rows |
| T5.11 | Accept task on coordinator panel → watch NGO dashboard | Coordinator in tracker within 3 seconds |

---

### Phase 6 — Coordinator Panel

**Time:** ~2 days | **Owner:** Mobile + Web Dev | **Week 3, Days 1–2**

**Web pages:**
- `/coordinator` — My Tasks (assigned + in-progress split)
- `/coordinator/task/[id]` — Task detail with match score ring + map route
- `/coordinator/history` — Past tasks table + stats row
- `/coordinator/profile` — ID card view + skills/availability edit + impact badge

**Mobile screens:**
- `mobile/app/(coordinator)/home.tsx` — Map top 40% + task feed
- `mobile/app/(coordinator)/task/[id].tsx` — Mobile task detail + haptic feedback
- `mobile/app/(coordinator)/profile.tsx` — Digital ID card + stats grid
- `mobile/app/(ngo)/report.tsx` — 3-step need submission form

**Test Checkpoint (10 cases):**

| Test | Expected |
|---|---|
| T6.1 | Login as coordinator → My Tasks → only own tasks visible |
| T6.2 | Accept task | task.status=travelling, resource.status=in_progress in Firestore |
| T6.3 | Decline + reason | task.status=cancelled, next fallback coordinator notified via FCM |
| T6.4 | Update Travelling → In Progress | Stepper shows correct step, NGO tracker updates |
| T6.5 | Mark Complete + upload photo | Photo in Storage, task.status=completed, resource.status=resolved |
| T6.6 | Open task detail | Green card with matchExplanation text and circular score ring |
| T6.7 | Open Profile | ID card with uniqueId, photo, NGO name, QR code |
| T6.8 | Short tap SOS | Nothing happens |
| T6.9 | Long press SOS 2 seconds | sos Firestore doc created + NGO receives FCM |
| T6.10 | Send message in task chat | Message appears real-time on NGO Dashboard messages page |

---

### Phase 7 — Admin Panel

**Time:** ~2.5 days | **Owner:** Web Dev (separate app) | **Week 3, Days 3–5**

**Pages to create (13 total):**

| Route | Page |
|---|---|
| /admin | Dashboard overview |
| /admin/users | User management |
| /admin/ngos | NGO management |
| /admin/needs | Needs management |
| /admin/tasks | Task management |
| /admin/ai | AI analytics |
| /admin/reports | Platform reports |
| /admin/notifications | Notification center |
| /admin/moderation | Content moderation |
| /admin/settings | System settings |
| /admin/audit | Audit log |
| /admin/export | Data export |
| /admin/login | Admin login (separate page) |

**New Firestore collections for admin:**

| Collection | Purpose |
|---|---|
| adminUsers/{uid} | Admin role assignments (Super Admin writes only) |
| adminAuditLog/{id} | Immutable log (allow write: if false — Cloud Functions only) |
| systemSettings/{key} | Maintenance mode, feature flags, matching weights |
| flaggedContent/{id} | Content flagging for moderation queue |
| notifications/{id} | Broadcast notification history |
| appAnnouncements/{id} | In-app banner messages |

**Critical utility — call before EVERY mutation:**
```javascript
// website/lib/auditLog.ts
logAdminAction(action, targetType, targetId, oldValue, newValue)
// → writes to adminAuditLog with server timestamp
```

**Test Checkpoint (11 cases):**

| Test | Expected |
|---|---|
| T7.1 | Login as Admin + 2FA | /admin, sidebar shows role-limited items |
| T7.2 | Login as Super Admin | All 13 sidebar items visible |
| T7.3 | Login as Admin | No: AI Analytics, Notifications, Settings, Audit Log, Export |
| T7.4 | Ban a test user | user.isBanned=true + auditLog entry with reason |
| T7.5 | Try login as banned user | Redirect to /banned page |
| T7.6 | Approve pending NGO | ngos/{id}.verified=true + audit logged |
| T7.7 | Force resolve a resource | resource.status=resolved + audit logged with admin note |
| T7.8 | Update auditLog from browser console | PERMISSION_DENIED error |
| T7.9 | Toggle maintenance ON | Public website shows maintenance screen |
| T7.10 | Set sliders to 50+30+10=90 → save | Validation error "Must sum to 100" |
| T7.11 | Click Emergency Broadcast → send | FCM on all test devices within 30 seconds |

---

### Phase 8 — Demo Data & Deployment

**Time:** ~1 day | **Owner:** Full Team | **Week 4, Day 1**

**Files to create:**
- `functions/src/seedDemoData.ts` — full demo data seeder
- `functions/src/resetDemoData.ts` — delete demo-* docs and re-seed
- `functions/src/e2eTest.ts` — 6-check automated pipeline test

**Demo data to seed:**

```
1 Super Admin: uid="demo-sa-001", role="superadmin", name="Demo Super Admin"
1 Admin: uid="demo-admin-001", role="admin", name="Demo Admin"
1 NGO: id="demo-ngo-001", name="Hadapsar Care Foundation", area="Hadapsar, Pune", verified=true
1 NGO Dashboard user: uid="demo-ngo-001", role="ngodashboard", name="Anita Sharma"

4 Coordinators:
  demo-coord-001: Rahul Kulkarni, skills=[logistics,driving,marathi], lat=18.507,lng=73.931, rating=4.9, tasks=24
  demo-coord-002: Sneha Patil, skills=[medical,first-aid,hindi], lat=18.498,lng=73.855, rating=4.7
  demo-coord-003: Arjun Mehta, skills=[teaching,english,computers], lat=18.563,lng=73.789, rating=4.8
  demo-coord-004: Priya Desai, skills=[eldercare,cooking,marathi], lat=18.520,lng=73.856, rating=4.6

5 Resources (all in Pune):
  demo-res-001: Food distribution Hadapsar (High, score=8.4, 40 people, status=open)
  demo-res-002: Medical camp Kothrud urgent (High, score=7.9, 25 people, status=matched)
  demo-res-003: Children tutoring Baner (Medium, score=5.2, 15 people, status=open)
  demo-res-004: Elder care Shivajinagar (Medium, score=4.8, 8 people, status=open)
  demo-res-005: Shelter repair Yerawada (Low, score=3.1, 12 people, status=open)

2 Tasks:
  demo-task-001: resource=001, coordinator=001, status=in_progress, matchScore=87
    matchExplanation="Rahul matched: logistics skills + 1.2km away + available today"
  demo-task-002: resource=002, coordinator=002, status=assigned, matchScore=91, expiresAt=30min from now
    matchExplanation="Sneha matched: medical+first-aid + 3.8km from Kothrud"
```

**Pre-Demo Checklist (12 items):**

- [ ] 1. Run seedDemoData.ts → verify 5 resources, 4 coordinators, 2 tasks, 1 NGO in Firestore
- [ ] 2. Run e2eTest.ts → confirm 6/6 checks pass
- [ ] 3. Website live on Vercel → open in browser, verify home page loads in <3s
- [ ] 4. NGO Dashboard login works → verify resource heatmap loads
- [ ] 5. Coordinator app on device → task feed shows demo tasks
- [ ] 6. Post a test resource → AI scores it → task created → FCM notification received
- [ ] 7. Chatbot responds on home page within 3 seconds
- [ ] 8. Contact form AI preview works (type a message, see AI suggestion)
- [ ] 9. Admin panel login works → metric cards show data
- [ ] 10. Screen recording of full demo loop saved as backup MP4
- [ ] 11. Coordinator ID card PDF downloads correctly
- [ ] 12. Device battery >80%, charger available

**3-Minute Demo Script:**

| Time | Action |
|---|---|
| 0:00–0:30 | Problem slide: "NGOs cannot allocate resources efficiently — data is scattered" |
| 0:30–1:00 | NGO Dashboard posts a food resource live (4-step form, GPS auto-detect) |
| 1:00–1:30 | Dashboard: watch AI score appear + pin on heatmap + coordinator matched |
| 1:30–2:00 | Coordinator device receives: "Matched: Food distribution 1.2km away" |
| 2:00–2:30 | Coordinator accepts → dashboard tracker updates live → show ID card |
| 2:30–3:00 | Show admin panel analytics + mention SDG 1/3/10/17 + impact stats |

**Test Checkpoint (10 cases):**

| Test | Expected |
|---|---|
| T8.1 | Run seedDemoData.ts | 5 resources, 4 coordinators, 2 tasks, 1 NGO visible in Firestore |
| T8.2 | Run e2eTest.ts | Output: 6/6 checks passed |
| T8.3 | Open Vercel URL | Home page loads in <3s, dark 3D design visible |
| T8.4 | Full demo loop practice | Completes under 3 min with no errors |
| T8.5 | Create coordinator on deployed site | PDF downloads with all correct fields |
| T8.6 | Open website on Vercel → test chatbot | Reply within 3s |
| T8.7 | Type in contact form on Vercel | AI suggestion appears below textarea |
| T8.8 | Login as demo coordinator on deployed site | Successful login + task feed visible |
| T8.9 | Run resetDemoData.ts | Fresh data populated, old demo data gone |
| T8.10 | `firebase functions:list` on production | All 8 functions show ACTIVE status |

---

## 6. Project Workflow — End-to-End

### The Core Loop: Need → Match → Resolve

```
NGO Field Worker
     │
     ▼ Opens mobile app (Google Sign-In)
     │
     ▼ 3-Step Form:
     │   Step 1: Category (6 options) + Urgency (High/Medium/Low) + People affected
     │   Step 2: Description + Voice-to-text (Gemini STT) + GPS auto-detect + optional photo
     │          [If offline: saved to AsyncStorage, submitted on reconnect]
     │   Step 3: Submit → resource document created in Firestore
     │
     ▼ onResourceCreated Cloud Function fires (within 5 seconds)
     │
     ▼ Gemini AI Analysis (within 15 seconds):
     │   ├── Generates urgencyScore (0–10)
     │   ├── Extracts requiredSkills array
     │   ├── Creates aiTitle (≤6 words)
     │   └── Deduplication: checks same category + 2km radius + 24hrs → assigns clusterId
     │
     ▼ matchCoordinatorsForResource() called
     │   ├── Idempotency check: active task for this resource? → return
     │   ├── Fetch active coordinators for this NGO
     │   ├── Haversine filter: remove coordinators beyond 25km
     │   ├── ONE batch Distance Matrix API call (all coordinators as origins)
     │   ├── Enrich: add distanceKm, travelMinutes, availableToday per coordinator
     │   └── Gemini scores + ranks: skill(40%) + proximity(35%) + availability(25%)
     │
     ▼ Task created:
     │   ├── coordinatorId = rank 1
     │   ├── fallbackQueue = [rank 2, rank 3]
     │   ├── status = "assigned"
     │   ├── expiresAt = now + 30 minutes
     │   └── matchExplanation = Gemini 1-sentence reason
     │
     ▼ FCM push to coordinator:
     │   "Urgent task matched! [aiTitle] — 1.2km away"
     │
Coordinator (Mobile or Web)
     │
     ▼ Reviews task:
     │   ├── Task card: aiTitle, NGO name, distance, travel time
     │   └── AI match explanation: "Why you were matched" green card
     │
     ▼ Accepts (one tap):
     │   ├── Firestore batch: task.status="travelling", task.acceptedAt=now, resource.status="in_progress"
     │   ├── Haptic feedback (mobile)
     │   └── Map shows route from coordinator to resource location
     │
     [If declined: reason required → task.status=cancelled → fallbackQueue[0] notified within 2 min]
     [If unaccepted after 30 min: onTaskExpired → cancel + re-match]
     │
     ▼ Status updates (contextual action buttons):
     │   Assigned → Travelling → In Progress → Completed
     │
     ▼ Marks Complete:
     │   ├── Uploads completion photo → Firebase Storage
     │   ├── task.status="completed", task.completedAt=now, task.completionPhotoURL=url
     │   └── Shows impact card: "You helped X families today!"
     │
     ▼ onTaskCompleted trigger fires:
     │   ├── coordinator.tasksCompleted++
     │   ├── coordinator.hoursVolunteered += hours (completedAt - acceptedAt)
     │   └── resource.status="resolved"
     │
NGO Dashboard (Real-time throughout)
     ├── 4 metric cards update via Firestore onSnapshot
     ├── Google Maps heatmap pin changes color/status
     ├── Coordinator tracker shows status pill updates
     └── Gemini daily briefing reflects resolved resource
```

### Key Timing Requirements

| Event | Target |
|---|---|
| Resource created → onResourceCreated fires | <5 seconds |
| Gemini analysis completes | <15 seconds |
| Matching engine completes (incl. Distance Matrix + Gemini) | <30 seconds total |
| FCM push delivered to coordinator | <30 seconds from need submission |
| Firestore real-time listener updates | <3 seconds |
| App cold start on mid-range Android | <3 seconds |

---

## 7. Firestore Database Schema

### Collections (12 total)

#### users/{uid}
```typescript
interface User {
  id: string
  name: string
  email: string
  role: "superadmin" | "admin" | "ngodashboard" | "coordinator" | "user"
  photoURL: string
  isActive: boolean
  isBanned: boolean
  twoFAEnabled: boolean
  fcmToken: string
  createdAt: Date
}
```

#### ngos/{uid}
```typescript
interface NGO {
  id: string
  name: string
  email: string
  area: string
  verified: boolean
  coordinatorCount: number
  logoURL: string
  createdAt: Date
}
```

#### coordinators/{uid}
```typescript
interface Coordinator {
  id: string
  ngoId: string
  name: string
  email: string
  uniqueId: string                           // "VC-HCF-2025-0042"
  photoURL: string
  skills: string[]
  languages: string[]
  location: { lat: number; lng: number }
  availability: Record<"mon"|"tue"|"wed"|"thu"|"fri"|"sat"|"sun", boolean>
  isActive: boolean
  idCardURL: string
  idCardExpiry: Date
  tasksCompleted: number
  hoursVolunteered: number
  rating: number
  createdAt: Date
}
```

#### resources/{id}
```typescript
type ResourceCategory = "food" | "health" | "shelter" | "education" | "eldercare" | "other"
type Urgency = "high" | "medium" | "low"
type ResourceStatus = "open" | "matched" | "in_progress" | "resolved"

interface Resource {
  id: string
  category: ResourceCategory
  urgency: Urgency
  urgencyScore: number                        // 0–10, set by Gemini
  aiTitle: string                             // ≤6 words, set by Gemini
  description: string
  requiredSkills: string[]                    // set by Gemini
  location: { lat: number; lng: number }
  address: string
  photoURL: string | null
  reportedBy: string                          // NGO uid
  ngoName: string
  peopleAffected: number
  status: ResourceStatus
  clusterId: string | null                    // set if duplicate detected
  createdAt: Date
  updatedAt: Date
}
```

#### tasks/{id}
```typescript
type TaskStatus = "assigned" | "travelling" | "in_progress" | "completed" | "cancelled"

interface Task {
  id: string
  resourceId: string
  coordinatorId: string
  ngoId: string
  status: TaskStatus
  matchScore: number                          // 0–100
  matchExplanation: string                    // 1-sentence Gemini reason
  fallbackQueue: string[]                     // [rank2Id, rank3Id]
  assignedAt: Date
  acceptedAt: Date | null
  completedAt: Date | null
  completionPhotoURL: string | null
  ngoVerified: boolean
  expiresAt: Date                             // assignedAt + 30 minutes
  declineReason: string
}
```

#### chats/{taskId}/messages/{id}
```typescript
interface Message {
  senderId: string
  senderName: string
  senderRole: string
  text: string
  createdAt: Date
}
```

#### adminUsers/{uid}
```typescript
interface AdminUser {
  uid: string
  role: "superadmin" | "admin" | "ngoadmin" | "moderator"
  assignedBy: string
  assignedAt: Date
  ngoId: string | null
  isActive: boolean
}
```

#### auditLog/{id}
```typescript
interface AuditLog {
  actorUid: string
  actorRole: string
  action: string
  targetType: string
  targetId: string
  oldValue: string        // JSON string
  newValue: string        // JSON string
  timestamp: Date
  ip: string
}
// IMMUTABLE: allow write: if false in Firestore rules
```

#### systemSettings/{key}
```typescript
interface SystemSetting {
  key: string
  value: any
  updatedBy: string
  updatedAt: Date
}
// Keys: maintenance_mode, feature_flags, matching_weights, task_expiry_minutes, max_distance_km
```

#### idCards/{coordinatorId}
```typescript
interface IDCard {
  coordinatorId: string
  ngoId: string
  uniqueId: string        // "VC-HCF-2025-0042"
  issuedAt: Date
  expiresAt: Date         // issuedAt + 2 years
  isRevoked: boolean
  qrData: string          // JSON.stringify({coordinatorId, ngoId, uniqueId, issuedAt})
  pdfURL: string
}
```

#### contactMessages/{id}
```typescript
interface ContactMessage {
  name: string
  email: string
  subject: string
  message: string
  aiResponse: string
  status: "new" | "read" | "replied"
  createdAt: Date
}
```

#### notifications/{id}
```typescript
interface Notification {
  title: string
  body: string
  audience: "all" | "coordinators" | "ngos" | string    // string = specific NGO id
  sentBy: string
  sentAt: Date
  deepLink: string
  deliveryCount: number
}
```

### Composite Indexes (5)

```json
[
  {
    "collectionGroup": "tasks",
    "fields": [
      {"fieldPath": "coordinatorId", "order": "ASCENDING"},
      {"fieldPath": "status", "order": "ASCENDING"},
      {"fieldPath": "assignedAt", "order": "DESCENDING"}
    ]
  },
  {
    "collectionGroup": "tasks",
    "fields": [
      {"fieldPath": "resourceId", "order": "ASCENDING"},
      {"fieldPath": "status", "order": "ASCENDING"}
    ]
  },
  {
    "collectionGroup": "resources",
    "fields": [
      {"fieldPath": "status", "order": "ASCENDING"},
      {"fieldPath": "urgencyScore", "order": "DESCENDING"},
      {"fieldPath": "createdAt", "order": "DESCENDING"}
    ]
  },
  {
    "collectionGroup": "resources",
    "fields": [
      {"fieldPath": "reportedBy", "order": "ASCENDING"},
      {"fieldPath": "status", "order": "ASCENDING"},
      {"fieldPath": "createdAt", "order": "DESCENDING"}
    ]
  },
  {
    "collectionGroup": "auditLog",
    "fields": [
      {"fieldPath": "actorUid", "order": "ASCENDING"},
      {"fieldPath": "timestamp", "order": "DESCENDING"}
    ]
  }
]
```

### Firestore Security Rules

```
rules_version = "2";
service cloud.firestore {
  match /databases/{db}/documents {

    function auth() { return request.auth != null; }
    function own(uid) { return request.auth.uid == uid; }
    function role() {
      return get(/databases/$(db)/documents/users/$(request.auth.uid)).data.role;
    }
    function isAdmin() { return auth() && role() in ["superadmin","admin"]; }
    function isSuperAdmin() { return auth() && role() == "superadmin"; }
    function isNGO() { return auth() && role() == "ngodashboard"; }
    function isCoord() { return auth() && role() == "coordinator"; }
    function notBanned() {
      return !get(/databases/$(db)/documents/users/$(request.auth.uid)).data.isBanned;
    }

    match /users/{uid} {
      allow read: if auth() && notBanned();
      allow create: if auth() && own(uid);
      allow update: if auth() && (own(uid) || isAdmin());
      allow delete: if isSuperAdmin();
    }
    match /ngos/{uid} {
      allow read: if auth();
      allow create: if auth() && own(uid);
      allow update: if auth() && (own(uid) || isAdmin());
      allow delete: if isSuperAdmin();
    }
    match /coordinators/{uid} {
      allow read: if auth() && notBanned();
      allow create: if isNGO();
      allow update: if auth() && (own(uid) || isNGO() || isAdmin());
      allow delete: if isNGO() || isAdmin();
    }
    match /resources/{id} {
      allow read: if auth() && notBanned();
      allow create: if isNGO() && notBanned();
      allow update: if (isNGO() && notBanned()) || isAdmin();
      allow delete: if isAdmin();
    }
    match /tasks/{id} {
      allow read: if auth() && (
        own(resource.data.coordinatorId) || isNGO() || isAdmin()
      );
      allow create: if false;    // Cloud Functions only
      allow update: if auth() && (
        own(resource.data.coordinatorId) || isNGO() || isAdmin()
      );
      allow delete: if false;
    }
    match /chats/{taskId}/messages/{msgId} {
      allow read, create: if auth() && notBanned();
    }
    match /adminUsers/{uid} {
      allow read: if auth() && own(uid) || isSuperAdmin();
      allow write: if isSuperAdmin();
    }
    match /auditLog/{id} {
      allow read: if isAdmin();
      allow create: if auth();
      allow update, delete: if false;    // IMMUTABLE
    }
    match /systemSettings/{key} {
      allow read: if isAdmin();
      allow write: if isSuperAdmin();
    }
    match /idCards/{id} {
      allow read: if auth();
      allow create: if isNGO();
      allow update: if isNGO() || isAdmin();
      allow delete: if isSuperAdmin();
    }
    match /contactMessages/{id} {
      allow read: if isAdmin();
      allow create: if true;    // Public can submit
      allow update: if isAdmin();
      allow delete: if isSuperAdmin();
    }
    match /notifications/{id} {
      allow read: if isSuperAdmin();
      allow write: if isSuperAdmin();
    }
  }
}
```

---

## 8. Design System

All surfaces — public website, NGO dashboard, coordinator panel, admin panel — use the SAME design system.

### Color Tokens

| Token | Hex | Used For |
|---|---|---|
| `--vc-bg-deep` | `#0A1628` | Page background — all surfaces |
| `--vc-bg-surface` | `#0F2137` | Card and panel backgrounds |
| `--vc-bg-elevated` | `#162A40` | Modal, dropdown, elevated surfaces |
| `--vc-glass` | `rgba(255,255,255,0.06)` | Glassmorphism card fill |
| `--vc-glass-border` | `rgba(255,255,255,0.12)` | Glassmorphism card border |
| `--vc-primary` | `#1DB975` | Brand teal-green — buttons, active states, links |
| `--vc-primary-glow` | `rgba(29,185,117,0.25)` | Focus rings, button shadows |
| `--vc-primary-dark` | `#0F8A50` | Button hover, gradient end |
| `--vc-accent` | `#00D4FF` | Cyan highlight — charts, progress bars |
| `--vc-urgent` | `#FF4E4E` | High urgency, danger, error states |
| `--vc-medium` | `#FFB020` | Medium urgency, warning states |
| `--vc-low` | `#1DB975` | Low urgency, success states |
| `--vc-text-primary` | `#F0F4F8` | All primary text |
| `--vc-text-secondary` | `#8FA3B8` | Secondary/muted text |
| `--vc-text-muted` | `#4A6278` | Placeholder, disabled text |

### Component Rules

**Cards:**
```css
background: var(--vc-glass);
border: 1px solid var(--vc-glass-border);
border-radius: 16px;
backdrop-filter: blur(20px);
box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.1) inset;
```

**Buttons (primary):**
```css
background: linear-gradient(145deg, #1DB975, #0F8A50);
box-shadow: 0 4px 15px rgba(29,185,117,0.4), 0 1px 0 rgba(255,255,255,0.2) inset;
/* hover: */ transform: translateY(-2px);
/* active: */ transform: translateY(0px) scale(0.98);
```

**Inputs:**
```css
background: rgba(255,255,255,0.05);
border: 1px solid rgba(255,255,255,0.1);
border-radius: 10px;
color: var(--vc-text-primary);
/* focus: */
border-color: var(--vc-primary);
box-shadow: 0 0 0 3px var(--vc-primary-glow);
```

**Typography:** Plus Jakarta Sans from Google Fonts — weights 400, 500, 600, 700

**Animations:**
- Page load: fade-in + slide-up, 400ms ease-out
- Button hover: 150ms ease
- Card hover: translateY(-4px) + enhanced shadow, 200ms ease
- Skeleton loading: shimmer animation

**Background Decoration:**
- 3 large blurred circles (position: absolute, pointer-events: none): teal top-right, cyan bottom-left, teal mid-left — opacity 0.06–0.08
- Subtle grid pattern overlay on hero sections using CSS repeating-linear-gradient
- No solid flat backgrounds — everything has depth through glass, blur, or gradient

**Role badge pills:**
- Teal = coordinator
- Blue = NGO dashboard
- Amber = admin
- Red = super admin
- Gray = user

---

## 9. Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| Next.js 14 (App Router) | Public website + all web dashboards |
| React Native (Expo) | Coordinator mobile app |
| TypeScript | All code — shared types across all platforms |
| Tailwind CSS | Styling for all web surfaces |
| Chart.js | Dashboard charts (dark theme) |
| Plus Jakarta Sans | Typography (all surfaces) |
| pdfmake | PDF generation for ID cards + reports |
| qrcode (npm) | QR code generation for ID cards |
| react-native-maps | Maps in mobile app |
| expo-location | GPS location for mobile |
| expo-haptics | Haptic feedback on task accept |
| AsyncStorage | Offline queue for need submissions |

### Google / Firebase (6 Google Products)
| Service | Used For |
|---|---|
| Google Gemini 1.5 Flash | AI analysis, matching, chatbot, summaries, STT |
| Firebase Firestore | Real-time database for all collections |
| Firebase Auth | Authentication for all roles |
| Firebase Storage | Photos, completion images, ID card PDFs |
| Firebase Cloud Functions | All backend logic (matching engine, triggers, scheduler) |
| Firebase FCM | Push notifications to mobile app |
| Cloud Scheduler | Daily summary (08:00 IST), task expiry check (every 5 min) |
| Google Maps JS API | Heatmap + pins on NGO Dashboard |
| Distance Matrix API | Travel time for coordinator matching |
| Geocoding API | Address resolution |
| Maps SDK Android/iOS | Maps in mobile app |
| Google Sheets API | Export reports to Google Sheets |

### Infrastructure
| Service | Purpose |
|---|---|
| Firebase Blaze plan | Required for Cloud Functions with external API calls |
| Firebase Secrets | API keys stored securely (never exposed to client) |
| Vercel | Next.js web hosting |
| Expo EAS | Android APK build |

---

## 10. Non-Functional Requirements

| Category | Requirement | Target | Rationale |
|---|---|---|---|
| Performance | App cold start (volunteer home screen) | <3s on mid-range Android | Majority of Indian volunteers use budget Android |
| Performance | Need submission → AI score | <15s end-to-end | Field worker expects near-instant confirmation |
| Performance | Matching Cloud Function | <30s total | Includes Gemini + Distance Matrix + Firestore writes |
| Reliability | Cloud Function uptime | >99.5% monthly | Firebase SLA, auto-retry on crash |
| Reliability | Firestore real-time listeners | <3s delivery | Firebase guarantees on 4G |
| Offline | Form data survives app close | AsyncStorage until submitted | Field workers in rural areas have intermittent connectivity |
| Security | All Firestore access governed by rules | Zero unauthorized reads/writes | Verified by Firebase emulator test suite |
| Security | Gemini and Maps API keys never exposed to client | Stored as Firebase Secrets | Prevents API key abuse |
| Scalability | Handle 100 concurrent coordinators | Firebase + Cloud Functions auto-scale | No manual server management |
| Accessibility | Voice input for low-literacy users | >85% accuracy for Indian English | Designed for NGO field workers with varying literacy |
| Privacy | Location data not stored historically | Only current location in coordinator document | DPDP Act 2023 compliance (India) |

---

## 11. AI Prompts & Cloud Functions

### Gemini Prompts (exact content)

#### analyzeResource
```
Analyze this community resource request. Return ONLY valid JSON with no markdown,
no explanation, no extra text.

Description: "${description}"
Category: "${category}"
Urgency level: "${urgency}"
People affected: ${peopleAffected}

Return this exact JSON structure:
{
  "aiTitle": "<6 words max describing the need>",
  "requiredSkills": ["skill1", "skill2"],
  "urgencyScore": <integer 0-10>,
  "keywords": ["kw1", "kw2", "kw3"]
}
```
**Fallback:** `{ aiTitle: category+" need", requiredSkills: [], urgencyScore: 5, keywords: [] }`

#### matchCoordinators
```
You are a volunteer coordination AI for an NGO platform in India.

COMMUNITY NEED:
- Category: ${need.category}
- Description: ${need.description}
- Urgency score: ${need.urgencyScore}/10
- Required skills: ${need.requiredSkills.join(", ")}
- People affected: ${need.peopleAffected}

AVAILABLE COORDINATORS:
${coordinators.map(v =>
  `ID:${v.id} | ${v.name} | Skills:${v.skills.join(",")} | ${v.distanceKm}km away |
   Travel:${v.travelMinutes}min | Available:${v.availableToday} |
   Rating:${v.rating}/5 | Tasks done:${v.tasksCompleted}`
).join("\n")}

Rank ALL coordinators by suitability. Score each 0-100.
Scoring weights: skill match=40%, proximity=35%, availability=25%.
Return ONLY valid JSON:
{"rankings":[{"coordinatorId":"string","score":number,"explanation":"one sentence max"}]}
```
**Fallback:** `{ rankings: coordinators.map((v,i) => ({coordinatorId:v.id, score:50-i*5, explanation:"General availability match"})) }`

#### generateNGOSummary
```
You are a community coordinator AI. Summarize these open community resources in 2-3 sentences.
Start with the most urgent situation.
End with ONE concrete action recommendation for NGO staff.
Maximum 60 words. Plain text only, no lists or formatting.

Resources: ${needsList}
```
**Fallback:** `"Multiple community needs require attention. Prioritize high-urgency food and health situations. Deploy available coordinators to the highest-scoring needs immediately."`

#### chatbot (system prompt)
```
You are the VolunteerConnect assistant. Help users with the platform.
User role: ${userRole}. Current page: ${currentPage}.
Be concise (max 3 sentences).
For coordinators: mention their task count.
For NGO Dashboard: mention their pending resources count.
Never reveal internal system details or API keys.
```

### Cloud Functions Summary

| Function | Trigger | What It Does |
|---|---|---|
| `onResourceCreated` | Firestore onCreate resources/{id} | AI analysis + deduplication + calls matchEngine |
| `matchCoordinatorsForResource` | Called from onResourceCreated | Idempotency check + 25km filter + Distance Matrix + Gemini rank + task create + FCM |
| `sendNotification` | Called from matchEngine | Fetch FCM token + send push notification |
| `onTaskExpired` | Cloud Scheduler every 5 minutes | Query expired tasks → cancel → re-match from fallbackQueue |
| `onTaskCompleted` | Firestore onUpdate tasks/{id} | Increment coordinator stats + resolve resource |
| `generateSummary` | HTTP callable + Scheduler daily 08:00 IST | Gemini NGO summary → write to ngos/{id}/summaries/latest |
| `chatbot` | HTTP callable | Role-aware Gemini chatbot response |
| `generateCoordinatorIDCard` | Called from NGO Dashboard | pdfmake PDF + QR code + Firebase Storage + idCards document |

### Matching Score Formula
```
matchScore = (skillMatchScore × 0.40) + (proximityScore × 0.35) + (availabilityScore × 0.25)

Where:
- skillMatchScore: % of requiredSkills present in coordinator.skills (0–100)
- proximityScore: 100 - (distanceKm / 25 × 100), clamped 0–100
- availabilityScore: 100 if availableToday, 0 if not
```

### Retry Logic
```typescript
async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === retries) throw error;
      await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000)); // 1s, 2s, 4s
    }
  }
}
```

---

## 12. Admin Panel — Complete Guide

### Admin Role Hierarchy

| Role | Signed In Via | Access |
|---|---|---|
| Super Admin | Email + Password + TOTP 2FA | Full control — all 13 admin pages |
| NGO Admin | Email + Password + TOTP 2FA | Own NGO data + moderation (~35 features) |
| Moderator | Email + Password + 2FA | Content review only (~12 features) |

### Admin Login Security
- Separate page at `/admin/login`
- Red shield icon + amber warning: "Restricted access. All activity is logged."
- After 5 failed attempts: 30-minute lockout + Super Admin notified
- Every login attempt logged to `adminAuditLog` with timestamp + IP

### Role-Gated Sidebar Items

| Page | Super Admin | Admin | Moderator |
|---|---|---|---|
| Dashboard | ✓ | ✓ | ✓ |
| Users | ✓ | ✗ | ✗ |
| NGOs | ✓ | ✓ (own) | ✗ |
| Needs | ✓ | ✓ | ✓ (review+flag only) |
| Tasks | ✓ | ✓ | ✓ (verify only) |
| AI Analytics | ✓ | ✗ | ✗ |
| Reports | ✓ | ✓ (own NGO) | ✗ |
| Notifications | ✓ | ✗ | ✗ |
| Moderation | ✓ | ✓ | ✓ |
| Settings | ✓ | ✗ | ✗ |
| Audit Log | ✓ | ✗ | ✗ |
| Data Export | ✓ | ✓ (own NGO) | ✗ |

### Critical Rule: Every Admin Mutation

```javascript
// REQUIRED before EVERY Firestore write in admin panel:
await logAdminAction(action, targetType, targetId, oldValue, newValue);
// Then commit the Firestore change.
// If logAdminAction fails, do NOT commit the change.
```

### Admin Firestore Rules (additions to base rules)

```
match /adminUsers/{uid} {
  allow read: if request.auth.uid == uid || isSuperAdmin();
  allow write: if isSuperAdmin();
}
match /adminAuditLog/{id} {
  allow read: if isNGOAdmin();
  allow write: if false;    // Cloud Functions only — IMMUTABLE
}
match /systemSettings/{key} {
  allow read: if isAdmin();
  allow write: if isSuperAdmin();
}
match /flaggedContent/{id} {
  allow read: if isAdmin();
  allow create: if request.auth != null;
  allow update: if isAdmin();
  allow delete: if isSuperAdmin();
}
```

---

## 13. Demo Data & Testing

### seedDemoData.ts

Run: `npx ts-node functions/src/seedDemoData.ts`

**Deletes all demo-* prefixed documents first, then seeds:**

```javascript
// NGO
{ id: "demo-ngo-001", name: "Hadapsar Care Foundation", area: "Hadapsar, Pune", verified: true }

// Coordinators
{ id: "demo-coord-001", uniqueId: "VC-HCF-2025-0001", name: "Rahul Kulkarni",
  skills: ["logistics","driving","marathi"], location: {lat:18.507,lng:73.931}, rating: 4.9, tasksCompleted: 24 }
{ id: "demo-coord-002", uniqueId: "VC-HCF-2025-0002", name: "Sneha Patil",
  skills: ["medical","first-aid","hindi"], location: {lat:18.498,lng:73.855}, rating: 4.7 }
{ id: "demo-coord-003", uniqueId: "VC-HCF-2025-0003", name: "Arjun Mehta",
  skills: ["teaching","english","computers"], location: {lat:18.563,lng:73.789}, rating: 4.8 }
{ id: "demo-coord-004", uniqueId: "VC-HCF-2025-0004", name: "Priya Desai",
  skills: ["eldercare","cooking","marathi"], location: {lat:18.520,lng:73.856}, rating: 4.6 }

// Resources
{ id: "demo-res-001", category: "food", urgency: "high", urgencyScore: 8.4,
  aiTitle: "Food distribution Hadapsar", peopleAffected: 40, status: "open" }
{ id: "demo-res-002", category: "health", urgency: "high", urgencyScore: 7.9,
  aiTitle: "Medical camp Kothrud urgent", peopleAffected: 25, status: "matched" }
{ id: "demo-res-003", category: "education", urgency: "medium", urgencyScore: 5.2,
  aiTitle: "Children tutoring Baner area", peopleAffected: 15, status: "open" }
{ id: "demo-res-004", category: "eldercare", urgency: "medium", urgencyScore: 4.8,
  aiTitle: "Elder care Shivajinagar", peopleAffected: 8, status: "open" }
{ id: "demo-res-005", category: "shelter", urgency: "low", urgencyScore: 3.1,
  aiTitle: "Shelter repair Yerawada", peopleAffected: 12, status: "open" }

// Tasks
{ id: "demo-task-001", resourceId: "demo-res-001", coordinatorId: "demo-coord-001",
  status: "in_progress", matchScore: 87,
  matchExplanation: "Rahul matched: logistics skills + 1.2km away + available today" }
{ id: "demo-task-002", resourceId: "demo-res-002", coordinatorId: "demo-coord-002",
  status: "assigned", matchScore: 91, expiresAt: 30min from now,
  matchExplanation: "Sneha matched: medical+first-aid + 3.8km from Kothrud" }
```

### e2eTest.ts

Run: `npx ts-node functions/src/e2eTest.ts`

```
Check 1: Create test resource → verify document in Firestore
Check 2: Wait 20s → verify urgencyScore + aiTitle + requiredSkills populated (Gemini worked)
Check 3: Verify task document created with matchScore + matchExplanation (matching worked)
Check 4: Verify resource.status == "matched"
Check 5: Simulate coordinator accept → verify task.status == "travelling"
Check 6: Simulate task complete → verify resource.status == "resolved"
Cleanup: Delete all test documents
Output: "X/6 checks passed"
```

---

## 14. Deployment

### Website (Vercel)

```bash
cd website
vercel --prod
```

Add all environment variables in Vercel dashboard:
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
```

Add Vercel domain to Firebase Auth authorized domains.

### Mobile APK

```bash
cd mobile
npx eas build --platform android --profile preview
# OR
npx expo build:android
```

### Cloud Functions

```bash
firebase functions:secrets:set GEMINI_API_KEY
firebase functions:secrets:set GOOGLE_MAPS_API_KEY
firebase deploy --only functions
```

### Firestore Rules + Indexes

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

### Admin Panel (separate Vercel project)

```bash
cd admin-panel
vercel --prod
```

Add admin domain to Firebase Auth authorized domains.

Create first Super Admin manually in Firebase Console:
- Navigate to Firestore → adminUsers collection
- Add document with uid of the super admin's Firebase Auth uid
- Set role: "superadmin", isActive: true

---

## 15. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| FCM push not delivered on demo device | Medium | High | Test on physical device 24hrs before demo; have fallback screen recording |
| Gemini API rate limit hit during demo | Low | High | Implement retry logic; pre-warm with test calls; have cached demo response as fallback |
| Google Maps Distance Matrix API cost overrun | Low | Medium | Batch all coordinator distances in one API call; set billing alert at $5 |
| Cloud Function cold start delay (>10 sec) | Medium | Medium | Deploy functions with minimum 1 instance to avoid cold start |
| Firestore real-time listener not updating dashboard live | Low | High | Test on production Firebase (not emulator) 48hrs before demo |
| Offline form data lost on app crash | Low | Medium | Use AsyncStorage with try/catch; validate queue on every app open |
| Demo device battery during presentation | Medium | High | Bring charger; keep screen at 50% brightness; close background apps |

---

## Build Summary

| Phase | Deliverable | Test Cases | Time |
|---|---|---|---|
| 1 — Firebase Setup | Rules + indexes + shared types deployed | 8 | 1.5 days |
| 2 — Gemini AI + Functions | 8 Cloud Functions live, AI tested 4/4 | 9 | 2 days |
| 3 — Authentication | All 5 roles login, Google+Microsoft+2FA working | 10 | 1.5 days |
| 4 — Public Website | Home+About+Contact+Chatbot live | 10 | 2 days |
| 5 — NGO Dashboard | Resource posting+assignment+ID cards+export | 11 | 2.5 days |
| 6 — Coordinator Panel | Accept/decline+status+chat+SOS on web+mobile | 10 | 2 days |
| 7 — Admin Panel | All 13 admin pages, audit log, moderation live | 11 | 2.5 days |
| 8 — Demo Prep | Seed data + E2E test + Vercel deploy + APK | 10 | 1 day |
| **TOTAL** | **188 features across 3 platforms** | **79 core + 55 admin = 134** | **~15 days solo / 4 days team** |

### Key Differentiators for Google Solution Challenge Judges

1. **Coordinator ID Card with QR code** — unique physical proof of coordination, scannable for authenticity
2. **AI Chatbot on public website** — real-time contact form AI preview powered by Gemini
3. **Google + Microsoft Sign-In** — accessibility for diverse organizations
4. **2FA mandatory for all roles** — enterprise-grade security
5. **Export PDF/CSV/Sheets** — NGOs can show donors measurable impact
6. **6 Google products used:** Gemini, Maps, Firebase, FCM, Sheets, Calendar
7. **4 SDGs addressed:** SDG 1 (No Poverty), SDG 3 (Good Health), SDG 10 (Reduced Inequalities), SDG 17 (Partnerships)

---

*VolunteerConnect = Smart Resource Allocator | Complete Project Reference v1.0*
*Google Solution Challenge 2025 | 188 features · 5 roles · 8 build phases · 134 test cases · 3 platforms*