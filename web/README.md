# Splitlee Web Share

This web app now supports 2 share-link formats:

1. Legacy fragment links:
   - `https://<domain>/#<base64url-payload>`
2. Production short links backed by Cloudflare KV:
   - `https://<domain>/s/<share-id>`

The Pages Functions in `/functions` handle:

- `POST /api/share/create`
- `GET /api/share/:id`
- `GET /s/:id`

## Files

- Static web:
  - `web/index.html`
  - `web/app.js`
  - `web/styles.css`
- Pages Functions:
  - `functions/api/share/create.js`
  - `functions/api/share/[id].js`
  - `functions/s/[id].js`
- Shared helper:
  - `functions/_lib/share-store.js`

## How it works

### App side

1. The iOS app creates a `SharePayload`.
2. It calls `POST /api/share/create`.
3. The Function stores the payload in Workers KV with a TTL.
4. The Function returns a short share URL.
5. If the API is unavailable, the app falls back to the old fragment-based link.

### Web side

- If the page has a fragment payload, `web/app.js` decodes and renders it.
- If the page path matches `/s/:id`, `web/app.js` fetches `/api/share/:id` and renders that payload.

## Local development

Cloudflare recommends using `wrangler pages dev` for Pages Functions local development:
- [Local development](https://developers.cloudflare.com/pages/functions/local-development/)

Typical local command:

```bash
npx wrangler pages dev web --kv=SHARE_LINKS
```

If you want full config-driven local dev:

1. Copy `wrangler.jsonc.example` to `wrangler.jsonc`
2. Fill in your KV namespace IDs
3. Run:

```bash
npx wrangler pages dev
```

## First-time Cloudflare Pages deployment

Cloudflare docs referenced:

- [Pages Functions get started](https://developers.cloudflare.com/pages/functions/get-started/)
- [Pages Functions bindings](https://developers.cloudflare.com/pages/functions/bindings/)
- [Workers KV docs](https://developers.cloudflare.com/kv/)
- [Wrangler config for Pages](https://developers.cloudflare.com/pages/functions/wrangler-configuration/)

### 1. Install Wrangler

```bash
npm install -D wrangler
```

### 2. Log in

```bash
npx wrangler login
```

### 3. Create a KV namespace

```bash
npx wrangler kv namespace create SHARE_LINKS
npx wrangler kv namespace create SHARE_LINKS --preview
```

Save the 2 IDs returned by Cloudflare.

### 4. Create Wrangler config

```bash
cp wrangler.jsonc.example wrangler.jsonc
```

Then update:

- `id`
- `preview_id`
- `PUBLIC_SHARE_BASE_URL`

If you are deploying to:

- workers.dev first:
  - use your `https://<project>.workers.dev`
- custom domain later:
  - update `PUBLIC_SHARE_BASE_URL` to the final production domain

### 5. Create the Pages project

In Cloudflare dashboard:

1. Go to `Workers & Pages`
2. `Create application`
3. `Pages`
4. Connect your Git repo

Use:

- Build command: none
- Build output directory: `web`

### 6. Add the KV binding in Pages

In your Pages project:

1. `Settings`
2. `Bindings`
3. `Add`
4. `KV namespace`
5. Variable name:
   - `SHARE_LINKS`
6. Select the namespace you created

Cloudflare notes that Pages Functions can bind KV via dashboard or Wrangler:
- [Bindings docs](https://developers.cloudflare.com/pages/functions/bindings/)

### 7. Add environment variables

In `Settings > Variables and Secrets`, add:

- `PUBLIC_SHARE_BASE_URL`
  - example: `https://share.splitlee.app`
- `SHARE_TTL_SECONDS`
  - example: `7776000`

### 8. Deploy

Push to Git, or deploy with Wrangler if that is your preferred workflow.

After deploy, verify:

- `/`
- `/s/test`
- `POST /api/share/create`
- `GET /api/share/<id>`

## Suggested production domain setup

Recommended:

- web share host:
  - `share.splitlee.app`
- app website / marketing:
  - `splitlee.app`

Then set:

- `PUBLIC_SHARE_BASE_URL=https://share.splitlee.app`

And update the app's `ShareLinkEncoder.defaultBaseURL` and `defaultCreateEndpoint` accordingly.

## Notes

- Short links are more professional and allow expiry/revocation later.
- KV is a good fit here because this is a simple key lookup workload with high read volume.
- The current implementation is unauthenticated. That is acceptable for a v1 internal/product launch, but later you should add:
  - basic abuse protection
  - rate limiting
  - optional expiration UI
  - optional delete/revoke flow
