import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [transitionStage, setTransitionStage] = useState<"enter" | "exit">("enter");
  const prevLocation = useRef(location.pathname);

  useEffect(() => {
    if (location.pathname !== prevLocation.current) {
      setTransitionStage("exit");
    }
  }, [location]);

  useEffect(() => {
    if (transitionStage === "exit") {
      const timer = setTimeout(() => {
        setDisplayChildren(children);
        setTransitionStage("enter");
        prevLocation.current = location.pathname;
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [transitionStage, children, location.pathname]);

  return (
    <div
      className={`transition-all duration-200 ease-in-out ${
        transitionStage === "enter"
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-2"
      }`}
    >
      {displayChildren}
    </div>
  );
};

export default PageTransition;
