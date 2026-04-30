import { badRequest, getShare, json } from '../../_lib/share-store.js';

export async function onRequestGet(context) {
  const { env, params } = context;
  const id = typeof params.id === 'string' ? params.id.trim() : '';

  if (!env.SHARE_LINKS) {
    return badRequest('Missing SHARE_LINKS binding.', 500);
  }

  if (!id) {
    return badRequest('Missing share ID.');
  }

  const payload = await getShare(env, id);
  if (!payload) {
    return badRequest('Share not found.', 404);
  }

  return json(payload, {
    headers: {
      'cache-control': 'public, max-age=60',
    },
  });
}
