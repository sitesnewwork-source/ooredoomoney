import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LogIn, Shield } from "lucide-react";
import ooredooLogo from "@/assets/ooredoo-logo.webp";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4" dir="rtl">
      <div className="flex flex-col items-center space-y-8 animate-fade-in max-w-md w-full">
        {/* Logo */}
        <img src={ooredooLogo} alt="Ooredoo" className="h-16 object-contain" />

        {/* Welcome Text */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-extrabold text-foreground">
            أهلاً وسهلاً
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            مرحباً بك في نظام Ooredoo Money للتحويلات المالية. سجّل دخولك للبدء.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-4 w-full">
          <div className="glass-card rounded-xl p-4 flex flex-col items-center gap-2 text-center">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-xs text-muted-foreground font-medium">آمن وموثوق</span>
          </div>
          <div className="glass-card rounded-xl p-4 flex flex-col items-center gap-2 text-center">
            <ArrowLeft className="h-8 w-8 text-primary" />
            <span className="text-xs text-muted-foreground font-medium">تحويل سريع</span>
          </div>
        </div>

        {/* CTA Button */}
        <Button
          onClick={() => navigate("/login")}
          className="w-full rounded-xl h-12 text-base font-bold gap-2"
        >
          <LogIn className="h-5 w-5" />
          تسجيل الدخول
        </Button>
      </div>
    </div>
  );
};

export default Home;
