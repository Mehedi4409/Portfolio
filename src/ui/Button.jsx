import React from 'react';
import { motion } from 'framer-motion';

const BUTTON_HOVER = { scale: 1.03 };
const BUTTON_TAP = { scaleX: 1.06, scaleY: 0.92 };
const BUTTON_SPRING = { type: 'spring', stiffness: 520, damping: 15, mass: 0.7 };

const VARIANTS = {
  primary: 'bg-neutral-950 text-white',
  secondary: 'bg-neutral-100 text-neutral-950',
};

const Button = ({
  children,
  variant = 'primary',
  href,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  const baseStyles =
    'font-roboto inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-normal outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 cursor-pointer select-none';
  const variantStyles = VARIANTS[variant] || VARIANTS.primary;
  const combinedClassName = `${baseStyles} ${variantStyles} ${className}`.trim();

  if (href) {
    return (
      <motion.a
        href={href}
        whileHover={BUTTON_HOVER}
        whileTap={BUTTON_TAP}
        transition={BUTTON_SPRING}
        className={combinedClassName}
        {...props}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      whileHover={BUTTON_HOVER}
      whileTap={BUTTON_TAP}
      transition={BUTTON_SPRING}
      className={combinedClassName}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;