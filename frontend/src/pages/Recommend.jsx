import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { recommendApi } from '../api/recommendApi';

// ─── Question definitions ────────────────────────────────────────────────────

const QUESTIONS = [
  {
    id: 'mood',
    question: "What's your vibe right now?",
    subtitle: 'Pick the mood that feels most like you today.',
    icon: 'mood',
    options: ['Relaxed', 'Competitive', 'Adventurous', 'Social'],
  },
  {
    id: 'timeAvailable',
    question: 'How much time do you have?',
    subtitle: 'Be honest — no judgment if it\'s all day.',
    icon: 'schedule',
    options: ['< 30 minutes', '1 – 2 hours', 'Half a day', 'All day'],
  },
  {
    id: 'genre',
    question: 'What genre speaks to you?',
    subtitle: 'Pick the one that instantly excites you.',
    icon: 'category',
    options: ['Action', 'RPG', 'Strategy', 'Puzzle', 'Horror', 'Sports'],
  },
  {
    id: 'playStyle',
    question: 'Solo warrior or team player?',
    subtitle: 'How do you prefer to experience your games?',
    icon: 'groups',
    options: ['Solo only', 'Love co-op', 'Full PvP'],
  },
  {
    id: 'platform',
    question: 'What\'s your main platform?',
    subtitle: 'Where do most of your gaming hours go?',
    icon: 'devices',
    options: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch', 'Mobile'],
  },
];

// ─── Slide animation variants ────────────────────────────────────────────────

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
};

const chipVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.95 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.06, type: 'spring', stiffness: 280, damping: 22 },
  }),
};

// ─── Loading oracle messages ─────────────────────────────────────────────────

const ORACLE_MESSAGES = [
  'Consulting the gaming oracle…',
  'Scanning 10,000+ titles…',
  'Matching your vibe to the perfect game…',
  'Almost there — calibrating fun levels…',
];

// ─── Rate limit countdown component ─────────────────────────────────────────

const RateLimitScreen = ({ seconds, onRetry, autoRetry }) => {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (!autoRetry) return; // stop auto-countdown if we've exhausted retries
    if (remaining <= 0) { onRetry(); return; }
    const timer = setTimeout(() => setRemaining((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [remaining, onRetry, autoRetry]);

  const pct = autoRetry ? Math.max(0, (remaining / seconds) * 100) : 0;

  return (
    <motion.div
      className="flex flex-col items-center justify-center gap-8 py-20"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      {/* Circular countdown */}
      <div className="relative w-32 h-32">
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="52" fill="none" stroke="#1e2736" strokeWidth="8" />
          <motion.circle
            cx="60" cy="60" r="52"
            fill="none"
            stroke="#f5c518"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 52}`}
            strokeDashoffset={`${2 * Math.PI * 52 * (1 - pct / 100)}`}
            transition={{ duration: 0.8, ease: 'linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-primary">{remaining}</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">seconds</span>
        </div>
      </div>

      <div className="text-center space-y-2">
        <p className="text-white font-black text-lg uppercase tracking-widest">Gemini is cooling down</p>
        <p className="text-gray-400 text-sm max-w-xs">
          {autoRetry
            ? 'The AI hit its rate limit. Hang tight — we\'ll auto-retry when the timer hits zero.'
            : 'Still rate-limited. Click Retry when you\'re ready to try again.'}
        </p>
      </div>

      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-graphite text-gray-300 font-bold uppercase tracking-widest text-xs hover:border-primary hover:text-primary transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <span className="material-symbols-outlined text-base">refresh</span>
        Retry now
      </button>
    </motion.div>
  );
};

// ─── Sub-components ──────────────────────────────────────────────────────────

const ProgressBar = ({ current, total }) => (
  <div className="w-full mb-8">
    <div className="flex justify-between items-center mb-2">
      <span className="text-xs font-bold uppercase tracking-widest text-primary">
        Question {current} of {total}
      </span>
      <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">
        {Math.round((current / total) * 100)}%
      </span>
    </div>
    <div className="h-1.5 w-full rounded-full bg-graphite overflow-hidden">
      <motion.div
        className="h-full rounded-full bg-primary shadow-glow-yellow"
        initial={false}
        animate={{ width: `${(current / total) * 100}%` }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      />
    </div>
    <div className="flex mt-2 gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
            i < current ? 'bg-primary' : 'bg-graphite'
          }`}
          animate={{ opacity: i < current ? 1 : 0.4 }}
        />
      ))}
    </div>
  </div>
);

const ChipButton = ({ label, selected, onClick, index }) => (
  <motion.button
    type="button"
    custom={index}
    variants={chipVariants}
    initial="hidden"
    animate="show"
    onClick={onClick}
    className={`relative px-5 py-3 rounded-xl border-2 font-bold uppercase tracking-wider text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-navy ${
      selected
        ? 'border-primary bg-primary text-navy shadow-glow-yellow scale-[1.03]'
        : 'border-graphite bg-navy/60 text-gray-300 hover:border-primary hover:text-primary hover:bg-navy'
    }`}
    whileTap={{ scale: 0.97 }}
  >
    {selected && (
      <motion.span
        className="material-symbols-outlined absolute -top-2 -right-2 text-base bg-primary text-navy rounded-full p-0.5 leading-none"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      >
        check
      </motion.span>
    )}
    {label}
  </motion.button>
);

const OtherChip = ({ value, onChange, active, onActivate, index }) => (
  <motion.div
    custom={index}
    variants={chipVariants}
    initial="hidden"
    animate="show"
    className="contents"
  >
    {!active ? (
      <button
        type="button"
        onClick={onActivate}
        className="px-5 py-3 rounded-xl border-2 border-dashed border-graphite bg-navy/40 text-gray-500 font-bold uppercase tracking-wider text-sm hover:border-primary hover:text-primary transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        ✦ Other…
      </button>
    ) : (
      <div className="col-span-full flex gap-2 mt-1">
        <input
          id="other-input"
          type="text"
          autoFocus
          placeholder="Type your answer…"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={80}
          className="flex-1 px-4 py-3 rounded-xl border-2 border-primary bg-navy text-white font-bold text-sm focus:outline-none placeholder-gray-600"
        />
      </div>
    )}
  </motion.div>
);

const StreamerToggle = ({ value, onChange }) => (
  <div className="flex gap-4 justify-center mt-2">
    {[
      { label: 'Yes, I stream', icon: '🎙️', val: true },
      { label: 'Nope, just me', icon: '🎮', val: false },
    ].map(({ label, icon, val }, i) => (
      <motion.button
        key={String(val)}
        type="button"
        custom={i}
        variants={chipVariants}
        initial="hidden"
        animate="show"
        onClick={() => onChange(val)}
        className={`flex flex-col items-center gap-3 px-8 py-6 rounded-2xl border-2 font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
          value === val
            ? 'border-primary bg-primary/10 text-primary shadow-glow-yellow scale-[1.04]'
            : 'border-graphite bg-navy/60 text-gray-300 hover:border-primary hover:text-primary'
        }`}
        whileTap={{ scale: 0.97 }}
      >
        <span className="text-4xl">{icon}</span>
        <span className="uppercase tracking-widest text-sm">{label}</span>
        {value === val && (
          <motion.span
            className="material-symbols-outlined text-lg text-primary"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          >
            check_circle
          </motion.span>
        )}
      </motion.button>
    ))}
  </div>
);

const LoadingOracle = ({ messageIndex }) => (
  <motion.div
    key="loading"
    className="flex flex-col items-center justify-center gap-8 py-20"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
  >
    {/* Animated crystal ball */}
    <div className="relative w-28 h-28">
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-br from-primary via-yellow-400 to-amber-500 opacity-20"
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute inset-4 rounded-full bg-gradient-to-br from-primary/60 to-amber-400/40 blur-sm"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.25 }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span
          className="material-symbols-outlined text-primary text-5xl"
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        >
          auto_awesome
        </motion.span>
      </div>
    </div>

    <div className="text-center space-y-2">
      <AnimatePresence mode="wait">
        <motion.p
          key={messageIndex}
          className="text-white font-bold text-lg uppercase tracking-widest"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4 }}
        >
          {ORACLE_MESSAGES[messageIndex % ORACLE_MESSAGES.length]}
        </motion.p>
      </AnimatePresence>
      <p className="text-gray-500 text-sm">Powered by Gemini AI</p>
    </div>

    {/* Progress dots */}
    <div className="flex gap-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-primary"
          animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.3 }}
        />
      ))}
    </div>
  </motion.div>
);

const MatchBadge = ({ score }) => {
  const color =
    score >= 90 ? 'from-emerald-500 to-green-400' :
    score >= 75 ? 'from-yellow-500 to-amber-400' :
    'from-blue-500 to-cyan-400';
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r ${color} text-navy font-black text-xs uppercase tracking-widest`}>
      <span className="material-symbols-outlined text-sm">bolt</span>
      {score}% Match
    </div>
  );
};

const GameRecommendCard = ({ game, index }) => {
  const navigate = useNavigate();
  const [notFound, setNotFound] = useState(false);

  const handleClick = () => {
    if (game.rawgId) {
      navigate(`/game/${game.rawgId}`);
    } else {
      setNotFound(true);
      setTimeout(() => setNotFound(false), 3000);
    }
  };

  return (
    <motion.article
      onClick={handleClick}
      className="relative overflow-hidden rounded-2xl border-2 border-graphite bg-navy flex flex-col gap-4 p-6 hover:border-primary hover:shadow-glow-yellow transition-all duration-300 group cursor-pointer"
      initial={{ opacity: 0, y: 32, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.15, type: 'spring', stiffness: 200, damping: 22 }}
      whileHover={{ y: -4 }}
    >
      {/* Loading overlay — kept for future use */}
      {/* Not found toast */}
      {notFound && (
        <motion.div
          className="absolute inset-x-4 bottom-4 z-10 px-3 py-2 rounded-xl bg-graphite border border-gray-600 text-gray-300 text-xs font-bold text-center"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Not found in game database — try searching manually
        </motion.div>
      )}

      {/* Rank badge */}
      <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-primary flex items-center justify-center font-black text-navy text-sm shadow-glow-yellow">
        {index + 1}
      </div>

      {/* Open icon — appears on hover */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        {game.streamFriendly && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-purple-600/20 border border-purple-500/40 text-purple-300 text-[10px] font-bold uppercase tracking-widest">
            <span className="material-symbols-outlined text-xs">stream</span>
            Stream Friendly
          </div>
        )}
        <span className="material-symbols-outlined text-gray-600 group-hover:text-primary transition-colors text-base">
          open_in_new
        </span>
      </div>

      <div className="mt-4 space-y-1">
        <h3 className="text-white font-black text-xl uppercase tracking-wider group-hover:text-primary transition-colors">
          {game.title}
        </h3>
        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">
          {game.developer} · {game.year}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        {game.matchScore != null && <MatchBadge score={game.matchScore} />}
        <span className="px-2 py-1 rounded-lg bg-graphite text-gray-300 text-xs font-bold uppercase tracking-widest">
          {game.genre}
        </span>
      </div>

      <p className="text-gray-300 text-sm leading-relaxed flex-1">
        {game.reason}
      </p>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-gray-500 text-xs">
          <span className="material-symbols-outlined text-sm">devices</span>
          <span className="font-bold">{game.platforms}</span>
        </div>

        {Array.isArray(game.tags) && game.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {game.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-md bg-background-dark border border-graphite text-gray-500 text-[10px] font-bold uppercase tracking-widest"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.article>
  );
};

// ─── Main page component ──────────────────────────────────────────────────────

export const Recommend = () => {
  const [phase, setPhase] = useState('intro'); // intro | quiz | loading | results | ratelimit
  const [step, setStep] = useState(0);         // 0–5 (5 chip qs + 1 streamer)
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState({
    mood: '', timeAvailable: '', genre: '', playStyle: '', platform: '', isStreamer: null,
  });
  const [otherActive, setOtherActive] = useState(false);
  const [otherValue, setOtherValue] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [oracleMsg, setOracleMsg] = useState(0);
  const [retryAfter, setRetryAfter] = useState(30);
  const [autoRetryCount, setAutoRetryCount] = useState(0);
  const MAX_AUTO_RETRIES = 2;

  const totalSteps = 6; // 5 chip + 1 streamer
  const currentQ = QUESTIONS[step];
  const isStreamerStep = step === 5;
  const fieldId = isStreamerStep ? 'isStreamer' : currentQ?.id;

  const currentValue = answers[fieldId ?? ''];
  const canAdvance = isStreamerStep
    ? answers.isStreamer !== null
    : (currentValue && currentValue !== '') || (otherActive && otherValue.trim() !== '');

  // Reset "other" state when changing questions
  const goToStep = useCallback((next, dir) => {
    setDirection(dir);
    setOtherActive(false);
    setOtherValue('');
    setStep(next);
  }, []);

  const selectChip = (option) => {
    setAnswers((prev) => ({ ...prev, [currentQ.id]: option }));
    setOtherActive(false);
    setOtherValue('');
  };

  const activateOther = () => {
    setAnswers((prev) => ({ ...prev, [currentQ.id]: '' }));
    setOtherActive(true);
    setOtherValue('');
  };

  const handleOtherChange = (val) => {
    setOtherValue(val);
    setAnswers((prev) => ({ ...prev, [currentQ.id]: val }));
  };

  const handleNext = () => {
    if (!canAdvance) return;
    if (step < totalSteps - 1) {
      goToStep(step + 1, 1);
    } else {
      submit();
    }
  };

  const handleBack = () => {
    if (step > 0) goToStep(step - 1, -1);
    else setPhase('intro');
  };

  const submit = async (isAutoRetry = false) => {
    setPhase('loading');
    setError(null);

    // Cycle oracle messages
    const interval = setInterval(() => setOracleMsg((m) => m + 1), 2200);

    try {
      const data = await recommendApi.getRecommendations(answers);
      if (!data?.recommendations?.length) {
        throw new Error('No recommendations returned. Please try again.');
      }
      setResults(data.recommendations);
      setAutoRetryCount(0); // reset on success
      setPhase('results');
    } catch (err) {
      // The axios interceptor transforms errors — check err.status directly
      if (err?.status === 429 || err?.message?.toLowerCase().includes('rate limit')) {
        const nextRetryCount = isAutoRetry ? autoRetryCount + 1 : autoRetryCount;
        setAutoRetryCount(nextRetryCount);
        setRetryAfter(30);
        setPhase('ratelimit');
      } else {
        setError(err.message || 'Something went wrong. Please try again.');
        setPhase('quiz');
      }
    } finally {
      clearInterval(interval);
    }
  };

  const restart = () => {
    setPhase('intro');
    setStep(0);
    setDirection(1);
    setAnswers({ mood: '', timeAvailable: '', genre: '', playStyle: '', platform: '', isStreamer: null });
    setOtherActive(false);
    setOtherValue('');
    setResults(null);
    setError(null);
    setOracleMsg(0);
    setRetryAfter(30);
    setAutoRetryCount(0);
  };

  // ── Intro screen ────────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <motion.div
          className="text-center max-w-xl space-y-8"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Icon */}
          <motion.div
            className="mx-auto w-24 h-24 rounded-3xl bg-primary/10 border-2 border-primary/30 flex items-center justify-center shadow-glow-yellow"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span className="material-symbols-outlined text-primary text-5xl">auto_awesome</span>
          </motion.div>

          <div className="space-y-3">
            <h1 className="text-4xl font-black uppercase tracking-widest text-white">
              Find My Game
            </h1>
            <p className="text-gray-400 text-base leading-relaxed">
              Answer <span className="text-primary font-bold">6 quick questions</span> and our AI will
              recommend the perfect game for your current mood, time, and play style.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { icon: 'quiz', label: '6 Questions' },
              { icon: 'auto_awesome', label: 'AI-Powered' },
              { icon: 'sports_esports', label: '3 Picks' },
            ].map(({ icon, label }) => (
              <div key={label} className="bg-navy rounded-xl border border-graphite p-4 space-y-2">
                <span className="material-symbols-outlined text-primary text-2xl">{icon}</span>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{label}</p>
              </div>
            ))}
          </div>

          <motion.button
            type="button"
            onClick={() => setPhase('quiz')}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-primary text-navy font-black uppercase tracking-widest text-base shadow-glow-yellow hover:scale-105 active:scale-100 transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
            whileTap={{ scale: 0.97 }}
          >
            <span className="material-symbols-outlined">bolt</span>
            Start the Quiz
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // ── Rate-limit screen ───────────────────────────────────────────────────────
  if (phase === 'ratelimit') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-lg">
          <RateLimitScreen
            seconds={retryAfter}
            onRetry={() => submit(true)}
            autoRetry={autoRetryCount < MAX_AUTO_RETRIES}
          />
        </div>
      </div>
    );
  }

  // ── Loading screen ──────────────────────────────────────────────────────────
  if (phase === 'loading') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <motion.div
          className="w-full max-w-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <LoadingOracle messageIndex={oracleMsg} />
        </motion.div>
      </div>
    );
  }

  // ── Results screen ──────────────────────────────────────────────────────────
  if (phase === 'results' && results) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <motion.div
          className="text-center space-y-3"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-bold uppercase tracking-widest mb-2">
            <span className="material-symbols-outlined text-sm">auto_awesome</span>
            AI Recommendations
          </div>
          <h2 className="text-3xl font-black uppercase tracking-widest text-white">
            Your Perfect Games
          </h2>
          <p className="text-gray-400 text-sm">
            Based on your answers — hand-picked by Gemini AI
          </p>
        </motion.div>

        {/* Summary chips */}
        <motion.div
          className="flex flex-wrap justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {Object.entries({
            Mood: answers.mood,
            Time: answers.timeAvailable,
            Genre: answers.genre,
            Style: answers.playStyle,
            Platform: answers.platform,
            Streamer: answers.isStreamer ? 'Yes 🎙️' : 'No 🎮',
          }).map(([k, v]) => (
            <span
              key={k}
              className="px-3 py-1 rounded-full bg-graphite text-gray-300 text-xs font-bold uppercase tracking-widest"
            >
              {k}: <span className="text-primary">{v}</span>
            </span>
          ))}
        </motion.div>

        {/* Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {results.map((game, i) => (
            <GameRecommendCard key={game.title + i} game={game} index={i} />
          ))}
        </div>

        <motion.div
          className="flex justify-center pt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <button
            type="button"
            onClick={restart}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-graphite text-gray-300 font-bold uppercase tracking-widest text-sm hover:border-primary hover:text-primary transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span className="material-symbols-outlined">refresh</span>
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  // ── Quiz screen ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        <ProgressBar current={step + 1} total={totalSteps} />

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            className="bg-navy border-2 border-graphite rounded-2xl p-8 space-y-6"
          >
            {/* Question header */}
            <div className="space-y-2">
              <div className="flex items-center gap-3 mb-1">
                <span className="material-symbols-outlined text-primary text-2xl">
                  {isStreamerStep ? 'live_tv' : currentQ.icon}
                </span>
                <span className="text-primary text-xs font-black uppercase tracking-widest">
                  Question {step + 1} / {totalSteps}
                </span>
              </div>
              <h2 className="text-2xl font-black uppercase tracking-wide text-white">
                {isStreamerStep ? 'Are you a streamer?' : currentQ.question}
              </h2>
              <p className="text-gray-500 text-sm">
                {isStreamerStep
                  ? 'This helps us pick games with great streaming potential & community hype.'
                  : currentQ.subtitle}
              </p>
            </div>

            {/* Answer area */}
            {isStreamerStep ? (
              <StreamerToggle
                value={answers.isStreamer}
                onChange={(val) => setAnswers((prev) => ({ ...prev, isStreamer: val }))}
              />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {currentQ.options.map((opt, i) => (
                  <ChipButton
                    key={opt}
                    label={opt}
                    selected={answers[currentQ.id] === opt && !otherActive}
                    onClick={() => selectChip(opt)}
                    index={i}
                  />
                ))}
                <OtherChip
                  value={otherValue}
                  onChange={handleOtherChange}
                  active={otherActive}
                  onActivate={activateOther}
                  index={currentQ.options.length}
                />
              </div>
            )}

            {/* Error message */}
            {error && (
              <motion.div
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-crimson/10 border border-crimson/30 text-crimson text-sm font-bold"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <span className="material-symbols-outlined text-lg">error</span>
                {error}
              </motion.div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-graphite text-gray-400 font-bold uppercase tracking-wider text-sm hover:border-primary hover:text-primary transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span className="material-symbols-outlined text-lg">arrow_back</span>
                Back
              </button>

              <motion.button
                type="button"
                onClick={handleNext}
                disabled={!canAdvance}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  canAdvance
                    ? 'bg-primary text-navy shadow-glow-yellow hover:scale-105 active:scale-100'
                    : 'bg-graphite text-gray-600 cursor-not-allowed'
                }`}
                whileTap={canAdvance ? { scale: 0.97 } : {}}
              >
                {step === totalSteps - 1 ? (
                  <>
                    <span className="material-symbols-outlined text-lg">auto_awesome</span>
                    Get My Games
                  </>
                ) : (
                  <>
                    Next
                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
