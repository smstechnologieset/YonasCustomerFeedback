# Yonas Mobile Customer Feedback System

A modern customer feedback collection kiosk for Yonas Mobile (phone repair shop) built with React, Express, TypeScript, and Firebase.

## Features

- **Customer Kiosk**: 5-star emoji-based rating system with optional text feedback
- **Admin Dashboard**: Secure analytics dashboard with charts, search, and filtering
- **Real-time Analytics**: Rating distribution, timeline tracking, hourly volume stats
- **Data Export**: CSV export and print capabilities
- **Firebase Backend**: Scalable cloud database storage with real-time capabilities

## Architecture

- **Frontend**: React 19 + Vite + Tailwind CSS + Recharts
- **Backend**: Express.js with TypeScript
- **Database**: Firebase Realtime Database (via Admin SDK)
- **Authentication**: JWT-like token-based admin authentication

## Prerequisites

- Node.js (v18 or higher)
- Firebase Project with Realtime Database enabled
- Firebase Service Account credentials

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Firebase Configuration

#### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project" and follow the setup wizard
3. Enable Realtime Database:
   - In the Firebase Console, go to **Build > Realtime Database**
   - Click "Create Database"
   - Choose your region (e.g., us-central1)
   - Start in **Test mode** (for development only)

#### Step 2: Get Service Account Credentials

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Click the **Service Accounts** tab
3. Click **Generate New Private Key**
4. A JSON file will download - save this securely

#### Step 3: Set Environment Variables

Create a `.env.local` file in the project root:

```bash
# Firebase Service Account Key (entire JSON as a string)
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"your-project-id",...}'

# Your Firebase Realtime Database URL
# Found in Firebase Console > Realtime Database > Data tab at the top
FIREBASE_DATABASE_URL=https://your-project-id.firebaseio.com

# Admin Portal Password
ADMIN_PASSWORD=yonas123

NODE_ENV=development
```

**Getting the JSON key as a string:**

If the JSON file looks like this:
```json
{
  "type": "service_account",
  "project_id": "my-project",
  ...
}
```

Convert it to a single-line string by removing all newlines and copying the entire content into `FIREBASE_SERVICE_ACCOUNT_KEY`.

Or on PowerShell:
```powershell
$content = Get-Content "path/to/service-key.json" -Raw
$env:FIREBASE_SERVICE_ACCOUNT_KEY = $content
```

### 3. Firebase Security Rules (for Test Mode)

For development, the default test rules allow read/write for testing. In production, update your Firestore rules in Firebase Console > Realtime Database > Rules:

```json
{
  "rules": {
    "feedback": {
      ".read": true,
      ".write": true
    }
  }
}
```

## Running the Application

### Development

```bash
npm run dev
```

The app will start at `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

## API Endpoints

### Public Endpoints

- `POST /api/feedback` - Submit customer feedback
- `POST /api/admin/login` - Admin authentication

### Secure Admin Endpoints (require Bearer token)

- `GET /api/feedback` - Retrieve all feedback records
- `DELETE /api/feedback/:id` - Delete a feedback record
- `POST /api/feedback/seed` - Seed mock data for demonstration

## Admin Portal Access

Default credentials:
- **Password**: `yonas123` (change in `.env.local` for production)

Access the admin portal by clicking the shield icon on the kiosk screen.

## Data Storage

Data is stored in Firebase Realtime Database under the `feedback` path:

```
feedback/
├── fb_1234567890_123/
│   ├── id: "fb_1234567890_123"
│   ├── rating: 5
│   ├── emoji: "🤩"
│   ├── category: "Excellent"
│   ├── textFeedback: "Great service!"
│   ├── createdAt: "2026-05-29T10:30:00.000Z"
│   └── timestamp: 1234567890000
└── ...
```

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── AdminPortal.tsx      # Secure admin dashboard
│   │   ├── RatingScreen.tsx     # Customer kiosk interface
│   │   ├── ThumbsUpPopup.tsx    # Confirmation popup
│   │   └── YonasLogo.tsx        # Brand component
│   ├── services/
│   │   └── firebase.ts          # Firebase service layer
│   ├── App.tsx                  # Main app component
│   ├── types.ts                 # TypeScript interfaces
│   ├── main.tsx                 # Entry point
│   └── index.css                # Tailwind styles
├── server.ts                    # Express server
├── vite.config.ts               # Vite configuration
├── tsconfig.json                # TypeScript configuration
├── package.json                 # Dependencies
└── .env.example                 # Environment variables template
```

## Troubleshooting

### "Firebase credentials not configured" Error

Ensure both `FIREBASE_SERVICE_ACCOUNT_KEY` and `FIREBASE_DATABASE_URL` are set in `.env.local`

### "Permission denied" from Firebase

1. Check your Realtime Database security rules
2. For development, ensure you're in "Test mode"
3. Verify your service account has correct permissions

### Data not persisting

1. Verify Firebase Realtime Database is enabled
2. Check that your service account key is valid
3. Look at the server console logs for Firebase errors

## Development Notes

- The admin token is generated server-side and stored in `localStorage`
- All admin operations are protected with JWT-like token authentication
- Mock data can be seeded via the admin portal for testing
- The system supports concurrent admin access (real-time sync)

## License

Apache 2.0 - See LICENSE file for details
