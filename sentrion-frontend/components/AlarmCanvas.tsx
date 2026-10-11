'use client';

export default function AlarmCanvas() {
  return (
    <div className="alarm-stage relative w-full h-full overflow-hidden flex items-center justify-center bg-[#260b12]">
      <div className="alarm-grid absolute inset-0" />
      <div className="alarm-glow" />
      <div className="alarm-beam alarm-beam-a" />
      <div className="alarm-beam alarm-beam-b" />
      <div className="alarm-ring alarm-ring-one" />
      <div className="alarm-ring alarm-ring-two" />
      <div className="alarm-ring alarm-ring-three" />
      <div className="alarm-core"><div className="alarm-core-inner" /></div>
      <span className="alarm-marker alarm-marker-a">!</span>
      <span className="alarm-marker alarm-marker-b">!</span>
      <span className="alarm-marker alarm-marker-c">!</span>

      {/* Top label */}
      <div className="absolute top-6 left-0 right-0 flex flex-col items-center gap-1 px-4">
        <div className="flex items-center gap-2">
          <span className="text-red-400 text-base">🚨</span>
          <span className="text-xs font-mono tracking-[.16em] text-red-100 uppercase">
            ALARM PROTOCOL / ARMED
          </span>
        </div>
        <div className="h-px w-48 bg-gradient-to-r from-transparent via-red-500/60 to-transparent" />
        <span className="text-[10px] font-mono tracking-[.22em] text-red-400/80 uppercase">
          VIOLATION RESPONSE READY
        </span>
      </div>

      {/* Bottom — simulation notice, not a live state indicator */}
      <div className="absolute bottom-8 inset-x-0 text-center px-4">
        <p className="text-[10px] font-mono tracking-[.18em] text-red-400/50 uppercase">
          ⚙ Simulation — Agent 3 Trigger Demo
        </p>
      </div>
    </div>
  );
}
