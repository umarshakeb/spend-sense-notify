
import { useEffect, useState } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia(query);
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Initial check
    setMatches(mediaQuery.matches);

    // Add listener
    mediaQuery.addEventListener("change", listener);

    // Clean up
    return () => {
      mediaQuery.removeEventListener("change", listener);
    };
  }, [query]);

  return matches;
}
