export const learnStages = ["1.0", "1.1", "1.2", "1.3", "1.4", "1.5", "1", "2.0", "2.1", "2.2", "2.2", "2.2", "2.3", "2.4"] as const;

export function stepForStage(from?: string) {
  if (!from) {
    return 0;
  }

  const index = learnStages.indexOf(from as (typeof learnStages)[number]);
  return index < 0 ? 0 : index;
}
