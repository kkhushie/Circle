
# 🌐 Circle – Full-Stack Social App (MERN)

<div align="center">
  <img width="1884" height="921" alt="image" src="https://github.com/user-attachments/assets/b1faf198-5dc4-483d-a96e-b02664f2e446" />

  **A modern social networking platform built with the MERN stack**
  
  [![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react)]()
  [![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?logo=node.js)]()
  [![Express](https://img.shields.io/badge/Express-4.18-000000?logo=express)]()
  [![MongoDB](https://img.shields.io/badge/MongoDB-6.0-47A248?logo=mongodb)]()
  [![Socket.io](https://img.shields.io/badge/Socket.io-4.5-010101?logo=socket.io)]()
  [![License](https://img.shields.io/badge/License-MIT-blue.svg)]()
</div>

---

## 📋 Overview

**Circle** is a full-stack social networking platform that reimagines online communities through **time-based content discovery**. Users can create communities (Circles), share ephemeral stories (Moments), chat in real-time (Huddles), and host video meetings (RoundTables).

Built as a **monorepo** with React frontend and Node.js backend, this project demonstrates production-ready full-stack development.

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| **👤 User System** | JWT authentication, profiles, follow/unfollow, reportuser, privacy settings |
| **🏘️ Circles** | Communities with public/private options, roles, invite codes |
| **📸 Moments** | customized hour stories with auto-expiry, view counts, replies |
| **💬 Huddles** | Real-time chat with Socket.io, reactions, read receipts |
| **🎥 RoundTables** | Video meetings using Zoom API, screen sharing, recordings |
| **🔔 Notifications** | In-app and push notifications for engagement |

---

## 🛠️ Tech Stack

### Frontend
- **React 18** – UI library with hooks
- **React Router** – Navigation
- **Context API** – State management
- **Axios** – HTTP client
- **Socket.io-client** – Real-time communication
- **Tailwind CSS** – Styling
- **Lucide React** – Dynamic SVG iconography

### Backend
- **Node.js** – JavaScript runtime
- **Express.js** – Web framework
- **MongoDB + Mongoose** – Database & ODM
- **JWT + Bcrypt** – Authentication
- **Nodemailer** – Secure email delivery
- **Socket.io** – WebSocket server
- **Cloudinary** – Media storage

### DevOps
- **Git/GitHub** – Version control
- **Vercel** – Frontend hosting
- **Render** – Backend hosting
- **MongoDB Atlas** – Database hosting

---

## 📁 Project Structure

```
circle-app/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Page components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── context/           # Context providers
│   │   ├── services/          # API services
│   │   └── utils/             # Helper functions
│   └── package.json
│
├── server/                    # Node.js backend
│   ├── src/
│   │   ├── models/            # MongoDB models
│   │   ├── controllers/        # Business logic
│   │   ├── routes/            # API routes
│   │   ├── middleware/         # Custom middleware
│   │   ├── utils/             # Helper functions
│   │   └── socket/            # WebSocket handlers
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- npm or yarn
- MongoDB Atlas account
- Cloudinary account

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/your-username/circle-app.git
cd circle-app
```

**2. Backend setup**
```bash
cd server
npm install
cp .env.example .env   # Add your credentials
npm run dev            # Runs on http://localhost:3000
```

**3. Frontend setup**
```bash
cd client
npm install
cp .env.example .env.local   # Add backend URL
npm run dev                     # Runs on http://localhost:5173
```

---

## 🔧 Environment Variables

### Backend (`server/.env`)
```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:5173
```

### Frontend (`client/.env.local`)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

---

## 📡 API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| GET | `/api/users/:username` | Get user profile |
| PUT | `/api/users/profile` | Update profile |
| POST | `/api/users/:userId/follow` | Follow user |
| POST | `/api/circles` | Create circle |
| GET | `/api/circles` | Get all circles |
| POST | `/api/circles/:circleId/join` | Join circle |
| POST | `/api/moments` | Create moment |
| GET | `/api/moments/feed` | Get moments feed |
| POST | `/api/reports` | Submit a violation report (User or Circle) |

---


## 🔐 Authentication & Security

- **JWT-based authentication** – Tokens stored securely
- **Password hashing** – bcrypt with 10 rounds
- **Input validation** – All user inputs validated
- **Rate limiting** – Prevents brute force attacks
- **CORS protection** – Restricted API access
- **Helmet.js** – Security headers

---

## 🧪 Testing the App

Use these credentials to test:
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

Or register a new account at `/signup`

---

## 📦 Deployment

| Service | Platform | URL |
|---------|----------|-----|
| Frontend | Vercel | `https://circle-app.vercel.app` |
| Backend | Render | `https://circle-api.onrender.com` |
| Database | MongoDB Atlas | - |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📈 Project Status

✅ **Phase 1-4 Complete** – Authentication, Users, Circles, Moments  
⏳ **Phase 5-7 In Progress** – Huddles, RoundTables, Notifications  
🚀 **Production Ready** – Deployed and tested

---

## 📄 License

MIT License – feel free to use this project for learning and portfolio purposes.

---

## 👥 Team

- **Developer** – [Khushi Pal](https://github.com/kkhushi)  [Sakina Kheraj](https://github.com/SakinaKheraj) [Maryam Shaikh](https://github.com/mshaikh19)  [Anistina Dsouza](https://github.com/Anistina-Dsouza)
- **Project Link** – [https://github.com/Anistina-Dsouza/circle](https://github.com/Anistina-Dsouza/Circle)

---

<div align="center">
  Made with ❤️
</div>
