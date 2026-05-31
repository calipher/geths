import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Clock, MapPin, PlayCircle, PauseCircle, Calendar as CalendarIcon, Phone, Mail, Heart, BellRing, X, BookOpen, ChevronRight, ChevronLeft, Smile, Flame, Megaphone, User, Quote, Share2, Users, Edit3, Settings, Lock, Image as ImageIcon, SkipBack, SkipForward, Play, Pause } from "lucide-react";
import { useAppData } from "./context";
import { TabContext } from "./types";

function SundayTracker() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(interval);
  }, []);

  const isSunday = now.getDay() === 0;
  const timeInMins = now.getHours() * 60 + now.getMinutes();

  const schedule = [
    { id: 'prayers', title: 'Prayers', start: 480, end: 510, displayStart: '08:00 AM' },
    { id: 'first_service', title: '1st Service & Sunday School', start: 510, end: 570, displayStart: '08:30 AM' },
    { id: 'second_service', title: '2nd Service', start: 570, end: 690, displayStart: '09:30 AM' },
    { id: 'end', title: 'Church Ends', start: 690, end: 1440, displayStart: '11:30 AM' }
  ];

  const activeId = (() => {
    if (!isSunday) return null;
    if (timeInMins < 480) return 'upcoming';
    const currentService = schedule.find(s => timeInMins >= s.start && timeInMins < s.end);
    return currentService?.id || null;
  })();

  return (
    <div>
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="font-bold text-lg text-gray-900 leading-none">Sunday Schedule</h3>
        {isSunday && activeId && activeId !== 'end' && activeId !== 'upcoming' && (
          <div className="flex items-center gap-1.5 bg-red-50 text-red-600 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider animate-pulse border border-red-100">
             <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
             Live
          </div>
        )}
      </div>
      <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm">
        <div className="flex flex-col relative">
           <div className="absolute left-[13px] top-4 bottom-6 w-0.5 bg-gray-100"></div>
           {schedule.map((item, index) => {
              const isActive = isSunday && activeId === item.id;
              const isPast = isSunday && timeInMins >= item.end;
              
              return (
                <div key={item.id} className="flex gap-4 relative z-10 py-2.5">
                   <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold transition-colors ${isActive && item.id !== 'end' ? 'bg-blue-600 border-none text-white shadow-md shadow-blue-500/30 scale-110' : isPast || (isActive && item.id === 'end') ? 'bg-gray-100 text-gray-400 border border-gray-200' : 'bg-white border-2 border-gray-200 text-gray-400'}`}>
                      {isActive && item.id !== 'end' ? <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div> : index + 1}
                   </div>
                   <div className={`flex flex-col flex-1 pt-1 transition-opacity ${isActive && item.id !== 'end' ? 'opacity-100' : isPast || (isActive && item.id === 'end') ? 'opacity-50' : 'opacity-80'}`}>
                      <h4 className={`text-[14px] font-bold leading-tight mb-0.5 ${isActive && item.id !== 'end' ? 'text-blue-800' : 'text-gray-900'}`}>
                        {item.title}
                      </h4>
                      <p className={`text-[11px] font-semibold ${isActive && item.id !== 'end' ? 'text-blue-500' : 'text-gray-500'}`}>
                        {item.displayStart}
                      </p>
                   </div>
                </div>
              )
           })}
        </div>
      </div>
    </div>
  )
}

function TestimoniesSection() {
  const { data, addData } = useAppData();
  const { testimonies } = data;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [testimony, setTestimony] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testimony.trim()) return;
    
    setIsSubmitting(true);
    try {
      await addData('testimonies', {
        name: name.trim() || 'Anonymous',
        message: testimony,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      });
      setIsModalOpen(false);
      setName("");
      setTestimony("");
    } catch (error) {
      console.error("Failed to submit testimony:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="font-bold text-lg text-gray-900 leading-none">Testimonies</h3>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="text-[11px] font-bold text-blue-600 uppercase tracking-widest active:scale-95 transition-transform"
        >
          Share Yours +
        </button>
      </div>
      <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory pt-2 -mx-5 px-5 [&::-webkit-scrollbar]:hidden">
        {testimonies.map((item) => (
          <div key={item.id} className="bg-emerald-50 border border-emerald-100 rounded-3xl p-5 shadow-sm relative overflow-hidden min-w-[280px] max-w-[320px] shrink-0 snap-center">
            <Quote className="w-8 h-8 text-emerald-200 absolute top-4 right-4 rotate-180" fill="currentColor" />
            <p className="text-gray-700 text-[13px] leading-relaxed font-medium mb-3 relative z-10">"{item.message}"</p>
            <div className="flex justify-between items-center relative z-10 mt-auto">
              <span className="font-bold text-gray-900 text-xs">{item.name}</span>
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wide">{item.date}</span>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="mb-5 flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                <Quote className="w-5 h-5" fill="currentColor" />
              </div>
              <h3 className="font-extrabold text-xl text-gray-900 tracking-tight">Share Testimony</h3>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="testimonyName" className="text-sm font-bold text-gray-700 ml-1">Your Name (Optional)</label>
                <input 
                  id="testimonyName"
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Anonymous"
                  className="bg-gray-50 border border-gray-200 text-gray-900 text-[15px] rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 block w-full p-3 font-medium outline-none transition-shadow"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="testimonyText" className="text-sm font-bold text-gray-700 ml-1">Your Testimony</label>
                <textarea 
                  id="testimonyText"
                  required
                  rows={4}
                  value={testimony}
                  onChange={(e) => setTestimony(e.target.value)}
                  placeholder="What has God done for you?"
                  className="bg-gray-50 border border-gray-200 text-gray-900 text-[15px] rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 block w-full p-3 font-medium outline-none transition-shadow resize-none"
                ></textarea>
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="mt-2 w-full text-white bg-emerald-600 hover:bg-emerald-700 focus:ring-4 focus:outline-none focus:ring-emerald-300 font-extrabold rounded-xl text-[15px] px-5 py-3.5 text-center transition-colors shadow-md shadow-emerald-500/30 disabled:opacity-70"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Testimony'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function DailyDevotion() {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareImage, setShareImage] = useState<string | null>(null);
  const [isReadingPlanOpen, setIsReadingPlanOpen] = useState(false);

  const verseText = "But they that wait upon the Lord shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.";
  const verseRef = "Isaiah 40:31";
  
  const readingPlanContent = `Psalm 13
1 How long, Lord? Will you forget me forever?
  How long will you hide your face from me?
2 How long must I wrestle with my thoughts
  and day after day have sorrow in my heart?
  How long will my enemy triumph over me?
3 Look on me and answer, Lord my God.
  Give light to my eyes, or I will sleep in death,
4 and my enemy will say, "I have overcome him,"
  and my foes will rejoice when I fall.
5 But I trust in your unfailing love;
  my heart rejoices in your salvation.
6 I will sing the Lord's praise,
  for he has been good to me.

Psalm 14
1 The fool says in his heart,
  "There is no God."
  They are corrupt, their deeds are vile;
  there is no one who does good.
2 The Lord looks down from heaven
  on all mankind
  to see if there are any who understand,
  any who seek God.`;

  const generateImage = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 1080, 1080);
    gradient.addColorStop(0, "#1e3a8a"); 
    gradient.addColorStop(1, "#1d4ed8"); 
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1080);

    // Subtle pattern or shapes could be added here
    ctx.fillStyle = "#ffffff";
    ctx.globalAlpha = 0.05;
    ctx.beginPath();
    ctx.arc(1080, 0, 400, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 1080, 600, 0, 2 * Math.PI);
    ctx.fill();

    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";
    
    // Draw quote marks
    ctx.font = "bold 240px sans-serif";
    ctx.globalAlpha = 0.15;
    ctx.fillText('"', 540, 300);
    ctx.globalAlpha = 1.0;

    ctx.font = "italic 48px sans-serif";
    ctx.textBaseline = "middle";
    
    // Calculate total height of wrapped text to center it vertically
    const words = verseText.split(' ');
    let line = '';
    const lines = [];
    for(let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > 800 && n > 0) {
        lines.push(line);
        line = words[n] + ' ';
      } else {
        line = testLine;
      }
    }
    lines.push(line);

    const lineHeight = 70;
    const totalTextHeight = lines.length * lineHeight;
    let startY = 540 - (totalTextHeight / 2);

    lines.forEach(l => {
      ctx.fillText(l, 540, startY);
      startY += lineHeight;
    });

    ctx.font = "bold 36px sans-serif";
    ctx.fillText(`— ${verseRef}`, 540, startY + 60);

    // Church Name
    ctx.font = "bold 28px sans-serif";
    ctx.globalAlpha = 0.8;
    ctx.fillText("AFM IN ZIMBABWE - BYO SOUTH Gethsemane Assembly", 540, 1000);

    setShareImage(canvas.toDataURL("image/png"));
    setIsShareModalOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="font-bold text-lg text-gray-900 leading-none">Daily Devotion</h3>
        <button 
          onClick={generateImage}
          className="bg-blue-50 text-blue-600 rounded-full p-2 active:scale-95 transition-transform hover:bg-blue-100 flex items-center justify-center gap-1.5 px-3"
          aria-label="Share verse"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Share</span>
        </button>
      </div>
      <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm">
        <div className="mb-4">
          <h4 className="text-[11px] font-bold text-blue-600 uppercase tracking-widest mb-2">Verse of the Day</h4>
          <p className="text-gray-700 italic text-sm leading-relaxed font-medium mb-3">
            "{verseText}"
          </p>
          <p className="text-right font-bold text-gray-900 text-xs">— {verseRef}</p>
        </div>
        <div className="pt-4 border-t border-gray-100">
           <h4 className="text-[11px] font-bold text-blue-600 uppercase tracking-widest mb-2">Reading Plan</h4>
           <div className="flex items-center justify-between bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
             <span className="font-bold text-[13px] text-gray-900">Day 144: Psalms 13-15</span>
             <button 
               onClick={() => setIsReadingPlanOpen(true)}
               className="text-[11px] bg-blue-100/50 text-blue-700 font-bold px-3.5 py-1.5 rounded-full hover:bg-blue-100 transition-colors"
             >
               Read
             </button>
           </div>
        </div>
      </div>

      {isReadingPlanOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-[400px] h-[70vh] flex flex-col shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between shrink-0">
              <h3 className="font-extrabold text-lg text-gray-900 tracking-tight">Day 144: Psalms 13-15</h3>
              <button 
                onClick={() => setIsReadingPlanOpen(false)}
                className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto flex-1 font-serif text-gray-800 leading-relaxed text-[15px] whitespace-pre-wrap">
              {readingPlanContent}
            </div>
            <div className="p-4 border-t border-gray-100 shrink-0">
              <button 
                onClick={() => setIsReadingPlanOpen(false)}
                className="w-full bg-blue-600 text-white font-extrabold rounded-xl py-3.5 hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/30"
              >
                Done Reading
              </button>
            </div>
          </div>
        </div>
      )}

      {isShareModalOpen && shareImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-[320px] p-5 shadow-2xl relative animate-in fade-in zoom-in duration-200 flex flex-col">
            <button 
              onClick={() => setIsShareModalOpen(false)}
              className="absolute -top-3 -right-3 w-8 h-8 flex items-center justify-center bg-gray-900 rounded-full text-white hover:bg-gray-800 transition-colors shadow-lg z-10"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="mb-4">
              <h3 className="font-extrabold text-lg text-gray-900 tracking-tight text-center">Share Verse</h3>
              <p className="text-xs text-gray-500 font-medium text-center mt-1">Long-press or click to save</p>
            </div>
            <div className="rounded-2xl overflow-hidden mb-4 border border-gray-100 shadow-sm relative pt-[100%] w-full">
               <img src={shareImage} alt="Bible verse for sharing" className="absolute top-0 left-0 w-full h-full object-cover" />
            </div>
            <a 
              href={shareImage} 
              download="verse-of-the-day.png"
              className="flex items-center justify-center gap-2.5 w-full bg-blue-600 text-white font-extrabold rounded-xl py-3.5 active:scale-95 transition-transform shadow-md shadow-blue-500/30"
            >
              <span className="text-[14px]">Download Image</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function OfflineBibleReader({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [kjvBible, setKjvBible] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [selectedBookIndex, setSelectedBookIndex] = useState(0);
  const [selectedChapterIndex, setSelectedChapterIndex] = useState(0);

  useEffect(() => {
    if (isOpen && !kjvBible && !isLoading) {
      setIsLoading(true);
      fetch('/kjv.json')
        .then(res => res.json())
        .then(data => {
          setKjvBible(data);
          setIsLoading(false);
        })
        .catch(err => {
          console.error(err);
          setError(true);
          setIsLoading(false);
        });
    }
  }, [isOpen, kjvBible, isLoading]);

  if (!isOpen) return null;
  
  if (isLoading) {
    return createPortal(
       <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
         <div className="bg-white p-6 rounded-3xl text-gray-900 shadow-2xl flex flex-col items-center gap-3">
           <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
           <div className="font-bold">Loading Bible Data... (approx 4.5MB)</div>
         </div>
       </div>,
       document.body
    );
  }

  if (error || !kjvBible || !Array.isArray(kjvBible)) {
    return createPortal(
       <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
         <div className="bg-white p-6 rounded-3xl font-bold text-gray-900 flex flex-col items-center shadow-2xl">
            <p className="mb-4">Error loading bible data.</p>
            <button onClick={onClose} className="px-5 py-2 bg-emerald-600 text-white rounded-xl active:scale-95 transition-transform">Close</button>
         </div>
       </div>,
       document.body
    );
  }

  const selectedBook = kjvBible[selectedBookIndex] || kjvBible[0];
  
  if (!selectedBook || !selectedBook.chapters) {
    return createPortal(
       <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
         <div className="bg-white p-6 rounded-3xl font-bold text-gray-900 flex flex-col items-center shadow-2xl">
            <p className="mb-4">Error loading book data.</p>
            <button onClick={onClose} className="px-5 py-2 bg-emerald-600 text-white rounded-xl active:scale-95 transition-transform">Close</button>
         </div>
       </div>,
       document.body
    );
  }

  const selectedChapterContent = selectedBook.chapters[selectedChapterIndex] || selectedBook.chapters[0] || [];

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-[500px] h-[80vh] flex flex-col shadow-2xl relative animate-in fade-in zoom-in duration-200">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between shrink-0 bg-emerald-600 text-white rounded-t-3xl">
          <div className="flex items-center gap-3">
             <BookOpen className="w-5 h-5 text-emerald-100" />
             <h3 className="font-extrabold text-lg tracking-tight">Offline Bible</h3>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex bg-gray-50 border-b border-gray-100 shrink-0">
           <div className="flex-1 border-r border-gray-200">
              <select 
                className="w-full bg-transparent p-3 text-sm font-bold text-gray-900 outline-none appearance-none"
                value={selectedBookIndex}
                onChange={(e) => {
                  setSelectedBookIndex(Number(e.target.value));
                  setSelectedChapterIndex(0);
                }}
              >
                {kjvBible.map((b, i) => (
                   <option key={i} value={i}>{b.name}</option>
                ))}
              </select>
           </div>
           <div className="flex-1">
              <select 
                 className="w-full bg-transparent p-3 text-sm font-bold text-gray-900 outline-none appearance-none"
                 value={selectedChapterIndex}
                 onChange={(e) => {
                    setSelectedChapterIndex(Number(e.target.value));
                 }}
               >
                 {selectedBook.chapters.map((_, i) => (
                    <option key={i} value={i}>Chapter {i + 1}</option>
                 ))}
               </select>
           </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1 font-serif text-gray-800 leading-relaxed text-[16px] bg-[#fcfaf8]">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">{selectedBook.name || selectedBook.abbrev} {selectedChapterIndex + 1}</h2>
          {Array.isArray(selectedChapterContent) && selectedChapterContent.map((text: string, vi: number) => (
             <p key={vi} className="mb-3">
               <sup className="font-sans font-bold text-[10px] text-emerald-600 mr-1.5 align-super">{vi + 1}</sup>
               {text}
             </p>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}

export function HomeView() {
  const { data } = useAppData();
  const { announcements } = data;
  const [isOfflineBibleOpen, setIsOfflineBibleOpen] = useState(false);

  return (
    <div className="flex flex-col gap-5 p-5 antialiased">
      <OfflineBibleReader isOpen={isOfflineBibleOpen} onClose={() => setIsOfflineBibleOpen(false)} />
      <div className="bg-blue-800 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
        {/* Abstract shape for background depth */}
        <div className="absolute top-0 right-0 opacity-10">
          <svg width="200" height="200" viewBox="0 0 100 100" fill="currentColor">
            <circle cx="50" cy="50" r="50" />
            <circle cx="90" cy="20" r="40" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-1 relative z-10">Welcome To Gethsemane Assembly</h2>
        <p className="text-blue-200 text-sm font-medium mb-6 relative z-10">Being Elevated For Excellence &amp; Impact</p>
        
        <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-md relative z-10 border border-white/10">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-2 text-blue-100">Next Sunday Service</p>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-yellow-400" />
            <span className="font-extrabold text-lg tracking-tight">Sunday, 08:00 AM</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-blue-100 font-medium">
            <MapPin className="w-4 h-4" />
            <span>Church Hall</span>
          </div>
        </div>
      </div>

      <SundayTracker />

      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="font-bold text-lg text-gray-900 leading-none">Announcements</h3>
        </div>
        <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory pt-1 -mx-5 px-5 [&::-webkit-scrollbar]:hidden">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex flex-col gap-3 shadow-sm min-w-[260px] max-w-[300px] shrink-0 snap-center">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center shrink-0">
                  <Megaphone className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-gray-900 text-[14px] leading-tight mt-1 pt-0.5">{announcement.title}</h4>
              </div>
              <p className="text-gray-700 text-xs leading-relaxed font-medium">{announcement.message}</p>
              <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-wide mt-auto pt-2">{announcement.date}</div>
            </div>
          ))}
        </div>
      </div>

      <TestimoniesSection />

      <DailyDevotion />

      <div>
        <h3 className="font-bold text-lg text-gray-900 mb-3 px-1">Resources</h3>
        <div className="flex flex-col gap-3">
          <button 
            onClick={() => setIsOfflineBibleOpen(true)} 
            className="bg-emerald-50 border border-emerald-100 rounded-3xl p-4 shadow-sm flex items-center justify-between active:scale-95 transition-transform hover:shadow-md cursor-pointer group w-full text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center flex-shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-[15px] mb-0.5">Holy Bible (Offline)</h4>
                <p className="text-xs text-emerald-600 font-medium tracking-tight">Read the Bible without internet</p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
              <ChevronRight className="w-4 h-4 text-emerald-600" />
            </div>
          </button>

          <a href="#" className="bg-blue-50 border border-blue-100 rounded-3xl p-4 shadow-sm flex items-center justify-between active:scale-95 transition-transform hover:shadow-md cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-[15px] mb-0.5">Digital Hymnal</h4>
                <p className="text-xs text-blue-600 font-medium tracking-tight">Access church hymns anywhere</p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
              <ChevronRight className="w-4 h-4 text-blue-600" />
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}

export function SermonsView() {
  const { data } = useAppData();
  const { sermons } = data;
  const [activeSermon, setActiveSermon] = useState<any | null>(null);

  const getCleanUrl = (url: string) => {
    if (!url) return '';
    let clean = url.trim();
    if (clean.match(/youtube\.com|youtu\.be|soundcloud\.com/i) && !clean.match(/^https?:\/\//i)) {
      clean = 'https://' + clean;
    }
    return clean;
  };

  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const cleanAudioUrl = activeSermon?.audioUrl ? getCleanUrl(activeSermon.audioUrl) : '';
  const isYoutube = cleanAudioUrl.match(/youtube\.com|youtu\.be/i);
  const isSoundcloud = cleanAudioUrl.match(/soundcloud\.com/i);

  const handlePlay = (sermon: any) => {
    if (activeSermon?.id === sermon.id) {
       setActiveSermon(null);
    } else {
       setActiveSermon(sermon);
    }
  };

  const renderMedia = () => {
    if (!cleanAudioUrl) return null;
    
    if (isYoutube) {
      const vid = getYoutubeId(cleanAudioUrl);
      return vid ? (
         <iframe 
           className="w-full aspect-video rounded-2xl shadow-lg border-0"
           src={`https://www.youtube.com/embed/${vid}?autoplay=1`} 
           allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
           allowFullScreen
         />
      ) : null;
    }
    
    if (isSoundcloud) {
      return (
         <iframe 
           className="w-full h-[166px] rounded-2xl shadow-md border-0"
           scrolling="no" 
           allow="autoplay" 
           src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(cleanAudioUrl)}&color=%233b82f6&auto_play=true&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false`}
         />
      );
    }
    
    return (
       <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center">
         <audio 
           controls 
           autoPlay 
           src={cleanAudioUrl} 
           className="w-full outline-none"
         />
       </div>
    );
  };

  return (
    <div className={`p-5 pb-8`}>
      {activeSermon && cleanAudioUrl && (
        <div className="w-full mb-6 relative animate-in fade-in slide-in-from-top-4 duration-300">
           <div className="flex flex-col mb-3 px-1">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 leading-tight">{activeSermon.title}</h3>
                  <p className="text-gray-500 text-[13px] font-medium">{activeSermon.speaker}</p>
                  {activeSermon.scripture && (
                    <p className="text-[13px] font-bold text-blue-600 mt-1 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" /> 
                      {activeSermon.scripture}
                    </p>
                  )}
                </div>
                <button onClick={() => setActiveSermon(null)} className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors shrink-0">
                   <X className="w-4 h-4" />
                </button>
              </div>
              {activeSermon.summary && (
                <div className="mt-3 text-[13px] text-gray-700 leading-relaxed italic bg-blue-50/50 p-3 rounded-xl border border-blue-100/50">
                  {activeSermon.summary}
                </div>
              )}
           </div>
           {renderMedia()}
        </div>
      )}
      
      <h2 className="font-extrabold text-3xl text-gray-900 mb-5 px-1 tracking-tight">Sermons</h2>
      <div className="flex flex-col gap-3.5">
        {sermons.map((sermon: any) => (
          <div key={sermon.id} onClick={() => handlePlay(sermon)} className={`p-4 rounded-3xl border shadow-sm flex gap-4 items-center active:scale-95 transition-all cursor-pointer hover:shadow-md ${activeSermon?.id === sermon.id ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-100'}`}>
            <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${activeSermon?.id === sermon.id ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-800'}`}>
              {activeSermon?.id === sermon.id ? (
                 <div className="flex items-center justify-center gap-0.5">
                    <div className="w-1 h-3 bg-white animate-[bounce_1s_infinite_0ms] rounded-full"></div>
                    <div className="w-1 h-4 bg-white animate-[bounce_1s_infinite_200ms] rounded-full mx-0.5"></div>
                    <div className="w-1 h-3 bg-white animate-[bounce_1s_infinite_400ms] rounded-full"></div>
                 </div>
              ) : (
                 <PlayCircle className={`w-8 h-8 fill-blue-100`} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`font-bold mb-1 leading-tight text-[15px] truncate transition-colors ${activeSermon?.id === sermon.id ? 'text-blue-900' : 'text-gray-900'}`}>{sermon.title}</h3>
              <p className={`text-sm font-medium mb-1.5 truncate transition-colors ${activeSermon?.id === sermon.id ? 'text-blue-700' : 'text-blue-600'}`}>{sermon.speaker}</p>
              {sermon.scripture && (
                <p className="text-xs text-gray-500 font-medium mb-1.5 line-clamp-1"><BookOpen className="w-3 h-3 inline mr-1 opacity-70" /> {sermon.scripture}</p>
              )}
              {sermon.summary && activeSermon?.id === sermon.id && (
                <div className="mb-2 mt-2 px-3 py-2 bg-blue-50/50 rounded-xl border border-blue-100">
                  <p className="text-xs text-gray-600 leading-relaxed italic whitespace-pre-wrap">{sermon.summary}</p>
                </div>
              )}
              <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                <span>{sermon.date}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {sermon.duration}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TimetableView() {
  const { data } = useAppData();
  const { upcomingEvents } = data;
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 1)); // May 2026
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date(2026, 4, 30));

  const handleSetReminder = async (itemTitle: string) => {
    if (!("Notification" in window)) {
      alert("This browser does not support notifications.");
      return;
    }

    if (Notification.permission === "granted") {
      new Notification(`Reminder set for ${itemTitle}`);
    } else if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        new Notification(`Reminder set for ${itemTitle}`);
      }
    }
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }

  const getEventsForDate = (date: Date | null) => {
    if (!date) return [];
    const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const currentDayName = dayNames[date.getDay()];

    return upcomingEvents.filter((e: any) => {
       if (e.date && e.date === dateString) return true;
       if (!e.date && e.day && typeof e.day === 'string' && e.day.includes(currentDayName)) return true;
       return false;
    });
  };

  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const selectedEvents = getEventsForDate(selectedDate);
  const formattedSelectedDate = selectedDate ? `${monthNames[selectedDate.getMonth()]} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}` : '';

  return (
    <div className="p-5 flex flex-col gap-6">
      <div className="text-center mt-3 mb-0">
        <h2 className="font-extrabold text-3xl text-gray-900 mb-2 tracking-tight">Calendar</h2>
        <p className="text-gray-500 font-medium text-sm px-4">Keep track of our special events, seminars, and regular gatherings.</p>
      </div>

      <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-gray-100">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-gray-900 text-lg">{monthNames[month]} {year}</h3>
          <div className="flex gap-2">
             <button onClick={prevMonth} className="p-2 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-600 active:scale-95 transition-all">
               <ChevronLeft className="w-5 h-5" />
             </button>
             <button onClick={nextMonth} className="p-2 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-600 active:scale-95 transition-all">
               <ChevronRight className="w-5 h-5" />
             </button>
          </div>
        </div>

        {/* Days of Week */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
            <div key={day} className="text-center text-xs font-bold text-gray-400 uppercase">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, i) => {
            if (!date) {
              return <div key={`empty-${i}`} className="h-10"></div>;
            }

            const events = getEventsForDate(date);
            const hasEvents = events.length > 0;
            const isSelected = selectedDate?.getDate() === date.getDate() && selectedDate?.getMonth() === date.getMonth() && selectedDate?.getFullYear() === date.getFullYear();

            return (
              <button
                key={i}
                onClick={() => setSelectedDate(date)}
                className={`
                  h-10 rounded-full flex flex-col items-center justify-center relative font-medium text-sm transition-all
                  ${isSelected ? 'bg-blue-600 text-white shadow-md font-bold scale-105' : 'text-gray-700 hover:bg-gray-50'}
                `}
              >
                <span>{date.getDate()}</span>
                {hasEvents && (
                  <span className={`w-1 h-1 rounded-full absolute bottom-1.5 ${isSelected ? 'bg-white' : 'bg-blue-500'}`}></span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="font-bold text-lg text-gray-900 mb-3 px-1">
          Events for {formattedSelectedDate}
        </h3>
        
        {selectedEvents.length > 0 ? (
          <div className="flex flex-col gap-4">
            {selectedEvents.map((item) => (
              <div key={item.id} className="bg-white border-l-[6px] border-blue-600 rounded-r-3xl rounded-l-md p-5 shadow-sm relative overflow-hidden group cursor-pointer active:scale-95 transition-transform hover:shadow-md">
                <div className="absolute top-0 right-0 p-3">
                   {item.type && (
                     <div className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                       {item.type}
                     </div>
                   )}
                </div>
                
                <h4 className="font-bold text-gray-900 text-[16px] tracking-tight mb-3 pr-16">{item.title}</h4>
                
                <div className="flex flex-col gap-2 text-sm text-gray-600 font-medium">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span>{item.time}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-blue-400" />
                    <span>{item.location}</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-50 flex justify-end">
                   <button 
                     onClick={(e) => { e.stopPropagation(); handleSetReminder(item.title); }}
                     className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors"
                   >
                     <BellRing className="w-3.5 h-3.5" />
                     Set Reminder
                   </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm text-center">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
               <CalendarIcon className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium text-sm">No events or activities scheduled for this day.</p>
          </div>
        )}
      </div>

    </div>
  )
}

export function ProfileView() {
  const { data } = useAppData();
  const { testimonies } = data;
  const [selectedMinistry, setSelectedMinistry] = useState<any>(null);

  const ministries = [
    {
      id: "sunday-school",
      name: "Sunday School",
      icon: Smile,
      iconColor: "text-amber-500",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      hoverBorder: "hover:border-amber-200",
      description: "Children's Ministry",
      leader: "Sis. Sibanda",
      eligibleMembers: "Children ages 3 to 12",
      bio: "Sunday School is dedicated to raising a generation that loves and serves God. We engage children with interactive Bible lessons, songs, and fun activities that help them grow in their faith."
    },
    {
      id: "youth",
      name: "Youth Dept",
      icon: Flame,
      iconColor: "text-purple-500",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      hoverBorder: "hover:border-purple-200",
      description: "Empowering next gen",
      leader: "Bro. Moyo",
      eligibleMembers: "Youth and Young Adults ages 13 to 35",
      bio: "Our Youth Department empowers the next generation to be bold in their faith and impact their communities. We host dynamic services, youth camps, and skills development workshops."
    },
    {
      id: "mens-fellowship",
      name: "Men's Fellowship",
      icon: Users,
      iconColor: "text-blue-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      hoverBorder: "hover:border-blue-200",
      description: "Fathers & Builders",
      leader: "Elder Dube",
      eligibleMembers: "Men aged 35 and above, or married men",
      bio: "The Men's Fellowship exists to equip and strengthen men to be godly leaders in their homes, workplace, and the church. We stand together as fathers and builders."
    },
    {
      id: "womens-fellowship",
      name: "Women's Fellowship",
      icon: Heart,
      iconColor: "text-pink-500",
      bgColor: "bg-pink-50",
      borderColor: "border-pink-200",
      hoverBorder: "hover:border-pink-200",
      description: "Mothers & Pillars",
      leader: "Mrs. Ndlovu",
      eligibleMembers: "Women aged 35 and above, or married women",
      bio: "A community of virtuous women serving as pillars in the church. We engage in prayer, charitable projects, and mentorship to uplift each other."
    },
    {
      id: "evangelism",
      name: "Evangelism",
      icon: Megaphone,
      iconColor: "text-teal-500",
      bgColor: "bg-teal-50",
      borderColor: "border-teal-200",
      hoverBorder: "hover:border-teal-200",
      description: "Preaching the word",
      leader: "Evangelist Mpofu",
      eligibleMembers: "Open to all passionate about soul winning",
      bio: "Taking the Gospel to the streets, hospitals, and communities. Our evangelism team is committed to fulfilling the Great Commission and demonstrating God's love to the world."
    },
    {
      id: "media-sound",
      name: "Media & Sound",
      icon: PlayCircle,
      iconColor: "text-indigo-500",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200",
      hoverBorder: "hover:border-indigo-200",
      description: "Tech & PA Team",
      leader: "Bro. Ncube",
      eligibleMembers: "Anyone with an interest in tech, audio, or video",
      bio: "We manage the sound engineering, live streaming, and media presentation for all church services. We use technology as a tool to amplify the Gospel message."
    }
  ];

  return (
    <div className="p-5 flex flex-col gap-6">
      <div className="text-center mt-3 mb-0">
        <h2 className="font-extrabold text-3xl text-gray-900 mb-2 tracking-tight">Our Church</h2>
        <p className="text-gray-500 font-medium text-sm px-4">Get to know the AFM IN ZIMBABWE - BYO SOUTH Gethsemane Assembly leadership and ministries.</p>
      </div>

      <div>
        <h3 className="font-bold text-lg text-gray-900 mb-3 px-1">Lead Pastor</h3>
        <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0 border border-blue-100 overflow-hidden relative">
            <User className="w-7 h-7 text-blue-400 absolute" strokeWidth={2.5} />
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-200/30 to-transparent"></div>
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-gray-900 text-[16px] leading-tight mb-1">Rev M Ndlovu</h4>
            <p className="text-gray-500 text-[13px] leading-snug font-medium">Shepherding the flock and committed to the Gospel.</p>
          </div>
        </div>
      </div>

      <div>
         <h3 className="font-bold text-lg text-gray-900 mb-3 px-1">Board of Elders</h3>
         <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm">
           <ul className="flex flex-col gap-3">
             <li className="flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center border border-indigo-100 text-indigo-500 font-bold shrink-0 text-sm">E1</div>
                <div>
                   <h4 className="font-bold text-sm text-gray-900">Elder Sibanda</h4>
                   <p className="text-[11px] font-medium text-gray-500">Secretary</p>
                </div>
             </li>
             <li className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100 text-emerald-500 font-bold shrink-0 text-sm">E2</div>
                <div>
                   <h4 className="font-bold text-sm text-gray-900">Elder Dzama</h4>
                   <p className="text-[11px] font-medium text-gray-500">Treasurer</p>
                </div>
             </li>
             <li className="flex items-center gap-4">
                <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center border border-amber-100 text-amber-600 font-bold shrink-0 text-sm">E3</div>
                <div>
                   <h4 className="font-bold text-sm text-gray-900">Elder Dube</h4>
                   <p className="text-[11px] font-medium text-gray-500">Advisor</p>
                </div>
             </li>
           </ul>
         </div>
      </div>

      <div>
        <h3 className="font-bold text-lg text-gray-900 mb-3 px-1">Departments & Ministries</h3>
        <div className="grid grid-cols-2 gap-3">
          {ministries.map((ministry) => {
            const Icon = ministry.icon;
            return (
              <div 
                key={ministry.id} 
                onClick={() => setSelectedMinistry(ministry)}
                className={`bg-white border border-gray-100 rounded-2xl p-4 shadow-sm relative overflow-hidden group ${ministry.hoverBorder} transition-colors cursor-pointer`}
              >
                <Icon className={`w-6 h-6 ${ministry.iconColor} mb-3 group-hover:scale-110 transition-transform`} />
                <h4 className="font-bold text-gray-900 text-[13px] mb-0.5">{ministry.name}</h4>
                <p className="text-[10px] text-gray-500 font-medium">{ministry.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="font-bold text-lg text-gray-900 mb-3 px-1">Location</h3>
        <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm overflow-hidden flex flex-col gap-4">
           <div className="rounded-2xl overflow-hidden border border-gray-200">
             <iframe
               title="Google Maps Location"
               src="https://maps.google.com/maps?q=AFM%20in%20Zimbabwe%20Gethsemane%20Assembly%20Bulawayo&t=&z=13&ie=UTF8&iwloc=&output=embed"
               width="100%"
               height="200"
               style={{ border: 0 }}
               allowFullScreen
               loading="lazy"
               referrerPolicy="no-referrer-when-downgrade"
             ></iframe>
           </div>
           <div className="flex flex-col gap-3">
             <div className="flex gap-3">
               <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                 <MapPin className="w-5 h-5 text-blue-600" />
               </div>
               <div className="pt-0.5">
                 <h4 className="font-bold text-[15px] text-gray-900 leading-tight">Gethsemane Assembly</h4>
                 <p className="text-gray-500 text-[13px] font-medium mt-0.5">
                   AFM IN ZIMBABWE - BYO SOUTH<br/>
                   Bulawayo, Zimbabwe
                 </p>
               </div>
             </div>
             <a
               href="https://maps.google.com/maps?q=AFM%20in%20Zimbabwe%20Gethsemane%20Assembly%20Bulawayo"
               target="_blank"
               rel="noopener noreferrer"
               className="w-full bg-gray-50 text-blue-600 font-bold text-sm py-3 rounded-xl hover:bg-blue-50 transition-colors flex justify-center items-center gap-2"
             >
               View on Google Maps
               <MapPin className="w-4 h-4" />
             </a>
           </div>
        </div>
      </div>

      {selectedMinistry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-200">
             <div className={`${selectedMinistry.bgColor} p-6 relative overflow-hidden flex flex-col items-center justify-center text-center`}>
                <button 
                  onClick={() => setSelectedMinistry(null)}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-white/50 backdrop-blur rounded-full text-gray-600 hover:bg-white/80 transition-colors z-10"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className={`w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 relative z-10 ${selectedMinistry.iconColor}`}>
                   <selectedMinistry.icon className="w-8 h-8" />
                </div>
                <h3 className="font-extrabold text-2xl text-gray-900 tracking-tight leading-none mb-1 relative z-10">{selectedMinistry.name}</h3>
                <p className={`text-sm font-bold ${selectedMinistry.iconColor} uppercase tracking-widest relative z-10`}>{selectedMinistry.description}</p>
             </div>
             <div className="p-6 flex flex-col gap-6">
                <div>
                   <h4 className="font-bold text-sm text-gray-400 uppercase tracking-wider mb-2">About</h4>
                   <p className="text-gray-700 text-sm leading-relaxed font-medium">
                     {selectedMinistry.bio}
                   </p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                   <div>
                      <h4 className="font-bold text-xs text-gray-400 uppercase tracking-wider mb-1">Leader</h4>
                      <p className="font-bold text-gray-900 text-sm">{selectedMinistry.leader}</p>
                   </div>
                   <div>
                      <h4 className="font-bold text-xs text-gray-400 uppercase tracking-wider mb-1">Eligible</h4>
                      <p className="font-medium text-gray-800 text-[13px] leading-snug">{selectedMinistry.eligibleMembers}</p>
                   </div>
                </div>
                <button 
                  onClick={() => setSelectedMinistry(null)}
                  className="w-full bg-gray-50 hover:bg-gray-100 text-gray-900 font-bold py-3.5 rounded-xl transition-colors mt-2"
                >
                  Close
                </button>
             </div>
          </div>
        </div>
      )}

    </div>
  )
}

export function ConnectView() {
  const { data } = useAppData();
  const { prayerRequests, cellGroups } = data;
  const [notifications, setNotifications] = useState(() => {
    return localStorage.getItem('afm_notifications') === 'true';
  });

  const [prayerFilter, setPrayerFilter] = useState<'recent' | 'highest'>('recent');

  const [activeConnectTab, setActiveConnectTab] = useState<'contact' | 'prayerWall' | 'cellGroups'>('contact');
  const [isPrayerModalOpen, setIsPrayerModalOpen] = useState(false);
  const [prayerName, setPrayerName] = useState("");
  const [prayerRequest, setPrayerRequest] = useState("");
  
  // Local state to keep track of prayed count interactions
  const [prayedCounts, setPrayedCounts] = useState<{ [key: string]: number }>(() => {
    const counts: { [key: string]: number } = {};
    prayerRequests.forEach((p: any) => {
       counts[p.id] = p.prayersCount;
    });
    return counts;
  });
  
  const [userPrayed, setUserPrayed] = useState<{ [key: string]: boolean }>({});

  const sortedPrayerRequests = [...prayerRequests].sort((a: any, b: any) => {
    if (prayerFilter === 'highest') {
       const countA = prayedCounts[a.id] || 0;
       const countB = prayedCounts[b.id] || 0;
       return countB - countA;
    } else {
       return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
  });

  const handlePrayClick = (id: string | number) => {
    if (userPrayed[id]) return;
    setPrayedCounts(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    setUserPrayed(prev => ({ ...prev, [id]: true }));
  };

  const handlePrayerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Prayer Request Submitted:", { name: prayerName, request: prayerRequest });
    setIsPrayerModalOpen(false);
    setPrayerName("");
    setPrayerRequest("");
  };

  useEffect(() => {
    localStorage.setItem('afm_notifications', String(notifications));
  }, [notifications]);

  return (
    <div className="p-5 flex flex-col gap-6">
      <div className="text-center mt-3 mb-0">
        <h2 className="font-extrabold text-3xl text-gray-900 mb-2 tracking-tight">Connect</h2>
        <p className="text-gray-500 font-medium text-sm px-4">Reach out to AFM IN ZIMBABWE - BYO SOUTH Gethsemane Assembly. We're here for you.</p>
      </div>

      <div className="flex bg-gray-100 p-1.5 rounded-2xl">
        <button
          onClick={() => setActiveConnectTab('contact')}
          className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
            activeConnectTab === 'contact' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-500'
          }`}
        >
          Contact Us
        </button>
        <button
          onClick={() => setActiveConnectTab('cellGroups')}
          className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
            activeConnectTab === 'cellGroups' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-500'
          }`}
        >
          Cell Groups
        </button>
        <button
          onClick={() => setActiveConnectTab('prayerWall')}
          className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
            activeConnectTab === 'prayerWall' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-500'
          }`}
        >
          Prayer Wall
        </button>
      </div>

      {activeConnectTab === 'contact' && (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 flex items-start gap-4 border-b border-gray-50">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <div className="pt-1">
                <h3 className="font-bold text-gray-900 mb-1 text-[15px]">Our Location</h3>
                <p className="text-sm text-gray-600 leading-relaxed font-medium">
                  AFM IN ZIMBABWE - BYO SOUTH<br/>
                  Gethsemane Assembly<br/>
                  Zimbabwe
                </p>
              </div>
            </div>
            <div className="p-5 flex items-start gap-4 border-b border-gray-50 bg-gray-50/30">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-blue-600" />
              </div>
              <div className="pt-1">
                <h3 className="font-bold text-gray-900 mb-1 text-[15px]">Contact Number</h3>
                <p className="text-sm text-gray-600 font-medium">+263 700 000 000</p>
              </div>
            </div>
            <div className="p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div className="pt-1">
                <h3 className="font-bold text-gray-900 mb-1 text-[15px]">Email Us</h3>
                <p className="text-sm text-gray-600 font-medium">calipherrndlovu@gmail.com</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <BellRing className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1 text-[15px]">Push Notifications</h3>
                <p className="text-xs text-gray-500 font-medium tracking-tight">Alerts for sermons & schedule</p>
              </div>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`relative inline-flex h-7 w-[3.25rem] flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${notifications ? 'bg-blue-600' : 'bg-gray-200'}`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${notifications ? 'translate-x-6' : 'translate-x-0'}`}
              />
            </button>
          </div>
        </div>
      )}

      {activeConnectTab === 'prayerWall' && (
        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-bold text-gray-900 text-lg">Community Prayers</h3>
            <div className="flex bg-gray-100 p-1 rounded-lg">
               <button
                 onClick={() => setPrayerFilter('recent')}
                 className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${prayerFilter === 'recent' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
               >
                 Recent
               </button>
               <button
                 onClick={() => setPrayerFilter('highest')}
                 className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${prayerFilter === 'highest' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
               >
                 Most Prayed
               </button>
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            {sortedPrayerRequests.map((request) => (
              <div key={request.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3">
                <p className="text-[15px] font-medium text-gray-800 leading-relaxed">
                  "{request.message}"
                </p>
                <div className="flex items-center justify-between mt-2 pt-3 border-t border-gray-50">
                   <div className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">{request.date}</div>
                   
                   <button 
                     onClick={() => handlePrayClick(request.id)}
                     className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                       userPrayed[request.id] 
                        ? 'bg-red-50 text-red-500 border border-red-100' 
                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-100'
                     }`}
                   >
                     <Heart className={`w-3.5 h-3.5 ${userPrayed[request.id] ? 'fill-current' : ''}`} />
                     {userPrayed[request.id] ? 'Praying' : 'Pray'} • {prayedCounts[request.id]}
                   </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeConnectTab === 'cellGroups' && (
        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between px-1">
             <h3 className="font-bold text-gray-900 text-lg">Find a Cell Group</h3>
          </div>
          <div className="flex flex-col gap-3">
             {cellGroups.map((group) => (
               <div key={group.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-2">
                 <div className="flex items-center justify-between mb-1">
                   <h4 className="font-bold text-[16px] text-gray-900 leading-tight">{group.name}</h4>
                 </div>
                 <div className="space-y-1.5 text-sm text-gray-600 font-medium my-1">
                   <div className="flex gap-2">
                     <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                     <span className="leading-tight">{group.area}</span>
                   </div>
                   <div className="flex items-center gap-2">
                     <User className="w-4 h-4 text-gray-400" />
                     <span>{group.leader}</span>
                   </div>
                 </div>
                 <div className="mt-2 pt-3 border-t border-gray-50 flex items-center justify-between">
                   <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                     <Phone className="w-4 h-4 text-emerald-500" />
                     <a href={`tel:${group.phone?.replace(/\s+/g, '')}`}>{group.phone}</a>
                   </div>
                 </div>
               </div>
             ))}
          </div>
        </div>
      )}

      {activeConnectTab === 'prayerWall' && (
        <button 
          onClick={() => setIsPrayerModalOpen(true)}
          className="flex items-center justify-center gap-2.5 w-full bg-blue-800 text-white font-extrabold rounded-2xl py-4 active:scale-95 transition-transform shadow-lg shadow-blue-900/20 mt-2"
        >
          <Heart className="w-5 h-5 text-red-300" fill="currentColor" />
          <span className="text-[15px]">Submit Prayer Request</span>
        </button>
      )}

      {isPrayerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setIsPrayerModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="mb-5 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                <Heart className="w-5 h-5" fill="currentColor" />
              </div>
              <h3 className="font-extrabold text-xl text-gray-900 tracking-tight">Prayer Request</h3>
            </div>
            <form onSubmit={handlePrayerSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="name" className="text-sm font-bold text-gray-700 ml-1">Your Name</label>
                <input 
                  id="name"
                  type="text" 
                  value={prayerName}
                  onChange={(e) => setPrayerName(e.target.value)}
                  placeholder="Anonymous (Optional)"
                  className="bg-gray-50 border border-gray-200 text-gray-900 text-[15px] rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full p-3 font-medium outline-none transition-shadow"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="request" className="text-sm font-bold text-gray-700 ml-1">Your Request</label>
                <textarea 
                  id="request"
                  required
                  rows={4}
                  value={prayerRequest}
                  onChange={(e) => setPrayerRequest(e.target.value)}
                  placeholder="How can we pray for you?"
                  className="bg-gray-50 border border-gray-200 text-gray-900 text-[15px] rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full p-3 font-medium outline-none transition-shadow resize-none"
                ></textarea>
              </div>
              <button 
                type="submit" 
                className="mt-2 w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-extrabold rounded-xl text-[15px] px-5 py-3.5 text-center transition-colors shadow-md shadow-blue-500/30"
              >
                Send Request
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export function PortalView({ setActiveTab }: { setActiveTab: (tab: TabContext) => void }) {
  const { data, updateData } = useAppData();
  const { announcements, testimonies, sermons, galleryImages, upcomingEvents, timetable } = data;
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') { // Simple default credential
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid credentials');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col min-h-[calc(100vh-14rem)] bg-gray-50 items-center justify-center p-5">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 w-full max-w-sm flex flex-col gap-5 text-center">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h2 className="font-extrabold text-2xl text-gray-900 tracking-tight">Admin Gateway</h2>
            <p className="text-gray-500 font-medium text-sm mt-1">Enter password to access portal</p>
          </div>
          
          <form onSubmit={handleLogin} className="flex flex-col gap-4 mt-2 text-left">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Secure Password"
                className="bg-gray-50 border border-gray-200 text-gray-900 text-center text-[15px] rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full p-4 font-bold outline-none transition-shadow"
              />
              {error && <p className="text-red-500 text-xs font-bold mt-2 text-center">{error}</p>}
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-800 text-white font-extrabold rounded-xl py-3.5 active:scale-95 transition-transform shadow-md shadow-blue-900/20"
            >
              Access Portal
            </button>
            
            <p className="text-center text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-2">
               Default Password: admin123
            </p>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-14rem)] bg-gray-50">
      <div className="bg-blue-950 p-6 rounded-b-[2.5rem] shadow-md border-b flex flex-col gap-4 sticky top-0 z-20">
        <h2 className="font-extrabold text-2xl text-white tracking-tight flex items-center justify-between">
          <span>Admin Portal</span>
          <Settings className="w-5 h-5 text-blue-200" />
        </h2>
        <p className="text-sm text-blue-200 font-medium leading-relaxed">
          Manage announcements, testimonies, and timetable updates from here.
        </p>
      </div>

      <div className="p-5 flex flex-col gap-5 -mt-2">
        
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Megaphone className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900 text-[16px]">Announcements</h3>
            </div>
            <button className="text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-full hover:bg-emerald-100 transition-colors">
              New +
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {announcements.map((ann, i) => (
              <div key={i} className="flex justify-between items-center group py-2 border-b border-gray-50 last:border-0 hover:bg-gray-50 rounded-lg px-2 transition-colors cursor-pointer">
                <div>
                  <h4 className="font-bold text-[14px] text-gray-900">{ann.title}</h4>
                  <p className="text-[11px] font-medium text-gray-500">{ann.date}</p>
                </div>
                <button className="p-2 text-gray-400 group-hover:text-emerald-600 transition-colors rounded-full hover:bg-emerald-50">
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Quote className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900 text-[16px]">Testimonies</h3>
            </div>
            <button className="text-xs font-bold text-purple-600 uppercase tracking-widest bg-purple-50 px-3 py-1.5 rounded-full hover:bg-purple-100 transition-colors">
              Approve
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {testimonies.map((testimony, i) => (
              <div key={i} className="flex justify-between items-center group py-2 border-b border-gray-50 last:border-0 hover:bg-gray-50 rounded-lg px-2 transition-colors cursor-pointer">
                <div className="flex-1 pr-4">
                  <h4 className="font-bold text-[14px] text-gray-900 truncate">{testimony.message}</h4>
                  <p className="text-[11px] font-medium text-gray-500">{testimony.name} • {testimony.date}</p>
                </div>
                <button className="p-2 text-gray-400 group-hover:text-purple-600 transition-colors rounded-full hover:bg-purple-50 shrink-0">
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 p-4 rounded-2xl bg-blue-50 border border-blue-100 text-blue-800 text-sm font-medium text-center">
          Note: Admin features require Firebase Analytics and Realtime Database backend integration to persist changes.
        </div>

      </div>
    </div>
  );
}

export function GalleryView() {
  const { data } = useAppData();
  const { galleryImages } = data;
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <div className="p-5 flex flex-col gap-6">
      <div className="text-center mt-3 mb-2">
        <h2 className="font-extrabold text-3xl text-gray-900 mb-2 tracking-tight">Gallery</h2>
        <p className="text-gray-500 font-medium text-sm px-4">Moments captured at AFM IN ZIMBABWE - BYO SOUTH Gethsemane Assembly.</p>
      </div>

      <div className="columns-2 gap-3 space-y-3">
        {galleryImages.map((img) => (
          <div 
            key={img.id} 
            className="relative rounded-2xl overflow-hidden cursor-pointer group break-inside-avoid shadow-sm"
            onClick={() => setSelectedImage(img.url)}
          >
            <img 
              src={img.url} 
              alt={img.title} 
              className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
              referrerPolicy="no-referrer"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute bottom-0 left-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-full">
               <span className="text-[10px] font-bold text-white bg-blue-600/80 px-2 py-0.5 rounded-full inline-block mb-1">{img.category}</span>
               <h4 className="text-white text-xs font-bold leading-tight truncate">{img.title}</h4>
            </div>
          </div>
        ))}
      </div>

      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <button 
             className="absolute top-6 right-6 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors backdrop-blur-sm z-50"
             onClick={() => setSelectedImage(null)}
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="relative max-w-full max-h-[85vh] rounded-lg overflow-hidden flex items-center justify-center">
            <img 
              src={selectedImage} 
              alt="Gallery Fullscreen" 
              className="max-w-full max-h-[85vh] object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <p className="text-white/60 text-xs font-medium mt-4">Tap anywhere to close</p>
        </div>
      )}
    </div>
  );
}
