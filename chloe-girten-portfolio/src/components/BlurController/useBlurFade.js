import { useEffect } from "react";
import { gsap } from "gsap";
import { useBlurStore } from "@/store/store";

const FADE = { duration: 0.3, ease: "power1.inOut" };

// Shows the blur element while `name` is the active blur (see useBlurStore).
// From nothing or to nothing, it fades. Between the two blurs, the switch is instant:
// one goes off as the other comes on, they are never on together.
export function useBlurFade(ref, name) {
  const activeBlur = useBlurStore((state) => state.activeBlur);
  const previousBlur = useBlurStore((state) => state.previousBlur);

  useEffect(() => {
    const element = ref.current;
    const isOn = activeBlur === name;
    const isSwitch = activeBlur !== null && previousBlur !== null;

    gsap.to(element, {
      autoAlpha: isOn ? 1 : 0,
      ...FADE,
      duration: isSwitch ? 0 : FADE.duration,
      overwrite: true,
    });
  }, [ref, name, activeBlur, previousBlur]);

  useEffect(() => {
    const element = ref.current;
    return () => gsap.killTweensOf(element);
  }, [ref]);

  return activeBlur === name;
}
