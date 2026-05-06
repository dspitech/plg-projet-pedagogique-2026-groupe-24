/**
 * Validate a password against security policy.
 * Min 16 chars, must contain uppercase, lowercase, digit, special char.
 */
export function validatePasswordStrength(pwd: string): {
  valid: boolean;
  errors: string[];
  score: number; // 0..4
} {
  const errors: string[] = [];
  if (pwd.length < 16) errors.push('Minimum 16 caractères');
  if (!/[A-Z]/.test(pwd)) errors.push('Au moins une majuscule');
  if (!/[a-z]/.test(pwd)) errors.push('Au moins une minuscule');
  if (!/[0-9]/.test(pwd)) errors.push('Au moins un chiffre');
  if (!/[^A-Za-z0-9]/.test(pwd)) errors.push('Au moins un caractère spécial');

  let score = 0;
  if (pwd.length >= 16) score++;
  if (pwd.length >= 24) score++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) score++;

  return { valid: errors.length === 0, errors, score };
}
