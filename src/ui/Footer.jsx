import React, { useRef } from 'react';
import {
  MotionConfig,
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion';
import foot from '../assets/foot.jpg';

/* -------------------------------------------------------------------------- */
/*  Content                                                                   */
/* -------------------------------------------------------------------------- */

const HEADLINE = 'Thanks for stopping by.';

const LINKS = [
  { label: 'Say hello', href: '#contact' },
  { label: 'GitHub', href: 'https://github.com', external: true },
  { label: 'LinkedIn', href: 'https://linkedin.com', external: true },
  { label: 'X', href: 'https://x.com', external: true },
];

/* -------------------------------------------------------------------------- */
/*  Layout                                                                    */
/*  The stage matches the painting's own proportions, so on desktop the whole */
/*  scene shows uncropped. On tall, narrow screens it grows to 70dvh and the  */
/*  image crops from the sides, kept centred on the person and the cat.       */
/* -------------------------------------------------------------------------- */

const IMAGE_ALT =
  'Painting of a developer working on a laptop in a golden field, with a black cat beside him';

// Where the person sits in the painting, so crops and zoom stay centred on him.
const FOCAL_POINT = '43% 72%';

/* -------------------------------------------------------------------------- */
/*  Animation                                                                 */
/* -------------------------------------------------------------------------- */

const EASE = [0.32, 0.72, 0, 1];

// The painting starts slightly zoomed in and settles as the footer scrolls in.
const ZOOM_FROM = 1.12;

const headlineVariants = {
  hidden: {},
  show: { transition: { delayChildren: 0.1, staggerChildren: 0.07 } },
};

const wordVariants = {
  hidden: { y: '110%' },
  show: { y: 0, transition: { duration: 0.9, ease: EASE } },
};

/* -------------------------------------------------------------------------- */
/*  Hooks                                                                     */
/* -------------------------------------------------------------------------- */

// Scroll-linked zoom for the painting; none when the visitor prefers less motion.
const useSettleZoom = (ref) => {
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end end'],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [ZOOM_FROM, 1]);

  return reduceMotion ? undefined : { scale };
};

/* -------------------------------------------------------------------------- */
/*  Components                                                                */
/* -------------------------------------------------------------------------- */

const Painting = ({ zoom }) => (
  <motion.img
    src={foot}
    alt={IMAGE_ALT}
    loading="lazy"
    decoding="async"
    style={{ ...zoom, objectPosition: FOCAL_POINT, transformOrigin: FOCAL_POINT }}
    className="absolute inset-0 h-full w-full object-cover select-none"
  />
);

// Words rise out of a clipped line, like the hero headline.
const Headline = ({ visible }) => (
  <motion.h2
    variants={headlineVariants}
    initial="hidden"
    animate={visible ? 'show' : 'hidden'}
    className="font-comfortaa absolute top-0 left-0 max-w-[14ch] px-6 pt-24 text-4xl leading-[1.05] font-bold tracking-tight text-white sm:px-10 sm:pt-28 sm:text-6xl lg:px-16 lg:text-7xl"
  >
    {HEADLINE.split(' ').map((word, i) => (
      <span
        key={i}
        className="mr-[0.25em] -mb-[0.15em] inline-block overflow-hidden pb-[0.15em] align-top last:mr-0"
      >
        <motion.span variants={wordVariants} className="inline-block">
          {word}
        </motion.span>
      </span>
    ))}
  </motion.h2>
);

const FooterLink = ({ label, href, external }) => (
  <a
    href={href}
    className="underline-offset-4 transition-colors outline-none hover:text-white hover:underline focus-visible:ring-2 focus-visible:ring-white"
    {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
  >
    {label}
  </a>
);

const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

const FooterBar = () => (
  <div className="bg-black px-6 py-6 sm:px-10 lg:px-16">
    <div className="font-roboto mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-xs text-neutral-400 sm:flex-row sm:text-sm">
      <p>
        <span className="font-comfortaa font-bold text-white">Mehedi Hasan</span>{' '}
        © {new Date().getFullYear()}
      </p>

      <nav aria-label="Footer" className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
        {LINKS.map((link) => (
          <FooterLink key={link.label} {...link} />
        ))}
        <button
          type="button"
          onClick={scrollToTop}
          className="cursor-pointer text-white underline-offset-4 transition-opacity outline-none hover:underline hover:opacity-70 focus-visible:ring-2 focus-visible:ring-white"
        >
          Top ↑
        </button>
      </nav>
    </div>
  </div>
);

/* -------------------------------------------------------------------------- */
/*  Footer                                                                    */
/* -------------------------------------------------------------------------- */

const Footer = () => {
  const footerRef = useRef(null);
  const stageRef = useRef(null);

  const zoom = useSettleZoom(footerRef);
  const visible = useInView(stageRef, { once: true, amount: 0.3 });

  return (
    <MotionConfig reducedMotion="user">
      <footer ref={footerRef} className="w-full bg-black">
        <div
          ref={stageRef}
          className="relative aspect-[1376/768] h-[100dvh] w-full overflow-hidden"
        >
          <Painting zoom={zoom} />

          {/* Soft top shade so the headline stays readable on any crop. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-black/30 to-transparent"
          />

          <Headline visible={visible} />
        </div>

        <FooterBar />
      </footer>
    </MotionConfig>
  );
};

export default Footer;