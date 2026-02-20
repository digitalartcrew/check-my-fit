import { formatDistanceToNow } from 'date-fns';
import type { Timestamp } from 'firebase/firestore';

export function formatRelativeTime(timestamp: Timestamp | null | undefined): string {
  if (!timestamp) return '';
  try {
    return formatDistanceToNow(timestamp.toDate(), { addSuffix: true });
  } catch {
    return '';
  }
}

export function formatRating(value: number): string {
  return value.toFixed(1);
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

export function formatCount(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return String(count);
}
