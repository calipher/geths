import { Bell, Home, Headphones, Calendar, Users, Info, Settings, ShieldCheck, Camera, Loader2, Edit3 } from "lucide-react";
import { TabContext } from "./types";
import React, { useState, useRef } from "react";

interface HeaderProps {
  setActiveTab: (tab: TabContext) => void;
}

export function Header({ setActiveTab }: HeaderProps) {
  return (
    <header className="bg-white text-gray-900 px-5 pt-6 pb-4 z-10 border-b border-gray-100 flex items-center justify-between shrink-0 hover:bg-gray-50/50 transition-colors">
      <div className="flex items-center gap-3">
         <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center shadow-sm overflow-hidden border border-gray-200">
           <img src="/logo.png" alt="AFM Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
         </div>
         <div className="flex flex-col">
           <h1 className="font-black leading-none text-[1.05rem] tracking-tight text-blue-950">AFM IN ZIMBABWE - BYO SOUTH</h1>
           <h2 className="text-[0.65rem] font-bold text-blue-600 tracking-wider mt-1 uppercase">Gethsemane Assembly</h2>
         </div>
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={() => setActiveTab('portal')}
          className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100 text-emerald-600 active:bg-emerald-100 transition-colors"
          title="Admin Portal"
        >
           <ShieldCheck className="w-4 h-4" />
        </button>
        <button className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-200 text-gray-500 active:bg-gray-100 transition-colors">
           <Bell className="w-5 h-5" />
        </button>
      </div>
    </header>
  )
}

interface NavProps {
  activeTab: TabContext;
  setActiveTab: (tab: TabContext) => void;
}

export function BottomNav({ activeTab, setActiveTab }: NavProps) {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'sermons', label: 'Sermons', icon: Headphones },
    { id: 'timetable', label: 'Schedule', icon: Calendar },
    { id: 'profile', label: 'About', icon: Info },
    { id: 'notes', label: 'Notepad', icon: Edit3 },
    { id: 'connect', label: 'Connect', icon: Users },
  ] as const;

  return (
    <nav className="bg-white border-t border-gray-200 px-6 flex justify-between shrink-0 pb-6 pt-3 h-[5.5rem]">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabContext)}
            className={`flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-blue-800' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <div className={`p-1.5 rounded-full transition-colors ${isActive ? 'bg-blue-100/50' : 'bg-transparent'}`}>
              <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className={`text-[11px] font-medium ${isActive ? 'font-bold' : ''}`}>{tab.label}</span>
          </button>
        )
      })}
    </nav>
  );
}

export function PullToRefresh({ children, onRefresh }: { children: React.ReactNode, onRefresh: () => Promise<void> }) {
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (scrollRef.current && scrollRef.current.scrollTop <= 0) {
      startY.current = e.touches[0].clientY;
      setPulling(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!pulling || refreshing) return;
    currentY.current = e.touches[0].clientY;
    const distance = currentY.current - startY.current;
    
    // Only handle pull down from top
    if (distance > 0 && scrollRef.current && scrollRef.current.scrollTop <= 0) {
      const scaledDistance = Math.min(distance * 0.4, 80); // max 80px visual pull
      setPullDistance(scaledDistance);
    } else {
      setPullDistance(0);
    }
  };

  const handleTouchEnd = async () => {
    if (!pulling) return;
    setPulling(false);

    if (pullDistance > 60 && !refreshing) {
      setRefreshing(true);
      setPullDistance(60); // Hold at refreshing height
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  };

  return (
    <div 
      className="flex-1 overflow-y-auto no-scrollbar relative flex flex-col"
      ref={scrollRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div 
        className="absolute top-0 w-full flex justify-center items-center overflow-hidden transition-all duration-300 pointer-events-none"
        style={{ 
          height: pulling || refreshing ? `${pullDistance}px` : '0px',
          opacity: pullDistance > 10 ? 1 : 0
        }}
      >
        <div className="bg-white rounded-full p-2 shadow-sm border border-gray-100 flex items-center justify-center translate-y-2">
          <Loader2 
            className={`w-5 h-5 text-blue-500 ${refreshing ? 'animate-spin' : ''}`} 
            style={{ transform: !refreshing ? `rotate(${pullDistance * 4}deg)` : undefined }} 
          />
        </div>
      </div>
      <div 
        className="flex-1 flex flex-col"
        style={{ 
          transform: `translateY(${pullDistance}px)`,
          transition: !pulling ? 'transform 0.3s ease-out' : 'none'
        }}
      >
        {children}
      </div>
    </div>
  );
}
