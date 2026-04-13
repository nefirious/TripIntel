import { 
  collection, 
  addDoc, 
  query, 
  getDocs, 
  where, 
  Timestamp,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { db, auth } from '../firebase';

export interface ReliefLocation {
  id?: string;
  name: string;
  address?: string;
  lat: number;
  lng: number;
  type: 'public' | 'business' | 'department_store' | 'cafe' | 'library' | 'gas_station';
  isAccessible?: boolean;
  hasBabyChanging?: boolean;
  isGenderNeutral?: boolean;
  addedBy: string;
  createdAt?: any;
}

const COLLECTION_NAME = 'relief_locations';

export async function addReliefLocation(location: Omit<ReliefLocation, 'id' | 'createdAt'>) {
  if (!auth.currentUser) throw new Error('Must be authenticated to add a location');
  
  return await addDoc(collection(db, COLLECTION_NAME), {
    ...location,
    addedBy: auth.currentUser.uid,
    createdAt: serverTimestamp()
  });
}

export async function getReliefLocations(): Promise<ReliefLocation[]> {
  const q = query(collection(db, COLLECTION_NAME));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as ReliefLocation));
}

export async function deleteReliefLocation(id: string) {
  await deleteDoc(doc(db, COLLECTION_NAME, id));
}

// Haversine distance in km
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - Math.sqrt(a) === 0 ? 0.000001 : 1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}
