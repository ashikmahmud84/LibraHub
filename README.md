# LibraHub

LibraHub is split into independently deployable Vite/React and Express services:

- `frontend/` contains the existing React UI, client-side routes, Firebase Authentication, and Vite build.
- `backend/` contains the Express API, MongoDB driver utilities, Firebase ID-token verification, and Cloudinary image handling.

The backend continues to use the official MongoDB Node.js driver. It does not use Mongoose. The frontend never receives MongoDB or Cloudinary credentials.

## Local development

Use Node.js 24.12 or newer. The current locked Firebase web packages require Node.js 24.12 or newer. From the repository root, create local environment files:

```powershell
Copy-Item frontend\.env.example frontend\.env.local
Copy-Item backend\.env.example backend\.env
```

Fill in `frontend/.env.local` with the existing Firebase project's web-app values and set `VITE_API_BASE_URL=http://localhost:3000` for local development. In `backend/.env`, configure the existing Atlas database, Firebase Admin credentials, the unchanged approved administrator email allowlist, and Cloudinary. Replace the placeholders in the examples; never copy credentials into Git. Service-account JSON files must also remain outside the repository.

Start the backend in one PowerShell terminal:

```powershell
Set-Location backend
npm ci
npm run dev
```

Start the frontend in another:

```powershell
Set-Location frontend
npm ci
npm run dev
```

The frontend defaults to `http://localhost:3000` for its API in development. Set `VITE_API_BASE_URL` to the backend origin when using a different local port or deployment. The backend allows the Vite development origins by default; set `CORS_ORIGINS` to comma-separated exact origins for deployment.

### Backend configuration

- `PORT`: local server port (defaults to `3000`; Render supplies its own value).
- `NODE_ENV`: use `development` locally and `production` on Render.
- `CORS_ORIGINS`: comma-separated exact frontend origins. Local Vite origins are allowed in development; configure the deployed Vercel origin(s) in Render.
- `MONGODB_URI` and `MONGODB_DB`: backend-only connection settings for the existing Atlas cluster/database. Keep the existing database name `LibraHub`; do not point tests or deployments at a different database unless intentionally configured.
- `FIREBASE_PROJECT_ID` and `FIREBASE_SERVICE_ACCOUNT_JSON`: backend Firebase Admin project and service-account JSON used to verify Firebase ID tokens. Keep the same Firebase project and provide the service-account JSON only through a protected local or Render environment variable. For local development, Application Default Credentials via the optional `GOOGLE_APPLICATION_CREDENTIALS` file path are also supported; keep that credential file outside the repository.
- `FIREBASE_STORAGE_BUCKET`: optional status-endpoint display value only; it is not required for backend token verification.
- `ADMIN_EMAILS`: comma-separated exact email allowlist already approved for catalog administration. Preserve the current list; the backend requires a valid Firebase ID token and a matching email, ignores caller-supplied role/email headers, and does not authorize via a shared API secret.
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`: backend-only image-storage credentials.

The frontend needs `VITE_API_BASE_URL` plus `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, and `VITE_FIREBASE_APP_ID`. These `VITE_*` variables are bundled into the browser build; never put MongoDB, Firebase Admin service-account, or Cloudinary secrets in them.

### Smoke checks

These checks do not seed or modify the catalog. `/api/health` performs a database ping and book count; it returns HTTP 503 if database connectivity or configuration is unavailable. A successful server start alone does not mean the database is healthy.

```powershell
Invoke-RestMethod http://localhost:3000/api/health
Invoke-RestMethod http://localhost:3000/api/books
```

Do not use `POST /api/books/seed?force=true` against a database whose contents must be preserved: the existing endpoint intentionally resets the books collection when `force=true`. To test create/update/delete, use a dedicated disposable database and a Firebase account present in `ADMIN_EMAILS`; never point destructive test requests at production data. Cover upload/delete tests require working Cloudinary credentials and the same admin authorization.

## Vercel frontend deployment

1. Create a Vercel project for this repository and set the **Root Directory** to `frontend`.
2. Set Node.js to 24.12 or newer. Use `npm ci` as the install command, `npm run build` as the build command, and `dist` as the output directory.
3. Set `VITE_API_BASE_URL` to the public Render backend origin, for example `https://your-librahub-api.onrender.com` (origin only; no `/api` suffix).
4. Set `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, and `VITE_FIREBASE_APP_ID` using the existing Firebase project's web-app configuration.
5. Add the Vercel production domain (and any intentionally enabled preview domains) to the existing Firebase Authentication authorized domains.
6. Do not add `MONGODB_URI`, `FIREBASE_SERVICE_ACCOUNT_JSON`, `ADMIN_EMAILS`, or any Cloudinary credentials to Vercel. Redeploy after changing Vite environment variables because they are applied at build time.

The `frontend/vercel.json` rewrite serves the SPA entry point for client-side routes.

## Render backend deployment

1. Create a Render Web Service for this repository and set the **Root Directory** to `backend`.
2. Use Node.js 24.12 or newer, `npm ci` as the build command, and `npm start` as the start command. The server listens on `process.env.PORT || 3000`; Render supplies `PORT`.
3. Configure these values in Render's protected environment dashboard: `NODE_ENV=production`, `CORS_ORIGINS`, `MONGODB_URI`, `MONGODB_DB=LibraHub`, `FIREBASE_PROJECT_ID`, `FIREBASE_SERVICE_ACCOUNT_JSON`, `ADMIN_EMAILS`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`. `FIREBASE_STORAGE_BUCKET` is optional and only displayed by the upload status endpoint.
4. Use the existing Atlas database URI and Firebase project. Preserve the currently approved `ADMIN_EMAILS` values. Set `CORS_ORIGINS` to exact Vercel origin(s), comma-separated; include preview origins only if they should be allowed. Do not set frontend `VITE_*` values on the backend.
5. After configuring a valid database URI, verify `GET /api/health`. It reports healthy only after a database ping succeeds; HTTP 503 means the backend cannot confirm database connectivity. Do not run seed/reset or CRUD checks merely to make the health check pass.

Render's local filesystem is not used for new cover uploads. Cloudinary stores new images. The backend still serves legacy files from `backend/public/uploads` for compatibility; those files must be present in the deployed repository or separately migrated to Cloudinary to remain available on a fresh deployment.

## Existing cover compatibility

The current Atlas catalog was inspected read-only: 15 book records exist. Fourteen records use existing `/src/assets/images/...` paths; all referenced images are present under `frontend/public/assets/images`. One record, **Love Story**, uses `/uploads/covers/cover-1792995217503-6b42f4026f8e3b1a.png`; that file is preserved under `backend/public/uploads/covers`. The frontend rewrites legacy `/src/assets/images/...` paths to the deployed frontend asset path and resolves `/uploads/...` URLs against the backend origin. External absolute cover URLs remain unchanged.

No existing book record or cover URL was changed, and no cover was uploaded to Cloudinary, overwritten, or deleted. The local Love Story image is still untracked in Git; a Render deployment from the repository will not contain it unless you intentionally include that file. If you approve Cloudinary migration later, the current mapping to review is:

| Book | MongoDB ID | Existing cover URL | Source file | Cloudinary URL |
|---|---|---|---|---|
| Love Story | `6adeef9ca37420eada36d8e3` | `/uploads/covers/cover-1792995217503-6b42f4026f8e3b1a.png` | `backend/public/uploads/covers/cover-1792995217503-6b42f4026f8e3b1a.png` | Pending explicit approval and upload; expected under `librahub/covers/` |

The other 14 records continue to use the four local frontend image assets; no Cloudinary migration is needed for those files. Do not apply any Cloudinary URL mapping to MongoDB or remove a local image without explicit approval.
