import React, { useState, useEffect } from "react";
import { Megaphone, Quote, Edit3, Settings, Lock, X, Plus, Trash2, Calendar as CalendarIcon, PlayCircle, Image as ImageIcon, Users } from "lucide-react";
import { useAppData } from "./context";
import { TabContext } from "./types";
import { auth, storage } from "./firebase";
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { ref, uploadBytes, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { toast } from 'sonner';

export function PortalView({ setActiveTab }: { setActiveTab: (tab: TabContext) => void }) {
  const { data, addData, deleteData, updateData, loading } = useAppData();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');
  const [activeSection, setActiveSection] = useState<'announcements' | 'sermons' | 'events' | 'galleryImages' | 'cellGroups' | 'appSettings'>('events');

  const [aiPrompt, setAiPrompt] = useState("");
  const [isSchedulingAI, setIsSchedulingAI] = useState(false);

  const handleAISchedule = async () => {
    if (!aiPrompt.trim()) return;
    setIsSchedulingAI(true);
    try {
      const res = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      if (!res.ok) throw new Error("Failed to auto-schedule");
      const { events } = await res.json();
      for (const ev of events) {
        await handleAddData('upcomingEvents', ev);
      }
      setAiPrompt("");
      toast.success("Events successfully added from AI Auto-Scheduling!");
    } catch (e: any) {
      toast.error("Error generating schedule setup: " + e.message);
    } finally {
      setIsSchedulingAI(false);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });
    return unsub;
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setAuthError('');
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleAddData = async (section: 'announcements' | 'sermons' | 'upcomingEvents' | 'galleryImages' | 'cellGroups' | 'appSettings', newItem: any) => {
    let itemToSave = { ...newItem };
    
    // Handle generic file uploads (audioUrl or url for images)
    if (itemToSave.audioUrl instanceof File || itemToSave.url instanceof File) {
      setUploading(true);
      setUploadProgress(0);
      try {
        const isAudio = itemToSave.audioUrl instanceof File;
        const fileToUpload = isAudio ? itemToSave.audioUrl : itemToSave.url;
        const folderPath = isAudio ? 'sermons' : 'gallery';
        const fileRef = ref(storage, `${folderPath}/${Date.now()}_${fileToUpload.name}`);
        
        let url;
        if (fileToUpload.size < 10 * 1024 * 1024) {
          setUploadProgress(45);
          const snapshot = await uploadBytes(fileRef, fileToUpload);
          setUploadProgress(90);
          url = await getDownloadURL(snapshot.ref);
          setUploadProgress(100);
        } else {
          const uploadTask = uploadBytesResumable(fileRef, fileToUpload);
          
          url = await new Promise((resolve, reject) => {
            uploadTask.on('state_changed',
              (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgress(progress);
              },
              (error) => {
                console.error(error);
                reject(error);
              },
              async () => {
                 try {
                   const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                   resolve(downloadURL as unknown as string);
                 } catch (e) { reject(e); }
              }
            );
          });
        }
        
        if (isAudio) {
          itemToSave.audioUrl = url;
        } else {
          itemToSave.url = url;
        }
      } catch (e: any) {
        console.error("Upload failed", e);
        toast.error("File upload failed: " + (e.message || "Permission denied"));
        setUploading(false);
        setUploadProgress(0);
        return;
      }
      setUploading(false);
      setUploadProgress(0);
    }
    await addData(section, itemToSave);
  };

  const handleUpdateData = async (section: 'announcements' | 'sermons' | 'upcomingEvents' | 'galleryImages' | 'cellGroups' | 'appSettings', id: number | string, updatedItem: any) => {
    let itemToSave = { ...updatedItem };
    
    if (itemToSave.audioUrl instanceof File || itemToSave.url instanceof File) {
      setUploading(true);
      setUploadProgress(0);
      try {
        const isAudio = itemToSave.audioUrl instanceof File;
        const fileToUpload = isAudio ? itemToSave.audioUrl : itemToSave.url;
        const folderPath = isAudio ? 'sermons' : 'gallery';
        const fileRef = ref(storage, `${folderPath}/${Date.now()}_${fileToUpload.name}`);
        
        let url;
        if (fileToUpload.size < 10 * 1024 * 1024) {
          setUploadProgress(45);
          const snapshot = await uploadBytes(fileRef, fileToUpload);
          setUploadProgress(90);
          url = await getDownloadURL(snapshot.ref);
          setUploadProgress(100);
        } else {
          const uploadTask = uploadBytesResumable(fileRef, fileToUpload);
          
          url = await new Promise((resolve, reject) => {
            uploadTask.on('state_changed',
              (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgress(progress);
              },
              (error) => {
                console.error(error);
                reject(error);
              },
              async () => {
                 try {
                   const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                   resolve(downloadURL as unknown as string);
                 } catch (e) { reject(e); }
              }
            );
          });
        }
        
        if (isAudio) {
          itemToSave.audioUrl = url;
        } else {
          itemToSave.url = url;
        }
      } catch (e: any) {
        console.error("Upload failed", e);
        toast.error("File upload failed: " + (e.message || "Permission denied"));
        setUploading(false);
        setUploadProgress(0);
        return;
      }
      setUploading(false);
      setUploadProgress(0);
    }
    await updateData(section, id, itemToSave);
  };

  const handleDeleteData = async (section: 'announcements' | 'sermons' | 'upcomingEvents' | 'galleryImages' | 'cellGroups' | 'appSettings', id: number | string) => {
    await deleteData(section, id);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 items-center justify-center p-5">
        <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 w-full max-w-md flex flex-col gap-6 text-center">
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm border border-blue-100">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h2 className="font-extrabold text-3xl text-gray-900 tracking-tight">Admin Gateway</h2>
            <p className="text-gray-500 font-medium text-sm mt-2">Sign in with your admin Google account to manage church content.</p>
          </div>
          <div className="flex flex-col gap-4 mt-4 text-left">
            <button onClick={handleLogin} className="w-full bg-blue-800 text-white font-extrabold rounded-2xl py-4 hover:bg-blue-900 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-3">
              <svg className="w-5 h-5 bg-white rounded-full p-0.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Sign in with Google
            </button>
            {authError && <p className="text-red-500 text-xs font-bold mt-1 text-center">{authError}</p>}
          </div>
          <button onClick={() => setActiveTab('home')} className="mt-4 text-xs font-bold text-gray-500 uppercase tracking-widest hover:text-gray-900 transition-colors">
            Return to App
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-blue-950 text-blue-200 flex flex-col shadow-xl z-20">
        <div className="p-6 flex items-center gap-3 text-white font-extrabold text-xl tracking-tight border-b border-blue-900/50">
          <Settings className="w-6 h-6 text-blue-400" />
          Web Portal
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-2">
          <div className="text-xs font-bold text-blue-400 uppercase tracking-widest px-3 mb-2">Content Modules</div>
          
          {[
            { id: 'announcements', label: 'Announcements', icon: <Megaphone className="w-5 h-5" /> },
            { id: 'sermons', label: 'Sermons', icon: <PlayCircle className="w-5 h-5" /> },
            { id: 'events', label: 'Events & Schedule', icon: <CalendarIcon className="w-5 h-5" /> },
            { id: 'galleryImages', label: 'Gallery', icon: <ImageIcon className="w-5 h-5" /> },
            { id: 'cellGroups', label: 'Cell Groups', icon: <Users className="w-5 h-5" /> },
            { id: 'appSettings', label: 'App Updates', icon: <Settings className="w-5 h-5" /> }
          ].map((nav) => (
             <button 
               key={nav.id}
               onClick={() => setActiveSection(nav.id as any)} 
               className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-colors w-full text-left ${activeSection === nav.id ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-blue-900/50 hover:text-white'}`}
             >
               {nav.icon}
               {nav.label}
             </button>
          ))}
        </div>

        <div className="p-4 border-t border-blue-900/50 flex flex-col gap-2">
          <button onClick={() => setActiveTab('home')} className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-bold text-sm bg-blue-900 text-white hover:bg-blue-800 transition-colors">
            Exit to Mobile App
          </button>
          <button onClick={handleLogout} className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-bold text-sm text-blue-300 hover:bg-blue-900/50 transition-colors">
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50 flex justify-center">
        <div className="p-8 w-full max-w-5xl flex flex-col gap-6">
          <header className="mb-4">
             <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight capitalize">{activeSection.replace(/([A-Z])/g, ' $1').trim()}</h1>
             <p className="text-gray-500 font-medium mt-1">Manage and update data securely on Firebase.</p>
          </header>
          
          {activeSection === 'announcements' && (
           <SectionManager
             title="Announcements"
             items={data.announcements}
             onAdd={(item) => handleAddData('announcements', item)}
             onUpdate={(id, item) => handleUpdateData('announcements', id, item)}
             onDelete={(id) => handleDeleteData('announcements', id)}
             fields={[
               { name: 'title', label: 'Title' },
               { name: 'message', label: 'Message', isTextArea: true },
               { name: 'date', label: 'Date', type: 'date' },
             ]}
             renderItem={(item) => (
                <div>
                   <h4 className="font-bold text-[14px] text-gray-900">{item.title}</h4>
                   <p className="text-[12px] text-gray-600 line-clamp-1">{item.message}</p>
                   <p className="text-[10px] font-bold text-emerald-600 mt-1">{item.date}</p>
                </div>
             )}
             icon={<Megaphone className="w-5 h-5" />}
             colorClass="emerald"
           />
        )}

        {activeSection === 'sermons' && (
           <SectionManager
             title="Sermons"
             items={data.sermons}
             onAdd={(item: any) => handleAddData('sermons', item)}
             onUpdate={(id: any, item: any) => handleUpdateData('sermons', id, item)}
             onDelete={(id: string | number) => handleDeleteData('sermons', id)}
             uploadProgress={uploadProgress}
             fields={[
               { name: 'title', label: 'Sermon Title' },
               { name: 'speaker', label: 'Speaker' },
               { name: 'scripture', label: 'Scripture Reference (e.g. John 3:16)' },
               { name: 'summary', label: 'Theme / Summary', isTextArea: true },
               { name: 'duration', label: 'Duration (e.g. 45 mins)' },
               { name: 'date', label: 'Date', type: 'date' },
               { name: 'audioUrl', label: 'Audio File or Link', type: 'file_or_text', accept: 'audio/*' }
             ]}
             renderItem={(item) => (
                <div>
                   <h4 className="font-bold text-[14px] text-gray-900">{item.title}</h4>
                   <p className="text-[12px] text-gray-600">{item.speaker} • {item.duration}</p>
                   <p className="text-[10px] font-bold text-blue-600 mt-1">{item.date}</p>
                </div>
             )}
             icon={<PlayCircle className="w-5 h-5" />}
             colorClass="blue"
           />
        )}

        {activeSection === 'events' && (
           <div className="flex flex-col gap-6">
             <div className="bg-white rounded-3xl p-5 shadow-sm border border-purple-100 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                     <CalendarIcon className="w-5 h-5" />
                   </div>
                   <h3 className="font-bold text-gray-900 text-[16px]">AI Auto-Scheduler</h3>
                </div>
                <p className="text-gray-500 text-sm font-medium">Describe your upcoming events in a sentence, and AI will generate and add the schedules automatically.</p>
                <div className="flex gap-2">
                   <input
                     type="text"
                     value={aiPrompt}
                     onChange={(e) => setAiPrompt(e.target.value)}
                     placeholder="e.g. Next Sunday we have a youth choir practice at 2PM in the Main Hall"
                     className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                   />
                   <button
                     onClick={handleAISchedule}
                     disabled={isSchedulingAI || !aiPrompt.trim()}
                     className="bg-purple-600 text-white px-5 py-3 rounded-xl font-bold shadow-sm hover:bg-purple-700 disabled:bg-purple-300 transition-colors"
                   >
                     {isSchedulingAI ? 'Scheduling...' : 'Auto-Schedule'}
                   </button>
                </div>
             </div>

             <SectionManager
               title="Events & Schedule"
               items={data.upcomingEvents}
               onAdd={(item) => handleAddData('upcomingEvents', item)}
               onUpdate={(id, item) => handleUpdateData('upcomingEvents', id, item)}
               onDelete={(id) => handleDeleteData('upcomingEvents', id)}
               fields={[
                 { name: 'title', label: 'Event Name' },
                 { name: 'date', label: 'Date (Leave blank for weekly events)', type: 'date' },
                 { name: 'day', label: 'Day of Week (For weekly events, e.g. Sunday)' },
                 { name: 'time', label: 'Time (e.g. 09:00 hrs)' },
                 { name: 'location', label: 'Location', type: 'map_location' },
                 { name: 'type', label: 'Category' },
               ]}
               renderItem={(item) => (
                  <div>
                     <h4 className="font-bold text-[14px] text-gray-900">{item.title}</h4>
                     <p className="text-[12px] text-gray-600">{item.location} • {item.time}</p>
                     <p className="text-[10px] font-bold text-purple-600 mt-1">
                       {item.date ? item.date : `Every ${item.day}`}
                     </p>
                  </div>
               )}
               icon={<CalendarIcon className="w-5 h-5" />}
               colorClass="purple"
             />
           </div>
        )}

        {activeSection === 'galleryImages' && (
           <SectionManager
             title="Gallery Images"
             items={data.galleryImages}
             onAdd={(item: any) => handleAddData('galleryImages', item)}
             onUpdate={(id: any, item: any) => handleUpdateData('galleryImages', id, item)}
             onDelete={(id: string | number) => handleDeleteData('galleryImages', id)}
             uploadProgress={uploadProgress}
             fields={[
               { name: 'url', label: 'Image File', type: 'file', accept: 'image/*' },
               { name: 'title', label: 'Caption' },
               { name: 'category', label: 'Category' },
             ]}
             renderItem={(item: any) => (
                <div className="flex gap-3 items-center w-full">
                   <img src={item.url} alt={item.title} className="w-12 h-12 rounded object-cover" />
                   <div>
                     <h4 className="font-bold text-[14px] text-gray-900">{item.title}</h4>
                     <p className="text-[10px] font-bold text-orange-600 mt-0.5">{item.category}</p>
                   </div>
                </div>
             )}
             icon={<ImageIcon className="w-5 h-5" />}
             colorClass="orange"
           />
        )}

        {activeSection === 'cellGroups' && (
           <SectionManager
             title="Cell Groups"
             items={data.cellGroups}
             onAdd={(item) => handleAddData('cellGroups', item)}
             onUpdate={(id, item) => handleUpdateData('cellGroups', id, item)}
             onDelete={(id) => handleDeleteData('cellGroups', id)}
             fields={[
               { name: 'name', label: 'Cell Group Name' },
               { name: 'area', label: 'Coverage Area' },
               { name: 'leader', label: 'Cell Group Leader' },
               { name: 'phone', label: 'Phone Number' },
             ]}
             renderItem={(item) => (
                <div className="flex flex-col gap-1 w-full">
                  <h4 className="font-bold text-[14px] text-gray-900">{item.name}</h4>
                  <p className="text-[12px] text-gray-500">{item.area}</p>
                  <p className="text-[12px] text-gray-600 font-medium">Leader: {item.leader}</p>
                </div>
             )}
              icon={<Users className="w-5 h-5" />}
             colorClass="cyan"
           />
        )}

        {activeSection === 'appSettings' && (
           <SectionManager
             title="App Updates (Web & APK)"
             items={data.appSettings}
             onAdd={(item) => handleAddData('appSettings', item)}
             onUpdate={(id, item) => handleUpdateData('appSettings', id, item)}
             onDelete={(id) => handleDeleteData('appSettings', id)}
             fields={[
               { name: 'latestVersion', label: 'Latest App Version (e.g. 1.0.1)' },
               { name: 'apkDownloadUrl', label: 'APK Download URL' },
               { name: 'releaseNotes', label: 'Release Notes / What\'s New' },
             ]}
             renderItem={(item) => (
                <div className="flex flex-col gap-1 w-full">
                  <h4 className="font-bold text-[14px] text-gray-900">Version: {item.latestVersion}</h4>
                  <p className="text-[12px] text-blue-600 truncate">{item.apkDownloadUrl}</p>
                  <p className="text-[12px] text-gray-500 mt-1">{item.releaseNotes}</p>
                </div>
             )}
             icon={<Settings className="w-5 h-5" />}
             colorClass="gray"
           />
        )}
        </div>
      </div>
    </div>
  );
}

import { MapPin } from "lucide-react";
import { APIProvider, Map, AdvancedMarker, Pin, useMapsLibrary } from '@vis.gl/react-google-maps';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';

function MapPickerModal({ onClose, onSelect, initialPos }: { onClose: () => void, onSelect: (addr: string) => void, initialPos?: {lat: number, lng: number} }) {
  if (!API_KEY) {
    return (
      <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-lg p-5 flex flex-col gap-4 shadow-xl text-center">
          <h3 className="font-bold text-gray-900 text-lg">Google Maps API Key Missing</h3>
          <p className="text-gray-600 text-sm">Please add the GOOGLE_MAPS_PLATFORM_KEY to your environment variables or Secrets panel to use the location picker.</p>
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={onClose} className="px-5 py-2 font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors shadow-sm">Got it</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={API_KEY} version="weekly">
      <MapPickerModalContent onClose={onClose} onSelect={onSelect} initialPos={initialPos} />
    </APIProvider>
  );
}

function MapPickerModalContent({ onClose, onSelect, initialPos }: { onClose: () => void, onSelect: (addr: string) => void, initialPos?: {lat: number, lng: number} }) {
  const [markerPos, setMarkerPos] = useState(initialPos || {lat: 51.5074, lng: -0.1278}); 
  const geocodingLib = useMapsLibrary('geocoding');
  
  const handleSelect = () => {
    if (!geocodingLib) {
      onSelect(`${markerPos.lat.toFixed(4)}, ${markerPos.lng.toFixed(4)}`);
      onClose();
      return;
    }
    const geocoder = new geocodingLib.Geocoder();
    geocoder.geocode({ location: markerPos })
      .then((response) => {
        if (response.results && response.results[0]) {
          onSelect(response.results[0].formatted_address);
        } else {
          onSelect(`${markerPos.lat.toFixed(4)}, ${markerPos.lng.toFixed(4)}`);
        }
        onClose();
      })
      .catch((e: any) => {
        // Fallback to coordinates if API is not enabled
        onSelect(`${markerPos.lat.toFixed(4)}, ${markerPos.lng.toFixed(4)}`);
        onClose();
      });
  };

  return (
     <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-lg p-5 flex flex-col gap-4 shadow-xl">
            <h3 className="font-bold text-gray-900 text-lg">Pick Location</h3>
            <div className="h-72 rounded-xl overflow-hidden relative border border-gray-100">
               <Map
                 defaultCenter={markerPos}
                 defaultZoom={12}
                 mapId="LOCATION_PICKER_MAP"
                 onClick={(e) => {
                   if (e.detail.latLng) setMarkerPos(e.detail.latLng);
                 }}
                 gestureHandling="greedy"
                 disableDefaultUI={true}
                 internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
               >
                 <AdvancedMarker position={markerPos}>
                   <Pin background="#2563EB" glyphColor="#fff" />
                 </AdvancedMarker>
               </Map>
            </div>
            <div className="flex justify-end gap-2 mt-2">
               <button type="button" onClick={onClose} className="px-5 py-2 font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">Cancel</button>
               <button type="button" onClick={handleSelect} className="px-5 py-2 font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors shadow-sm">Confirm Location</button>
            </div>
        </div>
     </div>
  );
}

function SectionManager({ title, items, onAdd, onUpdate, onDelete, fields, renderItem, icon, colorClass, uploadProgress }: any) {
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMapPickerFor, setShowMapPickerFor] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEditing) {
        await onUpdate(isEditing, formData);
        setIsEditing(null);
      } else {
        await onAdd(formData);
        setIsAdding(false);
      }
      setFormData({});
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (item: any) => {
    setFormData(item);
    setIsEditing(item.id);
    setIsAdding(true);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setIsEditing(null);
    setFormData({});
  };

  const bgLight = `bg-${colorClass}-50`;
  const textVal = `text-${colorClass}-600`;
  const bgHover = `hover:bg-${colorClass}-100`;

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-gray-50 pb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center shrink-0`}>
            {icon}
          </div>
          <h3 className="font-bold text-gray-900 text-[16px]">{title}</h3>
        </div>
        {!isAdding && (
          <button onClick={() => setIsAdding(true)} className={`text-xs font-bold text-gray-700 uppercase tracking-widest bg-gray-100 px-3 py-1.5 rounded-full hover:bg-gray-200 transition-colors`}>
            New +
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 py-2 border-b border-gray-100 mb-2">
          {fields.map((f: any) => (
            <div key={f.name}>
              <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">{f.label}</label>
              {f.type === 'file' ? (
                <input
                  type="file"
                  accept={f.accept}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFormData({ ...formData, [f.name]: file });
                    }
                  }}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                />
              ) : f.type === 'file_or_text' ? (
                <div className="flex flex-col gap-2">
                  <input
                    type="file"
                    accept={f.accept}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setFormData({ ...formData, [f.name]: file });
                      }
                    }}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <div className="text-center text-xs text-gray-500 font-bold">OR</div>
                  <input
                    type="text"
                    placeholder="Enter URL (e.g. SoundCloud, YouTube)"
                    value={typeof formData[f.name] === 'string' ? formData[f.name] : ''}
                    onChange={(e) => setFormData({ ...formData, [f.name]: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              ) : f.isTextArea ? (
                <textarea
                  required
                  value={formData[f.name] || ''}
                  onChange={(e) => setFormData({ ...formData, [f.name]: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  rows={3}
                />
              ) : f.type === 'map_location' ? (
                <div className="flex gap-2 relative">
                  <input
                    required={f.required !== false}
                    type="text"
                    value={formData[f.name] || ''}
                    onChange={(e) => setFormData({ ...formData, [f.name]: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 pr-12 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Enter location or pick on map"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowMapPickerFor(f.name)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <MapPin className="w-4 h-4" />
                  </button>
                  {showMapPickerFor === f.name && (
                     <MapPickerModal
                        onClose={() => setShowMapPickerFor(null)}
                        onSelect={(addr) => {
                          setFormData({ ...formData, [f.name]: addr });
                        }}
                     />
                  )}
                </div>
              ) : (
                <input
                  required
                  type={f.type || "text"}
                  value={formData[f.name] || ''}
                  onChange={(e) => setFormData({ ...formData, [f.name]: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                />
              )}
            </div>
          ))}
          <div className="flex gap-2 mt-2">
            <button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-600 text-white font-bold py-2.5 rounded-xl shadow-sm hover:bg-blue-700 disabled:bg-blue-400 relative overflow-hidden">
              {isSubmitting && uploadProgress > 0 && (
                <div 
                  className="absolute left-0 top-0 bottom-0 bg-blue-500 opacity-50" 
                  style={{ width: `${uploadProgress}%`, transition: 'width 0.2s' }} 
                />
              )}
              <span className="relative z-10">
                {isSubmitting ? (uploadProgress > 0 ? `Uploading... ${Math.round(uploadProgress)}%` : 'Saving...') : (isEditing ? 'Update' : 'Save')}
              </span>
            </button>
            <button type="button" onClick={handleCancel} disabled={isSubmitting} className="flex-1 bg-gray-100 text-gray-700 font-bold py-2.5 rounded-xl hover:bg-gray-200 disabled:opacity-50">Cancel</button>
          </div>
        </form>
      )}

      <div className="flex flex-col gap-3">
        {items.map((item: any, i: number) => (
          <div key={item.id || i} className="flex justify-between items-start group py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 rounded-lg px-2 transition-colors">
            <div className="flex-1 min-w-0 pr-4">
              {renderItem(item)}
            </div>
            <div className="flex gap-1 shrink-0">
              <button 
                onClick={() => handleEdit(item)}
                className="p-2 text-gray-300 hover:text-blue-600 hover:bg-blue-50 transition-colors rounded-full"
                title="Edit"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => onDelete(item.id)}
                className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 transition-colors rounded-full"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && !isAdding && (
          <p className="text-center text-sm text-gray-500 py-4 font-medium">No items yet. Add one above.</p>
        )}
      </div>
    </div>
  );
}
