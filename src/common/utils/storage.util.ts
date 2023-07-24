import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

export const checkIfFileOrDirectoryExists = (path: string): boolean => {
  return fs.existsSync(path);
};

export const getFile = async (
  filePath: string,
  fileName: string,
): Promise<string> => {
  const readFile = promisify(fs.readFile);

  return readFile(joinPath(filePath, fileName), { encoding: 'utf8' });
};

export const createFile = async (
  filePath: string,
  fileName: string,
  data: string,
): Promise<void> => {
  if (!checkIfFileOrDirectoryExists(filePath)) {
    fs.mkdirSync(filePath);
  }

  const full = joinPath(filePath, fileName);

  if (checkIfFileOrDirectoryExists(full)) {
    throw new Error('File already exists');
  }

  const writeFile = promisify(fs.writeFile);

  return await writeFile(full, data, 'utf8');
};

export const deleteFile = async (
  filePath: string,
  fileName: string,
): Promise<void> => {
  const unlink = promisify(fs.unlink);

  return await unlink(joinPath(filePath, fileName));
};

const joinPath = (filePath: string, fileName: string) => {
  return path.join(filePath, fileName);
};
