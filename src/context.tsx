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
import { collection, onSnapshot, addDoc, deleteDoc, doc, setDoc, updateDoc, getDocs, query, orderBy } from 'firebase/firestore';
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

const processSnapshot = (snapshot: any, initialArr: any[]) => {
  const allDocs = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
  const deletedIds = allDocs.filter((d: any) => d._deletedInitial).map((d: any) => d.originalId);
  const parsed = allDocs.filter((d: any) => !d._deletedInitial);
  const filteredInitial = initialArr.filter(item => !deletedIds.includes(item.id));
  return { parsed, filteredInitial };
};

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(defaultData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubSermons = onSnapshot(collection(db, 'sermons'), (snapshot) => {
      const { parsed, filteredInitial } = processSnapshot(snapshot, initialSermons);
      parsed.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
      setData(prev => ({ ...prev, sermons: parsed.length > 0 ? [...parsed, ...filteredInitial] : filteredInitial }));
    }, (error) => handleFirestoreError(error, OperationType.GET, 'sermons'));

    const unsubEvents = onSnapshot(collection(db, 'upcomingEvents'), (snapshot) => {
      const { parsed, filteredInitial } = processSnapshot(snapshot, initialEvents);
      parsed.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
      setData(prev => ({ ...prev, upcomingEvents: parsed.length > 0 ? [...parsed, ...filteredInitial] : filteredInitial }));
    }, (error) => handleFirestoreError(error, OperationType.GET, 'upcomingEvents'));

    const unsubTimetable = onSnapshot(collection(db, 'timetable'), (snapshot) => {
      const { parsed, filteredInitial } = processSnapshot(snapshot, initialTimetable);
      parsed.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
      setData(prev => ({ ...prev, timetable: parsed.length > 0 ? [...parsed, ...filteredInitial] : filteredInitial }));
    }, (error) => handleFirestoreError(error, OperationType.GET, 'timetable'));

    const unsubAnnouncements = onSnapshot(collection(db, 'announcements'), (snapshot) => {
      const now = Date.now();
      const NINETY_DAYS = 90 * 24 * 60 * 60 * 1000;
      const { parsed, filteredInitial } = processSnapshot(snapshot, initialAnnouncements);
      const validAnnouncements = parsed.filter((ann: any) => {
        let ts = ann.createdAt;
        if (!ts && ann.date) {
           ts = Date.parse(ann.date);
           if (isNaN(ts)) ts = now;
        }
        return ts ? (now - ts) <= NINETY_DAYS : true;
      });
      validAnnouncements.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
      setData(prev => ({ ...prev, announcements: validAnnouncements.length > 0 ? [...validAnnouncements, ...filteredInitial] : filteredInitial }));
    }, (error) => handleFirestoreError(error, OperationType.GET, 'announcements'));

    const unsubTestimonies = onSnapshot(collection(db, 'testimonies'), (snapshot) => {
      const { parsed, filteredInitial } = processSnapshot(snapshot, initialTestimonies);
      parsed.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
      setData(prev => ({ ...prev, testimonies: parsed.length > 0 ? [...parsed, ...filteredInitial] : filteredInitial }));
    }, (error) => handleFirestoreError(error, OperationType.GET, 'testimonies'));

    const unsubPrayerRequests = onSnapshot(collection(db, 'prayerRequests'), (snapshot) => {
      const { parsed, filteredInitial } = processSnapshot(snapshot, initialPrayerRequests);
      parsed.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
      setData(prev => ({ ...prev, prayerRequests: parsed.length > 0 ? [...parsed, ...filteredInitial] : filteredInitial }));
    }, (error) => handleFirestoreError(error, OperationType.GET, 'prayerRequests'));

    const unsubGalleryImages = onSnapshot(collection(db, 'galleryImages'), (snapshot) => {
      const { parsed, filteredInitial } = processSnapshot(snapshot, initialGalleryImages);
      parsed.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
      setData(prev => ({ ...prev, galleryImages: parsed.length > 0 ? [...parsed, ...filteredInitial] : filteredInitial }));
    }, (error) => handleFirestoreError(error, OperationType.GET, 'galleryImages'));

    const unsubCellGroups = onSnapshot(collection(db, 'cellGroups'), (snapshot) => {
      const { parsed, filteredInitial } = processSnapshot(snapshot, initialCellGroups);
      parsed.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
      setData(prev => ({ ...prev, cellGroups: parsed.length > 0 ? [...parsed, ...filteredInitial] : filteredInitial }));
    }, (error) => handleFirestoreError(error, OperationType.GET, 'cellGroups'));

    const unsubAppSettings = onSnapshot(collection(db, 'appSettings'), (snapshot) => {
      const { parsed, filteredInitial } = processSnapshot(snapshot, initialAppSettings);
      parsed.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
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

      if (key === 'announcements' || key === 'sermons') {
         const tokensSnapshot = await getDocs(collection(db, 'fcmTokens'));
         const tokens = tokensSnapshot.docs.map(d => d.id);
         if (tokens.length > 0) {
            const title = key === 'announcements' ? 'New Announcement' : 'New Sermon Posted';
            const body = value.title || 'Check out our latest update!';
            fetch('/api/notify', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ title, body, tokens })
            }).catch(console.error);
         }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, key);
    }
  };

  const deleteData = async (key: keyof AppData, id: string | number) => {
    try {
      if (typeof id === 'number') {
         await setDoc(doc(db, key, `deleted_${id}`), { _deletedInitial: true, originalId: id });
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
         await setDoc(doc(db, key, `deleted_${id}`), { _deletedInitial: true, originalId: id });
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
