// script.js (WebSocket + Firebase Sync)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.4/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.8.4/firebase-database.js";

// ✅ Firebase Config (Ensure Restricted in Rules)
const firebaseConfig = {
    apiKey: "AIzaSyBw7wSgfYlFKFeKXbFnYpDP5jCV_PIbquU",
    authDomain: "realproj-ac309.firebaseapp.com",
    databaseURL: "https://realproj-ac309-default-rtdb.firebaseio.com",
    projectId: "realproj-ac309",
    storageBucket: "realproj-ac309.appspot.com",
    messagingSenderId: "566895627528",
    appId: "1:566895627528:web:a8e1b38d1a9b09ab4d30bd"
};

// ✅ Initialize Firebase and Database
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const socket = io();

// ✅ Function to Add a Player
window.addPlayer = function () {
    const playerName = document.getElementById('playerName').value.trim();
    const initialChips = parseInt(document.getElementById('initialChips').value);

    if (!playerName || isNaN(initialChips) || initialChips < 0) {
        alert('Please enter valid player details.');
        return;
    }

    // Send Player Addition Request to Server
    fetch('/addPlayer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: playerName, chips: initialChips })
    }).then(response => response.json())
      .then(data => alert(data))
      .catch(error => console.error('Error:', error));
};

// ✅ Real-time Player List Sync
socket.on('playerListUpdate', (players) => {
    const playerList = document.getElementById('playerList');
    playerList.innerHTML = '';

    for (const [player, data] of Object.entries(players)) {
        const listItem = document.createElement('li');
        listItem.textContent = `${player}: ${data.chips} chips`;
        playerList.appendChild(listItem);
    }
});
