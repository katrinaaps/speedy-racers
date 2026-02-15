import { useRef } from "react";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Rocket, Feather, Umbrella, Zap } from "lucide-react";

interface TouchControlsProps {
  keysRef: React.MutableRefObject<{
    up: boolean; down: boolean; left: boolean; right: boolean;
    boost: boolean; wings: boolean; parachute: boolean; laser: boolean;
  }>;
  visible: boolean;
  hasRockets: boolean;
  hasWings: boolean;
  hasParachute: boolean;
  hasLaser: boolean;
}

function PadButton({
  onDown, onUp, children, className = "",
}: {
  onDown: () => void; onUp: () => void; children: React.ReactNode; className?: string;
}) {
  const pressed = useRef(false);
  const handleStart = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!pressed.current) { pressed.current = true; onDown(); }
  };
  const handleEnd = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    if (pressed.current) { pressed.current = false; onUp(); }
  };
  return (
    <button
      onTouchStart={handleStart} onTouchEnd={handleEnd} onTouchCancel={handleEnd}
      onMouseDown={handleStart} onMouseUp={handleEnd} onMouseLeave={handleEnd}
      className={`pointer-events-auto select-none active:scale-95 transition-transform ${className}`}
    >
      {children}
    </button>
  );
}

export default function TouchControls({ keysRef, visible, hasRockets, hasWings, hasParachute, hasLaser }: TouchControlsProps) {
  if (!visible) return null;
  const k = keysRef.current;
  const btnClass = "w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center active:bg-white/40";

  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      {/* Left side: steering */}
      <div className="absolute bottom-8 left-6 flex gap-3">
        <PadButton onDown={() => (k.left = true)} onUp={() => (k.left = false)} className={btnClass}>
          <ChevronLeft className="w-8 h-8 text-white" />
        </PadButton>
        <PadButton onDown={() => (k.right = true)} onUp={() => (k.right = false)} className={btnClass}>
          <ChevronRight className="w-8 h-8 text-white" />
        </PadButton>
      </div>

      {/* Right side: accel / brake + abilities */}
      <div className="absolute bottom-8 right-6 flex flex-col gap-3 items-end">
        <PadButton onDown={() => (k.up = true)} onUp={() => (k.up = false)} className={btnClass}>
          <ChevronUp className="w-8 h-8 text-white" />
        </PadButton>
        <PadButton onDown={() => (k.down = true)} onUp={() => (k.down = false)} className={btnClass}>
          <ChevronDown className="w-8 h-8 text-white" />
        </PadButton>
        <div className="flex gap-2">
          {hasRockets && (
            <PadButton onDown={() => (k.boost = true)} onUp={() => (k.boost = false)}
              className="w-14 h-14 rounded-full bg-orange-500/40 backdrop-blur-sm flex items-center justify-center active:bg-orange-500/70">
              <Rocket className="w-6 h-6 text-white" />
            </PadButton>
          )}
          {hasWings && (
            <PadButton onDown={() => (k.wings = true)} onUp={() => (k.wings = false)}
              className="w-14 h-14 rounded-full bg-sky-500/40 backdrop-blur-sm flex items-center justify-center active:bg-sky-500/70">
              <Feather className="w-6 h-6 text-white" />
            </PadButton>
          )}
          {hasParachute && (
            <PadButton onDown={() => (k.parachute = true)} onUp={() => (k.parachute = false)}
              className="w-14 h-14 rounded-full bg-red-500/40 backdrop-blur-sm flex items-center justify-center active:bg-red-500/70">
              <Umbrella className="w-6 h-6 text-white" />
            </PadButton>
          )}
          {hasLaser && (
            <PadButton onDown={() => (k.laser = true)} onUp={() => (k.laser = false)}
              className="w-14 h-14 rounded-full bg-yellow-500/40 backdrop-blur-sm flex items-center justify-center active:bg-yellow-500/70">
              <Zap className="w-6 h-6 text-white" />
            </PadButton>
          )}
        </div>
      </div>
    </div>
  );
}
