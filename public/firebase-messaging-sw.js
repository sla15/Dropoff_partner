importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyC5uK6CYIZ0icQfUUnAd57a5fHyudXxSc4",
    authDomain: "ride-gm.firebaseapp.com",
    projectId: "ride-gm",
    storageBucket: "ride-gm.firebasestorage.app",
    messagingSenderId: "791001809445",
    appId: "1:791001809445:web:16ad4f846615bb90e4f5cc",
    measurementId: "G-XSLHWL73KG"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/assets/logo.png'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
