import bcrypt from 'bcryptjs';

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateAdminToken(email: string): string {
  // Simple token generation (in production, use JWT)
  return Buffer.from(email).toString('base64');
}

export function verifyAdminToken(token: string): string | null {
  try {
    return Buffer.from(token, 'base64').toString('utf-8');
  } catch {
    return null;
  }
}
