const timeDisplay = document.getElementById('time');
const scoreDisplay = document.getElementById('score');
const canvas = document.getElementById('mazeCanvas');
const ctx = canvas.getContext('2d');

let seconds = 0;
let score = 0;
let timerInterval;
let gameEnded = false;
let stopPlayer=false;
let player = { x: 740, y: 570, width: 20, height: 20 ,imageWidth: 45,imageHeight: 70}; // Player's start position
const playerImage = new Image();
playerImage.src = 'imgs/drRabe3.png'; // Replace with the path to your image

let coins = [
    { x: 60, y: 50, collected: false, message: "Reporter Details\nThis could be a physician or pharmacist you heard about the adverse event from." },
    { x: 580, y: 50, collected: false, message: "Event Details\nDetails about the adverse event caused by the product such as rash on the skin." },
    { x: 50, y: 400, collected: false, message: "Other Event\nDescribe any other adverse event details here." },
    { x: 150, y: 570, collected: false, message: "Medical History\nDetails about the patient's medical history related to the event." },
    { x: 630, y: 330, collected: false, message: "Treatment Information\nInformation about treatments given for the adverse event." }
];

function collectCoin(playerX, playerY) {
    if (gameEnded) return; // Do nothing if the game has ended

    coins.forEach(coin => {
        if (!coin.collected &&
            playerX < coin.x + 20 && playerX + player.width+20 > coin.x &&
            playerY < coin.y + 20 && playerY + player.height+20 > coin.y) {
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

 
    // Redirect after 5 seconds (duration of the popup)
    setTimeout(() => {
        window.location.href = "leaderboard.html"; // Change to your actual leaderboard page
    },5000);
}

async function saveTime(name, time) {

    const dataURL = 'https://reactionacademy.org/wp-json/stellar/v1/leaderboard';
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

            const responseData = await response.json();
            console.log( responseData[0]);

            let player_data={id:responseData[1],name: name, time: time, totalSeconds: seconds };
            localStorage.setItem('player', JSON.stringify(player_data));

        } else {
            console.error('Failed to add data');
        }
    } catch (error) {
        console.error('Error adding leaderboard data:', error);
    }
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
    clearInterval(timerInterval); // Stop the timer
    stopPlayer=true;


    // Remove popup after 3 seconds
    setTimeout(() => {
        document.body.removeChild(popup);
        if(!gameEnded){
            timerInterval = setInterval(updateTimer, 1000);
            stopPlayer=false;
        }
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
    [20, 590, 780, 590],[20, 70, 20,610 ],[20, 30, 780, 30],[780, 30, 780, 550],
    [520, 550, 520, 590],[180, 550, 180, 590],[650, 550, 780, 550],[650, 510, 650, 550],
    [610, 510, 610, 550],[460, 510, 460, 550],[240, 510, 240, 550],[120, 510, 120, 550],
    [240, 550, 460, 550],[180, 550, 80, 550],[610, 510, 460, 510],[120, 510, 400, 510],
    [20, 510, 80, 510],[80, 470, 80, 510],[180, 470, 180, 510],[400, 470, 400, 510],
    [740, 390, 740, 510],[650, 470, 740, 470],[320, 470, 540, 470],[220, 470, 270, 470],
    [80, 470, 130, 470],[610, 430, 610, 470],[470, 430, 470, 470],[220, 430, 220, 470],
    [270, 350, 270, 470],[130, 390, 130, 470],[130, 430, 180, 430],[320, 430, 430, 430],
    [470, 430, 540, 430],[610, 430, 650, 430],[740, 390, 780, 390],[20, 430, 80, 430],
    [80, 350, 80, 430],[430, 390, 430, 430],[380, 340, 380, 390],[650, 350, 650, 430],
    [80, 350, 170, 350],[270, 350, 320, 350],[650, 350, 780, 350],[450, 350, 490, 350],
    [380, 390, 530, 390],[450, 310, 450, 350],[490, 270, 490, 350],[530, 270, 530, 390],
    [610, 310, 610, 390],[740, 270, 740, 310],[650, 230, 650, 310],[320, 350, 320, 430],
    [220, 310, 220, 390],[170, 310, 170, 390],[20, 310, 100, 310],[170, 310, 320, 310],
    [410, 310, 450, 310],[610, 310, 740, 310],[410, 270, 410, 310],[320, 270, 320, 310],
    [100, 270, 100, 310],[60, 270, 140, 270],[220, 270, 320, 270],[490, 270, 610, 270],
    [650, 230, 780, 230],[450, 230, 530, 230],[180, 230, 410, 230],[100, 230, 140, 230],
    [140, 190, 140, 270],[220, 230, 220, 270],[450, 230, 450, 270],[610, 190, 610, 270],
    [500, 190, 690, 190],[350, 190, 450, 190],[220, 190, 310, 190],[60, 190, 100, 190],
    [60, 190, 60, 270],[100, 150, 100, 190],[100, 150, 140, 150],[220, 110, 220, 190],
    [310, 70, 310, 190],[450, 150, 450, 190],[620, 110, 620, 190],[500, 190, 500, 230],
    [690, 150, 690, 190],[430, 110, 740, 110],[180, 110, 220, 110],[310, 110, 350, 110],
    [660, 150, 740, 150],[450, 150, 620, 150],[350, 150, 390, 150],[350, 110, 350, 150],
    [390, 70, 390, 150],[500, 70, 500, 110],[500, 70, 620, 70],[620, 30, 620, 70],
    [740, 70, 740, 110],[660, 70, 740, 70],[390, 70, 460, 70],[390, 30, 390, 70],
    [270, 70, 310, 70],[270, 70, 270, 150],[180, 110, 180, 190],[20, 70, 220, 70],
    [140, 70, 140, 110],[60, 110, 140, 110],[60, 110, 60, 150],

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
    ctx.zIndex="500";
    ctx.drawImage(playerImage, player.x - 15, player.y-50, player.imageWidth, player.imageHeight);
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
    const speed = 10;
    let nextX = player.x;
    let nextY = player.y;
    let isArrowClicked=true;

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
        default :
            isArrowClicked=false;
        break ;
    }

    // Prevent movement if colliding with walls
    if (!isCollidingWithWalls(nextX, nextY, player.width, player.height) && isArrowClicked && !stopPlayer) {
        player.x = nextX;
        player.y = nextY;
        // Start timer on the first movement
        startTimer();
    }

    // Check for coin collection after moving
    collectCoin(player.x, player.y);
}


// Simplified collision check with the walls
function isCollidingWithWalls(nextX, nextY, width, height) {
    for (let wall of walls) {
        const [x1, y1, x2, y2] = wall;

        // Ensure the wall coordinates are correctly interpreted regardless of their order
        const minX = Math.min(x1, x2);
        const maxX = Math.max(x1, x2);
        const minY = Math.min(y1, y2);
        const maxY = Math.max(y1, y2);

        // Horizontal wall collision check
        if (y1 === y2) {
            if (nextY + height > minY && nextY < minY &&
                ((nextX + width > minX && nextX < maxX) || (nextX > minX && nextX < maxX))) {
                return true;
            }
        }

        // Vertical wall collision check
        if (x1 === x2) {
            if (nextX + width > minX && nextX < minX &&
                ((nextY + height > minY && nextY < maxY) || (nextY > minY && nextY < maxY))) {
                return true;
            }
        }
    }
    return false;
}



// Create Virtual Joystick instance
var joy;
// Wait for the DOM to load before initializing the joystick
document.addEventListener("DOMContentLoaded", () => {
    // console.log("Initializing joystick...");
    joy = new VirtualJoystick({
        container: document.body, // Joystick appears on the screen
        mouseSupport: true,       // Enable mouse support for joystick
        limitStickTravel: true,   // Restrict stick movement to radius
        stickRadius: 100          // Radius of joystick control
    });
}, { passive: false });

// Adjust the player's movement based on joystick input
function handleJoystickMovement() {
    if (!joy || typeof joy.deltaX !== 'function' || typeof joy.deltaY !== 'function') {
        console.error("Joystick instance not initialized or unavailable.");
        return;
    }

    const dx = joy.deltaX(); // Horizontal joystick movement
    const dy = joy.deltaY(); // Vertical joystick movement

    // Normalize movement to maintain consistent speed
    const magnitude = Math.sqrt(dx * dx + dy * dy);
    if (magnitude > 0) {
        const normalizedX = (dx / magnitude) * 2; // Adjust speed factor as needed
        const normalizedY = (dy / magnitude) * 2;

        let nextX = player.x + normalizedX;
        let nextY = player.y + normalizedY;

        // Handle collisions separately for each axis
        if (!isCollidingWithWalls(nextX, player.y, player.width, player.height) && !stopPlayer) {
            player.x = nextX; // Allow movement along X-axis
        }
        if (!isCollidingWithWalls(player.x, nextY, player.width, player.height) && !stopPlayer) {
            player.y = nextY; // Allow movement along Y-axis
        }

        startTimer(); // Start the timer on movement
    }

    // Check for coin collection
    collectCoin(player.x, player.y);
}




// Main game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    drawWalls();
    drawCoins();
    drawPlayer();
    handleJoystickMovement();
    requestAnimationFrame(gameLoop);
}

// Initialize game
gameLoop();

// Start timer when player moves
window.addEventListener('keydown', movePlayer);

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