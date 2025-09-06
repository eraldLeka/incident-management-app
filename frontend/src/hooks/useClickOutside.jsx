import { useEffect } from "react";

export default function useClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      // Nëse klikimi është brenda elementit, nuk bëjmë asgjë
      if (!ref.current || ref.current.contains(event.target)) return;
      handler(event); // Klikimi jashtë → thirret handler
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener); // për mobile

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}
