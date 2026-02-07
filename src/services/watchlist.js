import {
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  serverTimestamp,
  collection,
  query,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../lib/firebase";

function userMoviesCollection(uid) {
  return collection(db, "users", uid, "movies");
}

export function subscribeToUserMovies(uid, callback) {
  const q = query(userMoviesCollection(uid));
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(items);
  });
}

export async function upsertMovie(uid, movie) {
  const ref = doc(db, "users", uid, "movies", String(movie.id));

  await setDoc(
    ref,
    {
      ...movie,
      updatedAt: serverTimestamp(),
      createdAt: movie.createdAt || serverTimestamp(),
    },
    { merge: true },
  );
}

export function removeMovie(uid, movieId) {
  const ref = doc(db, "users", uid, "movies", String(movieId));
  return deleteDoc(ref);
}

export async function deleteAllUserMovies(uid) {
  const ref = collection(db, "users", uid, "movies");
  const snap = await getDocs(ref);

  const deletes = snap.docs.map((d) =>
    deleteDoc(doc(db, "users", uid, "movies", d.id)),
  );
  await Promise.all(deletes);
}
