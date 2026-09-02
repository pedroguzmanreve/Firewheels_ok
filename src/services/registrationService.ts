import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';
import { Student } from '../types';
import { StudentsService } from './studentsService';
import { AuthService } from './authService';

const REGISTRATIONS_COLLECTION = 'public_registrations';

export interface PublicRegistrationData extends Omit<Student, 'id' | 'created_at'> {
  registration_status?: 'pending' | 'approved';
}

export const RegistrationService = {
  // Public registration submission by parents
  async submitRegistration(studentData: Omit<Student, 'id' | 'created_at'>): Promise<Student> {
    try {
      const regDocRef = doc(collection(db, REGISTRATIONS_COLLECTION));
      const newRegistration = {
        ...studentData,
        id: regDocRef.id,
        status: 'active',
        registration_status: 'approved',
        created_at: new Date().toISOString(),
      };

      // Remove undefined values, as Firestore doesn't support them
      const cleanRegistration = Object.fromEntries(
        Object.entries(newRegistration).filter(([_, v]) => v !== undefined)
      );

      // Save into public_registrations collection (allowed by Security Rules for unauthenticated parents)
      await setDoc(regDocRef, cleanRegistration);

      // If user is authenticated admin (or when creating from admin app), also write to students collection
      const currentUser = AuthService.getCurrentUser();
      if (currentUser) {
        try {
          await StudentsService.addStudent(studentData);
        } catch (e) {
          console.warn('Could not auto-add to students collection directly:', e);
        }
      }

      return {
        ...studentData,
        id: regDocRef.id,
        created_at: newRegistration.created_at,
      };
    } catch (error) {
      console.error('Error submitting public registration:', error);
      throw error;
    }
  },

  // Get list of public registrations (Admin only)
  async getRegistrations(): Promise<Student[]> {
    try {
      const q = query(collection(db, REGISTRATIONS_COLLECTION), orderBy('created_at', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((docSnap) => ({
        ...(docSnap.data() as Omit<Student, 'id'>),
        id: docSnap.id,
      }));
    } catch (error) {
      console.warn('Error fetching public registrations:', error);
      return [];
    }
  },
};
