import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

export async function POST(req: Request) {
  try {
    const { email, password, name, phone, zone, skills, availability, ngoId, coordinatorId } = await req.json();

    if (!FIREBASE_API_KEY) {
      throw new Error("Missing Firebase API Key");
    }

    // 1. Create user via Firebase Auth REST API (prevents client-side logout)
    const authResponse = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true,
        }),
      }
    );

    const authData = await authResponse.json();

    if (!authResponse.ok) {
      throw new Error(authData.error?.message || "Failed to create auth account");
    }

    const uid = authData.localId;

    // 2. Create user document
    await setDoc(doc(db, "users", uid), {
      uid,
      email,
      name,
      phone,
      role: "coordinator",
      createdAt: new Date().toISOString(),
      isBanned: false,
    });

    // 3. Create coordinator profile
    await setDoc(doc(db, "coordinators", uid), {
      uid,
      id: coordinatorId,
      name,
      email,
      phone,
      zone,
      skills,
      status: "Active",
      availability,
      tasksCompleted: 0,
      ngoId: ngoId || null,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, uid });
  } catch (error: any) {
    console.error("Register Coordinator Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to register coordinator" },
      { status: 500 }
    );
  }
}
