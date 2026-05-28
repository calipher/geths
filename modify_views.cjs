const fs = require('fs');

let content = fs.readFileSync('src/views.tsx', 'utf8');

// Replace import
content = content.replace(
  /import \{ sermons, timetable, announcements, testimonies, upcomingEvents, prayerRequests, galleryImages, cellGroups \} from "\.\/data";/g,
  'import { useAppData } from "./context";'
);

// Inject into HomeView
content = content.replace(
  /export function HomeView\(\) \{/g,
  'export function HomeView() {\n  const { data } = useAppData();\n  const { announcements } = data;'
);

// Inject into SermonsView
content = content.replace(
  /export function SermonsView\(\) \{/g,
  'export function SermonsView() {\n  const { data } = useAppData();\n  const { sermons } = data;'
);

// Inject into TimetableView
content = content.replace(
  /export function TimetableView\(\) \{/g,
  'export function TimetableView() {\n  const { data } = useAppData();\n  const { upcomingEvents, timetable } = data;'
);

// Inject into ProfileView
content = content.replace(
  /export function ProfileView\(\) \{/g,
  'export function ProfileView() {\n  const { data } = useAppData();\n  const { testimonies } = data;'
);

// Inject into ConnectView
content = content.replace(
  /export function ConnectView\(\) \{/g,
  'export function ConnectView() {\n  const { data } = useAppData();\n  const { prayerRequests, cellGroups } = data;'
);

// Inject into PortalView
content = content.replace(
  /export function PortalView\(\{ setActiveTab \}: \{ setActiveTab: \(tab: TabContext\) => void \}\) \{/g,
  'export function PortalView({ setActiveTab }: { setActiveTab: (tab: TabContext) => void }) {\n  const { data, updateData } = useAppData();\n  const { announcements, testimonies } = data;'
);

// Inject into GalleryView
content = content.replace(
  /export function GalleryView\(\) \{/g,
  'export function GalleryView() {\n  const { data } = useAppData();\n  const { galleryImages } = data;'
);

fs.writeFileSync('src/views.tsx', content);
console.log('Done!');
