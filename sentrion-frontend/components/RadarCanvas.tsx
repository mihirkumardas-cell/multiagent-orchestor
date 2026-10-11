'use client';

const rings = [34, 52, 70, 88];

export default function RadarCanvas() {
  return (
    <div className="relative w-full h-full overflow-hidden flex items-center justify-center bg-[#071426]">
      <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'linear-gradient(rgba(59,130,246,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,.1) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      <div className="relative w-72 h-72 rounded-full border border-blue-400/40">
        {rings.map((size) => <div key={size} className="absolute rounded-full border border-blue-400/30" style={{ width: `${size}%`, height: `${size}%`, left: `${(100 - size) / 2}%`, top: `${(100 - size) / 2}%` }} />)}
        <div className="absolute left-1/2 top-0 h-1/2 w-px bg-blue-300/70 origin-bottom animate-spin" style={{ animationDuration: '3s' }} />
        <div className="absolute left-1/2 top-1/2 w-4 h-4 -ml-2 -mt-2 rounded-full bg-cyan-300 shadow-[0_0_18px_#22d3ee]" />
        <span className="absolute left-[20%] top-[28%] w-2 h-2 rounded-full bg-cyan-300 animate-pulse" />
        <span className="absolute right-[18%] top-[42%] w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
        <span className="absolute left-[35%] bottom-[17%] w-2 h-2 rounded-full bg-cyan-300 animate-pulse" />
      </div>
      <div className="absolute top-8 left-8 text-xs font-mono text-blue-300/80">POLICY INDEX / ONLINE</div>
      <div className="absolute bottom-8 right-8 text-xs font-mono text-cyan-300/80">SCANNING...</div>
    </div>
  );
}
