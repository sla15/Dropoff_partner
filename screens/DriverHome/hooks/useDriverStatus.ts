
import { supabase } from '../../../lib/supabase';

export const useDriverStatus = (
    profile: any,
    toggleOnlineStatus: () => void,
    currentRide: any,
    setCurrentRide: (ride: any) => void,
    rideStatus: string,
    setRideStatus: (status: string) => void,
    setIncomingRide: (ride: any) => void,
    handleCompleteRide: () => Promise<void>
) => {
    const handleToggleOnline = async () => {
        const newOnlineStatus = !profile.isOnline;

        if (!newOnlineStatus && currentRide) {
            if (rideStatus === 'ACCEPTED' || rideStatus === 'ARRIVED' || rideStatus === 'RINGING') {
                await supabase.from('rides').update({ status: 'cancelled' }).eq('id', currentRide.id);
                setIncomingRide(null);
            } else if (rideStatus === 'NAVIGATING') {
                await handleCompleteRide();
            }
            setCurrentRide(null);
            setRideStatus('IDLE');
        }

        if (profile.isOnline && rideStatus === 'RINGING') {
            setCurrentRide(null);
            setRideStatus('IDLE');
        }
        toggleOnlineStatus();
    };

    return { handleToggleOnline };
};
