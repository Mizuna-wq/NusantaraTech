// Error yang kita lempar sendiri, membawa status HTTP dan pesan yang aman ditampilkan ke user.
export class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}
