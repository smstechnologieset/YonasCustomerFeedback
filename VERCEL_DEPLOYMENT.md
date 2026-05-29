# Vercel Deployment Guide

This app is now configured to deploy on Vercel using serverless functions.

## Quick Deploy

1. **Install Vercel CLI** (optional, for local testing):
   ```bash
   npm install -g vercel
   ```

2. **Deploy to Vercel**:
   - Push your code to GitHub
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect the configuration

3. **Set Environment Variables** in Vercel Dashboard:
   - `FIREBASE_SERVICE_ACCOUNT_KEY` - Your Firebase service account JSON (as a string)
   - `FIREBASE_DATABASE_URL` - Your Firebase Realtime Database URL
   - `ADMIN_PASSWORD` - Admin portal password (default: yonas123)

## Environment Variables Setup

In your Vercel project settings:

1. Go to **Settings** → **Environment Variables**
2. Add these variables:
   - **FIREBASE_SERVICE_ACCOUNT_KEY**: Copy the entire content of your Firebase service account JSON file
   - **FIREBASE_DATABASE_URL**: Your Firebase database URL (e.g., `https://your-project.firebaseio.com`)
   - **ADMIN_PASSWORD**: Set a secure password for the admin portal

## API Routes

The following serverless functions are available:

- `POST /api/feedback` - Submit customer feedback
- `GET /api/feedback` - Get all feedback (admin only)
- `DELETE /api/feedback/[id]` - Delete feedback record (admin only)
- `POST /api/admin/login` - Admin authentication
- `POST /api/feedback/seed` - Seed sample data (admin only)

## Local Development

For local development, the Express server (`server.ts`) still works:

```bash
npm run dev
```

## Build for Production

```bash
npm run build
```

This creates a static build in the `dist/` folder that Vercel will serve.

## Troubleshooting

### "Host connection error" on Vercel
- Verify environment variables are set correctly in Vercel dashboard
- Check Vercel function logs for errors
- Ensure Firebase credentials are valid

### Firebase initialization errors
- Make sure `FIREBASE_SERVICE_ACCOUNT_KEY` is a valid JSON string
- Verify `FIREBASE_DATABASE_URL` matches your Firebase project

### CORS issues
- All API routes include CORS headers for cross-origin requests
- If issues persist, check Vercel function logs
