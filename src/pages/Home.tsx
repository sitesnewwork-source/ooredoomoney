import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogIn, Trophy, Gift, Users, Star, ChevronLeft, Clock } from "lucide-react";
import ooredooLogo from "@/assets/ooredoo-logo.webp";
import goldBars from "@/assets/gold-bars.png";

function getNextFriday() {
  const now = new Date();
  const day = now.getDay();
  const daysUntilFriday = (5 - day + 7) % 7 || 7;
  const next = new Date(now);
  next.setDate(now.getDate() + daysUntilFriday);
  next.setHours(20, 0, 0, 0);
  return next;
}

function getTimeLeft(target: Date) {
  const diff = Math.max(0, target.getTime() - Date.now());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds };
}

const Home = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(getNextFriday()));
  const [winnersCount, setWinnersCount] = useState(0);
  const winnersTarget = 1470;
  const countStarted = useRef(false);
  const testimonialsRef = useRef<HTMLDivElement>(null);
  const autoScrollPaused = useRef(false);
  const scrollIndex = useRef(0);

  const testimonials = [
    { name: "أحمد م.", text: "فزت بسبيكة ذهب في أول أسبوع! تجربة رائعة ومصداقية عالية.", emoji: "🥇" },
    { name: "فاطمة ع.", text: "ما كنت أتوقع الفوز، لكن وصلتني السبيكة خلال يومين. شكراً Ooredoo!", emoji: "✨" },
    { name: "محمد ك.", text: "سحب حقيقي وجوائز حقيقية. أنصح الجميع بالتسجيل.", emoji: "💎" },
    { name: "سارة ن.", text: "تجربة سهلة وسريعة، التسجيل بدقيقة واحدة والجائزة وصلتني فعلاً!", emoji: "🌟" },
    { name: "خالد ر.", text: "كنت متردد بالبداية لكن لما فزت تأكدت إنه سحب حقيقي 100%.", emoji: "🏆" },
    { name: "نورة ص.", text: "ثاني مرة أفوز! شكراً Ooredoo Money على هالفرصة الذهبية.", emoji: "💫" },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft(getNextFriday()));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (countStarted.current) return;
    countStarted.current = true;
    const duration = 2000;
    const steps = 60;
    const increment = winnersTarget / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= winnersTarget) {
        setWinnersCount(winnersTarget);
        clearInterval(interval);
      } else {
        setWinnersCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (autoScrollPaused.current || !testimonialsRef.current) return;
      const container = testimonialsRef.current;
      const cardWidth = 260 + 12; // min-w + gap
      scrollIndex.current = (scrollIndex.current + 1) % testimonials.length;
      container.scrollTo({ left: scrollIndex.current * cardWidth, behavior: "smooth" });
      if (scrollIndex.current === 0) {
        container.scrollTo({ left: 0, behavior: "smooth" });
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const timeUnits = [
    { label: "يوم", value: timeLeft.days },
    { label: "ساعة", value: timeLeft.hours },
    { label: "دقيقة", value: timeLeft.minutes },
    { label: "ثانية", value: timeLeft.seconds },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-x-hidden" dir="rtl">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center px-4 pt-6 pb-2">
        {/* Background glow */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-60 h-60 bg-[#d4a017]/10 rounded-full blur-[80px] pointer-events-none" />

        {/* Logo */}
        <img
          src={ooredooLogo}
          alt="Ooredoo Money"
          className="h-10 object-contain animate-fade-in mb-3"
          style={{ animationDelay: "0.1s", animationFillMode: "both" }}
        />

        {/* Badge */}
        <div
          className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-3 py-1 mb-3 animate-fade-in"
          style={{ animationDelay: "0.2s", animationFillMode: "both" }}
        >
          <Star className="h-3 w-3 text-primary fill-primary" />
          <span className="text-[11px] font-bold text-primary">عرض حصري لفترة محدودة</span>
          <Star className="h-3 w-3 text-primary fill-primary" />
        </div>

        {/* Gold Image */}
        <div
          className="relative w-40 h-40 flex items-center justify-center animate-scale-in"
          style={{ animationDelay: "0.4s", animationFillMode: "both" }}
        >
          <div className="absolute inset-0 rounded-full bg-[#d4a017]/25 blur-3xl animate-pulse" />
          <div className="absolute inset-4 rounded-full bg-[#d4a017]/15 blur-2xl" />
          <img
            src={goldBars}
            alt="سبائك ذهب"
            className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_25px_rgba(212,160,23,0.5)]"
          />
        </div>
      </section>

      {/* Content Section */}
      <section className="flex flex-col items-center px-5 pt-2 pb-6 space-y-4">
        {/* Headline */}
        <div className="text-center space-y-2">
          <h1
            className="text-2xl font-extrabold text-foreground leading-tight animate-fade-in"
            style={{ animationDelay: "0.6s", animationFillMode: "both" }}
          >
            فرصتك الذهبية
            <br />
            <span className="text-primary">للفوز بسبائك الذهب!</span>
          </h1>
          <p
            className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto animate-fade-in"
            style={{ animationDelay: "0.8s", animationFillMode: "both" }}
          >
            سجّل الآن في السحب الأسبوعي وكن واحداً من
            <span className="text-foreground font-bold"> 30 فائزاً محظوظاً </span>
            بسبائك ذهب حقيقية!
          </p>
        </div>

        {/* Stats Cards */}
        {/* Countdown Timer */}
        <div
          className="w-full max-w-sm glass-card rounded-2xl p-4 animate-fade-in"
          style={{ animationDelay: "0.95s", animationFillMode: "both" }}
        >
          <div className="flex items-center justify-center gap-1.5 mb-3">
            <Clock className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold text-muted-foreground">السحب القادم يوم الجمعة</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {timeUnits.map(({ label, value }) => (
              <div key={label} className="flex flex-col items-center">
                <div className="w-full bg-primary/10 border border-primary/20 rounded-xl py-2 text-center">
                  <span className="text-xl font-extrabold text-foreground tabular-nums">
                    {String(value).padStart(2, "0")}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground mt-1 font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2.5 w-full max-w-sm">
          {[
            { icon: Trophy, value: "ذهب حقيقي", sub: "سبائك عيار 999.9", delay: "1s" },
            { icon: Gift, value: "كل أسبوع", sub: "سحب مستمر", delay: "1.15s" },
            { icon: Users, value: "30 فائز", sub: "أسبوعياً", delay: "1.3s" },
          ].map(({ icon: Icon, value, sub, delay }) => (
            <div
              key={value}
              className="glass-card rounded-2xl p-3 flex flex-col items-center gap-1.5 text-center hover-scale animate-scale-in"
              style={{ animationDelay: delay, animationFillMode: "both" }}
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xs font-bold text-foreground">{value}</span>
              <span className="text-[10px] text-muted-foreground">{sub}</span>
            </div>
          ))}
        </div>

        {/* Trust text */}
        <p
          className="text-[11px] text-muted-foreground text-center animate-fade-in"
          style={{ animationDelay: "1.4s", animationFillMode: "both" }}
        >
          🔒 التسجيل مجاني وآمن — خاص بعملاء محفظة Ooredoo Money
        </p>

        {/* CTA Button */}
        <Button
          onClick={() => navigate("/login")}
          className="w-full max-w-sm rounded-2xl h-14 text-lg font-extrabold gap-2 shadow-lg shadow-primary/20 animate-fade-in hover-scale"
          style={{ animationDelay: "1.5s", animationFillMode: "both" }}
        >
          سجّل الآن واربح
          <ChevronLeft className="h-5 w-5" />
        </Button>

        {/* Secondary link */}
        <button
          onClick={() => navigate("/login")}
          className="text-xs text-muted-foreground hover:text-primary transition-colors animate-fade-in"
          style={{ animationDelay: "1.7s", animationFillMode: "both" }}
        >
          لديك حساب بالفعل؟ <span className="text-primary font-bold">سجل دخولك</span>
        </button>

        {/* Testimonials */}
        <div
          className="w-full max-w-sm space-y-3 animate-fade-in pb-4"
          style={{ animationDelay: "1.8s", animationFillMode: "both" }}
        >
          <h2 className="text-sm font-bold text-foreground text-center">⭐ آراء فائزين سابقين</h2>
          <div
            ref={testimonialsRef}
            className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
            onPointerDown={() => { autoScrollPaused.current = true; }}
            onPointerUp={() => { autoScrollPaused.current = false; }}
          >
            {testimonials.map((t) => (
              <div key={t.name} className="glass-card rounded-2xl p-4 flex flex-col items-center justify-center gap-2 min-w-[160px] w-[160px] h-[160px] snap-start shrink-0 text-center">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg shrink-0">
                  {t.emoji}
                </div>
                <span className="text-sm font-bold text-foreground">{t.name}</span>
                <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-3">{t.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
