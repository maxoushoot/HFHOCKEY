import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';
import Constants from 'expo-constants';
import * as Device from 'expo-device';

// Configure Notification Handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

interface NotificationContextType {
    expoPushToken: string | undefined;
    notification: Notifications.Notification | undefined;
    askPermissions: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType>({
    expoPushToken: undefined,
    notification: undefined,
    askPermissions: async () => { },
});

export const useNotifications = () => useContext(NotificationContext);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [expoPushToken, setExpoPushToken] = useState<string | undefined>('');
    const [notification, setNotification] = useState<Notifications.Notification | undefined>(undefined);
    const notificationListener = useRef<Notifications.EventSubscription | null>(null);
    const responseListener = useRef<Notifications.EventSubscription | null>(null);
    const { session } = useStore();

    useEffect(() => {
        registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            setNotification(notification);
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            console.log(response);
            // Handle navigation based on response.notification.request.content.data
        });

        return () => {
            notificationListener.current?.remove();
            responseListener.current?.remove();
        };
    }, []);

    // Save token to Supabase when user is logged in
    useEffect(() => {
        if (session && expoPushToken) {
            savePushToken(session.user.id, expoPushToken);
        }
    }, [session, expoPushToken]);

    // Watch for unlocked achievements
    const { achievements } = useStore();
    const previousUnlockedCount = useRef(0);

    useEffect(() => {
        if (!achievements) return;

        const unlocked = achievements.filter(a => a.unlocked_at);
        if (unlocked.length > previousUnlockedCount.current) {
            // Find the newly unlocked one (approximation)
            const latest = unlocked[unlocked.length - 1]; // Simple logic
            if (latest && previousUnlockedCount.current > 0) { // Don't notify on initial load
                Notifications.scheduleNotificationAsync({
                    content: {
                        title: "🏆 Succès déverrouillé !",
                        body: `${latest.icon} ${latest.title} - ${latest.description}`,
                        sound: true,
                    },
                    trigger: null, // Immediate
                });
            }
        }
        previousUnlockedCount.current = unlocked.length;
    }, [achievements]);

    const savePushToken = async (userId: string, token: string) => {
        const { error } = await supabase
            .from('user_profiles')
            .update({ push_token: token })
            .eq('id', userId);

        if (error) {
            console.error("Error saving push token:", error);
        }
    };

    const askPermissions = async () => {
        await registerForPushNotificationsAsync();
    };

    return (
        <NotificationContext.Provider value={{ expoPushToken, notification, askPermissions }}>
            {children}
        </NotificationContext.Provider>
    );
}

async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            // alert('Failed to get push token for push notification!');
            console.log('Failed to get push token');
            return;
        }

        // Learn more about projectId:
        // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
        try {
            const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
            if (!projectId) {
                // throw new Error('Project ID not found');
            }
            token = (await Notifications.getExpoPushTokenAsync({
                projectId,
            })).data;
            console.log(token);
        } catch (e) {
            token = (await Notifications.getExpoPushTokenAsync()).data;
            console.log(token);
        }

    } else {
        // alert('Must use physical device for Push Notifications');
        console.log('Must use physical device for Push Notifications');
    }

    return token;
}
