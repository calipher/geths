import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  sermons as initialSermons, 
  upcomingEvents as initialEvents, 
  timetable as initialTimetable, 
  announcements as initialAnnouncements, 
  testimonies as initialTestimonies, 
  prayerRequests as initialPrayerRequests, 
  galleryImages as initialGalleryImages, 
  cellGroups as initialCellGroups,
  appSettings as initialAppSettings
} from './data';
import { collection, onSnapshot, addDoc, deleteDoc, doc, setDoc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';

type AppData = {
  sermons: typeof initialSermons;
  upcomingEvents: typeof initialEvents;
  timetable: typeof initialTimetable;
  announcements: typeof initialAnnouncements;
  testimonies: typeof initialTestimonies;
  prayerRequests: typeof initialPrayerRequests;
  galleryImages: typeof initialGalleryImages;
  cellGroups: typeof initialCellGroups;
  appSettings: typeof initialAppSettings;
};

const defaultData: AppData = {
  sermons: initialSermons,
  upcomingEvents: initialEvents,
  timetable: initialTimetable,
  announcements: initialAnnouncements,
  testimonies: initialTestimonies,
  prayerRequests: initialPrayerRequests,
  galleryImages: initialGalleryImages,
  cellGroups: initialCellGroups,
  appSettings: initialAppSettings,
};

type AppDataContextType = {
  data: AppData;
  loading: boolean;
  addData: (key: keyof AppData, value: any) => Promise<void>;
  deleteData: (key: keyof AppData, id: string | number) => Promise<void>;
  updateData: (key: keyof AppData, id: string | number, value: any) => Promise<void>;
};

const getFilteredInitial = (key: string, initialArr: any[]) => {
  try {
    const deletedStr = localStorage.getItem('deleted_' + key);
    if (!deletedStr) return initialArr;
    const deletedIds = JSON.parse(deletedStr);
    return initialArr.filter(item => !deletedIds.includes(item.id));
  } catch(e) {
    return initialArr;
  }
};

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(defaultData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubSermons = onSnapshot(collection(db, 'sermons'), (snapshot) => {
      const parsed = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      parsed.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      const filteredInitial = getFilteredInitial('sermons', initialSermons);
      setData(prev => ({ ...prev, sermons: parsed.length > 0 ? [...parsed, ...filteredInitial] : filteredInitial }));
    }, (error) => handleFirestoreError(error, OperationType.GET, 'sermons'));

    const unsubEvents = onSnapshot(collection(db, 'upcomingEvents'), (snapshot) => {
      const parsed = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      parsed.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      const filteredInitial = getFilteredInitial('upcomingEvents', initialEvents);
      setData(prev => ({ ...prev, upcomingEvents: parsed.length > 0 ? [...parsed, ...filteredInitial] : filteredInitial }));
    }, (error) => handleFirestoreError(error, OperationType.GET, 'upcomingEvents'));

    const unsubTimetable = onSnapshot(collection(db, 'timetable'), (snapshot) => {
      const parsed = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      parsed.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      const filteredInitial = getFilteredInitial('timetable', initialTimetable);
      setData(prev => ({ ...prev, timetable: parsed.length > 0 ? [...parsed, ...filteredInitial] : filteredInitial }));
    }, (error) => handleFirestoreError(error, OperationType.GET, 'timetable'));

    const unsubAnnouncements = onSnapshot(collection(db, 'announcements'), (snapshot) => {
      const now = Date.now();
      const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
      const parsed = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      const validAnnouncements = parsed.filter(ann => {
        let ts = ann.createdAt;
        if (!ts && ann.date) {
           ts = Date.parse(ann.date);
           if (isNaN(ts)) ts = now;
        }
        return ts ? (now - ts) <= SEVEN_DAYS : true;
      });
      validAnnouncements.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      const filteredInitial = getFilteredInitial('announcements', initialAnnouncements);
      setData(prev => ({ ...prev, announcements: validAnnouncements.length > 0 ? [...validAnnouncements, ...filteredInitial] : filteredInitial }));
    }, (error) => handleFirestoreError(error, OperationType.GET, 'announcements'));

    const unsubTestimonies = onSnapshot(collection(db, 'testimonies'), (snapshot) => {
      const parsed = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      parsed.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      const filteredInitial = getFilteredInitial('testimonies', initialTestimonies);
      setData(prev => ({ ...prev, testimonies: parsed.length > 0 ? [...parsed, ...filteredInitial] : filteredInitial }));
    }, (error) => handleFirestoreError(error, OperationType.GET, 'testimonies'));

    const unsubPrayerRequests = onSnapshot(collection(db, 'prayerRequests'), (snapshot) => {
      const parsed = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      parsed.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      const filteredInitial = getFilteredInitial('prayerRequests', initialPrayerRequests);
      setData(prev => ({ ...prev, prayerRequests: parsed.length > 0 ? [...parsed, ...filteredInitial] : filteredInitial }));
    }, (error) => handleFirestoreError(error, OperationType.GET, 'prayerRequests'));

    const unsubGalleryImages = onSnapshot(collection(db, 'galleryImages'), (snapshot) => {
      const parsed = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      parsed.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      const filteredInitial = getFilteredInitial('galleryImages', initialGalleryImages);
      setData(prev => ({ ...prev, galleryImages: parsed.length > 0 ? [...parsed, ...filteredInitial] : filteredInitial }));
    }, (error) => handleFirestoreError(error, OperationType.GET, 'galleryImages'));

    const unsubCellGroups = onSnapshot(collection(db, 'cellGroups'), (snapshot) => {
      const parsed = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      parsed.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      const filteredInitial = getFilteredInitial('cellGroups', initialCellGroups);
      setData(prev => ({ ...prev, cellGroups: parsed.length > 0 ? [...parsed, ...filteredInitial] : filteredInitial }));
    }, (error) => handleFirestoreError(error, OperationType.GET, 'cellGroups'));

    const unsubAppSettings = onSnapshot(collection(db, 'appSettings'), (snapshot) => {
      const parsed = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      parsed.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      const filteredInitial = getFilteredInitial('appSettings', initialAppSettings);
      setData(prev => ({ ...prev, appSettings: parsed.length > 0 ? parsed : filteredInitial }));
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'appSettings'));

    return () => {
      unsubSermons();
      unsubEvents();
      unsubTimetable();
      unsubAnnouncements();
      unsubTestimonies();
      unsubPrayerRequests();
      unsubGalleryImages();
      unsubCellGroups();
      unsubAppSettings();
    }
  }, []);

  const addData = async (key: keyof AppData, value: any) => {
    try {
      await addDoc(collection(db, key), { ...value, isPublic: true, createdAt: Date.now() });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, key);
    }
  };

  const deleteData = async (key: keyof AppData, id: string | number) => {
    try {
      if (typeof id === 'number') {
         const keyStr = 'deleted_' + key;
         const existing = localStorage.getItem(keyStr);
         const arr = existing ? JSON.parse(existing) : [];
         if (!arr.includes(id)) {
            arr.push(id);
            localStorage.setItem(keyStr, JSON.stringify(arr));
         }
         setData(prev => ({ ...prev, [key]: prev[key].filter((item: any) => item.id !== id) }));
      } else {
         await deleteDoc(doc(db, key, String(id)));
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, key);
    }
  };

  const updateData = async (key: keyof AppData, id: string | number, value: any) => {
    try {
      if (typeof id === 'number') {
         await addDoc(collection(db, key), { ...value, isPublic: true, createdAt: Date.now() });
         const keyStr = 'deleted_' + key;
         const existing = localStorage.getItem(keyStr);
         const arr = existing ? JSON.parse(existing) : [];
         if (!arr.includes(id)) {
            arr.push(id);
            localStorage.setItem(keyStr, JSON.stringify(arr));
         }
         setData(prev => ({ ...prev, [key]: prev[key].filter((item: any) => item.id !== id) }));
      } else {
         const docRef = doc(db, key, String(id));
         await updateDoc(docRef, { ...value, updatedAt: Date.now() });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, key);
    }
  };

  return (
    <AppDataContext.Provider value={{ data, loading, addData, deleteData, updateData }}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
}
