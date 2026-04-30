const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 90;
const ID_ALPHABET = '23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';

export function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...(init.headers || {}),
    },
  });
}

export function badRequest(message, status = 400) {
  return json({ error: message }, { status });
}

export function generateShareID(length = 10) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);

  let result = '';
  for (const byte of bytes) {
    result += ID_ALPHABET[byte % ID_ALPHABET.length];
  }
  return result;
}

export function shareTTLSeconds(env) {
  const raw = Number(env.SHARE_TTL_SECONDS || DEFAULT_TTL_SECONDS);
  if (!Number.isFinite(raw) || raw <= 0) {
    return DEFAULT_TTL_SECONDS;
  }
  return Math.floor(raw);
}

export function shareBaseURL(request, env) {
  if (env.PUBLIC_SHARE_BASE_URL && typeof env.PUBLIC_SHARE_BASE_URL === 'string') {
    return env.PUBLIC_SHARE_BASE_URL.replace(/\/+$/, '');
  }
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

export async function putShare(env, id, payload) {
  await env.SHARE_LINKS.put(`share:${id}`, JSON.stringify(payload), {
    expirationTtl: shareTTLSeconds(env),
  });
}

export async function getShare(env, id) {
  const raw = await env.SHARE_LINKS.get(`share:${id}`);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function normalizeSharePayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  if (typeof payload.v !== 'number') return null;
  if (typeof payload.title !== 'string') return null;
  if (typeof payload.currency !== 'string') return null;
  if (!Array.isArray(payload.people)) return null;
  if (typeof payload.total !== 'number') return null;

  return payload;
}
