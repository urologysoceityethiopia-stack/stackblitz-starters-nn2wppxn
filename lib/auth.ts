import { auth, db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";

import { doc, setDoc, getDoc } from "firebase/firestore";

// 🟢 SIGN UP
export async function signUp(
  email: string,
  password: string,
  name: string,
  role: "patient" | "doctor"
) {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  const user = userCredential.user;

  // Save user in Firestore
  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    name,
    email,
    role,
    createdAt: new Date(),
  });

  return user;
}

// 🔵 SIGN IN
export async function signIn(email: string, password: string) {
  return await signInWithEmailAndPassword(auth, email, password);
}

// 🔴 LOGOUT
export async function logOut() {
  return await signOut(auth);
}

// 👤 GET USER DATA (role check)
export async function getUserData(uid: string) {
  const docRef = doc(db, "users", uid);
  const snap = await getDoc(docRef);

  if (snap.exists()) return snap.data();
  return null;
}