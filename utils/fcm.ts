import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { supabase } from "../lib/supabase";
import { CONFIG as APP_CONFIG } from "../config";
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';

const firebaseConfig = APP_CONFIG.FIREBASE_CONFIG;
const app = initializeApp(firebaseConfig);

// Web-only: messaging instance
let messaging: any;
try {
    if (!Capacitor.isNativePlatform() && typeof window !== 'undefined') {
        messaging = getMessaging(app);
    }
} catch (e) {
    console.warn("FCM: Messaging not initialized (likely platform restriction)");
}

export const initFCM = async (userId?: string, onForegroundMessage?: (title: string, body: string, data?: any) => void) => {
    try {
        console.log("🔔 FCM: Starting initialization for user:", userId || "anonymous");

        if (Capacitor.isNativePlatform()) {
            await initNativePush(userId, onForegroundMessage);
        } else {
            await initWebPush(userId, onForegroundMessage);
        }
    } catch (err) {
        console.error("❌ FCM: Initialization error details:", err);
    }
};

const initNativePush = async (userId?: string, onForegroundMessage?: (title: string, body: string, data?: any) => void) => {
    console.log("🔔 FCM: Initializing Native Push (Capacitor)");

    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
        console.warn("⚠️ FCM: Native push permissions not granted");
        return;
    }

    // Register for push notifications
    await PushNotifications.register();

    // On registration, we get the token
    PushNotifications.addListener('registration', async (token) => {
        console.log('✅ FCM: Native registration successful. Token:', token.value.substring(0, 10) + "...");
        if (userId) {
            await syncFCMTokenToSupabase(userId, token.value);
        }
    });

    PushNotifications.addListener('registrationError', (error) => {
        console.error('❌ FCM: Native registration error:', error);
    });

    PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('🔔 FCM: Native notification received:', notification);
        if (onForegroundMessage) {
            onForegroundMessage(notification.title || 'Notification', notification.body || '', notification.data);
        }
        if (notification.data?.ride_id || notification.title?.includes('Request')) {
            playNotificationSound();
        }
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('🔔 FCM: Native notification action performed:', notification);
    });
};

const initWebPush = async (userId?: string, onForegroundMessage?: (title: string, body: string, data?: any) => void) => {
    if (!("Notification" in window)) {
        console.error("❌ FCM: This browser does not support notifications.");
        return;
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
        console.warn("⚠️ FCM: Notification permission not granted");
        return;
    }

    if (!messaging) return;

    const token = await getToken(messaging, {
        vapidKey: APP_CONFIG.FCM_VAPID_KEY
    });

    if (token) {
        console.log("✅ FCM: Web token generated.");
        if (userId) await syncFCMTokenToSupabase(userId, token);
    }

    onMessage(messaging, (payload) => {
        console.log("🔔 FCM: Web message received in foreground:", payload);

        const title = payload.notification?.title || 'New Notification';
        const body = payload.notification?.body || '';

        // Trigger sound regardless of UI
        if (payload.data?.ride_id || title.includes('Request')) {
            playNotificationSound();
        }

        // Use callback if provided
        if (onForegroundMessage) {
            onForegroundMessage(title, body, payload.data);
        }

        if (payload.notification) {
            try {
                // Background notifications are handled by the browser/SW
                // For foreground, we attempt to show a browser notification
                const notificationTitle = title;
                const notificationOptions = {
                    body: body,
                    icon: '/assets/logo.png',
                    data: payload.data,
                    tag: payload.data?.ride_id || 'general' // Prevent duplicates
                };

                console.log("🔔 FCM: Attempting to show foreground notification:", notificationTitle, notificationOptions);
                const notification = new Notification(notificationTitle, notificationOptions);

                notification.onclick = () => {
                    window.focus();
                    notification.close();
                };
            } catch (err) {
                console.warn("⚠️ FCM: Could not show browser notification in foreground:", err);
            }
        }
    });
};

const playNotificationSound = () => {
    try {
        const audio = new Audio('/assets/cashregistersound.mp3');
        audio.play().catch(err => console.error("🔊 Audio Playback Error:", err));
    } catch (e) {
        console.error("🔊 Audio System Error:", e);
    }
};

export const syncFCMTokenToSupabase = async (userId: string, token: string) => {
    const { error } = await supabase
        .from('profiles')
        .upsert({
            id: userId,
            fcm_token: token,
            updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

    if (error) console.error('❌ FCM: Sync failed:', error);
    else console.log('✅ FCM: Token synced to Supabase');
};
