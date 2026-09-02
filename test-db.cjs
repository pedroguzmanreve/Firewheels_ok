const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const fs = require('fs');

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function test() {
  const snapshot = await getDocs(collection(db, 'students'));
  console.log('Students count:', snapshot.size);
  snapshot.forEach(doc => console.log(doc.id, doc.data().full_name));
}
test().catch(console.error);
