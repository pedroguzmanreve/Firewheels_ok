import {
  collection,
  doc,
  getDocs,
  writeBatch,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
} from 'firebase/firestore';
import { db } from './firebase';
import { AttendanceRecord } from '../types';
import { INITIAL_ATTENDANCE } from '../data/initialData';

const ATTENDANCE_COLLECTION = 'attendance';

export const AttendanceService = {
  // Get attendance records (optionally filtered by specific date)
  async getAttendance(date?: string): Promise<AttendanceRecord[]> {
    try {
      let q = query(collection(db, ATTENDANCE_COLLECTION), orderBy('date', 'desc'), firestoreLimit(200));

      if (date) {
        q = query(collection(db, ATTENDANCE_COLLECTION), where('date', '==', date));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map((docSnap) => ({
        ...(docSnap.data() as Omit<AttendanceRecord, 'id'>),
        id: docSnap.id,
      }));
    } catch (error) {
      console.error('Error fetching attendance from Firestore:', error);
      return [];
    }
  },

  // Save attendance for a specific date (atomic batch write)
  async saveDateAttendance(
    dateStr: string,
    recordsForDate: { student_id: string; status: 'present' | 'absent' | 'excused'; notes?: string }[]
  ): Promise<AttendanceRecord[]> {
    try {
      const batch = writeBatch(db);

      // Find existing attendance docs for this date to overwrite/delete cleanly
      const existingQuery = query(collection(db, ATTENDANCE_COLLECTION), where('date', '==', dateStr));
      const existingDocs = await getDocs(existingQuery);
      existingDocs.forEach((docSnap) => {
        batch.delete(docSnap.ref);
      });

      const savedRecords: AttendanceRecord[] = [];

      for (const item of recordsForDate) {
        const docRef = doc(collection(db, ATTENDANCE_COLLECTION));
        const newRecord: AttendanceRecord = {
          id: docRef.id,
          student_id: item.student_id,
          date: dateStr,
          status: item.status,
          notes: item.notes || '',
          created_at: new Date().toISOString(),
        };
        batch.set(docRef, newRecord);
        savedRecords.push(newRecord);
      }

      await batch.commit();
      return savedRecords;
    } catch (error) {
      console.error('Error saving date attendance to Firestore:', error);
      throw error;
    }
  },

  // Seed default attendance records
  async seedInitialAttendance(): Promise<void> {
    try {
      const snapshot = await getDocs(collection(db, ATTENDANCE_COLLECTION));
      if (snapshot.empty) {
        const batch = writeBatch(db);
        for (const item of INITIAL_ATTENDANCE) {
          const docRef = doc(db, ATTENDANCE_COLLECTION, item.id);
          batch.set(docRef, item);
        }
        await batch.commit();
      }
    } catch (error) {
      console.warn('Error seeding attendance:', error);
    }
  },
};
