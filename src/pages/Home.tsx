import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogIn, Trophy, Gift, Users } from "lucide-react";
import ooredooLogo from "@/assets/ooredoo-logo.webp";
import goldBars from "@/assets/gold-bars.png";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center bg-background px-4 py-8" dir="rtl">
      <div className="flex flex-col items-center space-y-6 max-w-md w-full">
        {/* Logo */}
        <img
          src={ooredooLogo}
          alt="Ooredoo Money"
          className="h-14 object-contain animate-fade-in"
          style={{ animationDelay: "0.1s", animationFillMode: "both" }}
        />

        {/* Gold Promo Image */}
        <div
          className="w-72 h-72 flex items-center justify-center relative animate-scale-in"
          style={{ animationDelay: "0.3s", animationFillMode: "both" }}
        >
          <div className="absolute inset-0 rounded-full bg-[#d4a017]/20 blur-3xl animate-pulse" />
          <img
            src={goldBars}
            alt="سبائك ذهب"
            className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_25px_rgba(212,160,23,0.4)]"
          />
        </div>

        {/* Promo Info */}
        <div className="text-center space-y-2">
          <h1
            className="text-2xl font-extrabold text-foreground animate-fade-in"
            style={{ animationDelay: "0.5s", animationFillMode: "both" }}
          >
            اربح سبائك الذهب
          </h1>
          <p
            className="text-primary text-lg font-bold animate-fade-in"
            style={{ animationDelay: "0.7s", animationFillMode: "both" }}
          >
            سجل في السحب الآن
          </p>
          <p
            className="text-muted-foreground text-sm leading-relaxed animate-fade-in"
            style={{ animationDelay: "0.9s", animationFillMode: "both" }}
          >
            كن من بين 30 فائزًا بالذهب كل أسبوع! خاص بعملاء محفظة اوريدو موني.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-3 w-full">
          {[
            { icon: Trophy, label: "جوائز ذهبية", delay: "1.1s" },
            { icon: Gift, label: "سحب أسبوعي", delay: "1.25s" },
            { icon: Users, label: "30 فائز", delay: "1.4s" },
          ].map(({ icon: Icon, label, delay }) => (
            <div
              key={label}
              className="glass-card rounded-xl p-3 flex flex-col items-center gap-2 text-center hover-scale animate-scale-in"
              style={{ animationDelay: delay, animationFillMode: "both" }}
            >
              <Icon className="h-6 w-6 text-primary" />
              <span className="text-xs text-muted-foreground font-medium">{label}</span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <Button
          onClick={() => navigate("/login")}
          className="w-full rounded-xl h-12 text-base font-bold gap-2 animate-fade-in hover-scale"
          style={{ animationDelay: "1.6s", animationFillMode: "both" }}
        >
          <LogIn className="h-5 w-5" />
          سجل الآن
        </Button>
      </div>
    </div>
  );
};

export default Home;
