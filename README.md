# VolunteerConnect 🌍

VolunteerConnect is an AI-powered humanitarian platform designed to bridge the gap between NGOs and field coordinators during crises. By leveraging real-time data and Google's Gemini AI, the platform optimizes resource allocation and speeds up response times.

## 🚀 Key Features

- **AI-Driven Matching:** Automatic assignment of resources to coordinators using Google Gemini 1.5 Flash.
- **Global Crisis Live Map:** Real-time visualization of resource distribution using Leaflet and OpenStreetMap.
- **NGO Dashboard:** Comprehensive inventory management and data import (CSV/XLSX).
- **Coordinator Panel:** Mobile-first interface for task management and status updates.
- **Live Activity Feed:** Centralized hub for tracking global humanitarian actions.

## 🛠️ Technical Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Framer Motion (for premium animations)
- **Database:** Firebase Cloud Firestore (Real-time synchronization)
- **Auth:** Firebase Auth
- **AI:** Google Gemini AI (Generative Model)
- **Mapping:** Leaflet.js with OpenStreetMap (CartoDB Dark Matter tiles)
- **Email:** Resend API

## 📦 Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Skedare240507/volunteerconnect.git
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file with the following:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_id
   GEMINI_API_KEY=your_gemini_key
   RESEND_API_KEY=your_resend_key
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

## 📄 License

This project is part of the Google Solution Challenge 2025.
