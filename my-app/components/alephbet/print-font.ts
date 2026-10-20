import { Noto_Sans_Hebrew } from "next/font/google";



// Square print, pinned so every device traces the same letter the card shows.
export const printFont = Noto_Sans_Hebrew({
  weight: "700",
  subsets: ["hebrew"],
  display: "swap",
  adjustFontFallback: false,
});
