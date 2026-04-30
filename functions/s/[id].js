export async function onRequest(context) {
  const url = new URL(context.request.url);
  const assetURL = new URL('/', url);
  return context.env.ASSETS.fetch(assetURL.toString());
}
