// server.js (Updated for Player Management)
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();

// Initialize Express and WebSocket
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

app.use(cors());
app.use(express.json());

// ✅ Firebase Setup
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set, push, onValue } = require('firebase/database');

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);

// ✅ Store Local Data
let userChips = {};

// ✅ POST Endpoint for Adding a New Player
app.post('/addPlayer', (req, res) => {
    const { user, chips } = req.body;
    if (!user || typeof chips !== 'number') {
        return res.status(400).send('Invalid data provided.');
    }

    // Add Player to Firebase
    const userRef = ref(db, `users/${user}`);
    set(userRef, { chips: chips })
        .then(() => {
            console.log(`✅ Player ${user} added with ${chips} chips.`);
            io.emit('playerAdded', { user, chips });
            res.status(200).send(`${user} added successfully.`);
        })
        .catch(error => res.status(500).send('Error adding player: ' + error.message));
});

// ✅ POST Endpoint for Updating Chips
app.post('/updateChips', (req, res) => {
    const { user, chips } = req.body;
    if (!user || typeof chips !== 'number') {
        return res.status(400).send('Invalid data provided.');
    }

    const chipRef = ref(db, `users/${user}`);
    set(chipRef, { chips: chips })
        .then(() => {
            console.log(`${user}'s chip count updated to ${chips}`);
            io.emit('chipUpdate', { user, chips });
            res.status(200).send('Chip count updated successfully.');
        })
        .catch(error => res.status(500).send('Error updating chips: ' + error.message));
});

// ✅ WebSocket Connection for Real-Time Sync
io.on('connection', (socket) => {
    console.log('✅ A client connected.');

    const chipRef = ref(db, 'users');
    onValue(chipRef, (snapshot) => {
        const data = snapshot.val() || {};
        io.emit('playerListUpdate', data); // Send all players
    });
});

// ✅ Serve Static Files
app.use(express.static('public'));

// ✅ Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
