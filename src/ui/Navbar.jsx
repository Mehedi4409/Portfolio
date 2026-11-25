import React, { useEffect, useRef, useState } from 'react';
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion';

/* -------------------------------------------------------------------------- */
/*  Data                                                                      */
/* -------------------------------------------------------------------------- */

const NAV_ITEMS = [
  { label: 'ABOUT ME', href: '#about' },
  { label: 'WORK', href: '#work' },
  { label: 'EXPERIENCE', href: '#experience' },
  { label: 'CONTACT', href: '#contact' },
];

/* -------------------------------------------------------------------------- */
/*  Layout                                                                    */
/*  Heights are explicit numbers (never "auto") so the spring always lands    */
/*  exactly on its target and nothing snaps at the end.                       */
/* -------------------------------------------------------------------------- */

const BUTTON_HEIGHT = 48;
const ITEM_HEIGHT = 40;
const ITEM_GAP = 2;
const LIST_PADDING_TOP = 4;
const LIST_PADDING_BOTTOM = 12;

const CLOSED = { width: 132, height: BUTTON_HEIGHT, borderRadius: 24 };
const OPEN = {
  width: 248,
  height:
    BUTTON_HEIGHT +
    LIST_PADDING_TOP +
    NAV_ITEMS.length * ITEM_HEIGHT +
    (NAV_ITEMS.length - 1) * ITEM_GAP +
    LIST_PADDING_BOTTOM,
  borderRadius: 30,
};

/* -------------------------------------------------------------------------- */
/*  Animation                                                                 */
/* -------------------------------------------------------------------------- */

// Pill <-> card: one spring drives width, height and radius together.
const SHELL_SPRING = { type: 'spring', stiffness: 380, damping: 32, mass: 0.9 };

// Press squish: low damping gives a small jelly rebound on release.
const SQUISH_SPRING = { type: 'spring', stiffness: 520, damping: 15, mass: 0.7 };
const SQUISH_PRESSED = { scaleX: 1.07, scaleY: 0.9 };
const SQUISH_RELEASED = { scaleX: 1, scaleY: 1 };

// Dock magnification.
const DOCK_RANGE = [-90, -45, 0, 45, 90];
const DOCK_SCALE = [1, 1.07, 1.2, 1.07, 1];
const DOCK_SPRING = { stiffness: 420, damping: 30, mass: 0.5 };

// Menu list: items grow in like icons popping out of the Dock.
const listVariants = {
  hidden: {},
  show: { transition: { delayChildren: 0.05, staggerChildren: 0.05 } },
  exit: { transition: { staggerChildren: 0.02, staggerDirection: -1 } },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.5, y: -14 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 380, damping: 24, mass: 0.8 },
  },
  exit: { opacity: 0, scale: 0.8, y: -8, transition: { duration: 0.12 } },
};

// MENU <-> CLOSE letters.
const letterVariants = {
  hidden: { opacity: 0, y: 9, filter: 'blur(5px)' },
  show: (i) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { type: 'spring', stiffness: 420, damping: 30, delay: i * 0.025 },
  }),
  exit: { opacity: 0, y: -9, filter: 'blur(5px)', transition: { duration: 0.15 } },
};

/* -------------------------------------------------------------------------- */
/*  Hooks                                                                     */
/* -------------------------------------------------------------------------- */

// Calls `onOutside` when a pointer goes down outside `ref`.
const useClickOutside = (ref, onOutside) => {
  useEffect(() => {
    const handle = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onOutside();
    };
    document.addEventListener('pointerdown', handle);
    return () => document.removeEventListener('pointerdown', handle);
  }, [ref, onOutside]);
};

// `pressed` turns on via `press()` and off on any pointer release, anywhere.
const usePressed = () => {
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    const release = () => setPressed(false);
    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', release);
    return () => {
      window.removeEventListener('pointerup', release);
      window.removeEventListener('pointercancel', release);
    };
  }, []);

  return [pressed, () => setPressed(true)];
};

// Spring-smoothed scale based on how close the pointer is to `ref`'s centre.
const useDockScale = (ref, mouseY) => {
  const distance = useTransform(mouseY, (y) => {
    if (!ref.current) return Infinity;
    const { top, height } = ref.current.getBoundingClientRect();
    return y - (top + height / 2);
  });
  const target = useTransform(distance, DOCK_RANGE, DOCK_SCALE);
  return useSpring(target, DOCK_SPRING);
};

/* -------------------------------------------------------------------------- */
/*  Components                                                                */
/* -------------------------------------------------------------------------- */

// Animates between words letter by letter.
const TextMorph = ({ text }) => (
  <span
    aria-label={text}
    className="relative inline-flex h-5 w-14 items-center justify-center"
  >
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={text}
        aria-hidden="true"
        initial="hidden"
        animate="show"
        exit="exit"
        className="inline-flex"
      >
        {[...text].map((char, i) => (
          <motion.span key={i} custom={i} variants={letterVariants}>
            {char}
          </motion.span>
        ))}
      </motion.span>
    </AnimatePresence>
  </span>
);

const MenuButton = React.forwardRef(({ isOpen, onClick, onPress }, ref) => (
  <button
    ref={ref}
    type="button"
    aria-expanded={isOpen}
    aria-controls="site-menu"
    onClick={onClick}
    onPointerDown={onPress}
    style={{ height: BUTTON_HEIGHT }}
    className="font-roboto flex w-full cursor-pointer items-center justify-center text-[13px] font-normal tracking-widest text-white uppercase outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-inset"
  >
    <TextMorph text={isOpen ? 'CLOSE' : 'MENU'} />
  </button>
));

const MenuItem = ({ item, mouseY, isActive, onActivate, onSelect }) => {
  const ref = useRef(null);
  const scale = useDockScale(ref, mouseY);

  return (
    <motion.li
      ref={ref}
      variants={itemVariants}
      style={{ height: ITEM_HEIGHT, transformOrigin: '50% 0%' }}
      className="relative"
    >
      {isActive && (
        <motion.span
          layoutId="menu-highlight"
          transition={{ type: 'spring', stiffness: 500, damping: 36 }}
          className="absolute inset-0 rounded-2xl bg-white/10"
        />
      )}
      <a
        href={item.href}
        onClick={onSelect}
        onMouseEnter={onActivate}
        onFocus={onActivate}
        className="font-roboto relative flex h-full w-full items-center justify-center rounded-2xl text-[13px] font-normal tracking-wider text-white uppercase outline-none focus-visible:ring-2 focus-visible:ring-white/70"
      >
        <motion.span style={{ scale }} className="inline-block">
          {item.label}
        </motion.span>
      </a>
    </motion.li>
  );
};

// Owns hover state, so it resets automatically every time the menu unmounts.
const MenuList = ({ onSelect }) => {
  const mouseY = useMotionValue(Infinity);
  const [activeIndex, setActiveIndex] = useState(null);

  const handleLeave = () => {
    mouseY.set(Infinity);
    setActiveIndex(null);
  };

  return (
    <motion.nav
      id="site-menu"
      aria-label="Primary"
      variants={listVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      onMouseMove={(e) => mouseY.set(e.clientY)}
      onMouseLeave={handleLeave}
    >
      <ul
        style={{
          gap: ITEM_GAP,
          paddingTop: LIST_PADDING_TOP,
          paddingBottom: LIST_PADDING_BOTTOM,
        }}
        className="flex flex-col px-2"
      >
        {NAV_ITEMS.map((item, i) => (
          <MenuItem
            key={item.label}
            item={item}
            mouseY={mouseY}
            isActive={activeIndex === i}
            onActivate={() => setActiveIndex(i)}
            onSelect={onSelect}
          />
        ))}
      </ul>
    </motion.nav>
  );
};

/* -------------------------------------------------------------------------- */
/*  Navbar                                                                    */
/* -------------------------------------------------------------------------- */

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [pressed, press] = usePressed();
  const rootRef = useRef(null);
  const buttonRef = useRef(null);

  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen((open) => !open);

  useClickOutside(rootRef, close);

  const handleKeyDown = (e) => {
    if (e.key !== 'Escape') return;
    close();
    buttonRef.current?.focus();
  };

  return (
    <MotionConfig reducedMotion="user">
      <header className="pointer-events-none fixed top-5 right-0 left-0 z-50 flex justify-center px-4">
        <div
          ref={rootRef}
          onKeyDown={handleKeyDown}
          className="pointer-events-auto"
        >
          {/* Squish layer sits outside the clipped shell so it can stretch. */}
          <motion.div
            initial={false}
            animate={pressed ? SQUISH_PRESSED : SQUISH_RELEASED}
            transition={SQUISH_SPRING}
            style={{ transformOrigin: '50% 0%' }}
          >
            {/* Shell: one black surface that grows from pill to card. */}
            <motion.div
              initial={false}
              animate={isOpen ? OPEN : CLOSED}
              transition={SHELL_SPRING}
              className="overflow-hidden bg-black shadow-[0_10px_30px_-8px_rgba(0,0,0,0.45)] ring-1 ring-white/10"
            >
              <MenuButton
                ref={buttonRef}
                isOpen={isOpen}
                onClick={toggle}
                onPress={press}
              />
              <AnimatePresence>
                {isOpen && <MenuList onSelect={close} />}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </div>
      </header>
    </MotionConfig>
  );
};

export default Navbar;