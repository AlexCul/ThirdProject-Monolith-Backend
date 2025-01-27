import jwt from 'jsonwebtoken';

import dotenv from 'dotenv';
dotenv.config();

export const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';

export function createToken(userId: string): string {
  return jwt.sign({ userId }, SECRET_KEY, { expiresIn: '24h' });
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, SECRET_KEY) as { userId: string };
  } catch (err) {
    return null;
  }
}
