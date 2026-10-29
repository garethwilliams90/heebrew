"use client";

import { animate, motion, useReducedMotion } from "motion/react";
import { useEffect, useId, useRef } from "react";

const dots = [
  "M136.267 274.847C136.267 269.737 137.997 265.454 141.457 261.997C144.918 258.54 149.055 256.812 153.869 256.812C158.984 256.812 163.271 258.54 166.731 261.997C170.191 265.454 171.921 269.737 171.921 274.847C171.921 279.656 170.191 283.79 166.731 287.246C163.271 290.703 158.984 292.432 153.869 292.432C149.055 292.432 144.918 290.703 141.457 287.246C137.997 283.79 136.267 279.656 136.267 274.847Z",
  "M171.921 298.519C171.921 293.709 173.726 289.501 177.337 285.894C180.947 282.287 185.16 280.483 189.974 280.483C194.788 280.483 199 282.287 202.611 285.894C206.221 289.501 208.026 293.709 208.026 298.519C208.026 303.328 206.221 307.536 202.611 311.143C199.15 314.75 194.938 316.554 189.974 316.554C184.859 316.554 180.571 314.75 177.111 311.143C173.651 307.536 171.921 303.328 171.921 298.519Z",
  "M208.026 321.965C208.026 316.855 209.832 312.571 213.442 309.114C217.053 305.658 221.265 303.929 226.079 303.929C230.893 303.929 235.105 305.733 238.716 309.34C242.326 312.947 244.131 317.155 244.131 321.965C244.131 326.774 242.326 330.982 238.716 334.589C235.256 338.196 231.043 340 226.079 340C220.964 340 216.676 338.272 213.216 334.815C209.756 331.358 208.026 327.075 208.026 321.965Z",
];

const ease = [0.22, 1, 0.36, 1] as const;
const travel = { duration: 0.36, ease };
const fade = { duration: 0.12, ease };
const pop = { duration: 0.24, ease };
const home = { duration: 0.26, ease };

type Pose = { x0: number; y0: number; x2: number; y2: number; opacity: number; scale: number; letter: number };

const restPose: Pose = { x0: 0, y0: 0, x2: 0, y2: 0, opacity: 1, scale: 1, letter: 0 };
const letterLift = -24;

export function AlephMark({ className }: { className?: string }) {
  const uid = useId().replace(/:/g, "");
  const fill = `aleph-fill-${uid}`;
  const shadow = `aleph-shadow-${uid}`;
  const reduce = useReducedMotion();
  const run = useRef(0);
  const motions = useRef<Array<() => void>>([]);
  const letterStop = useRef<(() => void) | null>(null);
  const timers = useRef<Array<() => void>>([]);
  const refs = useRef<Array<SVGPathElement | null>>([]);
  const pose = useRef<Pose>({ ...restPose });

  function stopMotions() {
    const current = motions.current;
    motions.current = [];
    for (const stop of current) stop();
  }

  function stopLetter() {
    letterStop.current?.();
    letterStop.current = null;
  }

  function cancelAll() {
    run.current += 1;
    stopMotions();
    stopLetter();
    const pending = timers.current;
    timers.current = [];
    for (const stop of pending) stop();
  }

  useEffect(() => {
    return () => {
      for (const stop of motions.current) stop();
      letterStop.current?.();
      for (const stop of timers.current) stop();
    };
  }, []);

  function paint() {
    const { x0, y0, x2, y2, opacity, scale } = pose.current;
    const top = refs.current[0];
    const mid = refs.current[1];
    const bottom = refs.current[2];
    if (top) top.style.transform = `translate(${x0}px, ${y0}px)`;
    if (bottom) bottom.style.transform = `translate(${x2}px, ${y2}px)`;
    if (mid) {
      mid.style.opacity = String(opacity);
      mid.style.transform = `scale(${scale})`;
    }
    const letter = refs.current[3];
    if (letter) letter.style.transform = `translate(0px, ${pose.current.letter}px)`;
  }

  function arm() {
    for (const el of refs.current) {
      if (el) el.style.willChange = "transform";
    }
  }

  function disarm(id: number) {
    if (id !== run.current) return;
    for (const el of refs.current) {
      if (el) el.style.willChange = "auto";
    }
  }

  function glide(key: keyof Pose, to: number, options: object) {
    const controls = animate(pose.current[key], to, {
      ...options,
      onUpdate: (value) => {
        pose.current[key] = value;
        paint();
      },
    });
    motions.current.push(() => controls.stop());
  }

  function glideLetter(to: number | number[], options: object) {
    stopLetter();
    const controls = animate(pose.current.letter, to, {
      ...options,
      onUpdate: (value) => {
        const trace = ((window as unknown as { __letter?: number[] }).__letter ??= []);
        if (trace.length < 24) trace.push(Math.round(value * 10) / 10);
        pose.current.letter = value;
        paint();
      },
    });
    letterStop.current = () => controls.stop();
  }

  function wait(ms: number) {
    return new Promise<void>((resolve) => {
      const timer = window.setTimeout(resolve, ms);
      timers.current.push(() => {
        window.clearTimeout(timer);
        resolve();
      });
    });
  }

  function reduced() {
    return reduce || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function snapHome() {
    pose.current = { ...restPose };
    paint();
  }

  function mergedShift() {
    const top = refs.current[0];
    const mid = refs.current[1];
    const bottom = refs.current[2];
    if (!top || !mid || !bottom) return null;
    const center = (el: SVGPathElement) => {
      const box = el.getBBox();
      return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    };
    const a = center(top);
    const b = center(mid);
    const c = center(bottom);
    return { x0: b.x - a.x, y0: b.y - a.y, x2: b.x - c.x, y2: b.y - c.y };
  }

  async function play() {
    if (reduced()) return;
    cancelAll();
    const id = run.current;
    const live = () => id === run.current;
    const shift = mergedShift();
    if (!shift) return;
    arm();
    (window as unknown as { __letter?: number[] }).__letter = [];
    glide("x0", shift.x0, travel);
    glide("y0", shift.y0, travel);
    glide("x2", shift.x2, travel);
    glide("y2", shift.y2, travel);
    glideLetter([0, letterLift, letterLift, 0], { duration: 1.41, times: [0, 0.26, 0.38, 1], ease });
    await wait(400);
    if (!live()) return;
    stopMotions();
    await wait(140);
    if (!live()) return;
    glide("x0", 0, travel);
    glide("y0", 0, travel);
    glide("x2", 0, travel);
    glide("y2", 0, travel);
    glide("opacity", 0, fade);
    glide("scale", 0.65, fade);
    await wait(400);
    if (!live()) return;
    stopMotions();
    await wait(170);
    if (!live()) return;
    glide("opacity", 1, pop);
    glide("scale", 1, pop);
    await wait(300);
    if (!live()) return;
    stopMotions();
    disarm(id);
  }

  function rest() {
    cancelAll();
    const id = run.current;
    if (reduced()) {
      snapHome();
      disarm(id);
      return;
    }
    arm();
    glide("x0", 0, home);
    glide("y0", 0, home);
    glide("x2", 0, home);
    glide("y2", 0, home);
    glide("opacity", 1, home);
    glide("scale", 1, home);
    glideLetter(0, home);
    void wait(340).then(() => {
      if (id !== run.current) return;
      stopMotions();
      disarm(id);
    });
  }

  const dotStyle = { transformBox: "fill-box" as const, transformOrigin: "center" };

  return (
    <motion.svg viewBox="0 0 399 399" fill="none" aria-hidden className={className} onHoverStart={play} onHoverEnd={rest}>
      <path
        d="M0 125C0 55.9644 55.9644 0 125 0H274C343.036 0 399 55.9644 399 125V274C399 343.036 343.036 399 274 399H125C55.9644 399 0 343.036 0 274V125Z"
        fill={`url(#${fill})`}
      />
      <g filter={`url(#${shadow})`}>
        {dots.map((d, index) => (
          <path
            key={index}
            ref={(node) => {
              refs.current[index] = node;
            }}
            d={d}
            fill="#274223"
            fillOpacity={0.2}
            style={dotStyle}
          />
        ))}
        <path
          ref={(node) => {
            refs.current[3] = node;
          }}
          d="M130.175 258.164L120.54 314.367C118.023 329.045 105.298 339.775 90.4062 339.775C71.0762 339.775 56.5977 322.06 60.4449 303.117L71.9552 246.441C77.3709 220.59 82.3354 202.179 86.8485 191.208C91.3617 180.086 96.9279 171.294 103.547 164.831C115.665 152.993 121.776 134.199 111.633 120.63L101.593 107.197C87.0408 87.7292 100.933 60 125.239 60C134.716 60 143.617 64.5497 149.168 72.2311L209.776 156.105C221.488 172.313 245.5 174.641 253.383 156.264C258.348 144.691 261.883 129.061 263.989 109.372L266.045 87.9543C267.566 72.1014 280.885 60 296.811 60C315.113 60 329.406 75.8154 327.561 94.0241L325.594 113.43C323.939 128.61 320.93 142.061 316.567 153.784C313.558 161.75 309.873 169.265 305.51 176.329C301.147 183.242 295.431 190.607 288.36 198.422C273.746 214.61 270.689 238.665 283.605 256.238L310.393 292.687C324.747 312.218 310.801 339.775 286.563 339.775C277.063 339.775 268.142 335.211 262.583 327.509L174.69 205.737C165.696 193.276 147.269 189.742 141.683 204.058C140.028 208.567 138.223 215.33 136.267 224.348C134.312 233.366 132.281 244.638 130.175 258.164Z"
          fill="#274223"
          fillOpacity="0.2"
          style={dotStyle}
        />
      </g>
      <defs>
        <filter id={shadow} x="55.8226" y="28" width="271.899" height="316" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feOffset dx="-4" dy="6" />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.39 0" />
          <feBlend mode="normal" in2="shape" result="effect1_innerShadow_19_34" />
        </filter>
        <linearGradient id={fill} x1="935.5" y1="-14" x2="935.5" y2="385" gradientUnits="userSpaceOnUse">
          <stop stopColor="#C7D8FF" />
          <stop offset="1" stopColor="#345DFF" />
        </linearGradient>
      </defs>
    </motion.svg>
  );
}
