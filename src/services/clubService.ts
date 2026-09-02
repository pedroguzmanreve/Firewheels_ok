import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { ClubInfo } from '../types';
import { INITIAL_CLUB_INFO } from '../data/initialData';

const CLUB_CONFIG_DOC = 'main';

export const ClubService = {
  // Get club info from Firestore or return fallback
  async getClubInfo(): Promise<ClubInfo> {
    try {
      const docRef = doc(db, 'club_config', CLUB_CONFIG_DOC);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return snapshot.data() as ClubInfo;
      }
      return INITIAL_CLUB_INFO;
    } catch (error) {
      console.warn('Error fetching club info from Firestore, using initial info:', error);
      return INITIAL_CLUB_INFO;
    }
  },

  // Save/Update club info
  async saveClubInfo(info: ClubInfo): Promise<void> {
    try {
      const docRef = doc(db, 'club_config', CLUB_CONFIG_DOC);
      await setDoc(docRef, info, { merge: true });
    } catch (error) {
      console.error('Error saving club info to Firestore:', error);
      throw error;
    }
  },
};
