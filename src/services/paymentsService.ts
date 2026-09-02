import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
} from 'firebase/firestore';
import { db } from './firebase';
import { Payment } from '../types';
import { INITIAL_PAYMENTS } from '../data/initialData';

const PAYMENTS_COLLECTION = 'payments';

export const PaymentsService = {
  // Get all payments (or by month/year)
  async getPayments(month?: string, year?: number): Promise<Payment[]> {
    try {
      let q = query(collection(db, PAYMENTS_COLLECTION), orderBy('created_at', 'desc'));
      
      if (month && year) {
        q = query(
          collection(db, PAYMENTS_COLLECTION),
          where('period_month', '==', month),
          where('period_year', '==', year)
        );
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map((docSnap) => ({
        ...(docSnap.data() as Omit<Payment, 'id'>),
        id: docSnap.id,
      }));
    } catch (error) {
      console.error('Error fetching payments from Firestore:', error);
      return [];
    }
  },

  // Add a payment
  async addPayment(paymentData: Omit<Payment, 'id' | 'created_at'>): Promise<Payment> {
    try {
      const newDocRef = doc(collection(db, PAYMENTS_COLLECTION));
      const newPayment: Payment = {
        ...paymentData,
        id: newDocRef.id,
        created_at: new Date().toISOString(),
      };
      await setDoc(newDocRef, newPayment);
      return newPayment;
    } catch (error) {
      console.error('Error adding payment to Firestore:', error);
      throw error;
    }
  },

  // Delete a payment
  async deletePayment(paymentId: string): Promise<void> {
    try {
      const docRef = doc(db, PAYMENTS_COLLECTION, paymentId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting payment from Firestore:', error);
      throw error;
    }
  },

  // Seed default payments
  async seedInitialPayments(): Promise<void> {
    try {
      const snapshot = await getDocs(collection(db, PAYMENTS_COLLECTION));
      if (snapshot.empty) {
        for (const payment of INITIAL_PAYMENTS) {
          const docRef = doc(db, PAYMENTS_COLLECTION, payment.id);
          await setDoc(docRef, payment);
        }
      }
    } catch (error) {
      console.warn('Error seeding payments:', error);
    }
  },
};
