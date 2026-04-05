import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Shield, Check, X, RefreshCw, Clock, Phone, KeyRound } from "lucide-react";

interface LoginRequest {
  id: string;
  phone: string;
  otp_code: string;
  status: string;
  created_at: string;
}

const Admin = () => {
  const [requests, setRequests] = useState<LoginRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("login_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("خطأ في جلب البيانات");
    } else {
      setRequests(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();

    // Realtime subscription
    const channel = supabase
      .channel("login_requests_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "login_requests" },
        () => {
          fetchRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateStatus = async (id: string, status: "approved" | "rejected") => {
    const { error } = await supabase
      .from("login_requests")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      toast.error("خطأ في تحديث الحالة");
    } else {
      toast.success(status === "approved" ? "تمت الموافقة" : "تم الرفض");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30 gap-1"><Clock className="h-3 w-3" /> معلق</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-success/10 text-success border-success/30 gap-1"><Check className="h-3 w-3" /> موافق</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 gap-1"><X className="h-3 w-3" /> مرفوض</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString("ar-QA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <div className="bg-primary px-4 py-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-foreground/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-primary-foreground">لوحة التحكم</h1>
              <p className="text-xs text-primary-foreground/60">إدارة طلبات تسجيل الدخول</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchRequests}
            className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-3">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "معلق", count: requests.filter(r => r.status === "pending").length, color: "bg-warning/10 text-warning" },
            { label: "موافق", count: requests.filter(r => r.status === "approved").length, color: "bg-success/10 text-success" },
            { label: "مرفوض", count: requests.filter(r => r.status === "rejected").length, color: "bg-destructive/10 text-destructive" },
          ].map((stat) => (
            <div key={stat.label} className="glass-card rounded-xl p-4 text-center">
              <p className={`text-2xl font-bold ${stat.color.split(" ")[1]}`}>{stat.count}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Requests */}
        {loading && requests.length === 0 ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>لا توجد طلبات حتى الآن</p>
          </div>
        ) : (
          requests.map((req) => (
            <div key={req.id} className="glass-card rounded-xl p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold text-foreground" dir="ltr">{req.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono text-lg font-bold text-primary tracking-widest" dir="ltr">{req.otp_code}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{formatTime(req.created_at)}</span>
                  </div>
                </div>
                <div>{getStatusBadge(req.status)}</div>
              </div>

              {req.status === "pending" && (
                <div className="flex gap-2 pt-2 border-t border-border/50">
                  <Button
                    size="sm"
                    className="flex-1 gap-1 bg-success hover:bg-success/90 text-success-foreground"
                    onClick={() => updateStatus(req.id, "approved")}
                  >
                    <Check className="h-4 w-4" />
                    موافقة
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1 gap-1"
                    onClick={() => updateStatus(req.id, "rejected")}
                  >
                    <X className="h-4 w-4" />
                    رفض
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Admin;
