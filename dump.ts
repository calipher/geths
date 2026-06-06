import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function run() {
  const sermons = await getDocs(collection(db, 'sermons'));
  console.log("Sermons in Firestore:", sermons.docs.map(d => d.data()));
  
  const announcements = await getDocs(collection(db, 'announcements'));
  console.log("Announcements in Firestore:", announcements.docs.map(d => d.data()));
  
  process.exit(0);
}
run();
