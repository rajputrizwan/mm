import dotenv from "dotenv";

dotenv.config();

export const config = {
  // Server
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  logLevel: process.env.LOG_LEVEL || "info",

  // Database
  mongodbUri:
    process.env.MONGODB_URI || "mongodb://localhost:27017/intervau-ai",
  dbName: process.env.DB_NAME || "intervau-ai",

  // JWT
  jwtSecret: process.env.JWT_SECRET || "your-secret-key",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "your-refresh-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "15m",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",

  // Security
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || "12"),
  cookieSecret: process.env.COOKIE_SECRET || "cookie-secret",
  cookieExpiresIn: process.env.COOKIE_EXPIRES_IN || "7d",

  // Email
  smtp: {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    user: process.env.SMTP_USER || "",
    password: process.env.SMTP_PASSWORD || "",
    from: process.env.SMTP_FROM || "noreply@intervau-ai.com",
  },

  // CORS
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  frontendProdUrl: process.env.FRONTEND_PROD_URL || "https://yourdomain.com",
  backendUrl: process.env.BACKEND_URL || "http://localhost:5000",

  // File Upload
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || "5242880"), // 5MB
  uploadDir: process.env.UPLOAD_DIR || "./uploads",

  // OpenAI
  openai: {
    apiKey: process.env.OPENAI_API_KEY || "",
    model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
    apiBaseUrl: process.env.OPENAI_API_BASE_URL || "https://api.openai.com",
    timeout: parseInt(process.env.OPENAI_TIMEOUT || "10000"),
  },

  // Cloudinary
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "",
  },

  // Redis
  redis: {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    password: process.env.REDIS_PASSWORD || "",
  },
};

export default config;
