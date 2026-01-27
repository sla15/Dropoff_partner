
import React, { useState, useEffect, useRef } from 'react';
import { Star, Power, MessageSquare, X, Navigation, CheckCircle, Wallet, MapPin, ArrowRight, AlertTriangle, User, Move, MoreVertical, Clock, XCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RIDE_REQUESTS } from '../data/dummyData';
import { RideRequest } from '../types';
import { RideDrawer } from '../components/RideDrawer';
import { supabase } from '../lib/supabase';

const VEHICLE_ICONS = {
  ECONOMIC: '/assets/car_economic_3d.png',
  SCOOTER_TUKTUK: '/assets/car_scooter_3d.png',
  PREMIUM: '/assets/car_premium_3d.png',
};

// Persistent Map Container to prevent reloading
let persistentMapDiv: HTMLDivElement | null = null;
let persistentMapInstance: any = null;
let persistentMarker: any = null;

export const DriverHome: React.FC = () => {
  const {
    profile,
    toggleOnlineStatus,
    payCommission,
    pushNotification,
    openChat,
    currentRide,
    setCurrentRide,
    rideStatus,
    setRideStatus,
    updateActiveRole,
    rideStats,
    orderStats,
    isDarkMode,
    user,
    incomingRide,
    setIncomingRide,
    appSettings,
    isLocked,
    setCurrentTab,
  } = useApp();

  const [isDrawerExpanded, setIsDrawerExpanded] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [countdown, setCountdown] = useState(15);
  const [showDirections, setShowDirections] = useState(false);
  const [navigationInfo, setNavigationInfo] = useState({ distance: '...', duration: '...' });

  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapInstance = useRef<any>(null);
  const driverMarker = useRef<any>(null);
  const directionsRenderer = useRef<any>(null);
  const directionsService = useRef<any>(null);

  const APP_WIDTH = Math.min(window.innerWidth, 448);
  const [dragPos, setDragPos] = useState({ x: APP_WIDTH - 70, y: 100 });
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const ringingInterval = useRef<any>(null);


  // Initialize Map and Services with Persistence
  useEffect(() => {
    const google = (window as any).google;
    if (!google || !google.maps || !mapRef.current) return;

    try {
      if (!persistentMapDiv) {
        persistentMapDiv = document.createElement('div');
        persistentMapDiv.style.width = '100%';
        persistentMapDiv.style.height = '100%';

        // Ensure clean state
        persistentMarker = null;

        const center = { lat: 13.4432, lng: -16.6776 };
        persistentMapInstance = new google.maps.Map(persistentMapDiv, {
          center,
          zoom: 17,
          disableDefaultUI: true,
          gestureHandling: 'greedy',
          mapId: '6c276b29bd3b4cd8'
        });

        const vehicleType = profile.vehicle?.type || 'ECONOMIC';
        const iconUrl = VEHICLE_ICONS[vehicleType as keyof typeof VEHICLE_ICONS];

        try {
          if (google.maps.marker && google.maps.marker.AdvancedMarkerElement) {
            const carWrapper = document.createElement('div');
            const isPremium = vehicleType === 'PREMIUM';
            const labelText = vehicleType === 'SCOOTER_TUKTUK' ? 'Scooter' :
              vehicleType === 'ECONOMIC' ? 'Economic' : 'Premium';

            carWrapper.style.pointerEvents = 'none';
            carWrapper.innerHTML = `
              <div style="display: flex; flex-direction: column; align-items: center; filter: drop-shadow(0 10px 8px rgba(0,0,0,0.3));">
                <img src="${iconUrl}" style="width: 50px; height: 50px; object-fit: contain; transform: rotate(${profile.heading || 0}deg); transform-origin: center center;" />
              </div>
            `;

            persistentMarker = new google.maps.marker.AdvancedMarkerElement({
              position: center,
              map: persistentMapInstance,
              content: carWrapper,
              zIndex: 100
            });
          }
        } catch (markerError) {
          console.warn('Advanced Marker Error', markerError);
        }

        driverMarker.current = persistentMarker;
      }

      // VITAL: Re-attach persistent map to DOM
      if (mapRef.current && persistentMapDiv && !mapRef.current.contains(persistentMapDiv)) {
        mapRef.current.appendChild(persistentMapDiv);
      }

      // VITAL: Restore references
      googleMapInstance.current = persistentMapInstance;
      driverMarker.current = persistentMarker;

      // Force Marker Map Attachment & Icon Update on Remount
      if (driverMarker.current && persistentMapInstance) {
        if (driverMarker.current.map !== persistentMapInstance) {
          driverMarker.current.map = persistentMapInstance;
        }
        // Force immediate icon refresher
        const currentIcon = VEHICLE_ICONS[(profile.vehicle?.type || 'ECONOMIC') as keyof typeof VEHICLE_ICONS];
        if (driverMarker.current.content) {
          const img = driverMarker.current.content.querySelector('img');
          if (img && img.src !== currentIcon) img.src = currentIcon;
        }
      }

      if (!directionsService.current) directionsService.current = new google.maps.DirectionsService();
      if (!directionsRenderer.current) {
        directionsRenderer.current = new google.maps.DirectionsRenderer({
          map: googleMapInstance.current,
          suppressMarkers: false,
          polylineOptions: { strokeColor: '#000000', strokeWeight: 5, strokeOpacity: 0.8 }
        });
      }
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }, [isDarkMode]);

  const [isFollowing, setIsFollowing] = useState(true);

  // Smooth Moving & Rotating System
  useEffect(() => {
    if (!profile.isOnline || !googleMapInstance.current) return;

    // 1. Compass / Phone Rotation Logic (Direct DOM manipulation for 60fps performance)
    const handleOrientation = (event: any) => {
      if (!driverMarker.current || !driverMarker.current.content) return;

      let heading = 0;
      if (event.webkitCompassHeading) {
        heading = event.webkitCompassHeading;
      } else if (event.alpha) {
        heading = (360 - event.alpha) % 360;
      }

      const img = driverMarker.current.content.querySelector('img');
      if (img && heading) {
        // Direct style update - no React render
        img.style.transform = `rotate(${heading}deg)`;
      }
    };

    // Initialize Compass Listener
    const startCompass = async () => {
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        try {
          const perms = await (DeviceOrientationEvent as any).requestPermission();
          if (perms === 'granted') window.addEventListener('deviceorientation', handleOrientation);
        } catch (e) { console.warn(e); }
      } else {
        window.addEventListener('deviceorientation', handleOrientation);
      }
    };
    startCompass();

    // 2. Smooth Position Interpolation
    const targetPos = { lat: profile.currentLat || 13.4432, lng: profile.currentLng || -16.6776 };

    // Store previous position in ref to interpolate from
    const currentPosRef = driverMarker.current?.position || targetPos;
    let animationFrameId: number;
    let startTime: number;
    const duration = 1000; // Interpolate over 1 second (approx time between GPS updates)

    const animateMarker = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      if (driverMarker.current) {
        const lat = currentPosRef.lat + (targetPos.lat - currentPosRef.lat) * progress;
        const lng = currentPosRef.lng + (targetPos.lng - currentPosRef.lng) * progress;
        const nextPos = { lat, lng };

        if (typeof driverMarker.current.setPosition === 'function') {
          driverMarker.current.setPosition(nextPos);
        } else {
          driverMarker.current.position = nextPos;
        }

        // Auto-follow logic inside animation loop for smoothness
        if (isFollowing && !currentRide) {
          googleMapInstance.current.panTo(nextPos);
        }
      }

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animateMarker);
      } else {
        // Animation complete, save final pos as start for next jump
        if (driverMarker.current) driverMarker.current.position = targetPos; // Hard snap at end to be precise
      }
    };

    animationFrameId = requestAnimationFrame(animateMarker);

    // Update Icon Type if changed
    const vehicleType = profile.vehicle?.type || 'ECONOMIC';
    const iconUrl = VEHICLE_ICONS[vehicleType as keyof typeof VEHICLE_ICONS];
    if (driverMarker.current && driverMarker.current.content) {
      const img = driverMarker.current.content.querySelector('img');
      if (img && img.src !== iconUrl) img.src = iconUrl;
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      cancelAnimationFrame(animationFrameId);
    };
  }, [profile.currentLat, profile.currentLng, profile.isOnline, profile.vehicle?.type, isFollowing, currentRide]);

  // Directions Logic
  useEffect(() => {
    if (!directionsRenderer.current || !currentRide || (rideStatus !== 'ACCEPTED' && rideStatus !== 'NAVIGATING')) {
      if (directionsRenderer.current) directionsRenderer.current.setDirections({ routes: [] });
      return;
    }

    const google = (window as any).google;
    directionsService.current.route({
      origin: { lat: profile.currentLat, lng: profile.currentLng },
      destination: rideStatus === 'NAVIGATING' ? currentRide.destination : currentRide.pickupLocation,
      travelMode: google.maps.TravelMode.DRIVING,
    }, (result: any, status: any) => {
      if (status === 'OK') {
        directionsRenderer.current.setDirections(result);
        setNavigationInfo({ distance: result.routes[0].legs[0].distance.text, duration: result.routes[0].legs[0].duration.text });
      }
    });
  }, [rideStatus, currentRide, profile.currentLat, profile.currentLng]);

  // Ride Request Sync (Internal context -> Screen state)
  // Ride Request Sync (Internal context -> Screen state)
  useEffect(() => {
    if (incomingRide && !currentRide) {
      setCurrentRide(incomingRide);
      setRideStatus('RINGING');
      setCountdown(15);
      pushNotification('New Request Received!', 'A user needs assistance nearby.', 'RIDE');
    }
  }, [incomingRide, currentRide]);

  // Ringing Countdown
  useEffect(() => {
    if (rideStatus === 'RINGING') {
      ringingInterval.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(ringingInterval.current);
            setCurrentRide(null);
            setIncomingRide(null); // Clear from global context too
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

  const handleToggleOnline = () => {
    if (profile.isOnline && rideStatus === 'RINGING') {
      setCurrentRide(null);
      setRideStatus('IDLE');
    }
    toggleOnlineStatus();
  };

  const handleDragStart = (e: React.TouchEvent | React.MouseEvent) => {
    isDragging.current = true;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    dragOffset.current = { x: clientX - dragPos.x, y: clientY - dragOffset.current.x };
  };

  const handleDragMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging.current) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    const newX = Math.min(Math.max(0, clientX - dragOffset.current.x), APP_WIDTH - 60);
    const newY = Math.min(Math.max(50, clientY - dragOffset.current.y), window.innerHeight - 150);
    setDragPos({ x: newX, y: newY });
  };

  const handleDragEnd = () => { isDragging.current = false; };

  // Added toggleDrawer to fix "Cannot find name toggleDrawer" error
  const toggleDrawer = () => setIsDrawerExpanded(!isDrawerExpanded);

  const handleAcceptRide = async () => {
    if (!currentRide || !user) return;

    setRideStatus('ACCEPTED');

    // Persist acceptance to Supabase
    const { error } = await supabase
      .from('rides')
      .update({
        status: 'accepted',
        driver_id: user.id
      })
      .eq('id', currentRide.id);

    if (error) {
      console.error("Error accepting ride:", error);
      pushNotification('Error', 'Could not accept ride. Please try again.', 'SYSTEM');
      setRideStatus('RINGING');
      return;
    }

    pushNotification('Ride Accepted', `Navigating to pickup`, 'SYSTEM');
  };

  const handleArrivedAtPickup = () => {
    setRideStatus('ARRIVED');
    pushNotification('You have Arrived', 'Notify the passenger you are here.', 'SYSTEM');
  };

  const handleStartRide = async () => {
    setRideStatus('NAVIGATING');
    setIsDrawerExpanded(false);
    pushNotification('Ride Started', 'Destination revealed. Drive safely!', 'RIDE');

    // Safety sync: Ensure driver is marked as online when ride starts
    if (user && !profile.isOnline) {
      await supabase.from('drivers').update({ is_online: true }).eq('id', user.id);
    }
  };

  const handleCompleteRide = async () => {
    setRideStatus('COMPLETED');
    setIsDrawerExpanded(true);

    if (currentRide && user) {
      try {
        const percentage = appSettings.commission_percentage || 10;
        const commissionAmount = (currentRide.price * percentage) / 100;
        const driverEarnings = currentRide.price;

        const { data: driverData } = await supabase.from('drivers').select('commission_debt').eq('id', user.id).single();
        const { data: walletData } = await supabase.from('wallets').select('balance').eq('owner_id', user.id).single();

        const newDebt = (driverData?.commission_debt || 0) + commissionAmount;
        const newBalance = (walletData?.balance || 0) + driverEarnings;

        await supabase.from('drivers').update({ commission_debt: newDebt }).eq('id', user.id);
        await supabase.from('wallets').update({ balance: newBalance }).eq('owner_id', user.id);

        await supabase.from('transactions').insert({
          user_id: user.id,
          amount: driverEarnings,
          commission: commissionAmount,
          type: 'RIDE_EARNING',
          description: `Ride ${currentRide.id.slice(0, 8)}...`,
          status: 'completed'
        });

      } catch (e) {
        console.error("Error updating commission logic:", e);
      }
    }
  };

  const handleCollectPayment = () => setShowRatingModal(true);

  const handleSkipRating = () => {
    setCurrentRide(null);
    setRideStatus('IDLE');
    setIsDrawerExpanded(false);
    setShowRatingModal(false);
  };

  const submitRating = async () => {
    if (currentRide && user) {
      try {
        await supabase.from('reviews').insert({
          ride_id: currentRide.id,
          reviewer_id: user.id,
          target_id: currentRide.customer_id, // Need to ensure customer_id is in currentRide
          rating: userRating,
          role_target: 'CUSTOMER',
          comment: 'Rating submitted by driver'
        });
      } catch (err) {
        console.error("Error saving rating:", err);
      }
    }

    setCurrentRide(null);
    setRideStatus('IDLE');
    setIsDrawerExpanded(false);
    setShowRatingModal(false);
    setUserRating(0);
  };

  const isBlocked = profile.commissionDebt > (appSettings?.max_driver_cash_amount || 300);

  if (isLocked) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 bg-red-950 text-center text-white">
        <div className="bg-red-500/20 p-8 rounded-full mb-8 animate-pulse">
          <XCircle className="w-20 h-20 text-red-500" />
        </div>
        <h2 className="text-3xl font-black mb-4 tracking-tight">Account Restricted</h2>
        <p className="text-red-200/70 mb-10 leading-relaxed max-w-xs mx-auto">
          {profile.isSuspended
            ? "Your account has been manually suspended by an administrator. Please contact support."
            : `Your commission debt of D${profile.commissionDebt.toFixed(2)} exceeds the allowable limit. Clear your dues to continue.`
          }
        </p>
        <button
          onClick={() => setCurrentTab('wallet')}
          className="w-full bg-red-600 hover:bg-red-500 text-white py-5 rounded-[2rem] font-black text-lg transition-all active:scale-95 shadow-[0_10px_30px_rgba(220,38,38,0.4)] uppercase tracking-widest"
        >
          {profile.isSuspended ? "Check Wallet Status" : "Reduce Commission Due"}
        </button>
      </div>
    );
  }

  return (
    <div
      className="relative h-full w-full bg-white dark:bg-[#1C1C1E] overflow-hidden font-sans"
      onTouchMove={handleDragMove}
      onMouseMove={handleDragMove}
      onTouchEnd={handleDragEnd}
      onMouseUp={handleDragEnd}
    >
      <div ref={mapRef} className={`absolute inset-0 transition-opacity duration-700 ${profile.isOnline ? 'opacity-100' : 'opacity-60 grayscale'}`} />

      {!profile.isOnline && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
          <div className="w-[85%] max-w-sm bg-[#1C1C1E] rounded-[2.5rem] p-8 text-center shadow-2xl border border-white/10 overflow-hidden">
            <h2 className="text-2xl font-bold text-white mb-2">Ready to drive?</h2>
            <p className="text-gray-400 text-sm mb-10">Go online to receive requests.</p>
            <button onClick={handleToggleOnline} className="w-20 h-20 mx-auto rounded-full bg-[#1C1C1E] border-2 border-[#00E39A] flex items-center justify-center shadow-[0_0_30px_rgba(0,227,154,0.15)] active:scale-95 transition-all"><Power size={32} className="text-[#00E39A]" /></button>
            <p className="text-[#00E39A] text-xs font-bold uppercase mt-8 animate-pulse tracking-widest">Tap to Start</p>
          </div>
        </div>
      )}

      {profile.isOnline && !isFollowing && !currentRide && (
        <div className="absolute top-20 right-6 z-30 animate-in fade-in zoom-in">
          <button onClick={() => setIsFollowing(true)} className="w-12 h-12 rounded-full bg-white dark:bg-[#1C1C1E] text-blue-500 shadow-xl flex items-center justify-center active:scale-90 transition-transform"><Navigation size={20} className="fill-current" /></button>
        </div>
      )}

      {profile.isOnline && (
        <div className="absolute top-4 right-6 z-30">
          <button onClick={handleToggleOnline} className="w-12 h-12 rounded-full bg-white dark:bg-[#1C1C1E] text-red-500 shadow-xl flex items-center justify-center active:scale-90 transition-transform"><Power size={20} /></button>
        </div>
      )}

      {(rideStatus === 'ACCEPTED' || rideStatus === 'NAVIGATING') && currentRide && (
        <>
          <div className="absolute z-[60] cursor-grab active:cursor-grabbing touch-none" style={{ top: dragPos.y, left: dragPos.x }} onTouchStart={handleDragStart} onMouseDown={handleDragStart}>
            <button onClick={() => { if (!isDragging.current) setShowDirections(!showDirections); }} className="w-14 h-14 bg-black/40 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white shadow-xl">{showDirections ? <X size={24} /> : <Navigation size={24} />}</button>
          </div>
          {showDirections && (
            <div className="absolute top-14 left-4 right-4 z-50">
              <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 p-4 flex gap-4 items-center animate-in slide-in-from-top duration-300">
                <div className="w-14 h-14 bg-[#1E2D23] rounded-xl flex items-center justify-center shrink-0 border border-[#00E39A]/20"><ArrowRight size={32} className="text-[#00E39A]" /></div>
                <div className="flex-1">
                  <p className="text-[#00E39A] font-bold text-2xl">{navigationInfo.distance}</p>
                  <p className="text-gray-900 dark:text-white font-bold text-lg leading-tight truncate">
                    {rideStatus === 'ACCEPTED' ? `Pickup: ${currentRide.pickupLocation}` : `Heading to: ${currentRide.destination}`}
                  </p>
                  <p className="text-gray-400 text-xs mt-0.5">Estimated time: {navigationInfo.duration}</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {showRatingModal && (
        <div className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in">
          <div className="bg-white dark:bg-[#1C1C1E] w-full max-w-sm rounded-[2rem] p-6 text-center shadow-2xl relative">
            <button onClick={handleSkipRating} className="absolute top-4 right-4 p-2 text-gray-400"><X size={24} /></button>
            <div className="w-20 h-20 rounded-full mx-auto mb-4 overflow-hidden border-4 border-white dark:border-gray-800 shadow-lg"><img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentRide?.passengerName}`} alt="User" /></div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Rate {currentRide?.passengerName}</h3>
            <div className="flex justify-center gap-2 mb-6 mt-4">{[1, 2, 3, 4, 5].map((star) => (<button key={star} onClick={() => setUserRating(star)}><Star size={32} className={`${star <= userRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} /></button>))}</div>
            <button onClick={submitRating} disabled={userRating === 0} className={`w-full py-4 rounded-2xl font-bold ${userRating > 0 ? 'bg-[#00E39A] text-black shadow-lg' : 'bg-gray-200 text-gray-400'}`}>Submit</button>
          </div>
        </div>
      )}

      {currentRide && !showRatingModal && (
        <RideDrawer
          currentRide={currentRide} rideStatus={rideStatus} isDrawerExpanded={isDrawerExpanded} toggleDrawer={toggleDrawer} onAccept={handleAcceptRide} onDecline={() => { setCurrentRide(null); setRideStatus('IDLE'); }} onCancel={() => { if (confirm('Cancel?')) { setCurrentRide(null); setRideStatus('IDLE'); } }} onArrived={handleArrivedAtPickup} onStartRide={handleStartRide} onComplete={handleCompleteRide} onChat={() => openChat({ id: `chat-${currentRide.id}`, participantName: currentRide.passengerName, contextId: currentRide.id })} onCollectPayment={handleCollectPayment} countdown={countdown} rideType={currentRide.type as any}
        />
      )}
    </div>
  );
};
