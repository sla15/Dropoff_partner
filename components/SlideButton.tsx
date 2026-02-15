
import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';

interface SlideButtonProps {
    onSlideComplete: () => void;
    label: string;
    description?: string;
    baseColor?: string;
    activeColor?: string;
    disabled?: boolean;
}

export const SlideButton: React.FC<SlideButtonProps> = ({
    onSlideComplete,
    label,
    description,
    baseColor = "bg-gray-100 dark:bg-zinc-800",
    activeColor = "bg-[#00E39A]",
    disabled = false
}) => {
    const [sliderPos, setSliderPos] = useState(0);
    const [isSliding, setIsSliding] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const sliderRef = useRef<HTMLDivElement>(null);

    const getSliderMax = () => {
        if (!containerRef.current || !sliderRef.current) return 0;
        return containerRef.current.clientWidth - sliderRef.current.clientWidth - 8; // 8px for padding
    };

    const handleStart = () => {
        if (disabled) return;
        setIsSliding(true);
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
        if (!isSliding) return;

        const container = containerRef.current;
        if (!container) return;

        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const rect = container.getBoundingClientRect();
        const max = getSliderMax();

        let pos = clientX - rect.left - 30; // 30 is approx half of slider width
        pos = Math.max(0, Math.min(pos, max));
        setSliderPos(pos);

        // Check for completion
        if (pos >= max * 0.95) {
            handleComplete();
        }
    };

    const handleEnd = () => {
        if (!isSliding) return;
        setIsSliding(false);

        const max = getSliderMax();
        if (sliderPos < max * 0.9) {
            setSliderPos(0); // Snap back
        }
    };

    const handleComplete = () => {
        setIsSliding(false);
        setSliderPos(getSliderMax());
        onSlideComplete();

        // Reset after a delay if needed, but usually the parent will hide this component
        setTimeout(() => setSliderPos(0), 1000);
    };

    useEffect(() => {
        if (isSliding) {
            window.addEventListener('mousemove', handleMove);
            window.addEventListener('mouseup', handleEnd);
            window.addEventListener('touchmove', handleMove);
            window.addEventListener('touchend', handleEnd);
        }
        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleEnd);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('touchend', handleEnd);
        };
    }, [isSliding]);

    const progress = (sliderPos / (getSliderMax() || 1)) * 100;

    return (
        <div
            ref={containerRef}
            className={`relative w-full h-16 rounded-2xl flex items-center p-1 overflow-hidden transition-all duration-300 ${disabled ? 'opacity-50 pointer-events-none' : 'active:scale-[0.98]'} ${baseColor} shadow-inner`}
        >
            {/* Active Background Fill */}
            <div
                className="absolute left-1 top-1 bottom-1 rounded-xl transition-all duration-75 ease-out flex items-center overflow-hidden"
                style={{
                    width: `${Math.max(64, sliderPos + 64)}px`,
                    backgroundColor: activeColor === 'bg-[#00E39A]' ? '#00E39A' : activeColor
                }}
            >
                <div className="whitespace-nowrap ml-16 text-black font-black uppercase tracking-widest text-sm opacity-20">
                    {label}
                </div>
            </div>

            {/* Hint Text */}
            <div
                className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-opacity duration-300"
                style={{ opacity: 1 - (progress / 100) }}
            >
                <span className="text-gray-400 dark:text-gray-500 font-black text-xs uppercase tracking-[0.2em] ml-12">
                    {label}
                </span>
                {description && (
                    <span className="text-[9px] text-gray-400 mt-0.5 ml-12 font-medium">{description}</span>
                )}
            </div>

            {/* Slider Handle */}
            <div
                ref={sliderRef}
                onMouseDown={handleStart}
                onTouchStart={handleStart}
                className="relative z-10 w-14 h-14 rounded-xl bg-white dark:bg-zinc-900 shadow-xl flex items-center justify-center cursor-grab active:cursor-grabbing transition-shadow hover:shadow-2xl border border-white/10"
                style={{
                    transform: `translateX(${sliderPos}px)`,
                    transition: isSliding ? 'none' : 'transform 0.4s cubic-bezier(0.19, 1, 0.22, 1)'
                }}
            >
                <ChevronRight
                    size={28}
                    className="text-black dark:text-white transition-transform duration-300"
                    style={{ transform: `translateX(${progress * 0.05}px)` }}
                />
            </div>

            {/* Shine Overlay */}
            <div className="absolute inset-x-0 top-0 h-1/2 bg-white/5 pointer-events-none rounded-t-2xl"></div>
        </div>
    );
};
