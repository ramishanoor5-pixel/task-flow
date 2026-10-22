# TaskFlow &bull; Firebase Authentication & Cloud Firestore CRUD

A modern, production-ready Full-Stack Authentication and Data Handling application built with **React**, **Firebase Authentication**, **Cloud Firestore**, and **Tailwind CSS**.

---

## 🌟 Key Features

### 1. Robust Authentication Flow
- **User Signup**: Registration with display name, email, and password validation. Automatically creates an authenticated user and stores user metadata in Firestore.
- **User Login**: Secure sign-in with clean credential validation and human-friendly error messages (e.g. invalid credentials, user not found, account disabled).
- **Session Persistence**: Reactive session tracking powered by `onAuthStateChanged`.
- **User Logout**: Instant, smooth session termination.
- **Protected Routes**: Custom `<ProtectedRoute>` wrapper that guards private routes (`/dashboard`) and redirects unauthorized users to `/login`.

### 2. User-Specific Cloud Firestore CRUD
- **Create**: Add new tasks/items with title, description, category, and priority. Automatically stamps document with `userId`, `createdAt`, and `updatedAt`.
- **Read**: Live real-time Firestore synchronization (`onSnapshot`) scoped strictly to the current user's UID (`where('userId', '==', currentUser.uid)`).
- **Update**: Edit title, notes, priority, or category in a dedicated modal. Includes a 1-click status cycle toggle directly from the card.
- **Delete**: Soft confirmation dialog before permanent deletion from Cloud Firestore.

### 3. Modern Human-Crafted UX & Design
- Custom dark theme with glassmorphic cards, subtle borders, and smooth hover micro-interactions.
- Real-time search across titles and descriptions.
- Filter by category (*Work*, *Personal*, *Study*, *Urgent*) and status (*Pending*, *In Progress*, *Completed*).
- Multi-dimensional sorting (Newest, Oldest, Priority level).
- Live metrics overview bar with completion percentage progress bar.
- Floating toast notification system for instant action feedback.
- Zero-crash fallback sandbox mode so you can preview and test every feature immediately even before pasting Firebase keys.

---

## 🔒 Security & Environment Secrets (.gitignore)

All Firebase API keys and secrets are loaded via Vite environment variables and strictly ignored by Git:

```gitignore
# Environment Variables & Secrets (Keep Firebase Keys Private)
.env
.env.local
.env.*.local
*.local
```

### Setting up `.env.local`:
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in your Firebase credentials in `.env.local`:
```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-app-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-app-id
VITE_FIREBASE_STORAGE_BUCKET=your-app-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

---

## 🛡️ Firestore Security Rules

To ensure strict database-level security and data isolation, paste the included `firestore.rules` into your Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /tasks/{taskId} {
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow read, update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

---

## 🚀 Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Run the development server
```bash
npm run dev
```

### 3. Build for production
```bash
npm run build
```
