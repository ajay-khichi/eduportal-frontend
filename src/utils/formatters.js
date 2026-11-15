import { format, parseISO } from 'date-fns';

export function formatDate(dateString) {
  if (!dateString) return '—';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(date, 'MMM dd, yyyy');
  } catch (e) {
    return dateString;
  }
}

export function formatDateTime(dateTimeString) {
  if (!dateTimeString) return '—';
  try {
    const date = typeof dateTimeString === 'string' ? parseISO(dateTimeString) : dateTimeString;
    return format(date, 'MMM dd, yyyy · hh:mm a');
  } catch (e) {
    return dateTimeString;
  }
}

export function formatTime(timeString) {
  if (!timeString) return '—';
  try {
    // If timeString is "14:30" or "14:30:00"
    const parts = timeString.split(':');
    if (parts.length >= 2) {
      let hours = parseInt(parts[0], 10);
      const minutes = parts[1];
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      return `${hours}:${minutes} ${ampm}`;
    }
    return timeString;
  } catch (e) {
    return timeString;
  }
}

export function formatRole(role) {
  if (!role) return '';
  switch (role) {
    case 'SUPER_ADMIN':
      return 'Super Admin';
    case 'COLLEGE_ADMIN':
      return 'College Admin';
    case 'FACULTY':
      return 'Faculty Member';
    case 'STUDENT':
      return 'Student';
    default:
      return role.replace(/_/g, ' ');
  }
}

export function getInitials(name) {
  if (!name) return 'EP';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
