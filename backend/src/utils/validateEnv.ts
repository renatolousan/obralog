import { cleanEnv, port, str, num } from 'envalid';

const validateEnv = () => {
  cleanEnv(process.env, {
    PORT: port(),
    DATABASE_URL: str(),
    UPLOAD_MAX_FILE_SIZE: num(),
    SESSION_SECRET: str(),
    GEMINI_API_KEY: str(),
  });
};

export default validateEnv;
