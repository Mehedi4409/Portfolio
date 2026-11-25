import React, { useRef } from 'react';
import {
  MotionConfig,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion';
import one from '../assets/one.jpg';
import Button from '../ui/Button';

/* -------------------------------------------------------------------------- */
/*  Content                                                                   */
/* -------------------------------------------------------------------------- */

const HEADLINE_LINES = ['Hi, I am', 'Mehedi Hasan'];
const SUBTITLE = 'A developer with Great Design Teste ....';

const ACTIONS = [
  { label: 'View my work', href: '#work', variant: 'primary' },
  { label: 'Get in touch', href: '#contact', variant: 'secondary' },
];

/* -------------------------------------------------------------------------- */
/*  Animation                                                                 */
/* -------------------------------------------------------------------------- */

const EASE = [0.32, 0.72, 0, 1];

// Orchestrates the entrance: portrait, headline, subtitle, actions, in order.
const stageVariants = {
  hidden: {},
  show: { transition: { delayChildren: 0.1, staggerChildren: 0.12 } },
};

const portraitVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 190, damping: 22 },
  },
};

// Headline: words rise out of a clipped line, one after another.
const headlineVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const wordVariants = {
  hidden: { y: '110%' },
  show: { y: 0, transition: { duration: 0.9, ease: EASE } },
};

const fadeUpVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
};

/* -------------------------------------------------------------------------- */
/*  Hooks                                                                     */
/* -------------------------------------------------------------------------- */

// As the section scrolls out, its content eases back: smaller, lower, fading.
const useScrollExit = (ref) => {
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  return {
    opacity: useTransform(scrollYProgress, [0, 0.7], [1, 0]),
    scale: useTransform(scrollYProgress, [0, 1], [1, 0.92]),
    y: useTransform(scrollYProgress, [0, 1], [0, 80]),
  };
};

/* -------------------------------------------------------------------------- */
/*  Components                                                                */
/* -------------------------------------------------------------------------- */

const Portrait = () => (
  <motion.img
    src={one}
    alt="Mehedi Hasan portrait"
    loading="eager"
    decoding="async"
    variants={portraitVariants}
    className="mb-8 h-28 w-28 rounded-[2rem] object-cover object-top shadow-[0_20px_40px_-12px_rgba(0,0,0,0.3)] ring-1 ring-black/5 select-none sm:h-32 sm:w-32"
  />
);

// One headline line; each word sits in its own mask so it can rise into view.
const HeadlineLine = ({ text }) => (
  <span className="block">
    {text.split(' ').map((word, i) => (
      <span
        key={i}
        className="mr-[0.25em] -mb-[0.15em] inline-block overflow-hidden pb-[0.15em] align-top last:mr-0"
      >
        <motion.span variants={wordVariants} className="inline-block">
          {word}
        </motion.span>
      </span>
    ))}
  </span>
);

const Headline = () => (
  <motion.h1
    variants={headlineVariants}
    className="font-comfortaa text-5xl leading-[1.05] font-bold tracking-tight text-neutral-950 sm:text-6xl lg:text-7xl"
  >
    {HEADLINE_LINES.map((line) => (
      <HeadlineLine key={line} text={line} />
    ))}
  </motion.h1>
);

const Subtitle = () => (
  <motion.p
    variants={fadeUpVariants}
    className="font-roboto mt-6 max-w-md text-lg font-normal text-neutral-500 sm:text-xl"
  >
    {SUBTITLE}
  </motion.p>
);

const Actions = () => (
  <motion.div variants={fadeUpVariants} className="mt-10 flex flex-wrap justify-center gap-3">
    {ACTIONS.map(({ label, href, variant }) => (
      <Button key={label} href={href} variant={variant}>
        {label}
      </Button>
    ))}
  </motion.div>
);

/* -------------------------------------------------------------------------- */
/*  Banner                                                                    */
/* -------------------------------------------------------------------------- */

const Banner = () => {
  const sectionRef = useRef(null);
  const scrollExit = useScrollExit(sectionRef);
  const reduceMotion = useReducedMotion();

  return (
    <MotionConfig reducedMotion="user">
      <section
        ref={sectionRef}
        className="flex min-h-dvh w-full items-center justify-center bg-white px-6 pt-44 pb-16"
      >
        <motion.div
          variants={stageVariants}
          initial="hidden"
          animate="show"
          style={reduceMotion ? undefined : scrollExit}
          className="flex flex-col items-center text-center"
        >
          <Portrait />
          <Headline />
          <Subtitle />
          <Actions />
        </motion.div>
      </section>
    </MotionConfig>
  );
};

export default Banner;