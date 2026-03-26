import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import crypto from 'crypto';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
];

export interface UploadResult {
  storageKey: string;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  checksum: string;
}

export async function saveUploadedFile(file: File): Promise<UploadResult> {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new UploadError('INVALID_TYPE', `File type ${file.type} is not allowed. Accepted: PDF, JPEG, PNG, WebP`);
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new UploadError('FILE_TOO_LARGE', `File exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const checksum = crypto.createHash('sha256').update(buffer).digest('hex');
  const ext = getExtension(file.type);
  const storageKey = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;

  // Ensure upload dir exists
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }

  const filePath = path.join(UPLOAD_DIR, storageKey);
  await writeFile(filePath, buffer);

  return {
    storageKey,
    originalFilename: file.name,
    mimeType: file.type,
    fileSize: file.size,
    checksum,
  };
}

function getExtension(mimeType: string): string {
  switch (mimeType) {
    case 'application/pdf': return '.pdf';
    case 'image/jpeg': return '.jpg';
    case 'image/png': return '.png';
    case 'image/webp': return '.webp';
    default: return '';
  }
}

export function getUploadPath(storageKey: string): string {
  return path.join(UPLOAD_DIR, storageKey);
}

export class UploadError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}
