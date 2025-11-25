import multer from 'multer';
import path from 'node:path';
import { promises as fs } from 'node:fs';
import { randomUUID } from 'node:crypto';

const UPLOAD_ROOT =
  process.env.UPLOAD_ROOT ?? path.resolve(__dirname, '../../uploads');
const RECLAMACOES_UPLOAD_DIR = path.join(UPLOAD_ROOT, 'reclamacoes');
const MAX_UPLOAD_SIZE = Number(process.env.UPLOAD_MAX_FILE_SIZE!) * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    fs.mkdir(RECLAMACOES_UPLOAD_DIR, { recursive: true })
      .then(() => cb(null, RECLAMACOES_UPLOAD_DIR))
      .catch((error) => cb(error, RECLAMACOES_UPLOAD_DIR));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeExt = ext.length <= 8 ? ext : ext.slice(0, 8);
    const uniqueName = `anexo-${Date.now()}-${randomUUID()}${safeExt}`;
    cb(null, uniqueName);
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: MAX_UPLOAD_SIZE | (5 * 1024 * 1024),
  },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Somente imagens (JPEG/PNG) sao permitidas.'));
    }
    cb(null, true);
  },
});

export { UPLOAD_ROOT, RECLAMACOES_UPLOAD_DIR };
