import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { 
  getFirestore, collection, addDoc, query, where, orderBy, onSnapshot, 
  limit, serverTimestamp, doc, updateDoc, deleteDoc, Firestore,
  initializeFirestore, persistentLocalCache, persistentMultipleTabManager
} from "firebase/firestore";
import { getAuth, signInAnonymously, User, Auth } from "firebase/auth";
import { ArtWork } from "../types";

// --- CONFIGURATION LOADER ---
const getFirebaseConfig = () => {
  // 1. Try AI Studio / Hosting injected config
  if (typeof window !== 'undefined' && (window as any).__firebase_config) {
    return JSON.parse((window as any).__firebase_config);
  }

  // 2. Try Vite Environment Variables
  // Note: Do NOT use process.env in Vite
  const viteEnv = import.meta.env;
  if (viteEnv && viteEnv.VITE_FIREBASE_API_KEY) {
    return {
      apiKey: viteEnv.VITE_FIREBASE_API_KEY,
      authDomain: viteEnv.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: viteEnv.VITE_FIREBASE_PROJECT_ID,
      storageBucket: viteEnv.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: viteEnv.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: viteEnv.VITE_FIREBASE_APP_ID
    };
  }

  return null;
};

// --- INITIALIZATION ---
let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let auth: Auth | undefined;
let isFirebaseInitialized = false;
let initError: string | null = null;

try {
  const firebaseConfig = getFirebaseConfig();

  if (firebaseConfig && firebaseConfig.apiKey && firebaseConfig.apiKey !== "AIzaSy...") {
    // Avoid double initialization
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }

    // Initialize Firestore with New Persistence Settings (SDK v11+)
    // Replaces deprecated enableIndexedDbPersistence
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    });

    auth = getAuth(app);
    isFirebaseInitialized = true;
    console.log("Firebase initialized successfully");
  } else {
    initError = "Missing or Invalid Firebase Configuration";
    console.warn("Firebase Config Warning: No valid configuration found. Gallery features will be disabled.");
  }
} catch (e: any) {
  initError = e.message;
  console.error("Firebase Initialization Error:", e);
}

// Export status helper
export const checkFirebaseStatus = () => {
  if (!isFirebaseInitialized) {
    return { 
      ready: false, 
      error: initError || "Firebase API Key is missing. Check VITE_FIREBASE_API_KEY." 
    };
  }
  return { ready: true, error: null };
};

// --- AUTH ---
export const signInUser = async (): Promise<User | null> => {
  if (!auth) {
    console.error("Auth is not initialized");
    return null;
  }
  try {
    if (auth.currentUser) return auth.currentUser;
    const userCredential = await signInAnonymously(auth);
    return userCredential.user;
  } catch (error: any) {
    console.error("Auth Error details:", error);
    if (error.code === 'auth/api-key-not-valid') {
       throw new Error("API Key Firebase không hợp lệ. Vui lòng kiểm tra biến môi trường VITE_FIREBASE_API_KEY.");
    }
    throw error;
  }
};

export const getCurrentUser = (): User | null => {
  return auth?.currentUser || null;
};

// --- FIRESTORE OPERATIONS ---

// Data structure for saving (Schema V2)
export interface ArtworkDTO {
  imagePreviewBase64: string; 
  promptTextEN: string;
  promptTextVN: string;
  style: string;
  lessonName: string;
  topicName: string;
  grade: number;
  userId: string;
  authorName: string;
  visibility: 'public' | 'private';
  savedFrom: 'generator';
}

export const saveArtwork = async (data: ArtworkDTO) => {
  if (!db || !isFirebaseInitialized) {
    throw new Error(initError || "Firebase chưa được cấu hình.");
  }
  try {
    const docRef = await addDoc(collection(db, "artworks"), {
      ...data,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Save Artwork Error:", error);
    throw error;
  }
};

export const deleteArtwork = async (artworkId: string) => {
  if (!db) return false;
  try {
    await deleteDoc(doc(db, "artworks", artworkId));
    return true;
  } catch (error) {
    console.error("Delete Artwork Error:", error);
    return false;
  }
};

export const toggleArtworkVisibility = async (artworkId: string, currentStatus: 'public' | 'private') => {
  if (!db) throw new Error("Database not connected");
  try {
    const newStatus = currentStatus === 'public' ? 'private' : 'public';
    const artworkRef = doc(db, "artworks", artworkId);
    await updateDoc(artworkRef, {
      visibility: newStatus
    });
    return newStatus;
  } catch (error) {
    console.error("Toggle Visibility Error:", error);
    throw error;
  }
};

export const subscribeToGallery = (
  filterType: 'community' | 'mine',
  userId: string | null,
  filters: { grade?: number | null, lesson?: string | null, style?: string | null, search?: string } = {},
  callback: (data: ArtWork[]) => void
) => {
  // Graceful fallback if DB is not ready
  if (!db) {
    callback([]);
    return () => {};
  }

  const collectionRef = collection(db, "artworks");
  const constraints = [];

  // 1. Filter by Owner/Public
  if (filterType === 'mine' && userId) {
    constraints.push(where("userId", "==", userId));
  } else {
    constraints.push(where("visibility", "==", "public"));
  }

  // 2. Order by Date
  constraints.push(orderBy("createdAt", "desc"));
  constraints.push(limit(50));

  const q = query(collectionRef, ...constraints);
  
  return onSnapshot(q, (snapshot) => {
    let items: ArtWork[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      items.push({
        id: doc.id,
        imagePreviewBase64: data.imagePreviewBase64 || data.imageBase64 || '',
        promptTextEN: data.promptTextEN || data.prompt || '',
        promptTextVN: data.promptTextVN || '',
        lessonName: data.lessonName,
        topicName: data.topicName,
        grade: data.grade,
        style: data.style,
        createdAt: data.createdAt?.toMillis() || Date.now(),
        userId: data.userId,
        authorName: data.authorName,
        visibility: data.visibility
      });
    });

    // Client-side filtering
    if (filters.grade) items = items.filter(i => i.grade === filters.grade);
    if (filters.lesson) items = items.filter(i => i.lessonName === filters.lesson);
    if (filters.style) items = items.filter(i => i.style === filters.style);
    
    if (filters.search) {
      const s = filters.search.toLowerCase();
      items = items.filter(i => 
        (i.lessonName || '').toLowerCase().includes(s) || 
        (i.promptTextEN || '').toLowerCase().includes(s) ||
        (i.promptTextVN || '').toLowerCase().includes(s)
      );
    }

    callback(items);
  }, (error) => {
    console.error("Gallery Subscription Error:", error);
    // Don't crash UI, just return empty
    callback([]);
  });
};