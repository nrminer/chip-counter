// Import required modules
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config(); // For using .env variables

// Initialize the Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",  // Allow all origins for testing (Secure later for production)
        methods: ["GET", "POST"]
    }
});

// Use CORS and JSON Parsing Middleware
app.use(cors());
app.use(express.json());

// ✅ Firebase Integration
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set, onValue } = require('firebase/database');

// ✅ Firebase Configuration from .env File
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
};

// ✅ Initialize Firebase App and Database
const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);

// ✅ Store Chip Data In-Memory (for quick reference)
let userChips = {};

// ✅ Endpoint to Update Chips from Android APK
app.post('/updateChips', (req, res) => {
    const { user, chips } = req.body;
    if (!user || typeof chips !== 'number') {
        return res.status(400).send('Invalid data provided.');
    }

    // ✅ Update Firebase Database
    const chipRef = ref(db, `users/${user}`);
    set(chipRef, chips)
        .then(() => {
            console.log(`${user} chip count updated to ${chips}`);
            userChips[user] = chips;
            io.emit('chipUpdate', { user, chips });
            res.status(200).send('Chip count updated successfully.');
        })
        .catch((error) => {
            res.status(500).send('Error updating chip count: ' + error.message);
        });
});

// ✅ WebSocket Connection for Real-Time Updates
io.on('connection', (socket) => {
    console.log('A client connected for real-time updates.');

    // Send current data on connection
    socket.emit('initialData', userChips);

    // Firebase Real-Time Sync with WebSocket
    const chipRef = ref(db, 'users');
    onValue(chipRef, (snapshot) => {
        const data = snapshot.val();
        userChips = data || {};
        io.emit('chipUpdate', data);  // Send updates to all connected clients
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected.');
    });
});

// ✅ Serve Static Files for the Web Page
app.use(express.static('public')); // Serve the index.html and related files

// ✅ Start the Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
