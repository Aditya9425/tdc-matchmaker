import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'New Lead': 'badge-blue',
    'Profile Review': 'badge-yellow',
    'Active Matching': 'badge-green',
    'Meeting Scheduled': 'badge-purple',
    'Engaged': 'badge-green',
    'On Hold': 'badge-red',
    'Closed': 'badge-red',
  };
  return colors[status] || 'badge-purple';
}

export function getScoreColor(score: number): string {
  if (score >= 90) return 'text-emerald-400';
  if (score >= 75) return 'text-green-400';
  if (score >= 60) return 'text-yellow-400';
  return 'text-orange-400';
}

export function generateAvatar(name: string, gender: string): string {
  const seed = name.replace(/\s/g, '');
  const style = gender === 'Female' ? 'adventurer' : 'adventurer';
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
}
