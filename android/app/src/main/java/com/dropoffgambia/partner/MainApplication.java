package com.dropoffgambia.partner;

import android.app.Application;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.media.AudioAttributes;
import android.net.Uri;
import android.os.Build;

public class MainApplication extends Application {

    public static final String CHANNEL_RIDE_REQUESTS = "ride_requests";
    public static final String CHANNEL_DEFAULT = "default";

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannels();
    }

    private void createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager manager = getSystemService(NotificationManager.class);

            // --- Ride Requests Channel (cash register sound, max importance) ---
            Uri cashRegisterSound = Uri.parse(
                "android.resource://" + getPackageName() + "/raw/cashregistersound"
            );
            AudioAttributes audioAttrs = new AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .build();

            NotificationChannel rideChannel = new NotificationChannel(
                CHANNEL_RIDE_REQUESTS,
                "Ride & Order Requests",
                NotificationManager.IMPORTANCE_HIGH
            );
            rideChannel.setDescription("Incoming ride and order requests");
            rideChannel.setSound(cashRegisterSound, audioAttrs);
            rideChannel.enableVibration(true);
            rideChannel.setVibrationPattern(new long[]{0, 500, 200, 500});
            rideChannel.setShowBadge(true);
            manager.createNotificationChannel(rideChannel);

            // --- Default Channel (system default sound) ---
            NotificationChannel defaultChannel = new NotificationChannel(
                CHANNEL_DEFAULT,
                "General Notifications",
                NotificationManager.IMPORTANCE_DEFAULT
            );
            defaultChannel.setDescription("General app notifications");
            manager.createNotificationChannel(defaultChannel);
        }
    }
}
