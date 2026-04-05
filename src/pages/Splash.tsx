import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ooredooLogo from "@/assets/ooredoo-logo.webp";

const Splash = () => {
  const navigate = useNavigate();
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeOut(true), 2500);
    const navTimer = setTimeout(() => navigate("/login", { replace: true }), 3000);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(navTimer);
    };
  }, [navigate]);

  return (
    <div
      className={`min-h-screen flex items-center justify-center relative overflow-hidden transition-opacity duration-500 ${fadeOut ? "opacity-0" : "opacity-100"}`}
      style={{ background: "linear-gradient(145deg, hsl(234 75% 32%) 0%, hsl(234 70% 22%) 50%, hsl(234 65% 18%) 100%)" }}
    >
      {/* Decorative geometric shapes */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large circle top-center */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full border border-primary-foreground/8" />
        {/* Thumbs-up / wallet icon shape top-left */}
        <div className="absolute top-16 left-8 w-24 h-28 rounded-2xl border border-primary-foreground/8 rotate-[-15deg]" />
        <div className="absolute top-20 left-12 w-16 h-20 rounded-xl border border-primary-foreground/6 rotate-[-15deg]" />
        {/* Rectangle top-right */}
        <div className="absolute top-12 right-12 w-20 h-20 rounded-xl border border-primary-foreground/6 rotate-[20deg]" />
        {/* Diagonal lines / shapes */}
        <div className="absolute top-1/3 left-[-40px] w-80 h-48 rounded-3xl border border-primary-foreground/5 rotate-[-30deg]" />
        <div className="absolute top-1/4 right-[-60px] w-72 h-40 rounded-3xl border border-primary-foreground/4 rotate-[25deg]" />
        {/* Bottom shapes */}
        <div className="absolute bottom-32 right-16 w-40 h-40 rounded-full border border-primary-foreground/6" />
        <div className="absolute bottom-20 right-24 w-24 h-24 rounded-full border border-primary-foreground/4" />
        <div className="absolute bottom-48 left-8 w-32 h-20 rounded-2xl border border-primary-foreground/5 rotate-[15deg]" />
        {/* Subtle gradient overlays */}
        <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-primary-foreground/3 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-1/4 bg-gradient-to-t from-black/10 to-transparent" />
      </div>

      {/* Logo centered */}
      <div className="relative z-10 flex flex-col items-center gap-2 animate-fade-in">
        <div className="flex items-center">
          <span className="text-ooredoo-red text-5xl font-extrabold tracking-tight" style={{ fontFamily: "'Cairo', sans-serif" }}>
            ooredoo
          </span>
          <span className="text-ooredoo-red text-5xl font-extrabold">·</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-primary-foreground text-3xl font-bold tracking-wide">m</span>
          <span className="text-ooredoo-red text-3xl font-bold">›</span>
          <span className="text-primary-foreground text-3xl font-bold tracking-wide">ney</span>
        </div>
      </div>
    </div>
  );
};

export default Splash;
