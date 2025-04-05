importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

firebase.initializeApp({

    apiKey: "AIzaSyBbe4yHfoeHNOlVDOQtJRI3gc1APuLOoFM",
    authDomain: "expense-tracker-10bdc.firebaseapp.com",
    projectId: "expense-tracker-10bdc",
    storageBucket: "expense-tracker-10bdc.firebasestorage.app",
    messagingSenderId: "488731254443",
    appId: "1:488731254443:web:b490a5642393d7363921ee"

});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log("Received background message ", payload);
    self.registration.showNotification(payload.notification.title, {
        body: payload.notification.body,
        icon: "/assets/notification.png",
    });
});