import { useEffect } from "react";

const handleWheel = (event: WheelEvent) => {
  if (event.ctrlKey) {
    event.preventDefault();
  }
};

export function disableZoom() {
  document.addEventListener("wheel", handleWheel, { passive: false });
}

export function enableZoom() {
  document.removeEventListener("wheel", handleWheel);
}

function usePreventZoom(scrollCheck = true, keyboardCheck = true) {
  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (keyboardCheck && event.ctrlKey && event.keyCode in [61, 107, 173, 109, 187, 189]) {
        event.preventDefault();
      }
    };

    const handleWheel = (event: WheelEvent) => {
      if (scrollCheck && event.ctrlKey) {
        event.preventDefault();
      }
    };

    document.addEventListener("keydown", handleKeydown);
    document.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      document.removeEventListener("keydown", handleKeydown);
      document.removeEventListener("wheel", handleWheel);
    };
  }, [scrollCheck, keyboardCheck]);
}

export default usePreventZoom;
