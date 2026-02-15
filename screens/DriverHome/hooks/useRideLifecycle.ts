
import { useEffect, useRef } from 'react';
import { supabase } from '../../../lib/supabase';

export const useRideLifecycle = (
    user: any,
    profile: any,
    currentRide: any,
    setCurrentRide: (ride: any) => void,
    rideStatus: string,
    setRideStatus: (status: string) => void,
    incomingRide: any,
    setIncomingRide: (ride: any) => void,
    rejectedRideIds: Set<string>,
    setRejectedRideIds: (ids: any) => void,
    pushNotification: any,
    setShowRatingModal: (val: boolean) => void,
    setHasCollectedPayment: (val: boolean) => void,
    setUserRating: (val: number) => void,
    userRating: number,
    setIsDrawerExpanded: (val: boolean) => void,
    appSettings: any,
    syncProfile: () => Promise<void>,
    setCountdown: (val: any) => void,
    calculateDistance: (lat1: number, lon1: number, lat2: number, lon2: number) => number
) => {
    const ringingInterval = useRef<any>(null);

    const notifyCustomer = async (title: string, message: string) => {
        if (!currentRide?.customer_id) return;
        try {
            const { data: customerProfile } = await supabase
                .from('profiles')
                .select('fcm_token')
                .eq('id', currentRide.customer_id)
                .single();

            if (customerProfile?.fcm_token) {
                await supabase.functions.invoke('send-fcm-notification', {
                    body: {
                        tokens: [customerProfile.fcm_token],
                        title,
                        message,
                        target: 'customer',
                        data: { ride_id: currentRide.id }
                    }
                });
            }
        } catch (e) {
            console.error("Error notifying customer with FCM:", e);
        }
    };

    const handleAcceptRide = async () => {
        if (!currentRide || !user) return;
        setRideStatus('ACCEPTED');
        const { error } = await supabase
            .from('rides')
            .update({ status: 'accepted', driver_id: user.id })
            .eq('id', currentRide.id);

        if (error) {
            console.error("Error accepting ride:", error);
            pushNotification('Error', 'Could not accept ride. Please try again.', 'SYSTEM');
            setRideStatus('RINGING');
            return;
        }
        pushNotification('Ride Accepted', `Navigating to pickup`, 'SYSTEM');
        setIncomingRide(null);
    };

    const handleArrivedAtPickup = async () => {
        if (!currentRide) return;
        setRideStatus('ARRIVED');
        await supabase.from('rides').update({ status: 'arrived' }).eq('id', currentRide.id);
        pushNotification('You have Arrived', 'Notify the passenger you are here.', 'SYSTEM');
        notifyCustomer('Driver Arrived', 'Your driver has arrived at the pickup location!');
    };

    const handleStartRide = async () => {
        if (!currentRide) return;
        setRideStatus('NAVIGATING');
        setIsDrawerExpanded(false);
        await supabase.from('rides').update({ status: 'in-progress' }).eq('id', currentRide.id);
        pushNotification('Ride Started', 'Destination revealed. Drive safely!', 'RIDE');
        notifyCustomer('Trip Started', 'Your driver has started the trip. Enjoy the ride!');
        if (user && !profile.isOnline) {
            await supabase.from('drivers').update({ is_online: true }).eq('id', user.id);
        }
    };

    const handleCompleteRide = async (isAuto = false) => {
        if (!currentRide || !user) return;
        try {
            setRideStatus('COMPLETED');
            setIsDrawerExpanded(true);
            const { data, error } = await supabase.rpc('complete_ride', {
                p_ride_id: currentRide.id,
                p_driver_id: user.id,
                p_actual_lat: profile.currentLat || 0,
                p_actual_lng: profile.currentLng || 0,
                p_is_auto: isAuto
            });
            if (error) throw error;
            if (!data.success) throw new Error(data.error);

            setCurrentRide(prev => prev ? { ...prev, price: data.final_price } : null);

            if (data.final_price > 0) {
                notifyCustomer('Trip Completed', 'You have arrived at your destination. Thank you for riding!');
                pushNotification('Ride Completed', `Total: ${appSettings.currency_symbol}${data.final_price}`, 'RIDE');
            } else {
                notifyCustomer('Ride Cancelled', 'The ride was ended with zero movement.');
                pushNotification('Ride Ended', 'No movement detected. Ride cancelled.', 'SYSTEM');
                setRideStatus('IDLE');
                setCurrentRide(null);
                setIsDrawerExpanded(false);
                return;
            }
            await syncProfile();
        } catch (e: any) {
            console.error("Error completing ride via RPC:", e);
            pushNotification('Error', e.message || 'Failed to complete ride properly.', 'SYSTEM');
        }
    };

    const submitRating = async () => {
        if (currentRide && user) {
            if (userRating > 0) {
                try {
                    await supabase.from('reviews').insert({
                        ride_id: currentRide.id,
                        reviewer_id: user.id,
                        target_id: currentRide.customer_id,
                        rating: userRating,
                        role_target: 'CUSTOMER'
                    });
                } catch (err) {
                    console.error("Error saving rating:", err);
                }
            }
        }
        setCurrentRide(null);
        setIncomingRide(null);
        setRideStatus('IDLE');
        setIsDrawerExpanded(false);
        setShowRatingModal(false);
        setHasCollectedPayment(false);
        setUserRating(0);
    };

    const handleSkipRating = () => {
        setCurrentRide(null);
        setIncomingRide(null);
        setRideStatus('IDLE');
        setIsDrawerExpanded(false);
        setShowRatingModal(false);
        setHasCollectedPayment(false);
        setUserRating(0);
    };

    const handleCollectPayment = () => setShowRatingModal(true);

    // Effects
    useEffect(() => {
        if (incomingRide && !currentRide && !rejectedRideIds.has(incomingRide.id)) {
            setCurrentRide(incomingRide);
            setRideStatus('RINGING');
            setCountdown(15);
            pushNotification('New Request Received!', 'A user needs assistance nearby.', 'RIDE');
        }
    }, [incomingRide, currentRide, rejectedRideIds]);

    useEffect(() => {
        if (!currentRide) return;
        const channel = supabase
            .channel(`ride_status_${currentRide.id}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'rides',
                filter: `id=eq.${currentRide.id}`
            }, (payload) => {
                const updatedRide = payload.new;
                if (updatedRide.status === 'cancelled') {
                    pushNotification('Ride Cancelled', 'The customer has cancelled the ride.', 'SYSTEM');
                    setCurrentRide(null);
                    setRideStatus('IDLE');
                    setIsDrawerExpanded(false);
                }
            })
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [currentRide]);

    useEffect(() => {
        if (rideStatus === 'NAVIGATING' && currentRide?.dropoff_lat && currentRide?.dropoff_lng && profile.currentLat && profile.currentLng) {
            const dist = calculateDistance(profile.currentLat, profile.currentLng, currentRide.dropoff_lat, currentRide.dropoff_lng);
            if (dist < 0.2) handleCompleteRide(true);
        }
    }, [profile.currentLat, profile.currentLng, rideStatus, currentRide]);

    useEffect(() => {
        if (rideStatus === 'RINGING') {
            ringingInterval.current = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(ringingInterval.current);
                        setCurrentRide(null);
                        setIncomingRide(null);
                        setRideStatus('IDLE');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            if (ringingInterval.current) clearInterval(ringingInterval.current);
        }
        return () => { if (ringingInterval.current) clearInterval(ringingInterval.current); };
    }, [rideStatus]);

    return {
        handleAcceptRide,
        handleArrivedAtPickup,
        handleStartRide,
        handleCompleteRide,
        handleCollectPayment,
        submitRating,
        handleSkipRating,
        notifyCustomer
    };
};
