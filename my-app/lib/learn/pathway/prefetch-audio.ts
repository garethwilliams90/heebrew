import { loadBundleClip } from "@/lib/learn/bundle-clip";
import type { ExerciseStep, IntroSlide } from "@/lib/learn/pathway/types";
import { wordById } from "@/lib/learn/words/catalog";

function add(paths: string[], value?: string | null) {
  if (value) {
    paths.push(value);
  }
}

/** Recordings on an intro slide. Letter slides use a different source. */
export function introAudioPaths(slide: IntroSlide) {
  const paths: string[] = [];
  for (const sample of slide.samples ?? []) {
    if (!sample.letterId) {
      add(paths, sample.audio);
    }
  }
  return paths;
}

/** Recordings an exercise can ask for, including the choices. */
export function exerciseAudioPaths(step: ExerciseStep) {
  const paths: string[] = [];

  switch (step.type) {
    case "nikud-drop":
      break;
    case "recognize-sound":
      for (const item of step.items) {
        add(paths, item.prompt.audio);
        for (const choice of item.choices) {
          add(paths, choice.audio);
        }
      }
      break;
    case "listen-repeat":
      for (const item of step.items) {
        add(paths, item.audio);
      }
      break;
    case "spell":
      for (const item of step.items) {
        add(paths, item.prompt.audio);
      }
      break;
    case "compose-gap":
      for (const item of step.items) {
        add(paths, item.audio);
        for (const token of item.tokens) {
          add(paths, token.audio);
        }
        for (const extra of item.extras) {
          add(paths, extra.audio);
        }
      }
      break;
    case "conjugate":
      for (const item of step.items) {
        for (const choice of item.choices) {
          add(paths, choice.audio);
        }
      }
      break;
    case "read":
    case "write":
    case "comprehend":
      for (const item of step.items) {
        add(paths, item.audio);
      }
      break;
    case "picture-word":
      for (const item of step.items) {
        for (const id of item.choiceIds) {
          add(paths, wordById(id)?.audio);
        }
      }
      break;
  }

  return paths;
}

/** Starts the downloads. A later play reuses the same clip. */
export function prefetchClips(paths: readonly string[]) {
  for (const path of paths) {
    void loadBundleClip(path);
  }
}
