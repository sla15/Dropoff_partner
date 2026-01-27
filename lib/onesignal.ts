// OneSignal Web SDK is loaded via script tag in index.html
// This file provides TypeScript-friendly wrapper functions

declare global {
    interface Window {
        OneSignalDeferred: Array<(oneSignal: any) => void>;
    }
}

const ONESIGNAL_APP_ID = import.meta.env.VITE_ONESIGNAL_APP_ID;

export const initializeOneSignal = async (): Promise<string | null> => {
    return new Promise((resolve) => {
        window.OneSignalDeferred = window.OneSignalDeferred || [];
        window.OneSignalDeferred.push(async function (OneSignal: any) {
            try {
                await OneSignal.init({
                    appId: ONESIGNAL_APP_ID,
                    allowLocalhostAsSecureOrigin: true,
                });

                // Show native permission prompt
                await OneSignal.Slidedown.promptPush();

                // Get user ID/Player ID
                const userId = await OneSignal.User.PushSubscription.id;
                resolve(userId || null);
            } catch (error) {
                console.error('OneSignal initialization error:', error);
                resolve(null);
            }
        });
    });
};

export const getPlayerId = async (): Promise<string | null> => {
    return new Promise((resolve) => {
        window.OneSignalDeferred.push(async function (OneSignal: any) {
            try {
                const userId = await OneSignal.User.PushSubscription.id;
                resolve(userId || null);
            } catch (error) {
                console.error('Error getting player ID:', error);
                resolve(null);
            }
        });
    });
};
