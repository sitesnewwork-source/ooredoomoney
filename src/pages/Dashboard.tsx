import { useAuth } from "@/hooks/useAuth";
import { 
  ArrowUpLeft, ArrowDownRight, Receipt, Smartphone, 
  Zap, CreditCard, MoreHorizontal, LogOut, Bell,
  Send, QrCode, Wallet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

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

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="bg-primary text-primary-foreground px-4 pt-6 pb-20 rounded-b-[2rem]">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-primary-foreground/70 text-sm">مرحباً 👋</p>
              <h2 className="text-lg font-bold">{user?.phone || "المستخدم"}</h2>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative p-2 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-warning rounded-full" />
              </button>
              <button 
                onClick={handleSignOut}
                className="p-2 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Balance */}
          <div className="text-center space-y-1">
            <p className="text-primary-foreground/70 text-sm">الرصيد المتاح</p>
            <h1 className="text-4xl font-extrabold tracking-tight" dir="ltr">
              9,750.00 <span className="text-lg font-medium">QAR</span>
            </h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 -mt-12 space-y-6 pb-8">
        {/* Quick Actions */}
        <div className="glass-card rounded-2xl p-5">
          <div className="grid grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <button
                key={action.label}
                className="flex flex-col items-center gap-2 group"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${action.color} transition-transform group-hover:scale-105`}>
                  <action.icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium text-foreground">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Transactions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-foreground">آخر المعاملات</h3>
            <button className="text-sm text-primary font-medium">عرض الكل</button>
          </div>

          <div className="space-y-3">
            {transactions.map((tx, i) => (
              <div
                key={tx.id}
                className="glass-card rounded-xl p-4 flex items-center gap-3 animate-fade-in"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
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
                  <p className="text-xs text-muted-foreground">{tx.date}</p>
                </div>
                <span className={`text-sm font-bold ${
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
