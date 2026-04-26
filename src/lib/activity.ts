import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function logActivity(data: {
  user: string;
  action: string;
  target: string;
  type: "info" | "success" | "warning" | "alert";
}) {
  try {
    await addDoc(collection(db, "activities"), {
      ...data,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}
