export const PASSWORD_MIN = 8;
export const NAME_MAX = 40;

// Deliberately loose: catches typos; Firebase is the real authority on validity.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateEmail(email: string): string | undefined {
  const value = email.trim();
  if (!value) return 'Enter your email address.';
  if (!EMAIL_RE.test(value)) return "That email address doesn't look right.";
  return undefined;
}

export function validatePassword(password: string, mode: 'signIn' | 'signUp'): string | undefined {
  if (!password) return 'Enter your password.';
  if (mode === 'signUp' && password.length < PASSWORD_MIN) {
    return `Use at least ${PASSWORD_MIN} characters.`;
  }
  return undefined;
}

export function validateName(name: string): string | undefined {
  const value = name.trim();
  if (!value) return 'Tell us what to call you.';
  if (value.length > NAME_MAX) return `Keep it under ${NAME_MAX} characters.`;
  return undefined;
}
