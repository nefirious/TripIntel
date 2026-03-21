import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, updateDoc, increment, serverTimestamp, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export async function incrementSearchCount(city: string) {
  if (!city) return;
  
  // Use city name as ID (normalized to lowercase for consistency)
  const cityId = city.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
  const cityRef = doc(db, 'searches', cityId);
  
  try {
    const cityDoc = await getDoc(cityRef);
    if (cityDoc.exists()) {
      await updateDoc(cityRef, {
        count: increment(1),
        lastSearched: serverTimestamp()
      });
    } else {
      await setDoc(cityRef, {
        city: city, // Store original display name
        count: 1,
        lastSearched: serverTimestamp()
      });
    }
  } catch (error) {
    console.error("Error incrementing search count:", error);
  }
}

export async function getTopSearchedCities(max: number = 6) {
  try {
    const searchesRef = collection(db, 'searches');
    const q = query(searchesRef, orderBy('count', 'desc'), limit(max));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      city: doc.data().city,
      count: doc.data().count
    }));
  } catch (error) {
    console.error("Error getting top searched cities:", error);
    return [];
  }
}
