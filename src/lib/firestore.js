// lib/firestore.js
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

// ─── CLIENTS ───────────────────────────────────────────────

export async function getClients() {
  const q = query(collection(db, 'clients'), orderBy('nom'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function addClient(data) {
  return addDoc(collection(db, 'clients'), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function updateClient(id, data) {
  return updateDoc(doc(db, 'clients', id), data);
}

export async function deleteClient(id) {
  return deleteDoc(doc(db, 'clients', id));
}

// ─── RENDEZ-VOUS ────────────────────────────────────────────

export async function getRendezVous() {
  const q = query(collection(db, 'rendezVous'), orderBy('date'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getRendezVousParClient(clientId) {
  const q = query(
    collection(db, 'rendezVous'),
    where('clientId', '==', clientId),
    orderBy('date', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function addRendezVous(data) {
  return addDoc(collection(db, 'rendezVous'), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function updateRendezVous(id, data) {
  return updateDoc(doc(db, 'rendezVous', id), data);
}

export async function deleteRendezVous(id) {
  return deleteDoc(doc(db, 'rendezVous', id));
}