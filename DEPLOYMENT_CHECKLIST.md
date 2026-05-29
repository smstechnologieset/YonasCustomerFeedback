# Vercel Deployment Checklist

## ✅ What Was Fixed

The app was using an Express server (`server.ts`) which doesn't work on Vercel's serverless platform. I've converted all API routes to Vercel serverless functions.

## 📁 New Files Created

- `api/feedback.ts` - Handles POST (submit) and GET (list) feedback
- `api/feedback/[id].ts` - Handles DELETE feedback by ID
- `api/admin/login.ts` - Handles admin authentication
- `api/feedback/seed.ts` - Handles seeding sample data
- `vercel.json` - Vercel configuration
- `api/tsconfig.json` - TypeScript config for API functions
- `.vercelignore` - Files to exclude from deployment

## 🚀 Deploy to Vercel

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Convert to Vercel serverless functions"
git push
```

### Step 2: Import to Vercel
1. Go to https://vercel.com
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect settings

### Step 3: Set Environment Variables
In Vercel Dashboard → Settings → Environment Variables, add:

**Required:**
- `FIREBASE_SERVICE_ACCOUNT_KEY` - Your Firebase service account JSON (paste the entire JSON as a string)
- `FIREBASE_DATABASE_URL` - Your Firebase database URL (e.g., `https://your-project.firebaseio.com`)

**Optional:**
- `ADMIN_PASSWORD` - Admin portal password (defaults to `yonas123` if not set)

### Step 4: Deploy
Click "Deploy" and wait for the build to complete.

## 🧪 Test After Deployment

1. Visit your Vercel URL
2. Submit a feedback rating
3. Verify the success popup appears (no "Host connection error")
4. Click the admin shield icon
5. Log in with your admin password
6. Verify feedback appears in the admin portal

## 🔧 Local Development Still Works

The Express server (`server.ts`) still works for local development:

```bash
npm run dev
```

## 📝 API Endpoints

All endpoints work the same as before:
- `POST /api/feedback` - Submit feedback
- `GET /api/feedback` - Get all feedback (admin)
- `DELETE /api/feedback/:id` - Delete feedback (admin)
- `POST /api/admin/login` - Admin login
- `POST /api/feedback/seed` - Seed data (admin)

## ❓ Troubleshooting

**"Host connection error" still appears:**
- Check Vercel function logs in the dashboard
- Verify environment variables are set correctly
- Ensure Firebase credentials are valid

**Firebase errors:**
- Make sure `FIREBASE_SERVICE_ACCOUNT_KEY` is valid JSON
- Verify `FIREBASE_DATABASE_URL` matches your project

**Build fails:**
- Run `npm run build` locally to test
- Check for TypeScript errors with `npm run lint`
