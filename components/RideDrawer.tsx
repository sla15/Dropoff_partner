
import React from 'react';
import { Star, Navigation, MessageSquare, X, Wallet, CheckCircle, MapPin, EyeOff, Play, Check } from 'lucide-react';
import { RideRequest, RideStatus } from '../types';

interface RideDrawerProps {
    currentRide: RideRequest;
    rideStatus: RideStatus;
    isDrawerExpanded: boolean;
    toggleDrawer: () => void;
    onAccept: () => void;
    onDecline: () => void;
    onCancel: () => void;
    onArrived: () => void;
    onStartRide: () => void;
    onComplete: () => void;
    onChat: () => void;
    onCollectPayment: () => void;
    countdown: number;
    rideType?: 'PASSENGER' | 'DELIVERY';
}

export const RideDrawer: React.FC<RideDrawerProps> = ({
    currentRide,
    rideStatus,
    isDrawerExpanded,
    toggleDrawer,
    onAccept,
    onDecline,
    onCancel,
    onArrived,
    onStartRide,
    onComplete,
    onChat,
    onCollectPayment,
    countdown,
    rideType = 'PASSENGER'
}) => {
    const isNavigating = rideStatus === 'NAVIGATING';
    const isRideStarted = rideStatus === 'NAVIGATING' || rideStatus === 'COMPLETED';
    const isRideActive = rideStatus !== 'IDLE' && rideStatus !== 'RINGING';

    // Dynamic height calculation
    const drawerHeight = isDrawerExpanded
        ? 'h-[92vh]'
        : isNavigating
            ? 'h-[180px]'
            : 'h-[460px]';

    return (
        <div
            className={`absolute bottom-0 left-0 right-0 z-40 px-0 sm:px-4 pb-0 sm:pb-4 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${drawerHeight}`}
        >
            {/* Incoming Request Label */}
            {rideStatus === 'RINGING' && !isDrawerExpanded && (
                <div className="flex justify-center mb-4 transition-opacity duration-300">
                    <div className="bg-black/80 backdrop-blur-md px-6 py-3 rounded-full border border-[#00E39A]/30 flex items-center gap-2 shadow-lg">
                        <div className="w-2 h-2 rounded-full bg-[#00E39A] animate-pulse"></div>
                        <span className="text-white font-bold text-sm tracking-wide">
                            INCOMING {rideType === 'DELIVERY' ? 'DELIVERY' : 'RIDE'}
                        </span>
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-[#1C1C1E] rounded-t-[2.5rem] sm:rounded-b-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.3)] border-t border-gray-100 dark:border-gray-800 h-full flex flex-col relative overflow-hidden transition-colors duration-300">

                {/* Drag Handle */}
                <div
                    onClick={toggleDrawer}
                    className="w-full p-4 flex justify-center cursor-pointer active:opacity-70 transition-opacity z-20 shrink-0"
                >
                    <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700/50 rounded-full"></div>
                </div>

                <div className={`flex-1 overflow-y-auto no-scrollbar px-6 pb-6 ${isDrawerExpanded ? 'overflow-y-auto' : 'overflow-hidden'}`}>

                    {/* Header: User & Price */}
                    <div className="flex justify-between items-start mb-8">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden border-2 border-white dark:border-gray-600">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentRide.passengerName}`} alt="User" className="w-full h-full object-cover" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 bg-white dark:bg-[#2C2C2E] px-1.5 py-0.5 rounded-full flex items-center gap-0.5 border border-gray-100 dark:border-gray-700 shadow-sm">
                                    <Star size={10} className="text-yellow-500 fill-current" />
                                    <span className="text-gray-900 dark:text-white text-[10px] font-bold">{currentRide.rating}</span>
                                </div>
                            </div>
                            <div>
                                <div className="flex flex-col gap-1">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-none">{currentRide.passengerName}</h3>
                                    {isRideActive && (
                                        <div className="flex gap-2 mt-1">
                                            {rideStatus === 'NAVIGATING' && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onComplete(); }}
                                                    className="text-[#00E39A] text-[10px] font-bold border border-[#00E39A]/30 px-2 py-1 rounded-full hover:bg-[#00E39A]/10 animate-pulse"
                                                >
                                                    End Ride
                                                </button>
                                            )}
                                            {rideStatus === 'ARRIVED' && (
                                                <span className="text-blue-500 text-[10px] font-black uppercase tracking-widest">At Pickup</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            {(rideStatus === 'RINGING' || rideStatus === 'ACCEPTED') ? (
                                <div className="flex flex-col items-end opacity-50">
                                    <div className="flex items-center gap-1.5 text-gray-400">
                                        <EyeOff size={16} />
                                        <span className="text-xl font-bold italic tracking-tighter">D ••••</span>
                                    </div>
                                    <div className="text-[9px] font-black uppercase tracking-widest mt-1">Reveal at {rideType === 'DELIVERY' ? 'Pickup' : 'Arrival'}</div>
                                </div>
                            ) : rideStatus === 'COMPLETED' ? (
                                <div className="animate-in zoom-in duration-300 flex flex-col items-end">
                                    <div className="text-[#00E39A] text-4xl font-extrabold tracking-tighter">
                                        D{currentRide.price}
                                    </div>
                                    <div className="text-gray-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                        <CheckCircle size={10} className="text-[#00E39A]" />
                                        {rideType === 'DELIVERY' ? 'Delivery Complete' : 'Ride Complete'}
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="text-[#00E39A] text-3xl font-bold tracking-tight">D{currentRide.price}</div>
                                    <div className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">{rideType === 'DELIVERY' ? 'Delivery Fee' : 'Estimated Fare'}</div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Route Visualizer */}
                    <div className={`relative pl-2 mb-8 transition-all duration-300 ${isNavigating && !isDrawerExpanded ? 'opacity-0 h-0 overflow-hidden mb-0' : 'opacity-100'} ${rideStatus === 'COMPLETED' ? 'opacity-40 grayscale' : ''}`}>
                        <div className="absolute left-[7px] top-3 bottom-8 w-[2px] bg-gray-200 dark:bg-[#2C2C2E]">
                            <div className={`absolute top-0 bottom-0 left-0 right-0 bg-gradient-to-b from-[#00E39A] to-transparent ${isRideStarted ? 'h-full' : 'h-1/2'}`}></div>
                        </div>

                        {/* Pickup */}
                        <div className="flex gap-4 mb-6 relative z-10">
                            <div className="mt-1 w-4 h-4 rounded-full border-[3px] border-[#00E39A] bg-white dark:bg-[#1C1C1E] shrink-0 shadow-[0_0_10px_rgba(0,227,154,0.4)]"></div>
                            <div>
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className="text-[#00E39A] text-[10px] font-black uppercase tracking-widest">PICKUP</span>
                                    <span className="bg-gray-100 dark:bg-[#2C2C2E] text-gray-500 text-[10px] px-1.5 py-0.5 rounded">{currentRide.pickupDistance} Away</span>
                                </div>
                                <h4 className="text-gray-900 dark:text-white font-bold text-lg leading-tight">{currentRide.pickupLocation}</h4>
                            </div>
                        </div>

                        {/* Stops - Masked until started */}
                        {!isRideStarted ? (
                            <div className="flex gap-4 mb-6 relative z-10 opacity-60">
                                <div className="mt-1 w-4 h-4 rounded-full border-[2px] border-dashed border-gray-400 bg-gray-50 dark:bg-zinc-800 shrink-0"></div>
                                <div className="flex-1 filter blur-[4px]">
                                    <div className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-0.5">DESTINATION</div>
                                    <h4 className="text-gray-400 font-bold text-lg leading-tight">•••••••• ••••••••</h4>
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="bg-white/80 dark:bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700 flex items-center gap-2">
                                        <EyeOff size={12} className="text-gray-400" />
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Hidden until start</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Stops (if any) */}
                                {currentRide.stops?.map((stop, index) => (
                                    <div key={index} className="flex gap-4 mb-6 relative z-10">
                                        <div className="mt-1 w-4 h-4 rounded-full border-[2px] border-gray-400 bg-gray-100 dark:bg-zinc-800 shrink-0 z-20"></div>
                                        <div>
                                            <div className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-0.5">STOP {index + 1}</div>
                                            <h4 className="text-gray-900 dark:text-white font-bold text-lg leading-tight">{stop}</h4>
                                        </div>
                                    </div>
                                ))}

                                {/* Destination */}
                                <div className="flex gap-4 relative z-10">
                                    <div className="mt-1 w-4 h-4 border-[2px] border-gray-400 dark:border-white bg-white dark:bg-[#1C1C1E] shrink-0 rounded-[2px]"></div>
                                    <div>
                                        <div className="text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-widest mb-0.5">DESTINATION</div>
                                        <h4 className="text-gray-900 dark:text-white font-bold text-lg leading-tight">{currentRide.destination}</h4>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Actions Area */}
                    <div className={`pb-20 transition-all duration-300 ${isNavigating && !isDrawerExpanded ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}>
                        {rideStatus === 'RINGING' && (
                            <div className="space-y-3">
                                <button
                                    onClick={onAccept}
                                    className="w-full bg-[#00E39A] hover:bg-[#00C285] active:scale-[0.98] transition-all h-14 rounded-full flex items-center justify-between px-2 relative overflow-hidden shadow-lg"
                                >
                                    <div className="w-12 h-12 rounded-full bg-black/10 flex items-center justify-center">
                                        <Check size={20} className="text-black" />
                                    </div>
                                    <span className="text-black font-black text-lg tracking-wide flex-1 text-center pr-12 uppercase">
                                        Accept {rideType === 'DELIVERY' ? 'Delivery' : 'Ride'}
                                    </span>
                                    <div className="absolute right-2 top-2 bottom-2 w-10 h-10 flex items-center justify-center">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle cx="20" cy="20" r="18" stroke="black" strokeWidth="2" fill="none" opacity="0.1" />
                                            <circle
                                                cx="20" cy="20" r="18"
                                                stroke="black" strokeWidth="2" fill="none"
                                                strokeDasharray={113}
                                                strokeDashoffset={113 - (113 * countdown) / 15}
                                                className="transition-all duration-1000 ease-linear"
                                            />
                                        </svg>
                                        <span className="absolute text-[10px] font-black text-black">{countdown}</span>
                                    </div>
                                </button>
                                <button onClick={onDecline} className="w-full py-3 text-red-500 font-black text-sm flex items-center justify-center gap-2">
                                    <X size={16} /> Decline Request
                                </button>
                            </div>
                        )}

                        {rideStatus === 'ACCEPTED' && (
                            <div className="space-y-3">
                                <button
                                    onClick={onArrived}
                                    className="w-full bg-blue-500 text-white h-14 rounded-2xl font-black active:scale-95 transition-transform flex items-center justify-center gap-3 shadow-lg"
                                >
                                    <MapPin size={22} /> I HAVE ARRIVED
                                </button>
                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={onChat} className="bg-gray-100 dark:bg-[#2C2C2E] text-gray-900 dark:text-white h-14 rounded-2xl flex items-center justify-center border border-gray-200 dark:border-gray-700 font-black text-sm uppercase tracking-widest gap-2">
                                        <MessageSquare size={18} /> Chat
                                    </button>
                                    <button onClick={onCancel} className="bg-gray-100 dark:bg-[#2C2C2E] text-red-500 h-14 rounded-2xl flex items-center justify-center border border-gray-200 dark:border-gray-700 font-black text-sm uppercase tracking-widest gap-2">
                                        <X size={18} /> Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {rideStatus === 'ARRIVED' && (
                            <div className="space-y-3">
                                <button
                                    onClick={onStartRide}
                                    className="w-full bg-[#00E39A] text-black h-16 rounded-2xl font-black active:scale-95 transition-transform flex items-center justify-center gap-3 shadow-xl animate-pulse"
                                >
                                    <Play size={24} fill="currentColor" /> START RIDE
                                </button>
                                <button onClick={onChat} className="w-full bg-gray-100 dark:bg-[#2C2C2E] text-gray-900 dark:text-white h-14 rounded-2xl flex items-center justify-center font-black text-sm uppercase tracking-widest gap-2 shadow-sm">
                                    <MessageSquare size={18} /> Message Passenger
                                </button>
                            </div>
                        )}

                        {rideStatus === 'NAVIGATING' && (
                            <div className="grid grid-cols-4 gap-3">
                                <button
                                    onClick={onComplete}
                                    className="col-span-3 bg-red-500 text-white h-14 rounded-2xl font-black active:scale-95 transition-transform flex items-center justify-center gap-2 shadow-lg"
                                >
                                    <CheckCircle size={20} /> END RIDE
                                </button>
                                <button onClick={onChat} className="col-span-1 bg-gray-100 dark:bg-[#2C2C2E] h-14 rounded-2xl flex items-center justify-center border border-gray-200 dark:border-gray-700 text-slate-500">
                                    <MessageSquare size={24} />
                                </button>
                            </div>
                        )}

                        {rideStatus === 'COMPLETED' && (
                            <button
                                onClick={onCollectPayment}
                                className="w-full bg-[#00E39A] text-black h-14 rounded-2xl font-black active:scale-95 transition-transform mt-1 shadow-lg hover:bg-[#00C285] flex items-center justify-center gap-2"
                            >
                                <Wallet size={20} /> Collect Payment
                            </button>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};
