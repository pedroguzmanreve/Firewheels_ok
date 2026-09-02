import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';
import { Plan } from '../types';
import { INITIAL_PLANS } from '../data/initialData';

const PLANS_COLLECTION = 'plans';

export const PlansService = {
  // Get all active plans
  async getPlans(): Promise<Plan[]> {
    try {
      const q = query(collection(db, PLANS_COLLECTION), orderBy('weekly_classes', 'asc'));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs.map((docSnap) => ({
          ...(docSnap.data() as Omit<Plan, 'id'>),
          id: docSnap.id,
        }));
      }
      return INITIAL_PLANS;
    } catch (error) {
      console.warn('Error fetching plans from Firestore, using initial plans:', error);
      return INITIAL_PLANS;
    }
  },

  // Add a new plan
  async addPlan(planData: Omit<Plan, 'id' | 'created_at'>): Promise<Plan> {
    try {
      const newDocRef = doc(collection(db, PLANS_COLLECTION));
      const newPlan: Plan = {
        ...planData,
        id: newDocRef.id,
        created_at: new Date().toISOString(),
      };
      await setDoc(newDocRef, newPlan);
      return newPlan;
    } catch (error) {
      console.error('Error adding plan to Firestore:', error);
      throw error;
    }
  },

  // Update existing plan
  async updatePlan(plan: Plan): Promise<void> {
    try {
      const docRef = doc(db, PLANS_COLLECTION, plan.id);
      await updateDoc(docRef, {
        name: plan.name,
        weekly_classes: plan.weekly_classes,
        price: plan.price,
      });
    } catch (error) {
      console.error('Error updating plan in Firestore:', error);
      throw error;
    }
  },

  // Delete a plan
  async deletePlan(planId: string): Promise<void> {
    try {
      const docRef = doc(db, PLANS_COLLECTION, planId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting plan from Firestore:', error);
      throw error;
    }
  },

  // Seed default plans if collection is empty
  async seedInitialPlans(): Promise<void> {
    try {
      const snapshot = await getDocs(collection(db, PLANS_COLLECTION));
      if (snapshot.empty) {
        for (const plan of INITIAL_PLANS) {
          const docRef = doc(db, PLANS_COLLECTION, plan.id);
          await setDoc(docRef, plan);
        }
      }
    } catch (error) {
      console.warn('Error seeding plans:', error);
    }
  },
};
