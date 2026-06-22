@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-ink text-paper font-body antialiased;
    /* subtle ambient glow so the deep teal doesn't read flat */
    background-image:
      radial-gradient(60% 50% at 80% 0%, rgba(123, 128, 255, 0.10), transparent 70%),
      radial-gradient(50% 40% at 0% 100%, rgba(255, 106, 69, 0.10), transparent 70%);
    background-attachment: fixed;
  }

  h1, h2, h3 {
    @apply font-display font-bold tracking-tight;
  }
}

@layer components {
  .btn {
    @apply inline-flex items-center justify-center gap-2 rounded-full font-display font-medium
           transition-all duration-150 active:scale-[0.97] disabled:opacity-40 disabled:active:scale-100;
  }
  .btn-primary {
    @apply btn bg-coral text-ink shadow-glow hover:brightness-105 px-7 py-3.5 text-lg;
  }
  .btn-ghost {
    @apply btn border border-mist/30 text-paper hover:border-mist/60 px-6 py-3;
  }

  /* answer option button */
  .option {
    @apply w-full text-left rounded-2xl border px-5 py-4 font-body text-lg transition-all duration-150
           border-mist/20 bg-ink-600 hover:border-mist/50 hover:bg-ink-500;
  }
  .option-selected {
    @apply border-coral bg-coral/15 text-paper;
  }

  .card {
    @apply rounded-3xl bg-ink-600 border border-mist/15 shadow-card;
  }

  .eyebrow {
    @apply font-mono text-xs uppercase tracking-[0.2em] text-mist;
  }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
