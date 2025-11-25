import { deleteUploadedFiles } from '../../../utils/files';
import { type UploadedFile } from '../../../types/types';
import { promises as fs } from 'node:fs';

jest.mock('node:fs', () => ({
  promises: {
    unlink: jest.fn(),
  },
}));

describe('Utils - files', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('deleteUploadedFiles', () => {
    it('deve deletar todos os arquivos fornecidos', async () => {
      const files: UploadedFile[] = [
        { path: '/path/to/file1.jpg' } as UploadedFile,
        { path: '/path/to/file2.jpg' } as UploadedFile,
      ];

      (fs.unlink as jest.Mock).mockResolvedValue(undefined);

      await deleteUploadedFiles(files);

      expect(fs.unlink).toHaveBeenCalledTimes(2);
      expect(fs.unlink).toHaveBeenCalledWith('/path/to/file1.jpg');
      expect(fs.unlink).toHaveBeenCalledWith('/path/to/file2.jpg');
    });

    it('deve lidar com array vazio', async () => {
      const files: UploadedFile[] = [];

      await deleteUploadedFiles(files);

      expect(fs.unlink).not.toHaveBeenCalled();
    });

    it('deve continuar mesmo se algum arquivo falhar ao deletar', async () => {
      const files: UploadedFile[] = [
        { path: '/path/to/file1.jpg' } as UploadedFile,
        { path: '/path/to/file2.jpg' } as UploadedFile,
        { path: '/path/to/file3.jpg' } as UploadedFile,
      ];

      (fs.unlink as jest.Mock)
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error('File not found'))
        .mockResolvedValueOnce(undefined);

      await expect(deleteUploadedFiles(files)).resolves.not.toThrow();

      expect(fs.unlink).toHaveBeenCalledTimes(3);
    });

    it('deve processar arquivos em paralelo', async () => {
      const files: UploadedFile[] = Array.from({ length: 5 }, (_, i) => ({
        path: `/path/to/file${i}.jpg`,
      })) as UploadedFile[];

      (fs.unlink as jest.Mock).mockResolvedValue(undefined);

      await deleteUploadedFiles(files);

      expect(fs.unlink).toHaveBeenCalledTimes(5);
    });
  });
});
