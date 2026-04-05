import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Shield, Check, X, RefreshCw, Clock, Phone, KeyRound, User, ChevronRight } from "lucide-react";


interface LoginRequest {
  id: string;
  phone: string;
  otp_code: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Visitor {
  phone: string;
  requests: LoginRequest[];
}

const Admin = () => {
  const [requests, setRequests] = useState<LoginRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
    const channel = supabase
      .channel("login_requests_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "login_requests" }, () => {
        fetchRequests();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // Group requests by phone
  const visitors: Visitor[] = Object.values(
    requests.reduce((acc: Record<string, Visitor>, req) => {
      if (!acc[req.phone]) acc[req.phone] = { phone: req.phone, requests: [] };
      acc[req.phone].requests.push(req);
      return acc;
    }, {})
  );

  const selectedVisitor = visitors.find((v) => v.phone === selectedPhone) || null;

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
        return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30 gap-1 text-xs"><Clock className="h-3 w-3" /> معلق</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-success/10 text-success border-success/30 gap-1 text-xs"><Check className="h-3 w-3" /> موافق</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 gap-1 text-xs"><X className="h-3 w-3" /> مرفوض</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("ar-QA", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    });
  };

  const getLatestStatus = (reqs: LoginRequest[]) => {
    return reqs[0]?.status || "pending";
  };

  const pendingCount = (reqs: LoginRequest[]) => reqs.filter(r => r.status === "pending").length;

  return (
    <div className="min-h-screen bg-background flex" dir="rtl">
      {/* Sidebar - Visitors List */}
      <div className={`${sidebarOpen ? "w-80" : "w-0"} transition-all duration-300 border-l border-border bg-card flex flex-col overflow-hidden`}>
        {/* Sidebar Header */}
        <div className="bg-primary p-4 flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-primary-foreground/10 flex items-center justify-center">
            <Shield className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold text-primary-foreground truncate">لوحة التحكم</h1>
            <p className="text-[10px] text-primary-foreground/60">{visitors.length} زائر</p>
          </div>
          <Button variant="ghost" size="icon" onClick={fetchRequests} className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 h-8 w-8">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 p-3 shrink-0">
          {[
            { label: "معلق", count: requests.filter(r => r.status === "pending").length, color: "text-warning" },
            { label: "موافق", count: requests.filter(r => r.status === "approved").length, color: "text-success" },
            { label: "مرفوض", count: requests.filter(r => r.status === "rejected").length, color: "text-destructive" },
          ].map((s) => (
            <div key={s.label} className="rounded-lg bg-muted/50 p-2 text-center">
              <p className={`text-lg font-bold ${s.color}`}>{s.count}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Visitors List */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {loading && visitors.length === 0 ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : visitors.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">لا يوجد زوار</div>
            ) : (
              visitors.map((visitor) => {
                const latest = visitor.requests[0];
                const hasPending = pendingCount(visitor.requests) > 0;
                const isSelected = selectedPhone === visitor.phone;
                return (
                  <button
                    key={visitor.phone}
                    onClick={() => setSelectedPhone(visitor.phone)}
                    className={`w-full text-right rounded-lg p-3 transition-all flex items-center gap-3 ${
                      isSelected
                        ? "bg-primary/10 border border-primary/20"
                        : "hover:bg-muted/70 border border-transparent"
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      hasPending ? "bg-warning/10" : "bg-muted"
                    }`}>
                      <User className={`h-4 w-4 ${hasPending ? "text-warning" : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate" dir="ltr">{visitor.phone}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-muted-foreground">{visitor.requests.length} طلب</span>
                        {hasPending && (
                          <span className="text-[10px] text-warning font-medium">{pendingCount(visitor.requests)} معلق</span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 rotate-180" />
                  </button>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Toggle Sidebar Button (mobile) */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 right-4 z-50 md:hidden w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-lg"
      >
        <Shield className="h-5 w-5" />
      </button>

      {/* Main Content - Visitor Details */}
      <div className="flex-1 flex flex-col min-h-screen">
        {selectedVisitor ? (
          <>
            {/* Visitor Header */}
            <div className="bg-card border-b border-border p-4 flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-bold text-foreground" dir="ltr">{selectedVisitor.phone}</p>
                <p className="text-xs text-muted-foreground">{selectedVisitor.requests.length} طلب تسجيل دخول</p>
              </div>
            </div>

            {/* Timeline */}
            <ScrollArea className="flex-1 p-4">
              <div className="max-w-xl mx-auto">
                <h2 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
                  <Clock className="h-4 w-4" /> سجل النشاط
                </h2>
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute right-[19px] top-0 bottom-0 w-0.5 bg-border" />

                  <div className="space-y-4">
                    {selectedVisitor.requests.map((req, idx) => (
                      <div key={req.id} className="relative flex gap-4">
                        {/* Timeline dot */}
                        <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                          req.status === "pending"
                            ? "bg-warning/20 border-2 border-warning"
                            : req.status === "approved"
                            ? "bg-success/20 border-2 border-success"
                            : "bg-destructive/20 border-2 border-destructive"
                        }`}>
                          {req.status === "pending" ? (
                            <Clock className="h-4 w-4 text-warning" />
                          ) : req.status === "approved" ? (
                            <Check className="h-4 w-4 text-success" />
                          ) : (
                            <X className="h-4 w-4 text-destructive" />
                          )}
                        </div>

                        {/* Card */}
                        <div className="flex-1 bg-card border border-border rounded-xl p-4 shadow-sm">
                          <div className="flex items-start justify-between mb-3">
                            <div className="text-xs text-muted-foreground">{formatTime(req.created_at)}</div>
                            {getStatusBadge(req.status)}
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-sm text-foreground" dir="ltr">{req.phone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <KeyRound className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="font-mono text-xl font-bold text-primary tracking-[0.3em]" dir="ltr">{req.otp_code}</span>
                            </div>
                          </div>

                          {req.status !== req.created_at && req.updated_at !== req.created_at && (
                            <div className="text-[10px] text-muted-foreground mt-2">
                              آخر تحديث: {formatTime(req.updated_at)}
                            </div>
                          )}

                          {req.status === "pending" && (
                            <div className="flex gap-2 mt-3 pt-3 border-t border-border/50">
                              <Button
                                size="sm"
                                className="flex-1 gap-1 bg-success hover:bg-success/90 text-success-foreground h-9"
                                onClick={() => updateStatus(req.id, "approved")}
                              >
                                <Check className="h-4 w-4" />
                                موافقة
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="flex-1 gap-1 h-9"
                                onClick={() => updateStatus(req.id, "rejected")}
                              >
                                <X className="h-4 w-4" />
                                رفض
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <User className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">اختر زائراً من القائمة</p>
              <p className="text-sm mt-1">لعرض تفاصيل تسجيل الدخول والسجل الكامل</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
