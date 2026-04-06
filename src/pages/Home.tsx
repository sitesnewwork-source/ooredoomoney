import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogIn, Trophy, Gift, Users } from "lucide-react";
import ooredooLogo from "@/assets/ooredoo-logo.webp";
import goldBars from "@/assets/gold-bars.png";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center bg-background px-4 py-8" dir="rtl">
      <div className="flex flex-col items-center space-y-6 animate-fade-in max-w-md w-full">
        {/* Logo */}
        <img src={ooredooLogo} alt="Ooredoo Money" className="h-14 object-contain" />

        {/* Gold Promo Image */}
        <div className="w-72 h-72 flex items-center justify-center">
          <img
            src={goldBars}
            alt="سبائك ذهب"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Promo Info */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-extrabold text-foreground">
            اربح سبائك الذهب
          </h1>
          <p className="text-primary text-lg font-bold">
            سجل في السحب الآن
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed">
            كن من بين 30 فائزًا بالذهب كل أسبوع! خاص بعملاء محفظة اوريدو موني.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-3 w-full">
          <div className="glass-card rounded-xl p-3 flex flex-col items-center gap-2 text-center">
            <Trophy className="h-6 w-6 text-primary" />
            <span className="text-xs text-muted-foreground font-medium">جوائز ذهبية</span>
          </div>
          <div className="glass-card rounded-xl p-3 flex flex-col items-center gap-2 text-center">
            <Gift className="h-6 w-6 text-primary" />
            <span className="text-xs text-muted-foreground font-medium">سحب أسبوعي</span>
          </div>
          <div className="glass-card rounded-xl p-3 flex flex-col items-center gap-2 text-center">
            <Users className="h-6 w-6 text-primary" />
            <span className="text-xs text-muted-foreground font-medium">30 فائز</span>
          </div>
        </div>

        {/* CTA Button */}
        <Button
          onClick={() => navigate("/login")}
          className="w-full rounded-xl h-12 text-base font-bold gap-2"
        >
          <LogIn className="h-5 w-5" />
          سجل الآن
        </Button>
      </div>
    </div>
  );
};

export default Home;
