import { initializeApp } from "firebase/app";
import { getMessaging, getToken, Messaging } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyBbe4yHfoeHNOlVDOQtJRI3gc1APuLOoFM",
    authDomain: "expense-tracker-10bdc.firebaseapp.com",
    projectId: "expense-tracker-10bdc",
    storageBucket: "expense-tracker-10bdc.firebasestorage.app",
    messagingSenderId: "488731254443",
    appId: "1:488731254443:web:b490a5642393d7363921ee"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Explicitly declare `messaging` as `Messaging | null`
let messaging: Messaging | null = null;

if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    messaging = getMessaging(app);
}

export const requestFCMToken = async () => {
    if (!messaging) {
        console.error("Firebase Messaging is not available (SSR detected).");
        alert("Firebase Messaging is not available (SSR detected).")
        return null;
    }

    try {
        const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
        console.log("Service Worker Registered:", registration);
        alert("Service Worker Registered:");

        const token = await getToken(messaging, {
            vapidKey: "BO9UcANN_R4LJ2eGRdYn5qlK6Ylrx4r6hstVkT-KIWWcR0reB_hzm-kIP5bC1qnZTSFRPLZhp66amvH9Co9rvtI",
            serviceWorkerRegistration: registration,
        });
        alert(JSON.stringify(token)+"here=========*****>")
        console.log("FCM Token:", token);
        return token;
    } catch (error) {
        console.error("FCM Token Error:", error);
        return null;
    }
};


export { messaging };