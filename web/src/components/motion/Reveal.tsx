"use client";

import {
  createElement,
  useEffect,
  useRef,
  useState,
  type ElementType,
  type ReactNode,
} from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  immediate?: boolean;
  as?: ElementType;
};

export function Reveal({
  children,
  className = "",
  delay = 0,
  immediate = false,
  as: Tag = "div",
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(immediate);

  useEffect(() => {
    if (immediate) return;
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -48px 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [immediate]);

  return createElement(
    Tag,
    {
      ref,
      className: `reveal ${visible ? "reveal--visible" : ""} ${className}`.trim(),
      style: { transitionDelay: visible ? `${delay}ms` : "0ms" },
    },
    children,
  );
}
