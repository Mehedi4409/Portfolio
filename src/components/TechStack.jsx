import React, { useLayoutEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';

/* -------------------------------------------------------------------------- */
/*  Content                                                                   */
/*  `col` is the node's column, left to right: build -> clients -> services   */
/*  -> data. Order inside a column follows the order here.                    */
/* -------------------------------------------------------------------------- */

const COLUMNS = [0, 1, 2, 3];

const NODES = [
  { id: 'tailwind', name: 'Tailwind CSS', role: 'Design systems', col: 0 },
  { id: 'framer', name: 'Framer Motion', role: 'Choreography', col: 0 },
  { id: 'gsap', name: 'GSAP & Lenis', role: 'Scroll & motion', col: 0 },
  { id: 'git', name: 'Git & GitHub', role: 'Version control', col: 0 },

  { id: 'flutter', name: 'Flutter', role: 'Native mobile', col: 1 },
  { id: 'native', name: 'React Native', role: 'Cross-platform', col: 1 },
  { id: 'react', name: 'React', role: 'UI & web apps', col: 1 },
  { id: 'vercel', name: 'Vercel', role: 'Edge deployment', col: 1 },

  { id: 'firebase', name: 'Firebase', role: 'BaaS & auth', col: 2 },
  { id: 'node', name: 'Node.js', role: 'Runtime', col: 2 },
  { id: 'express', name: 'Express.js', role: 'REST APIs', col: 2 },
  { id: 'python', name: 'Python', role: 'ML & scripting', col: 2 },
  { id: 'fastapi', name: 'FastAPI', role: 'Python services', col: 2 },

  { id: 'mongodb', name: 'MongoDB', role: 'NoSQL store', col: 3 },
  { id: 'postgres', name: 'PostgreSQL', role: 'Relational DB', col: 3 },
  { id: 'sklearn', name: 'scikit-learn', role: 'Predictive models', col: 3 },
];

// Every edge reads "from <label> to". Cross-column edges always run left to right.
const EDGES = [
  { from: 'tailwind', to: 'react', label: 'styles' },
  { from: 'framer', to: 'react', label: 'animates' },
  { from: 'gsap', to: 'react', label: 'scrolls' },
  { from: 'git', to: 'vercel', label: 'deploys' },
  { from: 'vercel', to: 'react', label: 'hosts' },
  { from: 'react', to: 'firebase', label: 'auth & data' },
  { from: 'react', to: 'express', label: 'REST' },
  { from: 'native', to: 'express', label: 'REST' },
  { from: 'flutter', to: 'firebase', label: 'auth & data' },
  { from: 'node', to: 'express', label: 'runs' },
  { from: 'python', to: 'fastapi', label: 'runs' },
  { from: 'express', to: 'mongodb', label: 'documents' },
  { from: 'express', to: 'postgres', label: 'queries' },
  { from: 'fastapi', to: 'postgres', label: 'queries' },
  { from: 'fastapi', to: 'sklearn', label: 'serves models' },
  { from: 'firebase', to: 'postgres', label: 'built on' },
];

/* -------------------------------------------------------------------------- */
/*  Styles                                                                    */
/* -------------------------------------------------------------------------- */

const NODE_STATES = {
  idle: 'border-neutral-200 bg-white text-neutral-950',
  active: 'border-neutral-950 bg-neutral-950 text-white',
  related: 'border-neutral-950 bg-white text-neutral-950',
  dimmed: 'border-neutral-200 bg-white text-neutral-950 opacity-30',
};

const EDGE_STATES = {
  idle: { stroke: 'stroke-neutral-300', fill: 'fill-neutral-300', width: 1.5 },
  related: { stroke: 'stroke-neutral-950', fill: 'fill-neutral-950', width: 2 },
  dimmed: { stroke: 'stroke-neutral-200', fill: 'fill-neutral-200', width: 1.5 },
};

/* -------------------------------------------------------------------------- */
/*  Animation                                                                 */
/* -------------------------------------------------------------------------- */

// The only motion: edges draw themselves once, when the diagram scrolls in.
const DRAW_EASE = [0.32, 0.72, 0, 1];
const DRAW_DURATION = 1.1;
const DRAW_STAGGER = 0.04;

/* -------------------------------------------------------------------------- */
/*  Graph helpers                                                             */
/* -------------------------------------------------------------------------- */

const touches = (edge, id) => edge.from === id || edge.to === id;

// The node itself plus everything it shares an edge with.
const neighborsOf = (id) =>
  new Set(EDGES.filter((edge) => touches(edge, id)).flatMap((e) => [e.from, e.to]));

const getNodeState = (id, active, neighbors) => {
  if (!active) return 'idle';
  if (id === active) return 'active';
  return neighbors.has(id) ? 'related' : 'dimmed';
};

const getEdgeState = (edge, active) => {
  if (!active) return 'idle';
  return touches(edge, active) ? 'related' : 'dimmed';
};

/* -------------------------------------------------------------------------- */
/*  Geometry                                                                  */
/* -------------------------------------------------------------------------- */

// Rect of an element, relative to the canvas.
const measureNode = (el, origin) => {
  const r = el.getBoundingClientRect();
  const left = r.left - origin.left;
  const top = r.top - origin.top;
  return {
    left,
    top,
    right: left + r.width,
    bottom: top + r.height,
    midX: left + r.width / 2,
    midY: top + r.height / 2,
  };
};

// Same column: straight line between facing sides.
// Different columns: smooth curve from right side to left side.
const buildEdge = (edge, a, b) => {
  if (Math.abs(a.midX - b.midX) < 1) {
    const down = a.midY < b.midY;
    const start = { x: a.midX, y: down ? a.bottom : a.top };
    const end = { x: b.midX, y: down ? b.top : b.bottom };
    return {
      edge,
      end,
      d: `M ${start.x} ${start.y} L ${end.x} ${end.y}`,
      label: { x: start.x + 8, y: (start.y + end.y) / 2, anchor: 'start' },
    };
  }

  const start = { x: a.right, y: a.midY };
  const end = { x: b.left, y: b.midY };
  const bend = (end.x - start.x) / 2;
  return {
    edge,
    end,
    d: `M ${start.x} ${start.y} C ${start.x + bend} ${start.y}, ${end.x - bend} ${end.y}, ${end.x} ${end.y}`,
    label: { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2, anchor: 'middle' },
  };
};

/* -------------------------------------------------------------------------- */
/*  Hooks                                                                     */
/* -------------------------------------------------------------------------- */

// Measures the rendered nodes and re-measures whenever the canvas resizes
// or web fonts finish loading.
const useEdgeGeometry = (canvasRef, nodeRefs) => {
  const [geometry, setGeometry] = useState([]);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    let cancelled = false;

    const measure = () => {
      if (cancelled) return;
      const origin = canvas.getBoundingClientRect();
      const rects = (id) => measureNode(nodeRefs.current[id], origin);
      setGeometry(EDGES.map((e) => buildEdge(e, rects(e.from), rects(e.to))));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(canvas);
    document.fonts?.ready.then(measure);

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [canvasRef, nodeRefs]);

  return geometry;
};

/* -------------------------------------------------------------------------- */
/*  Components                                                                */
/* -------------------------------------------------------------------------- */

const Header = () => (
  <div className="mb-12 flex flex-col items-center text-center">
    <h2 className="font-comfortaa text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl lg:text-5xl">
      How a project fits together
    </h2>
    <p className="font-roboto mt-4 max-w-md text-base text-neutral-500 sm:text-lg">
      Hover or tap a tool to trace what it connects to.
    </p>
  </div>
);

const TechNode = ({ node, state, registerRef, onActivate, onDeactivate }) => (
  <button
    ref={registerRef}
    type="button"
    onMouseEnter={onActivate}
    onMouseLeave={onDeactivate}
    onFocus={onActivate}
    onBlur={onDeactivate}
    className={`relative z-10 flex cursor-pointer flex-col items-start rounded-2xl border px-4 py-3 text-left outline-none transition-[background-color,border-color,color,opacity] duration-200 focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 ${NODE_STATES[state]}`}
  >
    <span className="font-comfortaa text-sm font-bold tracking-tight">
      {node.name}
    </span>
    <span
      className={`font-roboto text-xs transition-colors duration-200 ${
        state === 'active' ? 'text-neutral-300' : 'text-neutral-500'
      }`}
    >
      {node.role}
    </span>
  </button>
);

const Edge = ({ item, index, active, drawn }) => {
  const reduceMotion = useReducedMotion();
  const state = getEdgeState(item.edge, active);
  const { stroke, fill, width } = EDGE_STATES[state];
  const showLabel = state === 'related';

  return (
    <g>
      <motion.path
        d={item.d}
        fill="none"
        strokeWidth={width}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: drawn ? 1 : 0 }}
        transition={{
          duration: reduceMotion ? 0 : DRAW_DURATION,
          delay: reduceMotion ? 0 : index * DRAW_STAGGER,
          ease: DRAW_EASE,
        }}
        className={`transition-[stroke] duration-200 ${stroke}`}
      />
      <circle
        cx={item.end.x}
        cy={item.end.y}
        r={3}
        className={`transition-[fill,opacity] duration-200 ${fill} ${
          drawn ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <text
        x={item.label.x}
        y={item.label.y}
        textAnchor={item.label.anchor}
        dominantBaseline="middle"
        fontSize={11}
        stroke="#fff"
        strokeWidth={4}
        strokeLinejoin="round"
        style={{ paintOrder: 'stroke' }}
        className={`font-roboto fill-neutral-950 transition-opacity duration-200 ${
          showLabel ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {item.edge.label}
      </text>
    </g>
  );
};

const EdgeLayer = ({ geometry, active, drawn }) => (
  <svg
    aria-hidden="true"
    className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
  >
    {geometry.map((item, i) => (
      <Edge
        key={`${item.edge.from}-${item.edge.to}`}
        item={item}
        index={i}
        active={active}
        drawn={drawn}
      />
    ))}
  </svg>
);

/* -------------------------------------------------------------------------- */
/*  TechStack Section                                                         */
/* -------------------------------------------------------------------------- */

const TechStack = () => {
  const [active, setActive] = useState(null);
  const canvasRef = useRef(null);
  const nodeRefs = useRef({});

  const geometry = useEdgeGeometry(canvasRef, nodeRefs);
  const drawn = useInView(canvasRef, { once: true, amount: 0.3 });
  const neighbors = active ? neighborsOf(active) : null;

  return (
    <section
      id="stack"
      className="flex min-h-dvh w-full flex-col items-center justify-center bg-white px-6 pt-28 pb-16"
    >
      <Header />

      {/* On narrow screens the diagram scrolls sideways instead of shrinking. */}
      <div className="w-full max-w-[1400px] overflow-x-auto p-1">
        <div
          ref={canvasRef}
          className="relative mx-auto grid min-w-[1100px] grid-cols-4 gap-x-[clamp(7rem,10vw,12rem)]"
        >
          <EdgeLayer geometry={geometry} active={active} drawn={drawn} />

          {COLUMNS.map((col) => (
            <div key={col} className="flex flex-col justify-center gap-6">
              {NODES.filter((node) => node.col === col).map((node) => (
                <TechNode
                  key={node.id}
                  node={node}
                  state={getNodeState(node.id, active, neighbors)}
                  registerRef={(el) => {
                    nodeRefs.current[node.id] = el;
                  }}
                  onActivate={() => setActive(node.id)}
                  onDeactivate={() => setActive(null)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechStack;