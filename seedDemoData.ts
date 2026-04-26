import { db } from "./src/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

/**
 * Run this script to populate your VolunteerConnect Firestore with demo data.
 * Usage: node seedDemoData.js (requires firestore access)
 */

const SEED_DATA = {
  ngos: [
    {
      name: "Hope Care Foundation",
      email: "admin@hopecare.org",
      verified: true,
      status: "Verified",
      area: "Pune North",
      description: "Providing emergency medical relief and food security since 2010.",
      createdAt: new Date().toISOString()
    },
    {
      name: "Green Earth Initiative",
      email: "contact@greenearth.in",
      verified: false,
      status: "Pending",
      area: "Mumbai Metro",
      description: "Sustainable urban reforestation and disaster resilience.",
      createdAt: new Date().toISOString()
    }
  ],
  resources: [
    {
      title: "100 Medical Kits",
      description: "First aid kits for emergency response.",
      type: "Supplies",
      status: "active",
      ngoName: "Hope Care Foundation",
      matchScore: 92,
      createdAt: new Date().toISOString()
    },
    {
      title: "Temporary Shelter Tents",
      description: "Weather-resistant tents for 50 families.",
      type: "Equipment",
      status: "active",
      ngoName: "Hope Care Foundation",
      matchScore: 88,
      createdAt: new Date().toISOString()
    }
  ],
  tasks: [
    {
      title: "Deliver Kits to Sector 4",
      status: "in-progress",
      location: "Handewadi Road, Pune",
      coordinatorName: "Rahul Kulkarni",
      resourceType: "Medical Supplies",
      quantity: "50 Units",
      createdAt: new Date().toISOString()
    },
    {
      title: "Shelter Setup at Base 1",
      status: "completed",
      location: "Camp Area, Pune",
      coordinatorName: "Sneha Patil",
      resourceType: "Equipment",
      quantity: "12 Tents",
      createdAt: new Date().toISOString()
    }
  ],
  reports: [
    {
      reason: "Suspicious Activity",
      targetName: "Anonymous Bot",
      priority: "high",
      status: "pending",
      details: "Spamming the resource broadcast channel with fake entries.",
      reporterEmail: "moderator@vc.org",
      createdAt: new Date().toISOString()
    }
  ],
  users: [
    {
      name: "Super Admin",
      email: "master@vc.org",
      role: "superadmin",
      createdAt: new Date().toISOString()
    },
    {
       name: "Rahul Kulkarni",
       email: "rahul@vol.org",
       role: "coordinator",
       status: "online",
       verified: true,
       location: "Pune, Maharashtra",
       createdAt: new Date().toISOString()
    }
  ]
};

async function seed() {
  console.log("🚀 Starting Data Seeding...");
  
  for (const [collName, data] of Object.entries(SEED_DATA)) {
    console.log(`Seeding: ${collName}`);
    for (const item of data) {
      await addDoc(collection(db, collName), {
        ...item,
        timestamp: serverTimestamp()
      });
    }
  }
  
  console.log("✅ Seeding Complete!");
}

// Note: To run this, you would usually use a node script 
// but for this environment, I'm providing it as a reference.
// The user can copy-paste this into a script file.
seed();
