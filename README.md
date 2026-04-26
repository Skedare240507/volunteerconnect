# VolunteerConnect 🌍
### *Bridging the Gap in Crisis Response with AI*

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-v12-orange?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![Gemini AI](https://img.shields.io/badge/Google_AI-Gemini_1.5_Flash-blue?style=flat-square&logo=google)](https://ai.google.dev/)
[![Solution Challenge](https://img.shields.io/badge/Google-Solution_Challenge_2025-4285F4?style=flat-square&logo=google)](https://developers.google.com/community/solutions-challenge)

## 📌 Overview
**VolunteerConnect** is an advanced humanitarian platform designed for the **Google Solution Challenge 2025**. It solves the critical problem of delayed resource allocation during natural disasters and humanitarian crises. By combining real-time data synchronization with Google's Gemini AI, we ensure that resources (food, medicine, equipment) reach the people who need them in record time.

---

## ⚡ The Problem & The Solution
### **The Problem**
In disaster zones, coordination between NGOs and field workers is often fragmented. NGOs have resources but lacks real-time insight into which coordinator is best equipped or closest to handle a specific need, leading to logistical bottlenecks.

### **The Solution**
VolunteerConnect acts as an **intelligent middleman**. When an NGO logs a resource, our **AI Orhcestrator** analyzes the local coordinator pool and automatically assigns the task to the most qualified person based on availability, proximity, and skill match.

---

## 🚀 Core Features

### 🤖 **AI-Driven Logistics**
*   **Intelligent Matching:** Uses **Gemini 1.5 Flash** to parse resource descriptions and coordinator profiles for optimal assignment.
*   **Predictive Analysis:** Identifies potential hotspots where resources might be needed soon.

### 📍 **Real-time Visualization**
*   **Global Crisis Live Map:** Built with **Leaflet** and **OpenStreetMap**, providing a dark-mode, high-contrast view of active humanitarian zones.
*   **Dynamic Markers:** Instantly updates when a new resource is added or a task is completed.

### 🛡️ **Secure Dashboards**
*   **NGO Workspace:** Bulk data import (CSV/XLSX), inventory tracking, and coordinator oversight.
*   **Coordinator Panel:** Mobile-optimized PWA-style interface with SOS broadcasting and real-time task notifications.
*   **Admin Control:** Super-admin level oversight of all registered NGOs and platform-wide activity logs.

---

## 🛠️ Technical Stack

| Category | Technology |
| :--- | :--- |
| **Frontend** | Next.js 15 (App Router), Tailwind CSS, Framer Motion |
| **Backend** | Firebase (Firestore, Auth, Storage, Cloud Functions) |
| **AI/ML** | Google Gemini 1.5 Flash API |
| **Mapping** | Leaflet.js, OpenStreetMap, CartoDB Tiles |
| **Messaging** | Resend API (Transactional Emails) |

---

## 📁 Project Structure

```text
├── src/
│   ├── app/            # Next.js App Router (Auth, Dashboards, API)
│   ├── components/     # High-performance UI components (Maps, AI Chat, etc.)
│   ├── lib/            # Shared logic (Firebase config, AI helpers, Auth context)
│   └── styles/         # Global design system and animations
├── public/             # Static assets and map markers
└── functions/          # Firebase Cloud Functions (Typescript)
```

---

## 📦 Getting Started

1. **Clone & Install:**
   ```bash
   git clone https://github.com/Skedare240507/volunteerconnect.git
   cd volunteerconnect
   npm install
   ```

2. **Environment Setup:**
   Create a `.env.local` using the keys from your Firebase and Google AI Studio consoles.

3. **Development Mode:**
   ```bash
   npm run dev
   ```

---

## 🤝 Contribution & License
This project was developed for the **Google Solution Challenge 2025**. 

*   **Goal:** To achieve the UN Sustainable Development Goals (SDGs) for Good Health and Well-being & Reduced Inequalities.
*   **License:** MIT License.

---
*Built with ❤️ by Team Skedare for a safer world.*
