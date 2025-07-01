import fs from 'fs';
import path from 'path';

// === CONFIG ===
const logsDir = path.join(process.cwd(), 'logs');
const maxSize = 5 * 1024 * 1024; // 10MB

const logFilePaths = {
  info: path.join(logsDir, 'info.log'),
  warn: path.join(logsDir, 'warn.log'),
  error: path.join(logsDir, 'error.log'),
};

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// === HELPER: Rotate log file if it exceeds max size ===
function rotateLogFileIfNeeded(filePath: string) {
  if (!fs.existsSync(filePath)) return;

  const stats = fs.statSync(filePath);
  if (stats.size >= maxSize) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const ext = path.extname(filePath); // .log
    const base = path.basename(filePath, ext); // info / error
    const rotatedFile = path.join(logsDir, `${base}-${timestamp}${ext}`);
    fs.renameSync(filePath, rotatedFile);
  }
}

// === MAIN FUNCTION: Write log entry to appropriate file ===
export function logToFile(
  level: 'info' | 'warn' | 'error',
  message: string,
  meta?: {
    origin?: string;
    errorStack?: string;
    fileLocation?: string;
    req?: Request | { url?: string; method?: string; headers?: Record<string, unknown> };
    [key: string]: unknown; // ✅ Allow custom metadata (userId, email, etc.)
  }
) {
  const timestamp = new Date().toISOString();
  const filePath = logFilePaths[level];
  rotateLogFileIfNeeded(filePath);

  const lines: string[] = [];
  lines.push(
    `[${timestamp}] [${level.toUpperCase()}]${meta?.origin ? ` [${meta.origin}]` : ''} ${message}`
  );

  if (meta?.fileLocation) {
    lines.push(`Location: ${meta.fileLocation}`);
  }

  if (meta?.errorStack) {
    lines.push('StackTrace:\n' + meta.errorStack.trim());
  }

  if (meta?.req) {
    const method = meta.req.method || 'UNKNOWN';
    const url = meta.req.url || 'UNKNOWN';
    const userAgent = meta.req.headers?.['user-agent'] || meta.req.headers?.get?.('user-agent') || 'UNKNOWN';
    const ip = meta.req.headers?.['x-forwarded-for'] || 'UNKNOWN';

    lines.push(`Request Info:\n  Method: ${method}\n  URL: ${url}\n  UserAgent: ${userAgent}\n  IP: ${ip}`);
  }

  // ✅ Log all additional custom fields (except known ones already handled above)
  const knownKeys = ['origin', 'errorStack', 'fileLocation', 'req'];
  Object.entries(meta || {}).forEach(([key, value]) => {
    if (!knownKeys.includes(key)) {
      lines.push(`${key}: ${typeof value === 'object' ? JSON.stringify(value) : String(value)}`);
    }
  });

  lines.push('------------------------------------------------------------\n');
  fs.appendFileSync(filePath, lines.join('\n'));
}
