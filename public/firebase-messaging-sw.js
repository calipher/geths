importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Parse the firebase configuration we have. We'll duplicate it here since SW can't import JSON easily.
const firebaseConfig = {
  projectId: "gen-lang-client-0961167103",
  appId: "1:479298581369:web:39031e2eed55bebc55f5a8",
  apiKey: "AIzaSyDLU33D1Ce6Ckrj6a9bmbAblJ4Smc1llwg",
  authDomain: "gen-lang-client-0961167103.firebaseapp.com",
  messagingSenderId: "479298581369"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
