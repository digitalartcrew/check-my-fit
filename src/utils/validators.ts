export function validateEmail(email: string): string | null {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.trim()) return 'Email is required';
  if (!re.test(email)) return 'Enter a valid email address';
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  return null;
}

export function validateUsername(username: string): string | null {
  if (!username.trim()) return 'Username is required';
  if (username.length < 3) return 'Username must be at least 3 characters';
  if (username.length > 20) return 'Username must be 20 characters or less';
  if (!/^[a-z0-9_]+$/.test(username.toLowerCase()))
    return 'Username can only contain letters, numbers, and underscores';
  return null;
}

export function validateCaption(caption: string, maxLength: number): string | null {
  if (caption.length > maxLength)
    return `Caption must be ${maxLength} characters or less`;
  return null;
}
