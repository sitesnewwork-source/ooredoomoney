import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import ooredooLogo from "@/assets/ooredoo-logo.webp";
import { Smartphone } from "lucide-react";

const Login = () => {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 8) {
      toast.error("يرجى إدخال رقم هاتف صحيح");
      return;
    }

    setLoading(true);
    const formattedPhone = phone.startsWith("+") ? phone : `+974${phone}`;

    const { error } = await supabase.auth.signInWithOtp({ phone: formattedPhone });

    if (error) {
      toast.error("حدث خطأ في إرسال رمز التحقق");
      console.error(error);
    } else {
      toast.success("تم إرسال رمز التحقق");
      navigate("/verify", { state: { phone: formattedPhone } });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4" dir="rtl">
      <div className="w-full max-w-sm space-y-8 animate-fade-in">
        {/* Logo */}
        <div className="flex flex-col items-center space-y-4">
          <img src={ooredooLogo} alt="Ooredoo Money" className="w-24 h-24" />
          <h1 className="text-2xl font-bold text-foreground">Ooredoo Money</h1>
          <p className="text-muted-foreground text-center text-sm">
            محفظتك الرقمية لإدارة أموالك بسهولة
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSendOtp} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">رقم الهاتف</label>
            <div className="relative">
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-muted-foreground">
                <Smartphone className="h-4 w-4" />
                <span className="text-sm font-medium">974+</span>
              </div>
              <Input
                type="tel"
                placeholder="XXXX XXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                className="pr-24 text-left h-12 text-lg tracking-wider"
                maxLength={8}
                dir="ltr"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold rounded-xl"
            disabled={loading || phone.length < 8}
          >
            {loading ? (
              <span className="animate-pulse-soft">جاري الإرسال...</span>
            ) : (
              "إرسال رمز التحقق"
            )}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          بتسجيل الدخول، أنت توافق على{" "}
          <span className="text-primary cursor-pointer">الشروط والأحكام</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
