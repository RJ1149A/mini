import { User } from 'firebase/auth';
import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

const HEARTBEAT_INTERVAL = 30000; // 30 seconds

export const setupPresence = (user: User) => {
  if (!user) return () => {};

  const userStatusRef = doc(db, 'userStatus', user.uid);
  
  // Set user as online initially
  setDoc(userStatusRef, {
    isOnline: true,
    lastSeen: serverTimestamp(),
  }, { merge: true }).catch(error => {
    console.error('Error setting user status:', error);
  });

  // Set up heartbeat to keep user online
  const heartbeatInterval = setInterval(() => {
    updateDoc(userStatusRef, {
      isOnline: true,
      lastSeen: serverTimestamp(),
    }).catch(error => {
      console.error('Error updating user status:', error);
    });
  }, HEARTBEAT_INTERVAL);

  // Set user as offline when page unloads
  const handleBeforeUnload = () => {
    updateDoc(userStatusRef, {
      isOnline: false,
      lastSeen: serverTimestamp(),
    }).catch(() => {
      // Ignore errors on unload
    });
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  
  // Return cleanup function
  return () => {
    clearInterval(heartbeatInterval);
    window.removeEventListener('beforeunload', handleBeforeUnload);
    // Set offline on cleanup
    updateDoc(userStatusRef, {
      isOnline: false,
      lastSeen: serverTimestamp(),
    }).catch(() => {
      // Ignore errors
    });
  };
};
