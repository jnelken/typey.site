import { spawn } from 'node:child_process';
import { access } from 'node:fs/promises';

const API_PATH = '/api/tidbyt';
const DISPLAY_MS = 10_000;
const REFRESH_MS = 2_000;
const MAX_BODY_BYTES = 4_096;
const MAX_TEXT_LENGTH = 120;
const MAX_QUEUE_LENGTH = 25;
const DEFAULT_REMOTE_ORIGINS = [
  'https://typey.site',
  'https://www.typey.site',
];

const FONT_CANDIDATES = [
  '/System/Library/Fonts/SFNS.ttf',
  '/System/Library/Fonts/HelveticaNeue.ttc',
  '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
  '/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf',
  'C:\\Windows\\Fonts\\arialbd.ttf',
];

const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

async function firstReadablePath(paths) {
  for (const path of paths.filter(Boolean)) {
    try {
      await access(path);
      return path;
    } catch {
      // Try the next platform-specific font.
    }
  }

  return null;
}

function escapeXml(text) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function wrapText(text, maxCharacters, maxLines) {
  const words = text.trim().split(/\s+/);
  const lines = [];

  for (const word of words) {
    if (lines.length === maxLines) break;

    if (word.length > maxCharacters) {
      const chunks = word.match(new RegExp(`.{1,${maxCharacters}}`, 'g')) || [];
      for (const chunk of chunks) {
        if (lines.length === maxLines) break;
        lines.push(chunk);
      }
      continue;
    }

    const lastLine = lines.at(-1);
    if (lastLine && `${lastLine} ${word}`.length <= maxCharacters) {
      lines[lines.length - 1] = `${lastLine} ${word}`;
    } else {
      lines.push(word);
    }
  }

  const wrappedText = lines.join(' ');
  if (wrappedText.length < text.trim().length && lines.length) {
    const lastIndex = lines.length - 1;
    lines[lastIndex] = `${lines[lastIndex].slice(0, Math.max(1, maxCharacters - 1))}…`;
  }

  return lines;
}

export function promptSvg(input) {
  const text = input.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, MAX_TEXT_LENGTH);
  const length = text.length;
  const fontSize = length <= 12 ? 12 : length <= 32 ? 9 : 7;
  const maxCharacters = fontSize === 12 ? 9 : fontSize === 9 ? 13 : 17;
  const maxLines = fontSize === 12 ? 2 : fontSize === 9 ? 3 : 4;
  const lines = wrapText(text, maxCharacters, maxLines);
  const lineHeight = fontSize + 1;
  const blockHeight = lines.length * lineHeight;
  const startY = 16 - blockHeight / 2 + fontSize * 0.8;
  const tspans = lines.map((line, index) => (
    `<tspan x="32" y="${startY + index * lineHeight}">${escapeXml(line)}</tspan>`
  )).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="32" viewBox="0 0 64 32">
    <rect width="64" height="32" fill="#08051a"/>
    <rect width="64" height="3" fill="#55f6ff"/>
    <rect y="29" width="64" height="3" fill="#ff4fd8"/>
    <text text-anchor="middle" font-size="${fontSize}" font-weight="700" fill="#ffffff">${tspans}</text>
  </svg>`;
}

function runImageMagick(svg, fontPath) {
  return new Promise((resolve, reject) => {
    const child = spawn('magick', [
      '-font', fontPath,
      'svg:-',
      '-quality', '90',
      'webp:-',
    ]);
    const output = [];
    const errors = [];

    child.stdout.on('data', chunk => output.push(chunk));
    child.stderr.on('data', chunk => errors.push(chunk));
    child.on('error', reject);
    child.on('close', code => {
      if (code === 0) {
        resolve(Buffer.concat(output));
      } else {
        reject(new Error(Buffer.concat(errors).toString().trim() || `ImageMagick exited ${code}`));
      }
    });

    child.stdin.end(svg);
  });
}

async function pushFrame({ apiKey, deviceId, frame }) {
  const response = await fetch(`https://api.tidbyt.com/v0/devices/${encodeURIComponent(deviceId)}/push`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image: frame.toString('base64'),
      background: false,
    }),
  });

  if (!response.ok) {
    const detail = (await response.text()).slice(0, 300);
    throw new Error(`Tidbyt returned HTTP ${response.status}${detail ? `: ${detail}` : ''}`);
  }
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';

    request.setEncoding('utf8');
    request.on('data', chunk => {
      body += chunk;
      if (Buffer.byteLength(body) > MAX_BODY_BYTES) {
        reject(new Error('Request body is too large'));
        request.destroy();
      }
    });
    request.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch {
        reject(new Error('Request body must be valid JSON'));
      }
    });
    request.on('error', reject);
  });
}

function sendJson(response, statusCode, body) {
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'application/json');
  response.end(JSON.stringify(body));
}

function isLoopbackOrigin(origin) {
  try {
    const { hostname } = new URL(origin);
    return ['localhost', '127.0.0.1', '[::1]'].includes(hostname);
  } catch {
    return false;
  }
}

function setCorsHeaders(request, response, allowedRemoteOrigins) {
  const origin = request.headers.origin;
  if (!origin) return true;

  const isAllowed = isLoopbackOrigin(origin) || allowedRemoteOrigins.has(origin);
  if (!isAllowed) return false;

  response.setHeader('Access-Control-Allow-Origin', origin);
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.setHeader('Access-Control-Allow-Private-Network', 'true');
  response.setHeader(
    'Vary',
    'Origin, Access-Control-Request-Headers, Access-Control-Request-Private-Network'
  );
  return true;
}

export function createTidbytDevPlugin({
  apiKey,
  deviceId,
  fontPath,
  allowedOrigins = DEFAULT_REMOTE_ORIGINS,
} = {}) {
  const queue = [];
  let active = false;
  let selectedFont;
  const allowedRemoteOrigins = new Set(allowedOrigins);

  const displayPrompt = async (text, server) => {
    const font = await selectedFont;
    if (!font) {
      throw new Error('No usable font found. Set TIDBYT_FONT_PATH in .env.local.');
    }

    const frame = await runImageMagick(promptSvg(text), font);
    const refreshes = Math.ceil(DISPLAY_MS / REFRESH_MS);

    for (let index = 0; index < refreshes; index += 1) {
      await pushFrame({ apiKey, deviceId, frame });
      await sleep(REFRESH_MS);
    }

    server.config.logger.info(`[tidbyt] Displayed “${text.slice(0, 40)}” for 10 seconds.`);
  };

  const drainQueue = async server => {
    if (active) return;
    active = true;

    while (queue.length) {
      const text = queue.shift();
      try {
        await displayPrompt(text, server);
      } catch (error) {
        server.config.logger.error(`[tidbyt] ${error.message}`);
      }
    }

    active = false;
  };

  return {
    name: 'typey-tidbyt-dev',
    apply: 'serve',
    configureServer(server) {
      selectedFont = firstReadablePath([fontPath, ...FONT_CANDIDATES]);
      const configured = Boolean(apiKey && deviceId);

      if (configured) {
        server.config.logger.info('[tidbyt] Local prompt display enabled.');
      } else {
        server.config.logger.warn('[tidbyt] Add TIDBYT_API_KEY and TIDBYT_DEVICE_ID to .env.local to enable prompts.');
      }

      server.middlewares.use(async (request, response, next) => {
        const pathname = new URL(request.url, 'http://localhost').pathname;
        if (pathname !== API_PATH) {
          next();
          return;
        }

        if (!setCorsHeaders(request, response, allowedRemoteOrigins)) {
          sendJson(response, 403, { error: 'Origin is not allowed' });
          return;
        }

        if (request.method === 'OPTIONS') {
          response.statusCode = 204;
          response.end();
          return;
        }

        if (request.method === 'GET') {
          sendJson(response, 200, { configured, active, queued: queue.length });
          return;
        }

        if (request.method !== 'POST') {
          sendJson(response, 405, { error: 'Method not allowed' });
          return;
        }

        if (!configured) {
          sendJson(response, 503, { error: 'Tidbyt is not configured locally' });
          return;
        }

        if (queue.length >= MAX_QUEUE_LENGTH) {
          sendJson(response, 429, { error: 'Tidbyt prompt queue is full' });
          return;
        }

        try {
          const { text } = await readJsonBody(request);
          const normalizedText = typeof text === 'string' ? text.trim() : '';
          if (!normalizedText) {
            sendJson(response, 400, { error: 'Text is required' });
            return;
          }

          queue.push(normalizedText.slice(0, MAX_TEXT_LENGTH));
          sendJson(response, 202, { accepted: true, queued: queue.length });
          void drainQueue(server);
        } catch (error) {
          sendJson(response, 400, { error: error.message });
        }
      });
    },
  };
}
