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

### 3. Modern UX & Design
- Custom dark theme with glassmorphic cards, subtle borders, and smooth hover micro-interactions.
- Real-time search across titles and descriptions.
- Filter by category (*Work*, *Personal*, *Study*, *Urgent*) and status (*Pending*, *In Progress*, *Completed*).
- Multi-dimensional sorting (Newest, Oldest, Priority level).
- Live metrics overview bar with completion percentage progress bar.
- Floating toast notification system for instant action feedback.
- Zero-crash fallback sandbox mode so you can preview and test every feature immediately even before pasting Firebase keys.

---
Author 
Hafiza Ramisha Noor | Web Developer
