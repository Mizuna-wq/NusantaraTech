// Nomor HP Indonesia: 08xxxxxxxxxx, 628xxxxxxxxxx, atau +628xxxxxxxxxx
export const PHONE_REGEX = /^(\+62|62|0)8\d{7,12}$/;
export const PHONE_MESSAGE = 'Nomor HP tidak valid (contoh: 081234567890)';

// Hapus spasi dan tanda strip sebelum divalidasi
export const cleanPhone = (value) => String(value ?? '').replace(/[\s-]/g, '');

// Minimal 8 karakter, mengandung huruf dan angka
export const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
export const PASSWORD_MESSAGE = 'Password minimal 8 karakter dan mengandung huruf serta angka';
