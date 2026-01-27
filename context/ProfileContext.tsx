import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Role, UserProfile, RideRequest } from '../types';
import { INITIAL_PROFILE } from '../data/dummyData';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import type { User } from '@supabase/supabase-js';

interface ProfileContextType {
    role: Role;
    setRole: (role: Role) => void;
    profile: UserProfile;
    setProfile: (profile: UserProfile) => void;
    updateProfile: (updates: Partial<UserProfile>) => void;
    isOnboarded: boolean;
    completeOnboarding: () => Promise<void>;
    secondaryOnboardingRole: Role | null;
    startSecondaryOnboarding: (role: Role) => void;
    cancelSecondaryOnboarding: () => void;
    toggleOnlineStatus: () => void;
    payCommission: () => void;
    uploadFile: (file: File, bucketOverride?: string, path?: string) => Promise<string | null>;
    loadUserData: (userId: string) => Promise<void>;
    syncProfile: (targetProfile?: UserProfile) => Promise<void>;
    updateActiveRole: (newRole: Role) => Promise<void>;
    rideStats: { completed: number };
    orderStats: { count: number; revenue: number };
    incomingRide: RideRequest | null;
    setIncomingRide: (ride: RideRequest | null) => void;
    appSettings: {
        commission_percentage: number;
        max_driver_cash_amount: number;
    };
    isLocked: boolean;
    isLoading: boolean; // NEW: Loading state for initialization
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user: authUser } = useAuth(); // Renamed to avoid conflict with local 'user' state
    const [user, setUser] = useState<User | null>(null); // Local user state
    const [role, setRole] = useState<Role>('DRIVER');
    const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
    const [isOnboarded, setIsOnboarded] = useState(true); // Start as true to prevent flash
    const [isLoading, setIsLoading] = useState(true); // NEW: Loading state for initialization
    const [secondaryOnboardingRole, setSecondaryOnboardingRole] = useState<Role | null>(null);
    const [rideStats, setRideStats] = useState({ completed: 0 });
    const [orderStats, setOrderStats] = useState({ count: 0, revenue: 0 });
    const [incomingRide, setIncomingRide] = useState<RideRequest | null>(null);

    const [appSettings, setAppSettings] = useState<{
        commission_percentage: number;
        max_driver_cash_amount: number;
    }>({ commission_percentage: 10, max_driver_cash_amount: 300 });

    const uploadFile = async (file: File, bucketOverride?: string, path?: string): Promise<string | null> => {
        try {
            let bucket = bucketOverride;
            let uploadPath = path || `${Date.now()}_${file.name}`;

            if (!bucket) {
                if (role === 'DRIVER') bucket = 'driver_documents';
                else if (role === 'MERCHANT') bucket = 'business_documents';
                else bucket = 'profiles';
            }

            const { data, error } = await supabase.storage.from(bucket).upload(uploadPath, file, { upsert: true });
            if (error) throw error;
            const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
            return publicUrl;
        } catch (err) {
            console.error(`Upload error:`, err);
            return null;
        }
    };

    const loadStats = useCallback(async (userId: string) => {
        try {
            // Driver Stats
            const { count: rideCount } = await supabase.from('rides').select('*', { count: 'exact', head: true }).eq('driver_id', userId).eq('status', 'completed');
            setRideStats({ completed: rideCount || 0 });

            // Merchant Stats
            const { data: business } = await supabase.from('businesses').select('id').eq('owner_id', userId).maybeSingle();
            if (business) {
                const { count: orderCount } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('business_id', business.id);
                const { data: revenueData } = await supabase.from('orders').select('total_amount').eq('business_id', business.id);
                const totalRevenue = revenueData?.reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0) || 0;
                setOrderStats({ count: orderCount || 0, revenue: totalRevenue });
            }
        } catch (err) {
            console.error("Error loading stats:", err);
        }
    }, []);

    const loadUserData = useCallback(async (userId: string) => {
        try {
            // Fetch everything in parallel
            const [
                profileRes,
                driverRes,
                merchantRes,
                walletRes,
                driverDocsRes,
                configRes
            ] = await Promise.all([
                supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
                supabase.from('drivers').select('*').eq('id', userId).maybeSingle(),
                supabase.from('businesses').select('*').eq('owner_id', userId).maybeSingle(),
                supabase.from('wallets').select('*').eq('owner_id', userId).maybeSingle(),
                supabase.from('driver_documents').select('*').eq('driver_id', userId).maybeSingle(),
                supabase.from('app_settings').select('*').limit(1).maybeSingle()
            ]);

            const profileData = profileRes.data;
            if (!profileData) {
                setIsOnboarded(false);
                return;
            }

            const driverData = driverRes.data;
            const merchantData = merchantRes.data;
            const walletData = walletRes.data;
            const driverDocs = driverDocsRes.data;
            const config = configRes.data;

            if (config) {
                setAppSettings({
                    commission_percentage: Number(config.commission_percentage),
                    max_driver_cash_amount: Number(config.max_driver_cash_amount)
                });
            }

            const vehicleCategoryMap: Record<string, string> = {
                'tuktuk': 'SCOOTER_TUKTUK',
                'economic': 'ECONOMIC',
                'AC': 'PREMIUM'
            };

            const hasDriverData = !!driverData?.vehicle_model;
            const hasMerchantData = !!merchantData;

            // Profile image serves as the Driver/User avatar. Business logo is separate.
            const displayImage = profileData.avatar_url;

            const mergedProfile: UserProfile = {
                name: profileData.full_name || '',
                phone: profileData.phone || '',
                email: profileData.email || '',
                age: profileData.age,
                gender: profileData.gender,
                image: displayImage,
                driverProfilePic: driverData?.profile_picture,
                rating: profileData.average_rating || 5.0,
                commissionDebt: driverData?.commission_debt || 0,
                walletBalance: walletData?.balance || 0,
                isOnline: driverData?.is_online || false,
                location: profileData.location,
                vehicle: driverData?.vehicle_model ? {
                    model: driverData.vehicle_model,
                    plate: driverData.vehicle_plate,
                    color: driverData.vehicle_color,
                    type: (vehicleCategoryMap[driverData.vehicle_category] || 'ECONOMIC') as any,
                    seats: driverData.vehicle_category === 'tuktuk' ? 2 : 4,
                    hasAC: driverData.vehicle_category === 'AC',
                    images: []
                } : undefined,
                business: merchantData ? {
                    businessName: merchantData.name,
                    category: merchantData.category || 'Restaurant',
                    logo: merchantData.image_url || '',
                    workingHours: { start: '09:00', end: '21:00' },
                    workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
                    phone: profileData.phone || '',
                    eWallet: 'Wave',
                    subCategories: [],
                    address: merchantData.location_address,
                    lat: merchantData.lat,
                    lng: merchantData.lng,
                    paymentPhone: merchantData.payment_phone || ''
                } : undefined,
                documents: {
                    license: { url: driverDocs?.license_url || '', status: (driverDocs?.status as any) || 'MISSING' },
                    idCard: { url: driverDocs?.id_card_url || merchantData?.id_card_url || '', status: (driverDocs?.status as any) || 'MISSING' },
                    insurance: { url: driverDocs?.insurance_url || '', status: (driverDocs?.status as any) || 'MISSING' },
                    permit: { url: driverDocs?.permit_url || '', status: (driverDocs?.status as any) || 'MISSING' }
                },
                currentLat: driverData?.current_lat,
                currentLng: driverData?.current_lng,
                heading: driverData?.heading,
                isSuspended: driverData?.is_suspended || false
            };

            setProfile(mergedProfile);
            await loadStats(userId);

            // Access Granted: if they are in drivers or businesses tables
            // This bypasses the need for user_roles table
            const isActuallyOnboarded = hasDriverData || hasMerchantData;
            setIsOnboarded(isActuallyOnboarded);

            // Determine active role
            if (profileData.active_role && ['DRIVER', 'MERCHANT', 'CUSTOMER'].includes(profileData.active_role)) {
                setRole(profileData.active_role as Role);
            } else if (hasDriverData && hasMerchantData) {
                setRole('DRIVER');
            } else if (hasDriverData) {
                setRole('DRIVER');
            } else if (hasMerchantData) {
                setRole('MERCHANT');
            } else {
                setRole('CUSTOMER');
            }

        } catch (err) {
            console.error("Error loading user data:", err);
            setIsOnboarded(false);
        }
    }, [loadStats]);

    const updateActiveRole = async (newRole: Role) => {
        setRole(newRole);

        if (user) {
            await supabase.from('profiles').update({ active_role: newRole }).eq('id', user.id);
        }
    };

    useEffect(() => {
        // Handler for auth state changes
        const handleAuthChange = async (session: any) => {
            try {
                const currentUser = session?.user || null;
                setUser(currentUser);

                if (currentUser) {
                    // Centralized loading from primary tables
                    await loadUserData(currentUser.id);
                } else {
                    setIsOnboarded(false);
                }
            } catch (error) {
                console.error('Auth check error:', error);
                setIsOnboarded(false);
            } finally {
                setIsLoading(false);
            }
        };

        // Check session immediately on mount
        supabase.auth.getSession().then(({ data: { session } }) => {
            handleAuthChange(session);
        });

        // Listen for auth state changes
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            handleAuthChange(session);
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, [loadUserData]);

    useEffect(() => {
        if (user) {
            // Get OneSignal Player ID and save to database
            // OneSignal is already initialized in index.html
            setTimeout(() => {
                window.OneSignalDeferred?.push(async (OneSignal: any) => {
                    try {
                        const userId = await OneSignal.User.PushSubscription.id;
                        if (userId) {
                            await supabase.from('profiles')
                                .update({ onesignal_player_id: userId })
                                .eq('id', user.id);
                        }
                    } catch (error) {
                        console.error('Error saving OneSignal player ID:', error);
                    }
                });
            }, 2000); // Wait 2 seconds for OneSignal to fully initialize
        } else {
            setIsOnboarded(false);
        }
    }, [user, loadUserData]);

    // Real-time Location Sync (watchPosition when online)
    useEffect(() => {
        let watchId: number | null = null;

        if (isOnboarded && role === 'DRIVER' && profile.isOnline && user) {
            if ("geolocation" in navigator) {
                watchId = navigator.geolocation.watchPosition(
                    async (position) => {
                        const { latitude, longitude, heading } = position.coords;
                        // Local update for map responsiveness
                        updateProfile({ currentLat: latitude, currentLng: longitude, heading: heading || 0 });
                        // Sync to DB
                        await supabase.from('drivers').update({
                            current_lat: latitude,
                            current_lng: longitude,
                            heading: heading || 0,
                        }).eq('id', user.id);
                    },
                    (err) => console.error("Location watch error:", err),
                    { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
                );
            }
        }

        return () => {
            if (watchId !== null) navigator.geolocation.clearWatch(watchId);
        };
    }, [isOnboarded, role, profile.isOnline, user]);

    // Compass/Device Orientation logic moved to DriverHome/Map for performance (prevent global re-renders)

    // Real-time Driver Status Sync (Handle DB Trigger Updates)
    const lastToggleTime = useRef<number>(0); // Moved here to be accessible by toggleOnlineStatus
    useEffect(() => {
        if (!user || role !== 'DRIVER') return;

        const channel = supabase
            .channel('public:drivers_status')
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'drivers',
                filter: `id=eq.${user.id}`
            }, (payload) => {
                const newData = payload.new;
                // Ignore updates if a manual toggle was performed in the last 2 seconds (prevents flicker)
                if (Date.now() - lastToggleTime.current < 2000) return;

                if (newData && typeof newData.is_online === 'boolean') {
                    setProfile(prev => ({ ...prev, isOnline: newData.is_online }));
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, role]);

    // Real-time Ride Request Listener (Tiered Dispatch / Expanding Radius)
    useEffect(() => {
        if (!user || role !== 'DRIVER' || !profile.isOnline) return;

        const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
            const R = 6371; // km
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLon = (lon2 - lon1) * Math.PI / 180;
            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return R * c;
        };

        const channel = supabase
            .channel('public:rides_dispatch')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'rides',
                filter: `status=eq.pending`
            }, (payload) => {
                const newRide = payload.new;
                handleNewRide(newRide);
            })
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    fetchPendingRides();
                }
                if (status === 'CHANNEL_ERROR') {
                    console.error('Realtime channel error - connection may be unstable');
                }
            });

        const fetchPendingRides = async () => {
            const { data: pendingRides } = await supabase
                .from('rides')
                .select('*')
                .eq('status', 'pending')
                .order('created_at', { ascending: false })
                .limit(1); // Just get the latest one for now to avoid spam

            if (pendingRides && pendingRides.length > 0) {
                handleNewRide(pendingRides[0]);
            }
        };

        const handleNewRide = (newRide: any) => {
            const startTime = new Date().getTime();

            // Interval to check distance with expanding radius
            const checkInterval = setInterval(() => {
                if (!profile.currentLat || !profile.currentLng) return;

                const distance = calculateDistance(
                    profile.currentLat,
                    profile.currentLng,
                    newRide.pickup_lat,
                    newRide.pickup_lng
                );

                // Radius starts at 3km and increases by 2km every 5 seconds
                const elapsedSeconds = (new Date().getTime() - startTime) / 1000;
                const dynamicRadius = 3 + (Math.floor(elapsedSeconds / 5) * 2);

                if (distance <= dynamicRadius) {
                    setIncomingRide({
                        id: newRide.id,
                        passengerName: 'New Request',
                        rating: 4.8,
                        rideCount: 124,
                        pickupDistance: `${distance.toFixed(1)} km`,
                        destination: newRide.dropoff_address,
                        price: parseFloat(newRide.price),
                        pickupLocation: newRide.pickup_address,
                        type: newRide.type
                    } as any);
                    clearInterval(checkInterval);
                }

                // Stop checking after 60 seconds (dispatch timeout)
                if (elapsedSeconds > 60) clearInterval(checkInterval);
            }, 2000);
        };

        return () => {
            try {
                supabase.removeChannel(channel);
            } catch (error) {
                console.error('Error removing channel:', error);
            }
        };
    }, [user, role, profile.isOnline, profile.currentLat, profile.currentLng]);

    const completeOnboarding = async (targetProfile?: UserProfile) => {
        const activeProfile = targetProfile || profile;
        if (!user) {
            setIsOnboarded(true);
            return;
        }

        try {
            // Determine the final role (driver, merchant, or both)
            let finalRole = role.toLowerCase();
            const existingRole = (await supabase.from('profiles').select('role').eq('id', user.id).single()).data?.role;

            if (existingRole === 'both' || secondaryOnboardingRole || (activeProfile.vehicle && activeProfile.business) || (existingRole === 'driver' && activeProfile.business) || (existingRole === 'merchant' && activeProfile.vehicle)) {
                finalRole = 'both';
            } else {
                if (activeProfile.vehicle) finalRole = 'driver';
                else if (activeProfile.business) finalRole = 'merchant';
            }

            // 1. Sync Base Profile
            const { error: profileError } = await supabase.from('profiles').update({
                onboarded: true,
                role: finalRole,
                active_role: finalRole === 'both' ? 'DRIVER' : finalRole.toUpperCase()
            }).eq('id', user.id);
            if (profileError) throw profileError;

            // 2. Sync Driver Data if exists
            if (activeProfile.vehicle) {
                const vehicleMapping: Record<string, string> = {
                    'SCOOTER_TUKTUK': 'tuktuk',
                    'ECONOMIC': 'economic',
                    'PREMIUM': 'AC'
                };

                const categoryValue = vehicleMapping[activeProfile.vehicle?.type || 'ECONOMIC'] || 'economic';

                const { error: driverError } = await supabase.from('drivers').upsert({
                    id: user.id,
                    vehicle_model: activeProfile.vehicle?.model,
                    vehicle_plate: activeProfile.vehicle?.plate,
                    vehicle_color: activeProfile.vehicle?.color,
                    vehicle_category: categoryValue,
                    is_online: activeProfile.isOnline,
                    approval_status: 'pending',
                    submitted_at: new Date().toISOString()
                }, { onConflict: 'id' });
                if (driverError) console.error("Driver Sync Error:", driverError);

                if (activeProfile.documents.license?.url || activeProfile.documents.idCard?.url || activeProfile.documents.insurance?.url) {
                    const { error: docsError } = await supabase.from('driver_documents').upsert({
                        driver_id: user.id,
                        id_card_url: activeProfile.documents.idCard?.url,
                        drivers_license_url: activeProfile.documents.license?.url,
                        vehicle_insurance_url: activeProfile.documents.insurance?.url,
                        status: 'pending'
                    }, { onConflict: 'driver_id' });
                    if (docsError) console.error("Driver Docs Sync Error:", docsError);
                }
            }

            if (activeProfile.business) {
                const { error: businessError } = await supabase.from('businesses').upsert({
                    owner_id: user.id,
                    name: activeProfile.business?.businessName || 'Unnamed Business',
                    category: activeProfile.business?.category,
                    location_address: activeProfile.business?.address,
                    image_url: activeProfile.business?.logo,
                    lat: activeProfile.business?.lat,
                    lng: activeProfile.business?.lng,
                    payment_phone: activeProfile.business?.paymentPhone,
                    submitted_at: new Date().toISOString(),
                    approval_status: 'pending'
                }, { onConflict: 'owner_id' });
                if (businessError) console.error("Business Sync Error:", businessError);

                if (activeProfile.documents.idCard?.url) {
                    const { error: merchDocError } = await supabase.from('merchant_documents').upsert({
                        merchant_id: user.id,
                        id_card_url: activeProfile.documents.idCard.url,
                        status: 'pending'
                    }, { onConflict: 'merchant_id' });
                    if (merchDocError) console.error("Merchant Doc Sync Error:", merchDocError);
                }
            }

            setIsOnboarded(true);
            setSecondaryOnboardingRole(null);
        } catch (err) {
            console.error("Onboarding Sync Error:", err);
            // Don't set onboarded true on error to allow retry
        }
    };

    const syncProfile = async (targetProfile: UserProfile = profile) => {
        if (!user) return;

        try {
            // 1. Sync Base Profile
            // Only update avatar_url if the User Profile Image (Driver Photo) has changed.
            // Business Logo updates are handled separately in 'businesses' table update.

            const profileUpdates: any = {
                full_name: targetProfile.name,
                avatar_url: targetProfile.image, // Strictly Driver/User avatar
                location: targetProfile.location,
            };

            const { error: profileError } = await supabase.from('profiles').update(profileUpdates).eq('id', user.id);
            if (profileError) throw profileError;

            // 2. Sync Driver Data if exists
            if (targetProfile.vehicle) {
                const vehicleMapping: Record<string, string> = {
                    'SCOOTER_TUKTUK': 'tuktuk',
                    'ECONOMIC': 'economic',
                    'PREMIUM': 'AC'
                };
                const { error: driverError } = await supabase.from('drivers').update({
                    vehicle_model: targetProfile.vehicle.model,
                    vehicle_plate: targetProfile.vehicle.plate,
                    vehicle_color: targetProfile.vehicle.color,
                    vehicle_category: vehicleMapping[targetProfile.vehicle.type] || 'economic',
                    is_online: targetProfile.isOnline,
                    profile_picture: targetProfile.driverProfilePic
                }).eq('id', user.id);
                if (driverError) console.error("Driver Sync Error:", driverError);

                // Sync Driver Docs
                if (targetProfile.documents.license?.url || targetProfile.documents.idCard?.url || targetProfile.documents.insurance?.url) {
                    await supabase.from('driver_documents').upsert({
                        driver_id: user.id,
                        id_card_url: targetProfile.documents.idCard?.url,
                        drivers_license_url: targetProfile.documents.license?.url,
                        vehicle_insurance_url: targetProfile.documents.insurance?.url,
                    }, { onConflict: 'driver_id' });
                }
            }

            // 3. Sync Merchant Data if exists
            if (targetProfile.business) {
                const { error: businessError } = await supabase.from('businesses').update({
                    name: targetProfile.business.businessName,
                    category: targetProfile.business.category,
                    location_address: targetProfile.business.address,
                    image_url: targetProfile.business.logo,
                    lat: targetProfile.business.lat,
                    lng: targetProfile.business.lng,
                    payment_phone: targetProfile.business.paymentPhone,
                }).eq('owner_id', user.id);
                if (businessError) console.error("Business Sync Error:", businessError);

                // Sync Merchant Doc (ID Card only)
                if (targetProfile.documents.idCard?.url) {
                    await supabase.from('merchant_documents').upsert({
                        merchant_id: user.id,
                        id_card_url: targetProfile.documents.idCard.url,
                    }, { onConflict: 'merchant_id' });
                }
            }
        } catch (err) {
            console.error("Profile Sync Error:", err);
        }
    };

    const updateProfile = (updates: Partial<UserProfile>) => setProfile(prev => ({ ...prev, ...updates }));

    const toggleOnlineStatus = async () => {
        if (!user) return;

        const newStatus = !profile.isOnline;
        lastToggleTime.current = Date.now();

        // Optimistic local update
        setProfile(prev => ({ ...prev, isOnline: newStatus }));

        try {
            const { error } = await supabase.from('drivers').update({ is_online: newStatus }).eq('id', user.id);
            if (error) {
                // Rollback on error
                setProfile(prev => ({ ...prev, isOnline: !newStatus }));
                console.error("Failed to toggle status:", error);
            }
        } catch (err) {
            setProfile(prev => ({ ...prev, isOnline: !newStatus }));
        }
    };
    const payCommission = async () => {
        if (!user || profile.commissionDebt <= 0) return;
        const amountToPay = profile.commissionDebt;

        try {
            // 1. Call Supabase Edge Function to Create Wave Session
            const { data, error } = await supabase.functions.invoke('create-wave-checkout', {
                body: {
                    amount: amountToPay,
                    driverId: user.id
                }
            });

            if (error) throw error;
            if (!data?.checkout_url) throw new Error("No checkout URL returned");

            // 2. Open Wave Checkout
            window.open(data.checkout_url, '_blank');

            // 3. User feedback
            console.log("Redirected to Wave Checkout:", data.checkout_url);

        } catch (err: any) {
            console.error("Error initiating Wave payment:", err);
            alert("Error: " + (err.message || "Failed to initiate payment"));
        }
    };

    const signOut = async () => {
        const hasBothRoles = profile.vehicle && profile.business;
        if (hasBothRoles) {
            if (sessionStorage.getItem('partner_did_toggle_once')) {
                sessionStorage.removeItem('partner_did_toggle_once');
                await supabase.auth.signOut();
            } else {
                sessionStorage.setItem('partner_did_toggle_once', 'true');
                const nextRole = role === 'DRIVER' ? 'MERCHANT' : 'DRIVER';
                updateActiveRole(nextRole);
            }
        } else {
            await supabase.auth.signOut();
        }
    };

    return (
        <ProfileContext.Provider value={{
            role, setRole, profile, setProfile, updateProfile, isOnboarded, completeOnboarding: (p?: UserProfile) => completeOnboarding(p),
            secondaryOnboardingRole, startSecondaryOnboarding: (r) => { setRole(r); setSecondaryOnboardingRole(r); },
            cancelSecondaryOnboarding: () => setSecondaryOnboardingRole(null),
            toggleOnlineStatus, payCommission, signOut, uploadFile, loadUserData, syncProfile, updateActiveRole,
            rideStats, orderStats, incomingRide, setIncomingRide, appSettings,
            isLocked: (profile.commissionDebt > appSettings.max_driver_cash_amount) || profile.isSuspended,
            isLoading
        }}>
            {children}
        </ProfileContext.Provider>
    );
};

export const useProfile = () => {
    const context = useContext(ProfileContext);
    if (context === undefined) throw new Error('useProfile must be used within a ProfileProvider');
    return context;
};
