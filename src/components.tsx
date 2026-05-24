import { Bell, Home, Headphones, Calendar, Users, Info, Settings, ShieldCheck, Camera } from "lucide-react";
import { TabContext } from "./types";

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
    { id: 'gallery', label: 'Gallery', icon: Camera },
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
