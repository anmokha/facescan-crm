import bcrypt from 'bcryptjs';

/**
 * Генерирует случайный пароль из 6 символов
 *
 * Формат: заглавные буквы + цифры (без похожих символов)
 * Пример: "K7M2P9", "A3B9C2"
 *
 * Почему 6 символов? Легко запомнить, достаточно безопасно
 * Почему без 0,O,1,I? Чтобы не путались при вводе
 */
export function generatePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 32 символа
  let password = '';

  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    password += chars[randomIndex];
  }

  return password;
}

/**
 * Хеширует пароль для безопасного хранения в БД
 *
 * Вход: "K7M2P9"
 * Выход: "$2a$10$N9qo8uLOickgx2ZMRZoMye..."
 *
 * Даже если кто-то украдет нашу БД, они не узнают реальные пароли!
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10; // Уровень шифрования (10 - стандарт)
  return bcrypt.hash(password, saltRounds);
}

/**
 * Проверяет соответствие введенного пароля хешу в БД
 *
 * Пользователь ввел: "K7M2P9"
 * В БД хранится: "$2a$10$N9qo8uLOickgx2ZMRZoMye..."
 * Функция вернет: true ✅
 *
 * Если пароль неверный → false ❌
 */
export async function verifyPassword(
  password: string,     // То что ввел пользователь
  hash: string          // То что хранится в БД
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
