const timeDisplay = document.getElementById('time');
const scoreDisplay = document.getElementById('score');
const canvas = document.getElementById('mazeCanvas');
const ctx = canvas.getContext('2d');

let seconds = 0;
let score = 0;
let timerInterval;
let gameEnded = false;

let player = { x: 760, y: 560, width: 40, height: 40 }; // Player's start position
let coins = [
    { x: 100, y: 100, collected: false, message: "Reporter Details\nThis could be a physician or pharmacist you heard about the adverse event from." },
    { x: 200, y: 150, collected: false, message: "Event Details\nDetails about the adverse event caused by the product such as rash on the skin." },
    { x: 300, y: 200, collected: false, message: "Other Event\nDescribe any other adverse event details here." },
    { x: 400, y: 250, collected: false, message: "Medical History\nDetails about the patient's medical history related to the event." },
    { x: 500, y: 300, collected: false, message: "Treatment Information\nInformation about treatments given for the adverse event." }
];

function collectCoin(playerX, playerY) {
    if (gameEnded) return; // Do nothing if the game has ended

    coins.forEach(coin => {
        if (!coin.collected &&
            playerX < coin.x + 10 && playerX + player.width > coin.x &&
            playerY < coin.y + 10 && playerY + player.height > coin.y) {
            coin.collected = true;
            showPopup(coin.message); // Show the message associated with the coin
            updateScore(10); // Increase score when coin is collected
        }
    });

    // Check if all coins are collected
    if (checkAllCoinsCollected()) {
        endGame();
    }
}

function checkAllCoinsCollected() {
    return coins.every(coin => coin.collected);
}

function endGame() {
    gameEnded = true; // Set the game as ended
    clearInterval(timerInterval); // Stop the timer

    // Calculate time taken in hh:mm:ss format
    let hours = Math.floor(seconds / 3600);
    let mins = Math.floor((seconds % 3600) / 60);
    let secs = seconds % 60;
    const totalTime = `${hours}h ${mins}m ${secs}s`;

    // Prompt for player name
    const playerName = localStorage.getItem('username') || 'Guest';
    saveTime(playerName, totalTime);

    // Show end-game popup
    showEndGamePopup(hours, mins, secs);

    // Redirect after 5 seconds (duration of the popup)
    setTimeout(() => {
        window.location.href = "leaderboard.html"; // Change to your actual leaderboard page
    }, 5000);
}

async function saveTime(name, time) {
    let times = JSON.parse(localStorage.getItem('times')) || []; // Get existing times or create a new array
    times.push({ name: name, time: time, totalSeconds: seconds }); // Add new time with total seconds for sorting
    localStorage.setItem('times', JSON.stringify(times)); // Save updated times to local storage
    const dataURL = 'https://18.196.164.122/wp-json/stellar/v1/leaderboard';
    try {
        const response = await fetch(dataURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: name,
                time: time,
                totalSeconds: seconds
            })
        });

        if (response.ok) {
            console.log('Data added successfully');
        } else {
            console.error('Failed to add data');
        }
    } catch (error) {
        console.error('Error adding leaderboard data:', error);
    }
}

function showEndGamePopup(hours, minutes, seconds) {
    let message = `You ended the game!\nTime spent: ${hours} hours, ${minutes} minutes, and ${seconds} seconds.`;
    let popup = document.createElement("div");
    popup.className = 'popup visible';
    popup.textContent = message;
    document.body.appendChild(popup);

    // Remove popup after 5 seconds
    setTimeout(() => {
        document.body.removeChild(popup);
    }, 5000);
}

function showPopup(message) {
    let popup = document.createElement("div");
    popup.style.position = "fixed";
    popup.style.top = "30%";
    popup.style.left = "30%";
    popup.style.width = "300px";
    popup.style.padding = "20px";
    popup.style.backgroundColor = "orange";
    popup.style.border = "2px solid #000";
    popup.style.color = "#fff";
    popup.style.textAlign = "center";
    popup.style.borderRadius = "10px";
    popup.style.fontFamily = "Arial, sans-serif";
    popup.style.zIndex = "1000";
    
    popup.textContent = message; // Add message content

    // Append the popup to the body
    document.body.appendChild(popup);

    // Remove popup after 3 seconds
    setTimeout(() => {
        document.body.removeChild(popup);
    }, 3000);
}

function updateTimer() {
    seconds++;
    let mins = Math.floor(seconds / 60);
    let secs = seconds % 60;
    timeDisplay.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function startTimer() {
    if (!timerInterval) {
        timerInterval = setInterval(updateTimer, 1000);
    }
}

function updateScore(points) {
    score += points;
    scoreDisplay.textContent = score;
}

let walls = [
    // Outer boundary
    [0, 0, 800, 0], [0, 0, 0, 600], [800, 0, 800, 600], [0, 600, 800, 600],
    // Complex inner walls (adjust as needed)
    [20, 20, 100, 20], [100, 20, 100, 80], [100, 80, 180, 80], [180, 80, 180, 140], 
    [20, 180, 160, 180], [160, 180, 160, 260], [160, 260, 220, 260], [220, 260, 220, 320],
    [300, 60, 380, 60], [380, 60, 380, 140], [380, 140, 460, 140], [460, 140, 460, 220],
    [500, 20, 580, 20], [580, 20, 580, 100], [580, 100, 660, 100], [660, 100, 660, 180],
    [700, 200, 780, 200], [780, 200, 780, 280], [700, 280, 700, 360], [700, 360, 780, 360],
    [420, 240, 420, 320], [420, 320, 500, 320], [500, 320, 500, 400], [500, 400, 580, 400],
    [60, 400, 140, 400], [140, 400, 140, 480], [140, 480, 220, 480], [220, 480, 220, 560]
];

function drawWalls() {
    ctx.strokeStyle = "#000"; // Set color for walls
    ctx.lineWidth = 5; // Wall thickness
    walls.forEach(wall => {
        ctx.beginPath();
        ctx.moveTo(wall[0], wall[1]);
        ctx.lineTo(wall[2], wall[3]);
        ctx.stroke();
    });
}

function drawPlayer() {
    ctx.fillStyle = "#000";
    ctx.fillRect(player.x, player.y, player.width, player.height); // Player as a black rectangle
}

function drawCoins() {
    coins.forEach(coin => {
        if (!coin.collected) {
            ctx.fillStyle = "#FFD700"; // Gold coins
            ctx.beginPath();
            ctx.arc(coin.x, coin.y, 10, 0, Math.PI * 2); // Coin radius = 10
            ctx.fill();
        }
    });
}

function movePlayer(event) {
    const speed = 20;
    let nextX = player.x;
    let nextY = player.y;

    // Start timer on the first movement
    startTimer();

    switch (event.key) {
        case 'ArrowUp':
            nextY -= speed;
            break;
        case 'ArrowDown':
            nextY += speed;
            break;
        case 'ArrowLeft':
            nextX -= speed;
            break;
        case 'ArrowRight':
            nextX += speed;
            break;
    }

    // Prevent movement if colliding with walls
    if (!isCollidingWithWalls(nextX, nextY, player.width, player.height)) {
        player.x = nextX;
        player.y = nextY;
    }

    // Check for coin collection after moving
    collectCoin(player.x, player.y);
}


// Simplified collision check with the walls
function isCollidingWithWalls(nextX, nextY, width, height) {
    for (let wall of walls) {
        const [x1, y1, x2, y2] = wall;

        // Horizontal wall
        if (y1 === y2 && nextY + height > y1 && nextY < y1 && ((nextX > x1 && nextX < x2) || (nextX + width > x1 && nextX + width < x2))) {
            return true;
        }
        // Vertical wall
        if (x1 === x2 && nextX + width > x1 && nextX < x1 && ((nextY > y1 && nextY < y2) || (nextY + height > y1 && nextY + height < y2))) {
            return true;
        }
    }
    return false;
}


// Main game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    drawWalls();
    drawPlayer();
    drawCoins();
    requestAnimationFrame(gameLoop);
}

// Initialize game
gameLoop();

// Start timer when player moves
window.addEventListener('keydown', movePlayer);
canvas.addEventListener('click', () => {
    startTimer();
});










 // Example data after the maze is completed
 function onGameCompleted() {
    const playerName = localStorage.getItem('username') || 'Guest';
    const timeTaken = calculateTimeTaken(); // Your method for calculating time

    // Retrieve leaderboard data from localStorage
    let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];

    // Add current player's time
    leaderboard.push({ name: playerName, time: timeTaken });

    // Sort leaderboard by time (ascending order)
    leaderboard.sort((a, b) => a.time - b.time);

    // Save the updated leaderboard to localStorage
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));

    // Redirect to the leaderboard page
    window.location.href = 'leaderboard.html';
}

function calculateTimeTaken() {
    // Implement the logic to calculate the time taken by the player
    return 42; // Example: return time in seconds
}




document.getElementById('playerName').textContent = localStorage.getItem('username') || 'Guest';
