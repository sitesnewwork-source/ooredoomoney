import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Splash = ({ onDone }: { onDone?: () => void }) => {
  const navigate = useNavigate();
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeOut(true), 2500);
    const navTimer = setTimeout(() => {
      if (onDone) {
        onDone();
      } else {
        navigate("/login", { replace: true });
      }
    }, 3000);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(navTimer);
    };
  }, [navigate, onDone]);

  return (
    <div
      className={`min-h-screen min-h-[100dvh] flex items-center justify-center relative overflow-hidden transition-opacity duration-500 ${fadeOut ? "opacity-0" : "opacity-100"}`}
      style={{ background: "linear-gradient(145deg, hsl(234 75% 32%) 0%, hsl(234 70% 22%) 50%, hsl(234 65% 18%) 100%)" }}
    >
      {/* Decorative geometric shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full border border-primary-foreground/[0.08]" />
        <div className="absolute top-16 left-8 w-24 h-28 rounded-2xl border border-primary-foreground/[0.08] rotate-[-15deg]" />
        <div className="absolute top-20 left-12 w-16 h-20 rounded-xl border border-primary-foreground/[0.06] rotate-[-15deg]" />
        <div className="absolute top-12 right-12 w-20 h-20 rounded-xl border border-primary-foreground/[0.06] rotate-[20deg]" />
        <div className="absolute top-1/3 left-[-40px] w-80 h-48 rounded-3xl border border-primary-foreground/[0.05] rotate-[-30deg]" />
        <div className="absolute top-1/4 right-[-60px] w-72 h-40 rounded-3xl border border-primary-foreground/[0.04] rotate-[25deg]" />
        <div className="absolute bottom-32 right-16 w-40 h-40 rounded-full border border-primary-foreground/[0.06]" />
        <div className="absolute bottom-20 right-24 w-24 h-24 rounded-full border border-primary-foreground/[0.04]" />
        <div className="absolute bottom-48 left-8 w-32 h-20 rounded-2xl border border-primary-foreground/[0.05] rotate-[15deg]" />
        <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-primary-foreground/[0.03] to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-1/4 bg-gradient-to-t from-black/10 to-transparent" />
      </div>

      {/* Skip button */}
      <button
        onClick={() => {
          setFadeOut(true);
          setTimeout(() => {
            if (onDone) onDone();
            else navigate("/login", { replace: true });
          }, 400);
        }}
        className="absolute top-6 left-6 z-20 text-primary-foreground/60 hover:text-primary-foreground/90 text-sm font-medium transition-colors px-3 py-1.5 rounded-full border border-primary-foreground/10 hover:border-primary-foreground/20 backdrop-blur-sm"
        style={{ fontFamily: "'Cairo', sans-serif" }}
      >
        تخطي
      </button>

      {/* Logo centered */}
      <div className="relative z-10 flex flex-col items-center gap-2">
        <div
          className="flex items-center opacity-0"
          style={{
            animation: "splash-logo 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards",
          }}
        >
          <span className="text-ooredoo-red text-5xl font-extrabold tracking-tight" style={{ fontFamily: "'Cairo', sans-serif" }}>
            ooredoo
          </span>
          <span className="text-ooredoo-red text-5xl font-extrabold" style={{ animation: "splash-pulse 1.5s ease-in-out 1.2s infinite" }}>·</span>
        </div>
        <div
          className="flex items-center gap-1 opacity-0"
          style={{
            animation: "splash-text 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.7s forwards",
          }}
        >
          <span className="text-primary-foreground text-3xl font-bold tracking-wide">m</span>
          <span className="text-ooredoo-red text-3xl font-bold">›</span>
          <span className="text-primary-foreground text-3xl font-bold tracking-wide">ney</span>
        </div>
      </div>
    </div>
  );
};

export default Splash;