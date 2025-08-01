# Social Media App

This is a full-stack **Social Media App** built using **Next.js**, **Redux Toolkit**, **MongoDB**, **Cloudinary**, and **Socket.IO**. It allows users to:

- Create posts with images or videos
- Like and comment on posts
- Upload and view stories (like Instagram)
- Follow and unfollow users
- View real-time notifications (likes, comments)
- View and edit user profiles
- Receive notification badges

---

## ⚠️ Project Status

- 🔴 **Chat feature is currently not working.**
- 🟡 **The app is not yet deployed.**

You can still run and test all other major features locally.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js (App Router), Tailwind CSS, TypeScript
- **State Management**: Redux Toolkit
- **Backend**: MongoDB, Mongoose, API Routes in Next.js
- **Authentication**: NextAuth.js
- **Media Uploads**: Cloudinary
- **Real-time Updates**: Socket.IO (notifications & future chat)

---

## 🚀 Features

- 🔐 JWT-based authentication with NextAuth
- 📷 Post creation with image/video upload
- 🧵 Stories that auto-expire (24 hours)
- ❤️ Like and 💬 comment functionality
- 🔔 Real-time notifications (via Socket.IO)
- 👥 Follow/unfollow system
- 🧑‍💼 User profile pages with bio and posts
- 📦 Media handling with Cloudinary

---

## 📦 Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/social-media-app.git
cd social-media-app

2. Install dependencies
bash
npm install

3. Set up environment variables
Create a .env.local file:

env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

4. Run the app locally
bash
npm run dev
Visit http://localhost:3000 to see the app.

📌 Roadmap
 Post creation and feed

 Likes and comments with notifications

 User stories and profile system

 Follower system with conditional access

 Real-time Chat component (coming soon 🚧)

 Deployment (coming soon 🚀)

💬 Chat Feature
The UI and backend infrastructure for chat is in progress but not functional yet. Real-time messaging is not available in this version.

📡 Deployment
This application is currently under active development and has not been deployed yet.

🤝 Contributions
Feel free to open issues or submit pull requests for improvements or bug fixes.
