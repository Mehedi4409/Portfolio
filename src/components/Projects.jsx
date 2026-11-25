import React, { useRef, useState } from 'react';
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useInView,
  useMotionValueEvent,
  useScroll,
} from 'framer-motion';

/* -------------------------------------------------------------------------- */
/*  Content                                                                   */
/* -------------------------------------------------------------------------- */

const PROJECTS = [
  {
    id: 'acadex-hub',
    title: 'Acadex Hub',
    summary:
      'Centralized university portal with interactive lecture notes, past exam archives, AI-assisted handwritten transcription, and a printable coverpage generator.',
    liveUrl: '#',
    repoUrl: '#',
  },
  {
    id: 'sylang-compiler',
    title: 'Sylang Compiler',
    summary:
      'Native Bangla programming language and compiler built from scratch in C++, supporting Unicode & Romanized scripts, AST parsing, TAC, and Python code generation.',
    liveUrl: '#',
    repoUrl: '#',
  },
  {
    id: 'loan-predictor',
    title: 'Loan Approval Predictor',
    summary:
      'Real-time credit risk evaluation app pairing a FastAPI & scikit-learn Logistic Regression pipeline with a responsive, motion-choreographed React interface.',
    liveUrl: '#',
    repoUrl: '#',
  },
  {
    id: 'agilis-platform',
    title: 'Agilis Enterprise Web',
    summary:
      'Production web platform and modular product showcase engineered for speed, sharp visual hierarchy, and seamless deployment on Vercel.',
    liveUrl: 'https://agilis.one',
    repoUrl: '#',
  },
  {
    id: 'odisy-agency',
    title: 'ODISY Studio Platform',
    summary:
      'Digital agency web experience built for custom web platforms, POS & ERP workflows, automation engines, and motion-driven product storytelling.',
    liveUrl: 'https://odisy-seven.vercel.app/',
    repoUrl: '#',
  },
];

/* -------------------------------------------------------------------------- */
/*  Layout                                                                    */
/* -------------------------------------------------------------------------- */

const STEP = 28; // degrees between neighbouring numbers
const SCROLL_PER_PROJECT = 60; // dvh of scrolling each project is shown for

// Tall track: one screen for the sticky stage, plus scroll room per project.
const TRACK_STYLE = {
  height: `calc(100dvh + ${PROJECTS.length * SCROLL_PER_PROJECT}dvh)`,
};

const SECTION_VARS = {
  '--r': 'min(50dvh, 40vw)',
  '--visible': 'calc(var(--r) * 0.8)',
};

const WHEEL_ANCHOR_STYLE = { left: 'calc(var(--visible) - var(--r))' };

const RING_STYLE = {
  width: 'calc(var(--r) * 2)',
  height: 'calc(var(--r) * 2)',
  left: 'calc(var(--r) * -1)',
  top: 'calc(var(--r) * -1)',
};

const DOT_STYLE = { left: 'var(--r)' };
const NUMBER_STYLE = { left: 'calc(var(--r) + 1.25rem)' };

// Must clear the active number (which is scaled up), or the two collide.
const CONTENT_STYLE = {
  marginLeft: 'calc(var(--visible) + clamp(5rem, 7vw, 8rem))',
};

/* -------------------------------------------------------------------------- */
/*  Animation                                                                 */
/* -------------------------------------------------------------------------- */

const EASE = [0.32, 0.72, 0, 1];
const WHEEL_SPRING = { type: 'spring', stiffness: 90, damping: 20, mass: 1 };

const panelVariants = {
  hidden: {},
  show: { transition: { delayChildren: 0.15, staggerChildren: 0.08 } },
  exit: { transition: { staggerChildren: 0.04, staggerDirection: -1 } },
};

const previewVariants = {
  hidden: { opacity: 0, scale: 0.94, y: 28 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 150, damping: 22 },
  },
  exit: { opacity: 0, scale: 0.97, y: -12, transition: { duration: 0.18 } },
};

const infoVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } },
  exit: { opacity: 0, transition: { duration: 0.12 } },
};

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

const clamp = (n, min, max) => Math.min(Math.max(n, min), max);
const formatNumber = (i) => String(i + 1).padStart(2, '0');
const externalProps = (url) =>
  url?.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {};

// Scroll progress (0 to 1) -> which project is showing.
const indexFromProgress = (progress) =>
  clamp(Math.floor(progress * PROJECTS.length), 0, PROJECTS.length - 1);

/* -------------------------------------------------------------------------- */
/*  Wheel                                                                     */
/* -------------------------------------------------------------------------- */

const WheelItem = ({ number, title, angle, isActive, onSelect }) => (
  <div
    style={{ transform: `rotate(${angle}deg)` }}
    className="absolute top-0 left-0 h-0 w-0"
  >
    <span
      style={DOT_STYLE}
      className={`absolute top-0 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-500 ${
        isActive ? 'size-2 bg-neutral-950' : 'size-1.5 bg-neutral-300'
      }`}
    />
    <button
      type="button"
      onClick={onSelect}
      aria-label={`${number}, ${title}`}
      aria-current={isActive}
      style={NUMBER_STYLE}
      className={`font-comfortaa absolute top-0 origin-left -translate-y-1/2 cursor-pointer px-3 py-2 text-lg font-bold outline-none transition duration-500 ease-out focus-visible:ring-2 focus-visible:ring-neutral-950 sm:text-2xl lg:text-3xl ${
        isActive
          ? 'scale-125 text-neutral-950 sm:scale-[1.4]'
          : 'text-neutral-300 hover:text-neutral-500'
      }`}
    >
      {number}
    </button>
  </div>
);

const Wheel = ({ projects, index, onSelect }) => (
  <div
    role="group"
    aria-label="Projects"
    style={WHEEL_ANCHOR_STYLE}
    className="absolute top-1/2"
  >
    <div
      aria-hidden="true"
      style={RING_STYLE}
      className="absolute rounded-full border border-neutral-300"
    />

    <motion.div
      animate={{ rotate: -index * STEP }}
      transition={WHEEL_SPRING}
      className="absolute top-0 left-0 h-0 w-0"
    >
      {projects.map((project, i) => (
        <WheelItem
          key={project.id}
          number={formatNumber(i)}
          title={project.title}
          angle={i * STEP}
          isActive={i === index}
          onSelect={() => onSelect(i)}
        />
      ))}
    </motion.div>
  </div>
);

/* -------------------------------------------------------------------------- */
/*  Panel                                                                     */
/* -------------------------------------------------------------------------- */

// Swap this div for an <img src={...} alt={...} className="h-full w-full object-cover" />
const PreviewBox = () => (
  <motion.div
    variants={previewVariants}
    className="aspect-[16/10] max-h-[42dvh] w-full overflow-hidden rounded-3xl bg-black"
  />
);

const ProjectLink = ({ href, children }) => (
  <a
    href={href}
    className="underline-offset-4 transition-opacity hover:underline hover:opacity-70"
    {...externalProps(href)}
  >
    {children}
  </a>
);

const ProjectLinks = ({ project }) => (
  <div className="font-roboto mt-5 flex items-center justify-center gap-6 text-sm text-neutral-950">
    {project.repoUrl && <ProjectLink href={project.repoUrl}>Git</ProjectLink>}
    {project.liveUrl && <ProjectLink href={project.liveUrl}>Live</ProjectLink>}
  </div>
);

const ProjectInfo = ({ project }) => (
  <motion.div
    variants={infoVariants}
    className="mt-6 flex flex-col items-center text-center"
  >
    <h3 className="font-comfortaa text-2xl font-bold tracking-tight text-neutral-950 sm:text-3xl">
      {project.title}
    </h3>
    <p className="font-roboto mt-3 max-w-xl text-sm leading-relaxed text-neutral-500 sm:text-base">
      {project.summary}
    </p>
    <ProjectLinks project={project} />
  </motion.div>
);

// Held back until the section scrolls into view, so the first entrance isn't
// spent on page load while the section is still off-screen.
const ProjectPanel = ({ project, visible }) => (
  <motion.div
    variants={panelVariants}
    initial="hidden"
    animate={visible ? 'show' : 'hidden'}
    exit="exit"
    className="flex w-full flex-col items-center"
  >
    <PreviewBox />
    <ProjectInfo project={project} />
  </motion.div>
);

/* -------------------------------------------------------------------------- */
/*  Projects Section                                                          */
/* -------------------------------------------------------------------------- */

const Projects = () => {
  const [index, setIndex] = useState(0);
  const trackRef = useRef(null);
  const stageRef = useRef(null);

  const visible = useInView(stageRef, { once: true, amount: 0.4 });

  // 0 when the stage sticks, 1 when it lets go: the whole scroll-driven part.
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start start', 'end end'],
  });

  // Scroll is the single source of truth for which project is active.
  useMotionValueEvent(scrollYProgress, 'change', (progress) => {
    const next = indexFromProgress(progress);
    setIndex((prev) => (prev === next ? prev : next));
  });

  // Clicking a number scrolls to the middle of that project's band.
  const scrollToProject = (i) => {
    const track = trackRef.current;
    if (!track) return;

    const range = track.offsetHeight - window.innerHeight;
    const trackTop = track.getBoundingClientRect().top + window.scrollY;
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    window.scrollTo({
      top: trackTop + ((i + 0.5) / PROJECTS.length) * range,
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  };

  const project = PROJECTS[index];

  return (
    <MotionConfig reducedMotion="user">
      <section
        id="work"
        style={SECTION_VARS}
        className="relative w-full bg-white"
      >
        <h2 className="sr-only">Selected work</h2>

        <div ref={trackRef} style={TRACK_STYLE} className="relative">
          {/* Sticky stage: stays on screen while the track scrolls past. */}
          <div
            ref={stageRef}
            className="sticky top-0 flex h-dvh w-full items-center overflow-hidden"
          >
            <Wheel
              projects={PROJECTS}
              index={index}
              onSelect={scrollToProject}
            />

            <div
              style={CONTENT_STYLE}
              className="relative z-10 mr-5 flex min-w-0 flex-1 items-center justify-center md:mr-16"
            >
              <div className="w-full max-w-2xl">
                <AnimatePresence mode="wait">
                  <ProjectPanel
                    key={project.id}
                    project={project}
                    visible={visible}
                  />
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MotionConfig>
  );
};

export default Projects;