import React, { useRef, useState } from 'react';
import { AnimatePresence, MotionConfig, motion, useInView } from 'framer-motion';
import Button from '../ui/Button';

/* -------------------------------------------------------------------------- */
/*  Content                                                                   */
/* -------------------------------------------------------------------------- */

const QUESTIONS = [
  {
    id: 'project-scope',
    prompt: 'What are we building together?',
    placeholder: 'A web app, mobile app, internal tool...',
  },
  {
    id: 'timeline-goal',
    prompt: 'What is your timeline and main goal?',
    placeholder: 'Launch in 4 weeks, automate a workflow...',
  },
  {
    id: 'contact-channel',
    prompt: 'Where should I reply to you?',
    placeholder: 'you@example.com',
  },
];

/* -------------------------------------------------------------------------- */
/*  Animation                                                                 */
/* -------------------------------------------------------------------------- */

const EASE = [0.32, 0.72, 0, 1];

// Each screen is a "stage": its children enter one after another.
const stageVariants = {
  hidden: {},
  show: { transition: { delayChildren: 0.05, staggerChildren: 0.08 } },
  exit: { transition: { staggerChildren: 0.03, staggerDirection: -1 } },
};

// Headline words rise out of a clipped line, and leave upward.
const wordVariants = {
  hidden: { y: '110%' },
  show: { y: 0, transition: { duration: 0.8, ease: EASE } },
  exit: { y: '-110%', transition: { duration: 0.3, ease: EASE } },
};

const fadeUpVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

/* -------------------------------------------------------------------------- */
/*  Data helpers                                                              */
/*  `answers` stays an array of { id, question, answer }, ready for Resend.   */
/* -------------------------------------------------------------------------- */

const createAnswers = () =>
  QUESTIONS.map(({ id, prompt }) => ({ id, question: prompt, answer: '' }));

const buildPayload = (answers) =>
  answers.map(({ id, question, answer }) => ({
    id,
    question,
    answer: answer.trim(),
  }));

// Wire this to your Resend endpoint. Throw on failure so the UI shows an error.
// eslint-disable-next-line no-unused-vars
const sendMessage = async (payload) => {
  // const response = await fetch('/api/contact', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ responses: payload }),
  // });
  // if (!response.ok) throw new Error('Request failed');
};

const hasText = (value) => value.trim().length > 0;
const formatNumber = (i) => String(i + 1).padStart(2, '0');

/* -------------------------------------------------------------------------- */
/*  Building blocks                                                           */
/* -------------------------------------------------------------------------- */

// Holds a screen back until the section is on screen, then plays its entrance.
const Stage = ({ visible, children }) => (
  <motion.div
    variants={stageVariants}
    initial="hidden"
    animate={visible ? 'show' : 'hidden'}
    exit="exit"
    className="flex w-full flex-col items-center text-center"
  >
    {children}
  </motion.div>
);

// Each word sits in its own mask so it can rise into view.
const Headline = ({ text }) => (
  <motion.h2
    variants={stageVariants}
    className="font-comfortaa max-w-3xl text-3xl leading-[1.1] font-bold tracking-tight text-neutral-950 sm:text-5xl lg:text-6xl"
  >
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
  </motion.h2>
);

const TextButton = ({ onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className="font-roboto cursor-pointer text-sm text-neutral-500 underline-offset-4 transition-colors outline-none hover:text-neutral-950 hover:underline focus-visible:ring-2 focus-visible:ring-neutral-950"
  >
    {children}
  </button>
);

/* -------------------------------------------------------------------------- */
/*  Screens                                                                   */
/* -------------------------------------------------------------------------- */

const QuestionScreen = ({
  question,
  step,
  total,
  value,
  inputRef,
  visible,
  onChange,
  onNext,
  onBack,
}) => {
  const canContinue = hasText(value);
  const isLast = step === total - 1;

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && canContinue) onNext();
  };

  return (
    <Stage visible={visible}>
      <motion.p
        variants={fadeUpVariants}
        className="font-comfortaa mb-6 text-sm font-bold text-neutral-400"
      >
        {formatNumber(step)} / {formatNumber(total - 1)}
      </motion.p>

      <Headline text={question.prompt} />

      <motion.div variants={fadeUpVariants} className="mt-12 w-full max-w-xl">
        <label htmlFor="contact-answer" className="sr-only">
          {question.prompt}
        </label>
        <input
          id="contact-answer"
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={question.placeholder}
          autoComplete="off"
          className="font-roboto w-full border-b border-neutral-300 bg-transparent pb-3 text-center text-xl text-neutral-950 transition-colors outline-none placeholder:text-neutral-300 focus:border-neutral-950 sm:text-2xl"
        />
      </motion.div>

      <motion.div
        variants={fadeUpVariants}
        className="mt-10 flex items-center gap-6"
      >
        {step > 0 && <TextButton onClick={onBack}>Back</TextButton>}
        <Button
          variant="primary"
          onClick={onNext}
          disabled={!canContinue}
          className={canContinue ? '' : 'opacity-40'}
        >
          {isLast ? 'Review' : 'Next'}
        </Button>
      </motion.div>
    </Stage>
  );
};

const ReviewScreen = ({
  answers,
  status,
  visible,
  onEdit,
  onSend,
}) => {
  const isSending = status === 'sending';

  return (
    <Stage visible={visible}>
      <Headline text="Ready to send?" />

      <motion.ul
        variants={fadeUpVariants}
        className="mt-10 w-full max-w-xl divide-y divide-neutral-200 border-y border-neutral-200 text-left"
      >
        {answers.map((item, i) => (
          <li key={item.id} className="flex items-start justify-between gap-6 py-4">
            <div className="min-w-0">
              <p className="font-roboto text-xs text-neutral-400">
                {item.question}
              </p>
              <p className="font-roboto mt-1 text-base break-words text-neutral-950">
                {item.answer.trim()}
              </p>
            </div>
            <TextButton onClick={() => onEdit(i)}>Edit</TextButton>
          </li>
        ))}
      </motion.ul>

      <motion.div
        variants={fadeUpVariants}
        className="mt-10 flex flex-col items-center gap-4"
      >
        <Button
          variant="primary"
          onClick={onSend}
          disabled={isSending}
          className={isSending ? 'opacity-40' : ''}
        >
          {isSending ? 'Sending...' : 'Send message'}
        </Button>

        {status === 'error' && (
          <p role="alert" className="font-roboto text-sm text-neutral-500">
            That did not go through. Please try again.
          </p>
        )}
      </motion.div>
    </Stage>
  );
};

const SentScreen = ({ contact, visible }) => (
  <Stage visible={visible}>
    <Headline text="Message sent." />
    <motion.p
      variants={fadeUpVariants}
      className="font-roboto mt-6 max-w-md text-base break-words text-neutral-500 sm:text-lg"
    >
      Thanks. I will reply to {contact} soon.
    </motion.p>
  </Stage>
);

/* -------------------------------------------------------------------------- */
/*  Contact Section                                                           */
/* -------------------------------------------------------------------------- */

const Contact = () => {
  const [answers, setAnswers] = useState(createAnswers);
  const [step, setStep] = useState(0); // 0..total-1 are questions, total is review
  const [status, setStatus] = useState('idle'); // idle | sending | error | sent

  const sectionRef = useRef(null);
  const hasInteracted = useRef(false);

  const total = QUESTIONS.length;
  const visible = useInView(sectionRef, { once: true, amount: 0.4 });

  // Focus each new question's input, but never on first load (that would
  // scroll the page down to this section).
  const focusOnMount = (el) => {
    if (el && hasInteracted.current) el.focus({ preventScroll: true });
  };

  const goTo = (i) => {
    hasInteracted.current = true;
    setStatus('idle');
    setStep(i);
  };

  const updateAnswer = (value) =>
    setAnswers((prev) =>
      prev.map((item, i) => (i === step ? { ...item, answer: value } : item))
    );

  const handleNext = () => {
    if (hasText(answers[step].answer)) goTo(step + 1);
  };

  const handleSend = async () => {
    setStatus('sending');
    try {
      await sendMessage(buildPayload(answers));
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  const renderScreen = () => {
    if (status === 'sent') {
      return (
        <SentScreen
          key="sent"
          visible={visible}
          contact={answers[total - 1].answer.trim()}
        />
      );
    }

    if (step === total) {
      return (
        <ReviewScreen
          key="review"
          answers={answers}
          status={status}
          visible={visible}
          onEdit={goTo}
          onSend={handleSend}
        />
      );
    }

    return (
      <QuestionScreen
        key={step}
        question={QUESTIONS[step]}
        step={step}
        total={total}
        value={answers[step].answer}
        inputRef={focusOnMount}
        visible={visible}
        onChange={updateAnswer}
        onNext={handleNext}
        onBack={() => goTo(step - 1)}
      />
    );
  };

  return (
    <MotionConfig reducedMotion="user">
      <section
        id="contact"
        ref={sectionRef}
        className="flex min-h-dvh w-full items-center justify-center bg-white px-6 py-24"
      >
        <div className="w-full max-w-3xl">
          <AnimatePresence mode="wait">{renderScreen()}</AnimatePresence>
        </div>
      </section>
    </MotionConfig>
  );
};

export default Contact;