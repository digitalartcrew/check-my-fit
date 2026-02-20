# Check My Fit

A React Native mobile app where users post outfit photos, the community rates them, and Claude AI generates personalized style suggestions.

## Tech Stack

- **React Native** + Expo (Managed Workflow)
- **Firebase** — Auth, Firestore, Storage, Cloud Functions
- **Claude API** (Anthropic) — AI outfit suggestions
- **TypeScript** throughout
- **Zustand** — state management

## Setup

### 1. Firebase Project

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** (Email/Password)
3. Enable **Firestore** (start in production mode)
4. Enable **Storage**
5. Enable **Functions**

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in your Firebase config:

```bash
cp .env.example .env
```

Get your config from **Firebase Console → Project Settings → Your apps → Web app**.

### 3. Install Dependencies

```bash
npm install
```

### 4. Deploy Firebase Rules & Indexes

```bash
npx firebase login
npx firebase use --add          # select your project
npx firebase deploy --only firestore:rules,firestore:indexes,storage
```

### 5. Deploy Cloud Functions

```bash
cd functions
npm install

# Set the Anthropic API key as a Firebase secret
npx firebase functions:secrets:set ANTHROPIC_API_KEY

cd ..
npx firebase deploy --only functions
```

### 6. Run the App

```bash
npm start
# Scan the QR code with Expo Go (iOS/Android)
```

## Project Structure

```
check-my-fit/
├── src/
│   ├── config/          # Firebase init, app constants, colors
│   ├── types/           # TypeScript interfaces
│   ├── stores/          # Zustand stores (auth, feed)
│   ├── services/        # Firebase service functions
│   ├── hooks/           # Custom React hooks
│   ├── navigation/      # React Navigation setup
│   ├── screens/         # App screens
│   │   ├── auth/        # Login, Register, ForgotPassword
│   │   ├── feed/        # Feed, OutfitDetail
│   │   ├── upload/      # UploadScreen
│   │   ├── profile/     # Profile, PublicProfile
│   │   └── ai/          # AISuggestion
│   ├── components/
│   │   ├── ui/          # Button, Input, Avatar, Skeleton, EmptyState
│   │   ├── outfit/      # OutfitCard, RatingBar, CommentItem, CommentInput
│   │   └── layout/      # ScreenWrapper, LoadingOverlay
│   └── utils/           # formatters, validators, imageUtils
│
└── functions/           # Firebase Cloud Functions
    └── src/
        ├── index.ts
        ├── getAISuggestion.ts    # HTTPS Callable → Claude API
        ├── onRatingWritten.ts    # Trigger: recalculate avg rating
        ├── onOutfitDeleted.ts    # Trigger: cleanup storage
        └── utils/
            ├── anthropic.ts      # Claude client + prompt builder
            └── firestoreHelpers.ts
```

## Key Features

| Feature | Implementation |
|---------|---------------|
| Auth | Firebase Email/Password |
| Photo upload | expo-image-picker + Firebase Storage |
| Image resize | expo-image-manipulator (1080px max) |
| Feed | Firestore cursor pagination, 12/page |
| Ratings | Subcollection doc ID = raterUID (1 per user) |
| Avg rating update | Cloud Function trigger on rating write |
| Comments | Real-time Firestore `onSnapshot` |
| AI suggestions | Cloud Function → Claude claude-opus-4-6 |
| Rate limiting | 1 AI generation per outfit per hour |
| Storage cleanup | Cloud Function trigger on outfit delete |

## Firestore Data Model

```
users/{uid}
outfits/{outfitId}
  ratings/{raterUid}
  comments/{commentId}
aiSuggestions/{outfitId}
```

## AI Suggestion Flow

1. User taps "Get AI Style Suggestion" (outfit owners only)
2. Client calls `getAISuggestion` Cloud Function via HTTPS Callable
3. Function fetches up to 20 ratings + 20 comments from Firestore
4. Builds a structured prompt for Claude including ratings, comments, caption, and style tags
5. Claude generates personalized feedback: What's Working, Suggestions, Styling Tips, Encouragement
6. Result saved to `aiSuggestions/{outfitId}` and returned to client
7. Client displays rendered Markdown

Rate limit: 1 generation per outfit per hour to control API costs.
