import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ooredooLogo from "@/assets/ooredoo-logo.png";
import { ArrowRight } from "lucide-react";

const VerifyOtp = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const phone = (location.state as { phone?: string })?.phone;

  useEffect(() => {
    if (!phone) {
      navigate("/login");
      return;
    }
    inputRefs.current[0]?.focus();
  }, [phone, navigate]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = [...otp];
    pasted.split("").forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      toast.error("يرجى إدخال رمز التحقق كاملاً");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      phone: phone!,
      token: code,
      type: "sms",
    });
    if (error) {
      toast.error("رمز التحقق غير صحيح");
    } else {
      toast.success("تم تسجيل الدخول بنجاح");
      navigate("/");
    }
    setLoading(false);
  };

  const handleResend = async () => {
    const { error } = await supabase.auth.signInWithOtp({ phone: phone! });
    if (error) {
      toast.error("حدث خطأ في إعادة إرسال الرمز");
    } else {
      toast.success("تم إعادة إرسال الرمز");
      setCountdown(60);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4" dir="rtl">
      <div className="w-full max-w-sm space-y-8 animate-fade-in">
        {/* Back button */}
        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowRight className="h-5 w-5" />
          <span className="text-sm">رجوع</span>
        </button>

        {/* Logo */}
        <div className="flex flex-col items-center space-y-4">
          <img src={ooredooLogo} alt="Ooredoo Money" className="w-20 h-20" />
          <h1 className="text-xl font-bold text-foreground">رمز التحقق</h1>
          <p className="text-muted-foreground text-center text-sm">
            تم إرسال رمز مكون من 6 أرقام إلى
            <br />
            <span className="text-foreground font-medium" dir="ltr">{phone}</span>
          </p>
        </div>

        {/* OTP Inputs */}
        <div className="flex gap-3 justify-center" dir="ltr">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={i === 0 ? handlePaste : undefined}
              className="w-12 h-14 text-center text-xl font-bold rounded-xl border-2 border-input bg-card text-foreground focus:border-primary focus:ring-2 focus:ring-ring/20 outline-none transition-all"
            />
          ))}
        </div>

        {/* Verify Button */}
        <Button
          onClick={handleVerify}
          className="w-full h-12 text-base font-semibold rounded-xl"
          disabled={loading || otp.join("").length !== 6}
        >
          {loading ? (
            <span className="animate-pulse-soft">جاري التحقق...</span>
          ) : (
            "تأكيد"
          )}
        </Button>

        {/* Resend */}
        <div className="text-center">
          {countdown > 0 ? (
            <p className="text-sm text-muted-foreground">
              إعادة الإرسال خلال <span className="text-primary font-medium">{countdown}</span> ثانية
            </p>
          ) : (
            <button
              onClick={handleResend}
              className="text-sm text-primary font-medium hover:underline"
            >
              إعادة إرسال الرمز
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
