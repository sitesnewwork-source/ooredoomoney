import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ooredooLogo from "@/assets/ooredoo-logo.webp";
import goldPromo from "@/assets/gold-promo.png";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a]" dir="rtl">
      {/* Header Logo */}
      <div className="flex justify-center pt-6 pb-2">
        <img src={ooredooLogo} alt="Ooredoo Money" className="h-12 object-contain" />
      </div>

      {/* Gold Image Section */}
      <div className="relative w-full flex justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-[#b8860b]/20 via-transparent to-transparent" />
        <img
          src={goldPromo}
          alt="اربح سبائك الذهب"
          className="w-full max-w-lg object-contain"
        />
      </div>

      {/* Promo Text Section */}
      <div className="flex flex-col items-center text-center px-6 pb-8 -mt-4 space-y-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
          اربح سبائك الذهب
        </h1>
        <p className="text-[#e31e24] text-2xl md:text-3xl font-bold">
          سجل في السحب الآن
        </p>
        <p className="text-white/90 text-base md:text-lg font-medium">
          كن من بين 30 فائزًا بالذهب كل أسبوع!
        </p>
        <p className="text-white/60 text-sm">
          خاص بعملاء محفظة اوريدو موني
        </p>

        {/* CTA Button */}
        <Button
          onClick={() => navigate("/login")}
          className="mt-4 bg-[#e31e24] hover:bg-[#c41920] text-white text-lg font-bold rounded-full px-12 h-14 shadow-lg shadow-[#e31e24]/30 transition-all hover:scale-105"
        >
          سجل الآن
        </Button>
      </div>
    </div>
  );
};

export default Home;
