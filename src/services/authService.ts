import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from './firebase';

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export const AuthService = {
  // Subscribe to auth state changes
  onAuthChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  },

  // Get current logged-in user
  getCurrentUser(): User | null {
    return auth.currentUser;
  },

  // Sign in with Google
  async loginWithGoogle(): Promise<User> {
    const cred = await signInWithPopup(auth, googleProvider);
    return cred.user;
  },

  // Sign in with Email and Password
  async loginWithEmail(email: string, pass: string): Promise<User> {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    return cred.user;
  },

  // Register admin user
  async registerAdmin(email: string, pass: string): Promise<User> {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    return cred.user;
  },

  // Sign out
  async logout(): Promise<void> {
    await signOut(auth);
  },
};

