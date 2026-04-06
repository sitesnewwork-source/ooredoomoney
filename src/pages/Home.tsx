import { useState, useEffect } from "react";
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

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft(getNextFriday()));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const timeUnits = [
    { label: "يوم", value: timeLeft.days },
    { label: "ساعة", value: timeLeft.hours },
    { label: "دقيقة", value: timeLeft.minutes },
    { label: "ثانية", value: timeLeft.seconds },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-hidden" dir="rtl">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center px-4 pt-8 pb-0">
        {/* Background glow */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-80 h-80 bg-[#d4a017]/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Logo */}
        <img
          src={ooredooLogo}
          alt="Ooredoo Money"
          className="h-12 object-contain animate-fade-in mb-4"
          style={{ animationDelay: "0.1s", animationFillMode: "both" }}
        />

        {/* Badge */}
        <div
          className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6 animate-fade-in"
          style={{ animationDelay: "0.2s", animationFillMode: "both" }}
        >
          <Star className="h-3.5 w-3.5 text-primary fill-primary" />
          <span className="text-xs font-bold text-primary">عرض حصري لفترة محدودة</span>
          <Star className="h-3.5 w-3.5 text-primary fill-primary" />
        </div>

        {/* Gold Image */}
        <div
          className="relative w-56 h-56 flex items-center justify-center animate-scale-in"
          style={{ animationDelay: "0.4s", animationFillMode: "both" }}
        >
          <div className="absolute inset-0 rounded-full bg-[#d4a017]/25 blur-3xl animate-pulse" />
          <div className="absolute inset-4 rounded-full bg-[#d4a017]/15 blur-2xl" />
          <img
            src={goldBars}
            alt="سبائك ذهب"
            className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_30px_rgba(212,160,23,0.5)]"
          />
        </div>
      </section>

      {/* Content Section */}
      <section className="flex flex-col items-center px-6 pt-4 pb-8 space-y-5">
        {/* Headline */}
        <div className="text-center space-y-3">
          <h1
            className="text-3xl font-extrabold text-foreground leading-tight animate-fade-in"
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
      </section>
    </div>
  );
};

export default Home;
