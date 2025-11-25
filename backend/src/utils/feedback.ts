export function normalizeIssue(issue: string): string {
  return issue.trim().toUpperCase();
}

export function formatDateTime(date: Date): string {
  return date.toISOString().replace('T', ' ').slice(0, 16);
}

export function firstValue(field: unknown): string | undefined {
  if (typeof field === 'string') return field;
  if (Array.isArray(field)) {
    const [value] = field as Array<unknown>;
    return typeof value === 'string' ? value : undefined;
  }
  return undefined;
}
