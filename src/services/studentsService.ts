import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit as firestoreLimit,
} from 'firebase/firestore';
import { db } from './firebase';
import { Student } from '../types';
import { INITIAL_STUDENTS } from '../data/initialData';

const STUDENTS_COLLECTION = 'students';

export const StudentsService = {
  // Get all students (optionally limited)
  async getStudents(maxResults?: number): Promise<Student[]> {
    try {
      const q = maxResults
        ? query(collection(db, STUDENTS_COLLECTION), orderBy('created_at', 'desc'), firestoreLimit(maxResults))
        : query(collection(db, STUDENTS_COLLECTION), orderBy('created_at', 'desc'));

      const snapshot = await getDocs(q);
      return snapshot.docs.map((docSnap) => ({
        ...(docSnap.data() as Omit<Student, 'id'>),
        id: docSnap.id,
      }));
    } catch (error) {
      console.error('Error fetching students from Firestore:', error);
      return [];
    }
  },

  // Get a single student by ID (lazy full detail)
  async getStudentById(studentId: string): Promise<Student | null> {
    try {
      const docRef = doc(db, STUDENTS_COLLECTION, studentId);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return {
          ...(snapshot.data() as Omit<Student, 'id'>),
          id: snapshot.id,
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching student by ID:', error);
      return null;
    }
  },

  // Add a new student
  async addStudent(studentData: Omit<Student, 'id' | 'created_at'>): Promise<Student> {
    try {
      const newDocRef = doc(collection(db, STUDENTS_COLLECTION));
      const newStudent: Student = {
        ...studentData,
        id: newDocRef.id,
        created_at: new Date().toISOString(),
      };
      
      const cleanStudent = Object.fromEntries(
        Object.entries(newStudent).filter(([_, v]) => v !== undefined)
      ) as Student;

      await setDoc(newDocRef, cleanStudent);
      return newStudent;
    } catch (error) {
      console.error('Error adding student to Firestore:', error);
      throw error;
    }
  },

  // Update an existing student
  async updateStudent(student: Student): Promise<void> {
    try {
      const docRef = doc(db, STUDENTS_COLLECTION, student.id);
      const { id, ...dataToUpdate } = student;
      
      const cleanData = Object.fromEntries(
        Object.entries(dataToUpdate).filter(([_, v]) => v !== undefined)
      );

      await updateDoc(docRef, cleanData);
    } catch (error) {
      console.error('Error updating student in Firestore:', error);
      throw error;
    }
  },

  // Delete a student
  async deleteStudent(studentId: string): Promise<void> {
    try {
      const docRef = doc(db, STUDENTS_COLLECTION, studentId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting student from Firestore:', error);
      throw error;
    }
  },

  // Seed default students if collection is empty
  async seedInitialStudents(): Promise<void> {
    try {
      const snapshot = await getDocs(collection(db, STUDENTS_COLLECTION));
      if (snapshot.empty) {
        for (const student of INITIAL_STUDENTS) {
          const docRef = doc(db, STUDENTS_COLLECTION, student.id);
          await setDoc(docRef, student);
        }
      }
    } catch (error) {
      console.warn('Error seeding students:', error);
    }
  },
};
