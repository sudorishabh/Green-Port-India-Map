// Shared by the API and the db scripts run with plain Node, so no "server-only"
// and no "@/" imports here.
import bcrypt from "bcryptjs";

const PASSWORD_SALT_ROUNDS = 10;

export function hashPassword(password: string) {
  return bcrypt.hash(password, PASSWORD_SALT_ROUNDS);
}

export function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

export function normalizeEmail(email: string) {
  return email.toLowerCase().trim();
}
