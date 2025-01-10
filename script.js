// Import necessary Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.4/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/9.8.4/firebase-database.js";

// ✅ Firebase Configuration (Ensure to keep keys secure and don't expose them in public repos for production)
const firebaseConfig = {
    apiKey: "AIzaSyBw7wSgfYlFKFeKXbFnYpDP5jCV_PIbquU",
    authDomain: "realproj-ac309.firebaseapp.com",
    databaseURL: "https://realproj-ac309-default-rtdb.firebaseio.com",
    projectId: "realproj-ac309",
    storageBucket: "realproj-ac309.appspot.com",
    messagingSenderId: "566895627528",
    appId: "1:566895627528:web:a8e1b38d1a9b09ab4d30bd"
};

// ✅ Initialize Firebase Appff
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ✅ Function to Start Tracking User Chips
window.trackUser = function () {
    const userInput = document.getElementById("userInput").value.trim();
    if (!userInput) {
        alert("Please enter a valid username!");
        return;
    }

    // ✅ Real-time listener for chip updates
    const chipRef = ref(db, `users/${userInput}`);
    onValue(chipRef, (snapshot) => {
        const chips = snapshot.val();
        document.getElementById("chip-count").innerText = `Chips: ${chips || 0}`;
    });
};

// ✅ Function to Manually Update Chip Count (For Testing)
window.updateChips = function () {
    const userInput = document.getElementById("userInput").value.trim();
    const newChips = prompt("Enter new chip count:");
    if (!userInput || isNaN(newChips)) {
        alert("Invalid data provided!");
        return;
    }
    const chipRef = ref(db, `users/${userInput}`);
    set(chipRef, Number(newChips))
        .then(() => alert("Chips updated successfully!"))
        .catch((error) => alert("Error updating chips: " + error));
};
