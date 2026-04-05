import { useNavigate } from "react-router-dom";
import { CheckCircle2, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import ooredooLogo from "@/assets/ooredoo-logo.webp";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4" dir="rtl">
      <div className="flex flex-col items-center space-y-6 animate-fade-in">
        {/* Success Icon */}
        <div className="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center animate-scale-in">
          <CheckCircle2 className="h-14 w-14 text-success" />
        </div>

        {/* Logo */}
        <img src={ooredooLogo} alt="Ooredoo" className="h-10 object-contain" />

        {/* Text */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-extrabold text-foreground">تم التسجيل بنجاح!</h1>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
            تمت الموافقة على طلبك بنجاح. شكراً لاستخدامك خدماتنا.
          </p>
        </div>

        {/* Back Button */}
        <Button
          onClick={() => navigate("/")}
          variant="outline"
          className="mt-4 gap-2 rounded-xl"
        >
          <Home className="h-4 w-4" />
          العودة للرئيسية
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;
