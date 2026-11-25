import React from 'react';
import { MotionConfig, motion } from 'framer-motion';

/* -------------------------------------------------------------------------- */
/*  Content                                                                   */
/* -------------------------------------------------------------------------- */

const EXPERIENCES = [
  {
    id: 'virtual-armies',
    company: 'Virtual Armies',
    role: 'Programme Coordinator & IT',
    summary:
      'Managed CRM workflows, built operational automations, developed and maintained company and client websites, and contributed directly to core client initiatives.',
    meta: '2025 – 2026 · Remote',
  },
];

/* -------------------------------------------------------------------------- */
/*  Animation                                                                 */
/* -------------------------------------------------------------------------- */

const EASE = [0.32, 0.72, 0, 1];

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: EASE },
  },
};

/* -------------------------------------------------------------------------- */
/*  Experience Section                                                        */
/* -------------------------------------------------------------------------- */

const Experience = () => {
  return (
    <MotionConfig reducedMotion="user">
      <section
        id="experience"
        className="flex min-h-[70dvh] w-full flex-col justify-center bg-white px-6 py-24"
      >
        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="mx-auto w-full max-w-4xl"
        >
          {/* Section Heading */}
          <h2 className="font-comfortaa mb-14 text-center text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl lg:text-5xl">
            Career
          </h2>

          {/* Experience Row */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-[12rem_1fr] md:gap-10">
            <span className="font-comfortaa text-lg font-bold tracking-tight text-neutral-950 sm:text-xl">
              Experience
            </span>

            <div className="space-y-8">
              {EXPERIENCES.map((item) => (
                <article key={item.id} className="max-w-xl">
                  <h3 className="font-comfortaa text-lg font-bold tracking-tight text-neutral-950 sm:text-xl">
                    {item.company}{' '}
                    <span className="font-roboto font-normal text-neutral-400">
                      {item.role}
                    </span>
                  </h3>

                  <p className="font-roboto mt-2 text-sm leading-relaxed text-neutral-600 sm:text-base">
                    {item.summary}
                  </p>

                  <p className="font-roboto mt-2 text-xs text-neutral-400 sm:text-sm">
                    {item.meta}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </motion.div>
      </section>
    </MotionConfig>
  );
};

export default Experience;