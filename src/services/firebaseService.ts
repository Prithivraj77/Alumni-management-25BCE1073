import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { 
  AlumniMember, 
  AlumniEvent, 
  EventRegistration, 
  MentorshipRequest, 
  JobPosting 
} from '../types';
import { 
  INITIAL_ALUMNI, 
  INITIAL_EVENTS, 
  INITIAL_REGISTRATIONS, 
  INITIAL_MENTORSHIP_REQUESTS, 
  INITIAL_JOBS 
} from '../data/mockData';

export const COLLECTIONS = {
  ALUMNI: 'alumni_members',
  EVENTS: 'alumni_events',
  REGISTRATIONS: 'event_registrations',
  MENTORSHIPS: 'mentorship_requests',
  JOBS: 'job_postings',
};

// Seed initial dataset to Firestore if collections are empty
export async function seedFirestoreIfEmpty(): Promise<boolean> {
  try {
    const alumniCol = collection(db, COLLECTIONS.ALUMNI);
    const snapshot = await getDocs(alumniCol);
    
    if (!snapshot.empty) {
      console.log(`Firestore already populated with ${snapshot.size} alumni records.`);
      return true;
    }

    console.log('Seeding initial alumni data to Firebase Firestore...');
    const batch = writeBatch(db);

    // Seed Alumni
    INITIAL_ALUMNI.forEach((member) => {
      const ref = doc(db, COLLECTIONS.ALUMNI, member.id);
      batch.set(ref, member);
    });

    // Seed Events
    INITIAL_EVENTS.forEach((evt) => {
      const ref = doc(db, COLLECTIONS.EVENTS, evt.id);
      batch.set(ref, evt);
    });

    // Seed Registrations
    INITIAL_REGISTRATIONS.forEach((reg) => {
      const ref = doc(db, COLLECTIONS.REGISTRATIONS, reg.id);
      batch.set(ref, reg);
    });

    // Seed Mentorship Requests
    INITIAL_MENTORSHIP_REQUESTS.forEach((req) => {
      const ref = doc(db, COLLECTIONS.MENTORSHIPS, req.id);
      batch.set(ref, req);
    });

    // Seed Jobs
    INITIAL_JOBS.forEach((job) => {
      const ref = doc(db, COLLECTIONS.JOBS, job.id);
      batch.set(ref, job);
    });

    await batch.commit();
    console.log('Firestore seed completed successfully.');
    return true;
  } catch (error) {
    console.warn('Could not seed Firestore (using local fallback if offline):', error);
    return false;
  }
}

// Force populate or re-seed all collections into Firebase Firestore on demand
export async function populateAllFirebaseData(): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const batch = writeBatch(db);
    let count = 0;

    INITIAL_ALUMNI.forEach((member) => {
      const ref = doc(db, COLLECTIONS.ALUMNI, member.id);
      batch.set(ref, member);
      count++;
    });

    INITIAL_EVENTS.forEach((evt) => {
      const ref = doc(db, COLLECTIONS.EVENTS, evt.id);
      batch.set(ref, evt);
      count++;
    });

    INITIAL_REGISTRATIONS.forEach((reg) => {
      const ref = doc(db, COLLECTIONS.REGISTRATIONS, reg.id);
      batch.set(ref, reg);
      count++;
    });

    INITIAL_MENTORSHIP_REQUESTS.forEach((req) => {
      const ref = doc(db, COLLECTIONS.MENTORSHIPS, req.id);
      batch.set(ref, req);
      count++;
    });

    INITIAL_JOBS.forEach((job) => {
      const ref = doc(db, COLLECTIONS.JOBS, job.id);
      batch.set(ref, job);
      count++;
    });

    await batch.commit();
    return { success: true, count };
  } catch (error: any) {
    console.error('Failed to populate Firestore:', error);
    return { success: false, count: 0, error: error?.message || String(error) };
  }
}

// Firestore real-time subscriptions
export function subscribeToCollection<T>(
  collectionName: string, 
  onData: (items: T[]) => void
) {
  try {
    const colRef = collection(db, collectionName);
    return onSnapshot(colRef, (snapshot) => {
      const list: T[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ ...docSnap.data(), id: docSnap.id } as T);
      });
      onData(list);
    }, (error) => {
      console.warn(`Firestore onSnapshot warning for ${collectionName}:`, error.message);
    });
  } catch (error) {
    console.warn(`Could not attach listener to ${collectionName}:`, error);
    return () => {};
  }
}

// Write Alumni Profile to Firestore
export async function saveAlumniToFirestore(member: AlumniMember): Promise<void> {
  try {
    const ref = doc(db, COLLECTIONS.ALUMNI, member.id);
    await setDoc(ref, member, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTIONS.ALUMNI}/${member.id}`);
  }
}

// Save Event to Firestore
export async function saveEventToFirestore(event: AlumniEvent): Promise<void> {
  try {
    const ref = doc(db, COLLECTIONS.EVENTS, event.id);
    await setDoc(ref, event, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTIONS.EVENTS}/${event.id}`);
  }
}

// Save Event Registration to Firestore
export async function saveRegistrationToFirestore(reg: EventRegistration): Promise<void> {
  try {
    const ref = doc(db, COLLECTIONS.REGISTRATIONS, reg.id);
    await setDoc(ref, reg, { merge: true });
    
    // Also bump count in event
    const eventRef = doc(db, COLLECTIONS.EVENTS, reg.eventId);
    const evtSnap = await getDocs(collection(db, COLLECTIONS.EVENTS));
    const evt = evtSnap.docs.find(d => d.id === reg.eventId);
    if (evt) {
      await updateDoc(eventRef, {
        registeredCount: (evt.data().registeredCount || 0) + 1
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTIONS.REGISTRATIONS}/${reg.id}`);
  }
}

// Delete Event Registration from Firestore
export async function deleteRegistrationFromFirestore(regId: string, eventId: string): Promise<void> {
  try {
    const ref = doc(db, COLLECTIONS.REGISTRATIONS, regId);
    await deleteDoc(ref);

    // Decrement count in event
    const eventRef = doc(db, COLLECTIONS.EVENTS, eventId);
    const evtSnap = await getDocs(collection(db, COLLECTIONS.EVENTS));
    const evt = evtSnap.docs.find(d => d.id === eventId);
    if (evt) {
      const current = evt.data().registeredCount || 1;
      await updateDoc(eventRef, {
        registeredCount: Math.max(0, current - 1)
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTIONS.REGISTRATIONS}/${regId}`);
  }
}

// Save Mentorship Request to Firestore
export async function saveMentorshipToFirestore(req: MentorshipRequest): Promise<void> {
  try {
    const ref = doc(db, COLLECTIONS.MENTORSHIPS, req.id);
    await setDoc(ref, req, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTIONS.MENTORSHIPS}/${req.id}`);
  }
}

// Save Job Posting to Firestore
export async function saveJobToFirestore(job: JobPosting): Promise<void> {
  try {
    const ref = doc(db, COLLECTIONS.JOBS, job.id);
    await setDoc(ref, job, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTIONS.JOBS}/${job.id}`);
  }
}
