/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, useEffect } from "react";
import { TabContext } from "./types";
import { Header, BottomNav, PullToRefresh } from "./components";
import { HomeView, SermonsView, TimetableView, ConnectView, ProfileView, NotesView } from "./views";
import { PortalView } from "./PortalView";
import { AppDataProvider, useAppData } from "./context";
import { Download, X } from "lucide-react";
import { handleAuthRedirect } from "./firebase";

const CURRENT_VERSION = '1.0.0';

function AppUpdateBanner() {
  const { data } = useAppData();
  const [dismissed, setDismissed] = useState(false);
  const settings = data.appSettings?.[0];

  if (!settings || dismissed) return null;

  // Simple string comparison for versions (in a real app, use semver logic)
  if (settings.latestVersion && settings.latestVersion > CURRENT_VERSION && settings.apkDownloadUrl) {
    return (
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 flex items-center justify-between shadow-md relative z-50">
        <div className="flex flex-col">
          <span className="font-bold text-sm flex items-center gap-2">
            🚀 App Update Available!
          </span>
          <span className="text-xs text-blue-100 mt-0.5">Version {settings.latestVersion} is ready. {settings.releaseNotes}</span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={settings.apkDownloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors flex items-center gap-1 text-xs font-bold"
          >
            <Download className="w-4 h-4" />
          </a>
          <button onClick={() => setDismissed(true)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5 text-white/70" />
          </button>
        </div>
      </div>
    );
  }
  return null;
}

import { Toaster, toast } from 'sonner';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabContext>('home');

  useEffect(() => {
    handleAuthRedirect();
  }, []);

  const handleRefresh = async () => {
    // Simulate a network request delay since Firebase handles real-time updates automatically
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  return (
    <AppDataProvider>
      <Toaster position="top-center" richColors />
      {activeTab === 'portal' ? (
        <div className="min-h-screen bg-gray-50 font-sans">
          <PortalView setActiveTab={setActiveTab} />
        </div>
      ) : (
        <div className="min-h-screen bg-[#111827] flex items-center justify-center selection:bg-blue-200 font-sans">
          {/* Mobile App Shell Structure */}
          <div className="w-full max-w-md bg-gray-50 h-[100dvh] flex flex-col relative shadow-2xl overflow-hidden ring-1 ring-gray-900 sm:h-[850px] sm:max-h-[calc(100vh-4rem)] sm:rounded-[3rem] sm:ring-8 sm:ring-gray-800">
            <Header setActiveTab={setActiveTab} />
            <AppUpdateBanner />

            <PullToRefresh onRefresh={handleRefresh}>
              <div className="pb-6">
                {activeTab === 'home' && <HomeView />}
                {activeTab === 'sermons' && <SermonsView />}
                {activeTab === 'timetable' && <TimetableView />}
                {activeTab === 'profile' && <ProfileView />}
                {activeTab === 'connect' && <ConnectView />}
                {activeTab === 'notes' && <NotesView />}
              </div>
            </PullToRefresh>

            <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
        </div>
      )}
    </AppDataProvider>
  );
}
