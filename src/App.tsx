/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState } from "react";
import { TabContext } from "./types";
import { Header, BottomNav } from "./components";
import { HomeView, SermonsView, TimetableView, ConnectView, ProfileView, PortalView, GalleryView } from "./views";

export default function App() {
  const [activeTab, setActiveTab] = useState<TabContext>('home');

  return (
    <div className="min-h-screen bg-[#111827] flex items-center justify-center selection:bg-blue-200 font-sans">
      {/* Mobile App Shell Structure */}
      <div className="w-full max-w-md bg-gray-50 h-[100dvh] flex flex-col relative shadow-2xl overflow-hidden ring-1 ring-gray-900 sm:h-[850px] sm:max-h-[calc(100vh-4rem)] sm:rounded-[3rem] sm:ring-8 sm:ring-gray-800">
        <Header setActiveTab={setActiveTab} />

        <main className="flex-1 overflow-y-auto pb-6 no-scrollbar">
          {activeTab === 'home' && <HomeView />}
          {activeTab === 'sermons' && <SermonsView />}
          {activeTab === 'timetable' && <TimetableView />}
          {activeTab === 'profile' && <ProfileView />}
          {activeTab === 'connect' && <ConnectView />}
          {activeTab === 'portal' && <PortalView setActiveTab={setActiveTab} />}
          {activeTab === 'gallery' && <GalleryView />}
        </main>

        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
}
