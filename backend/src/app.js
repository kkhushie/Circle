const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const circleRoutes = require('./routes/circleRoutes');
const momentRoutes = require('./routes/momentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const circleMessageRoutes = require('./routes/circleMessageRoutes'); // Import circle message routes
const conversationRoutes = require('./routes/conversationRoutes');
const reportRoutes = require('./routes/reportRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const meetingRoutes = require('./routes/meetingRoutes');
const notificationRoutes = require('./routes/notificationRoutes');


const app = express();

// Middleware
app.use(helmet());

const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());


app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Circle API is running!',
    endpoints: {
      auth: '/api/auth',
      health: '/health'
    }
  });
});
// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'Circle Backend API'
  });
});


// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/circles', circleRoutes);
app.use('/api/moments', momentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/dm/conversations', conversationRoutes);
app.use('/api/circlemessages', circleMessageRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/notifications', notificationRoutes);


// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Error handler (will be imported from middleware)
app.use(require('./middleware/errorHandler'));

module.exports = app;