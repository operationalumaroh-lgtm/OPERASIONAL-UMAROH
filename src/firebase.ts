import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc, updateDoc, addDoc, setDoc, getDocs, deleteDoc, query, where, writeBatch } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export { collection, onSnapshot, doc, updateDoc, addDoc, setDoc, getDocs, deleteDoc, query, where, writeBatch };
