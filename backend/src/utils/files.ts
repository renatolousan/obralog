import { promises as fs } from 'node:fs';
import { type UploadedFile } from '../types/types';

export async function deleteUploadedFiles(files: UploadedFile[]) {
  await Promise.all(
    files.map((file) => fs.unlink(file.path).catch(() => undefined)),
  );
}
