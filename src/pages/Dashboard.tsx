import { useAuth } from "@/hooks/useAuth";
import { 
  ArrowUpLeft, ArrowDownRight, Receipt, Smartphone, 
  Zap, CreditCard, MoreHorizontal, LogOut, Bell,
  Send, QrCode, Wallet, Eye, EyeOff, TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const quickActions = [
  { icon: Send, label: "تحويل", color: "bg-primary/10 text-primary" },
  { icon: QrCode, label: "مسح QR", color: "bg-accent text-accent-foreground" },
  { icon: Smartphone, label: "شحن رصيد", color: "bg-success/10 text-success" },
  { icon: Receipt, label: "الفواتير", color: "bg-warning/10 text-warning" },
  { icon: CreditCard, label: "البطاقات", color: "bg-primary/10 text-primary" },
  { icon: Zap, label: "كهرباء", color: "bg-accent text-accent-foreground" },
  { icon: Wallet, label: "المحفظة", color: "bg-success/10 text-success" },
  { icon: MoreHorizontal, label: "المزيد", color: "bg-muted text-muted-foreground" },
];

const transactions = [
  { id: 1, name: "تحويل إلى أحمد", amount: -250, date: "اليوم، 2:30 م", type: "out" },
  { id: 2, name: "استلام من محمد", amount: 1500, date: "اليوم، 11:00 ص", type: "in" },
  { id: 3, name: "دفع فاتورة كهرباء", amount: -340, date: "أمس، 4:15 م", type: "out" },
  { id: 4, name: "شحن رصيد Ooredoo", amount: -50, date: "أمس، 9:00 ص", type: "out" },
  { id: 5, name: "استلام راتب", amount: 8500, date: "3 أبريل، 8:00 ص", type: "in" },
];

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showBalance, setShowBalance] = useState(true);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="relative bg-primary text-primary-foreground px-4 pt-6 pb-24 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-[-80px] right-[-60px] w-56 h-56 rounded-full bg-primary-foreground/5" />
        <div className="absolute bottom-[-40px] left-[-30px] w-40 h-40 rounded-full bg-primary-foreground/5" />
        <div className="absolute top-20 left-16 w-24 h-24 rounded-full bg-primary-foreground/3" />

        <div className="relative z-10 max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-primary-foreground/10 flex items-center justify-center text-lg font-bold">
                {(user?.phone || "م").charAt(0)}
              </div>
              <div>
                <p className="text-primary-foreground/60 text-xs">مرحباً 👋</p>
                <h2 className="text-base font-bold">{user?.phone || "المستخدم"}</h2>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="relative p-2.5 rounded-xl bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-warning rounded-full ring-2 ring-primary" />
              </button>
              <button 
                onClick={handleSignOut}
                className="p-2.5 rounded-xl bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Balance Card */}
          <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-5 border border-primary-foreground/10">
            <div className="flex items-center justify-between mb-3">
              <p className="text-primary-foreground/60 text-sm">الرصيد المتاح</p>
              <button 
                onClick={() => setShowBalance(!showBalance)}
                className="p-1.5 rounded-lg hover:bg-primary-foreground/10 transition-colors"
              >
                {showBalance ? <Eye className="h-4 w-4 text-primary-foreground/60" /> : <EyeOff className="h-4 w-4 text-primary-foreground/60" />}
              </button>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-1" dir="ltr">
              {showBalance ? "9,750.00" : "••••••"} <span className="text-base font-medium text-primary-foreground/70">QAR</span>
            </h1>
            <div className="flex items-center gap-1.5 text-primary-foreground/60">
              <TrendingUp className="h-3.5 w-3.5 text-success" />
              <span className="text-xs">+12.5% هذا الشهر</span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 -mt-10 space-y-5 pb-8 relative z-10">
        {/* Quick Actions */}
        <div className="glass-card rounded-2xl p-5 shadow-lg">
          <div className="grid grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <button
                key={action.label}
                className="flex flex-col items-center gap-2.5 group"
              >
                <div className={`w-13 h-13 rounded-2xl flex items-center justify-center ${action.color} transition-all group-hover:scale-110 group-hover:shadow-md`}>
                  <action.icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold text-foreground">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Transactions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-base font-bold text-foreground">آخر المعاملات</h3>
            <button className="text-sm text-primary font-semibold hover:underline">عرض الكل</button>
          </div>

          <div className="glass-card rounded-2xl overflow-hidden shadow-lg divide-y divide-border/50">
            {transactions.map((tx, i) => (
              <div
                key={tx.id}
                className="p-4 flex items-center gap-3 hover:bg-muted/30 transition-colors animate-fade-in cursor-pointer"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  tx.type === "in" ? "bg-success/10" : "bg-destructive/10"
                }`}>
                  {tx.type === "in" ? (
                    <ArrowDownRight className="h-5 w-5 text-success" />
                  ) : (
                    <ArrowUpLeft className="h-5 w-5 text-destructive" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{tx.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{tx.date}</p>
                </div>
                <span className={`text-sm font-bold tabular-nums ${
                  tx.type === "in" ? "text-success" : "text-foreground"
                }`} dir="ltr">
                  {tx.amount > 0 ? "+" : ""}{tx.amount.toLocaleString()} QAR
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
