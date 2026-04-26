import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function logAdminAction(
  action: string,
  targetType: string,
  targetId: string,
  oldValue?: any,
  newValue?: any
) {
  try {
    await addDoc(collection(db, "auditLog"), {
      action,
      targetType,
      targetId,
      oldValue: oldValue ? JSON.stringify(oldValue) : null,
      newValue: newValue ? JSON.stringify(newValue) : null,
      timestamp: serverTimestamp(),
    });
  } catch (err) {
    console.error("Audit log failed:", err);
    throw err; // Caller must handle — do not proceed with mutation if this fails
  }
}
