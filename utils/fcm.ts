import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { supabase } from "../lib/supabase";
import { CONFIG as APP_CONFIG } from "../config";

const firebaseConfig = APP_CONFIG.FIREBASE_CONFIG;
const app = initializeApp(firebaseConfig);

// Register service worker for FCM background messages
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/firebase-messaging-sw.js')
        .then((registration) => {
            console.log('🔔 FCM: Service Worker registered successfully:', registration);
        })
        .catch((error) => {
            console.error('❌ FCM: Service Worker registration failed:', error);
        });
}

const messaging = getMessaging(app);


export const initFCM = async (userId?: string) => {
    try {
        console.log("🔔 FCM: Starting initialization for user:", userId || "anonymous");

        if (!("Notification" in window)) {
            console.error("❌ FCM: This browser does not support notifications.");
            return;
        }

        const permission = await Notification.requestPermission();
        console.log("🔔 FCM: Permission status:", permission);

        if (permission !== "granted") {
            console.warn("⚠️ FCM: Notification permission not granted");
            return;
        }

        console.log("🔔 FCM: Requesting token with VAPID key...");
        const token = await getToken(messaging, {
            vapidKey: APP_CONFIG.FCM_VAPID_KEY
        });

        if (token) {
            console.log("✅ FCM: Token generated successfully.");
            // Log a truncated version for security but enough to identify it's not a UUID
            console.log("✅ FCM: Token prefix:", token.substring(0, 10) + "...");

            if (userId) {
                await syncFCMTokenToSupabase(userId, token);
            } else {
                console.log("ℹ️ FCM: No userId provided, skipping Supabase sync.");
            }
        } else {
            console.warn("⚠️ FCM: No token returned from getToken().");
        }

        onMessage(messaging, (payload) => {
            console.log("🔔 FCM: Message received in foreground:", payload);

            // Log specific data for debugging
            if (payload.data) {
                console.log("📊 FCM Payload Data:", JSON.stringify(payload.data, null, 2));
            }

            // Display notification when app is in foreground
            if (payload.notification) {
                const notificationTitle = payload.notification.title || 'New Notification';
                const notificationOptions = {
                    body: payload.notification.body || '',
                    icon: '/assets/app_logo.png',
                    badge: '/assets/app_logo.png',
                    tag: payload.data?.ride_id || 'general',
                    data: payload.data,
                    requireInteraction: true // Ensure driver sees it
                };

                console.log("📢 Displaying foreground notification:", notificationTitle);

                // Show browser notification
                try {
                    new Notification(notificationTitle, notificationOptions);
                } catch (e) {
                    console.error("❌ Notification API error:", e);
                }
            }
        });
    } catch (err) {
        console.error("❌ FCM: Initialization error details:", err);
    }
};

export const syncFCMTokenToSupabase = async (userId: string, token: string) => {
    const { error } = await supabase
        .from('profiles')
        .update({ fcm_token: token })
        .eq('id', userId);

    if (error) console.error('❌ FCM: Sync failed:', error);
    else console.log('✅ FCM: Token synced to Supabase');
};
