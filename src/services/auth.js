import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
} from "firebase/auth";
import { auth } from "../lib/firebase";

const googleProvider = new GoogleAuthProvider();

export function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

export function signInWithEmail(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function signUpWithEmail(email, password) {
  return createUserWithEmailAndPassword(auth, email, password);
}

export function logout() {
  return signOut(auth);
}

export function resetPassword(email) {
  return sendPasswordResetEmail(auth, email);
}

export async function deleteAccount() {
  if (!auth.currentUser) return;
  await deleteUser(auth.currentUser);
}

export async function reauthWithPassword(password) {
  const user = auth.currentUser;
  if (!user?.email) throw new Error("No email on current user");

  const cred = EmailAuthProvider.credential(user.email, password);
  await reauthenticateWithCredential(user, cred);
}

export async function reauthWithGoogle() {
  const user = auth.currentUser;
  if (!user) throw new Error("No current user");

  const provider = new GoogleAuthProvider();
  await reauthenticateWithPopup(user, provider);
}
