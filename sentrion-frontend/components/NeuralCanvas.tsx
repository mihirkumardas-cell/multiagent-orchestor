'use client';

const nodes = [
  [16, 34], [23, 62], [38, 22], [47, 48], [40, 76], [62, 31], [71, 59], [84, 43],
];

const links = [[0, 3], [1, 3], [2, 3], [3, 4], [3, 5], [4, 6], [5, 6], [5, 7], [6, 7]];

export default function NeuralCanvas() {
  return (
    <div className="neural-stage relative w-full h-full overflow-hidden bg-[#120d26]">
      <div className="neural-grid absolute inset-0" />
      <div className="neural-aura neural-aura-one" />
      <div className="neural-aura neural-aura-two" />

      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {links.map(([from, to], index) => (
          <line
            key={`${from}-${to}`}
            x1={nodes[from][0]} y1={nodes[from][1]}
            x2={nodes[to][0]} y2={nodes[to][1]}
            className="neural-link"
            style={{ animationDelay: `${index * -0.42}s` }}
          />
        ))}
      </svg>

      <div className="neural-orbit neural-orbit-a" />
      <div className="neural-orbit neural-orbit-b" />
      <div className="neural-core"><span /></div>

      {nodes.map(([left, top], index) => (
        <span
          key={index}
          className="neural-node"
          style={{ left: `${left}%`, top: `${top}%`, animationDelay: `${index * -0.32}s` }}
        />
      ))}

      <div className="absolute top-6 left-6 right-6">
        <div className="text-[10px] font-mono tracking-[.18em] text-purple-200/90 uppercase">DECISION NETWORK / LIVE REASONING</div>
        <div className="mt-1 text-[9px] font-mono tracking-[.22em] text-purple-200/60 uppercase">POLICY SIGNALS SYNCHRONIZED</div>
      </div>
    </div>
  );
}
