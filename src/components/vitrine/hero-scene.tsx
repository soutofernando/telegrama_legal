export function HeroScene() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      <div
        className="absolute inset-0 bg-[linear-gradient(165deg,var(--primary-soft)_0%,transparent_45%,rgb(255_222_89_/_0.1)_100%)]"
      />
      <div className="hero-glow hero-glow-blue" />
      <div className="hero-glow hero-glow-yellow" />
      <div className="hero-glow hero-glow-accent hidden sm:block" />
      <div className="hero-shine hidden sm:block" />
    </div>
  );
}
