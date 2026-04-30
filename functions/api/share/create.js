import {
  badRequest,
  generateShareID,
  json,
  normalizeSharePayload,
  putShare,
  shareBaseURL,
} from '../../_lib/share-store.js';

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.SHARE_LINKS) {
    return badRequest('Missing SHARE_LINKS binding.', 500);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return badRequest('Invalid JSON body.');
  }

  const payload = normalizeSharePayload(body?.payload);
  if (!payload) {
    return badRequest('Invalid share payload.');
  }

  let shareID = '';
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const candidate = generateShareID();
    shareID = candidate;
    const existing = await env.SHARE_LINKS.get(`share:${candidate}`);
    if (!existing) break;
  }

  if (!shareID) {
    return badRequest('Could not generate share ID.', 500);
  }

  await putShare(env, shareID, {
    ...payload,
    createdAt: new Date().toISOString(),
  });

  const baseURL = shareBaseURL(request, env);
  return json({
    id: shareID,
    url: `${baseURL}/s/${shareID}`,
  });
}
