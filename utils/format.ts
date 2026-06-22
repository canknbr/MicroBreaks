/**
 * Shared display formatters.
 *
 * These were duplicated inline across stats / break-completion / notifications
 * screens; centralizing them keeps the relative-time and duration copy
 * consistent and testable. Time-dependent inputs accept an injectable `now`
 * so the logic stays pure.
 */

/**
 * Render a second count as a short human duration.
 * - Under a minute: `"45s"`.
 * - A minute or more: `"5m"` by default, or `"5m 5s"` when `showSeconds`.
 */
export function formatDuration(
  totalSeconds: number,
  options: { showSeconds?: boolean } = {}
): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds}s`;
  return options.showSeconds ? `${minutes}m ${seconds}s` : `${minutes}m`;
}

/**
 * Render an ISO timestamp as a compact relative label
 * ("Just now" / "15m ago" / "3h ago" / "Yesterday" / "3d ago"), falling back
 * to a locale-formatted date once it is more than a week old.
 */
export function formatRelativeTime(
  dateString: string,
  options: { now?: Date; locale?: string } = {}
): string {
  const date = new Date(dateString);
  const now = options.now ?? new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(options.locale ?? 'en');
}
