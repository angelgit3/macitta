export function parseLabels(input: string): string[] {
  return input
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function formatLabels(labels: string[]): string {
  return labels.join(", ");
}
