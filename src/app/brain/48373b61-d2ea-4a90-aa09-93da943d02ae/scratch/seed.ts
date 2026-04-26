import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const coordinators = [
  {
    id: "VC-HCF-001",
    name: "Rahul Kulkarni",
    skills: ["Logistics", "Food Distribution"],
    location: { lat: 18.5089, lng: 73.9260 }, // Hadapsar
    availability: "online",
    zone: "Hadapsar"
  },
  {
    id: "VC-KTR-002",
    name: "Sneha Patil",
    skills: ["Medical", "First Aid"],
    location: { lat: 18.5074, lng: 73.8077 }, // Kothrud
    availability: "online",
    zone: "Kothrud"
  },
  {
      id: "VC-YRW-003",
      name: "Priya Das",
      skills: ["Education", "Eldercare"],
      location: { lat: 18.5529, lng: 73.8997 }, // Yerawada
      availability: "offline",
      zone: "Yerawada"
  }
];

async function seed() {
  console.log("Seeding coordinators...");
  for (const c of coordinators) {
    try {
      await addDoc(collection(db, "coordinators"), c);
      console.log(`Added ${c.name}`);
    } catch (e) {
      console.error(e);
    }
  }
  console.log("Done!");
}

seed();
