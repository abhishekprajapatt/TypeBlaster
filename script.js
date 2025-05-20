const gameContainer = document.getElementById('game-container');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const accuracyElement = document.getElementById('accuracy');
const currentWordElement = document.getElementById('current-word');
const typingDisplayElement = document.getElementById('typing-display');
const playerShip = document.getElementById('player-ship');
const healthBar = document.getElementById('health-bar');
const gameOverScreen = document.getElementById('game-over');
const startScreen = document.getElementById('start-screen');
const finalScoreElement = document.getElementById('final-score');
const finalAccuracyElement = document.getElementById('final-accuracy');

let score = 0;
let level = 1;
let health = 100;
let currentEnemy = null;
let enemies = [];
let gameRunning = false;
let spawnInterval;
let difficultyInterval;
let wordList = [];
let currentTypedWord = '';
let totalCharacters = 0;
let correctCharacters = 0;
let gameStarted = false;
let soundEnabled = true; 

const sounds = {
    laser: new Audio('/sounds/laser.mp3'),
    explosion: new Audio('/sounds/explosion.mp3'),
    keypress: new Audio('/sounds/keypress.mp3'),
    gameover: new Audio('/sounds/gameover.mp3')
};

function playSound(soundName) {
    if (!soundEnabled) return;
    
    try {
        const sound = sounds[soundName].cloneNode();
        sound.volume = soundName === 'laser' ? 0.3 : 0.5; 
        sound.play().catch(err => {
            console.warn('Audio playback failed:', err);
        });
    } catch (error) {
        console.error('Error playing sound:', error);
    }
}

const commonWords = [
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'it',
    'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this',
    'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or',
    'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
    'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
    'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know',
    'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could',
    'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come',
    'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how',
    'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because',
    'any', 'these', 'give', 'day', 'most', 'us'
];

const mediumWords = [
    'program', 'computer', 'language', 'keyboard', 'monitor', 'software',
    'hardware', 'network', 'internet', 'database', 'algorithm', 'function',
    'variable', 'constant', 'operator', 'condition', 'iteration', 'recursion',
    'structure', 'interface', 'abstract', 'instance', 'implement', 'inheritance',
    'polymorphism', 'encapsulation', 'abstraction', 'modularization', 'parameter',
    'argument', 'reference', 'pointer', 'memory', 'processor', 'compiler',
    'interpreter', 'debugging', 'exception', 'library', 'framework', 'application',
    'development', 'deployment', 'testing', 'validation', 'verification', 'security',
    'authentication', 'authorization', 'encryption', 'decryption', 'protocol'
];

const hardWords = [
    'synchronization', 'interoperability', 'multithreading', 'virtualization',
    'serialization', 'authentication', 'authorization', 'implementation',
    'infrastructure', 'configuration', 'optimization', 'parallelization',
    'sustainability', 'accessibility', 'compatibility', 'vulnerability',
    'decentralization', 'microservices', 'containerization', 'orchestration',
    'scalability', 'cryptocurrency', 'cryptography', 'concatenation',
    'dependencies', 'asynchronous', 'deserialization', 'functionality',
    'instantiation', 'internationalization', 'localization', 'parameterization',
    'refactoring', 'persistence', 'transaction', 'polymorphism',
    'encapsulation', 'abstraction', 'inheritance', 'middleware',
    'visualization', 'documentation', 'obfuscation', 'normalization',
    'fragmentation', 'authentication', 'authorization', 'optimization'
];

function initGame() {
    score = 0;
    level = 1;
    health = 100;
    enemies = [];
    currentEnemy = null;
    currentTypedWord = '';
    totalCharacters = 0;
    correctCharacters = 0;
    updateScoreAndLevel();
    updateHealthBar();
    updateAccuracy();
    
    updateWordList();
    
    const existingEnemies = document.querySelectorAll('.enemy');
    existingEnemies.forEach(enemy => enemy.remove());
    
    scoreElement.textContent = '0';
    levelElement.textContent = '1';
    healthBar.style.width = '100%';
    currentWordElement.textContent = '';
    typingDisplayElement.textContent = '';
}

function startGame() {
    if (gameRunning) return;
    
    initGame();
    startScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
    gameRunning = true;
    gameStarted = true;
    spawnInterval = setInterval(spawnEnemy, getSpawnRate());
    difficultyInterval = setInterval(increaseDifficulty, 30000);
    const mobileInput = document.getElementById('mobile-input');
    if (mobileInput) {
        mobileInput.focus();
        mobileInput.addEventListener('input', handleMobileInput);
        mobileInput.addEventListener('keydown', handleMobileKeydown);
    }
    window.focus();
}

function restartGame() {
    gameOverScreen.style.display = 'none';
    startGame();
}

function updateWordList() {
    if (level <= 3) {
        wordList = [...commonWords];
    } else if (level <= 6) {
        wordList = [...commonWords, ...mediumWords];
    } else {
        wordList = [...mediumWords, ...hardWords];
    }
}

function getRandomWord() {
    const randomIndex = Math.floor(Math.random() * wordList.length);
    return wordList[randomIndex];
}

function getSpawnRate() {
    return Math.max(800, 3000 - (level * 300));
}

function getEnemySpeed() {
    return Math.min(20, 5 + (level * 2));
}

function spawnEnemy() {
    if (!gameRunning) return;
    
    const word = getRandomWord();
    
    const enemy = document.createElement('div');
    enemy.className = 'enemy';
    
    const wordElement = document.createElement('div');
    wordElement.className = 'enemy-word';
    wordElement.textContent = word;
    
    const ship = document.createElement('div');
    ship.className = 'ship';
    
    enemy.appendChild(wordElement);
    enemy.appendChild(ship);
    
    const maxX = gameContainer.clientWidth - 60;
    const randomX = Math.floor(Math.random() * maxX);
    
    enemy.style.left = `${randomX}px`;
    enemy.style.top = '-50px';
    
    const enemyData = {
        element: enemy,
        wordElement: wordElement,
        shipElement: ship,
        word: word,
        originalWord: word,
        x: randomX,
        y: -50,
        speed: getEnemySpeed() * (0.8 + Math.random() * 0.4)
    };
    
    enemies.push(enemyData);
    gameContainer.appendChild(enemy);
}

function moveEnemies() {
    enemies.forEach((enemy, index) => {
        enemy.y += enemy.speed;
        enemy.element.style.top = `${enemy.y}px`;
        
        if (enemy.y > gameContainer.clientHeight - 150) {
            takeDamage(20);
            createExplosion(enemy.x + 30, gameContainer.clientHeight - 150);
            playSound('explosion');
            
            enemy.element.remove();
            enemies.splice(index, 1);
        }
    });
}

function takeDamage(amount) {
    health -= amount;
    updateHealthBar();
    
    if (health <= 0) {
        playSound('gameover');
        endGame();
    }
}

function updateHealthBar() {
    const healthPercent = Math.max(0, Math.min(100, health));
    healthBar.style.width = `${healthPercent}%`;
    
    if (healthPercent < 30) {
        healthBar.style.background = 'linear-gradient(45deg, #f44336, #ef5350)';
    } else if (healthPercent < 60) {
        healthBar.style.background = 'linear-gradient(45deg, #ff9800, #ffb74d)';
    } else {
        healthBar.style.background = 'linear-gradient(45deg, #4CAF50, #66BB6A)';
    }
}

function updateAccuracy() {
    const accuracy = totalCharacters > 0 ? Math.round((correctCharacters / totalCharacters) * 100) : 100;
    accuracyElement.textContent = `${accuracy}%`;
}

function updateTypingDisplay() {
    if (!currentEnemy) {
        typingDisplayElement.innerHTML = '';
        return;
    }

    const targetWord = currentEnemy.word;
    let displayHTML = '';
    
    for (let i = 0; i < Math.max(currentTypedWord.length, targetWord.length); i++) {
        const typedChar = currentTypedWord[i] || '';
        const targetChar = targetWord[i] || '';
        
        if (i < currentTypedWord.length) {
            if (typedChar === targetChar) {
                displayHTML += `<span class="correct-char">${typedChar}</span>`;
            } else {
                displayHTML += `<span class="incorrect-char">${typedChar}</span>`;
            }
        } else if (i < targetWord.length) {
            displayHTML += `<span class="remaining-char">${targetChar}</span>`;
        }
    }
    
    typingDisplayElement.innerHTML = displayHTML;
}

function createExplosion(x, y) {
    const explosion = document.createElement('div');
    explosion.className = 'explosion';
    explosion.style.left = `${x - 40}px`;
    explosion.style.top = `${y - 40}px`;
    gameContainer.appendChild(explosion);
    
    setTimeout(() => {
        explosion.remove();
    }, 600);
}

function fireLaser(fromX, fromY, toX, toY) {
    const dx = toX - fromX;
    const dy = toY - fromY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) - Math.PI / 2;
    
    const laser = document.createElement('div');
    laser.className = 'laser';
    laser.style.height = `${distance}px`;
    laser.style.left = `${fromX}px`;
    laser.style.top = `${fromY}px`;
    laser.style.transform = `rotate(${angle}rad)`;
    
    gameContainer.appendChild(laser);
    
    setTimeout(() => {
        laser.remove();
    }, 300);
}

function fireCharacterLaser(enemy) {
    if (!enemy) return;
    
    const playerRect = playerShip.getBoundingClientRect();
    const enemyRect = enemy.element.getBoundingClientRect();
    const laser = document.createElement('div');
    laser.className = 'laser character-laser';
    
    const fromX = playerRect.left + playerRect.width / 2;
    const fromY = playerRect.top;
    const toX = enemyRect.left + enemyRect.width / 2;
    const toY = enemyRect.top + enemyRect.height / 2;
    
    const dx = toX - fromX;
    const dy = toY - fromY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) - Math.PI / 2;
    
    laser.style.height = `${distance}px`;
    laser.style.left = `${fromX}px`;
    laser.style.top = `${fromY}px`;
    laser.style.transform = `rotate(${angle}rad)`;
    laser.style.opacity = '0.6';
    laser.style.width = '2px';
    
    gameContainer.appendChild(laser);
    
    setTimeout(() => {
        laser.remove();
    }, 200);
}

function createMiniExplosion(enemy) {
    if (!enemy) return;
    
    const enemyRect = enemy.element.getBoundingClientRect();
    const explosionX = enemyRect.left + enemyRect.width / 2;
    const explosionY = enemyRect.top + enemyRect.height / 2;
    
    const miniExplosion = document.createElement('div');
    miniExplosion.className = 'mini-explosion';
    miniExplosion.style.left = `${explosionX - 15}px`;
    miniExplosion.style.top = `${explosionY - 15}px`;
    
    gameContainer.appendChild(miniExplosion);
    
    setTimeout(() => {
        miniExplosion.remove();
    }, 300);
}

function increaseDifficulty() {
    if (!gameRunning) return;
    
    level++;
    updateScoreAndLevel();
    updateWordList();
    
    clearInterval(spawnInterval);
    spawnInterval = setInterval(spawnEnemy, getSpawnRate());
}

function updateScoreAndLevel() {
    scoreElement.textContent = score;
    levelElement.textContent = level;
}

function endGame() {
    gameRunning = false;
    clearInterval(spawnInterval);
    clearInterval(difficultyInterval);
    
    finalScoreElement.textContent = score;
    const finalAccuracy = totalCharacters > 0 ? Math.round((correctCharacters / totalCharacters) * 100) : 100;
    finalAccuracyElement.textContent = `${finalAccuracy}%`;
    gameOverScreen.style.display = 'block';
    
    currentWordElement.textContent = '';
    typingDisplayElement.innerHTML = '';
    currentTypedWord = '';
    currentEnemy = null;
}

document.addEventListener('keydown', (event) => {
    if (!gameStarted && startScreen.style.display !== 'none') {
        startGame();
        return;
    }
    
    if (!gameRunning || gameOverScreen.style.display === 'block' || startScreen.style.display === 'block') {
        return;
    }
    
    if (event.key.length === 1 && /^[a-zA-Z]$/.test(event.key)) {
        totalCharacters++;
        const typedChar = event.key.toLowerCase();
        currentTypedWord += typedChar;
        
        let foundMatch = false;
        
        enemies.forEach((enemy, index) => {
            if (enemy.word.startsWith(currentTypedWord)) {
                const expectedChar = enemy.word[currentTypedWord.length - 1];
                if (typedChar === expectedChar) {
                    correctCharacters++;
                    playSound('laser');
                    fireCharacterLaser(enemy);
                    createMiniExplosion(enemy);
                }
                
                if (currentEnemy !== enemy) {
                    if (currentEnemy) {
                        currentEnemy.shipElement.classList.remove('targeted');
                        currentEnemy.wordElement.textContent = currentEnemy.originalWord;
                    }
                    
                    currentEnemy = enemy;
                    currentEnemy.shipElement.classList.add('targeted');
                }
                
                foundMatch = true;
                
                if (currentTypedWord === enemy.word) {
                    score += enemy.word.length * 10;
                    updateScoreAndLevel();
                    
                    const playerRect = playerShip.getBoundingClientRect();
                    const enemyRect = enemy.element.getBoundingClientRect();
                    fireLaser(
                        playerRect.left + playerRect.width / 2,
                        playerRect.top,
                        enemyRect.left + enemyRect.width / 2,
                        enemyRect.top + enemyRect.height / 2
                    );
                    
                    playSound('explosion');
                    createExplosion(enemy.x + 30, enemy.y);
                    
                    enemy.element.remove();
                    enemies.splice(index, 1);
                    
                    currentTypedWord = '';
                    currentEnemy = null;
                }
                
                updateTypingDisplay();
                updateAccuracy();
                return;
            }
        });
        
        if (!foundMatch) {
            if (currentEnemy) {
                currentEnemy.shipElement.classList.remove('targeted');
                currentEnemy.wordElement.textContent = currentEnemy.originalWord;
                currentEnemy = null;
            }
            currentTypedWord = '';
            updateTypingDisplay();
        }
        
        currentWordElement.textContent = currentTypedWord;
        updateAccuracy();
        
    } else if (event.key === 'Backspace') {
        if (currentTypedWord.length > 0) {
            currentTypedWord = currentTypedWord.slice(0, -1);
            currentWordElement.textContent = currentTypedWord;
            
            if (currentEnemy) {
                if (currentTypedWord === '') {
                    currentEnemy.shipElement.classList.remove('targeted');
                    currentEnemy.wordElement.textContent = currentEnemy.originalWord;
                    currentEnemy = null;
                } else if (currentEnemy.word.startsWith(currentTypedWord)) {
                    updateTypingDisplay();
                } else {
                    currentEnemy.shipElement.classList.remove('targeted');
                    currentEnemy.wordElement.textContent = currentEnemy.originalWord;
                    currentEnemy = null;
                }
            }
            
            updateTypingDisplay();
        }
    }
});

function createMuteButton() {
    const muteButton = document.createElement('div');
    muteButton.id = 'mute-button';
    muteButton.innerHTML = soundEnabled ? '🔊' : '🔇';
    muteButton.style.position = 'absolute';
    muteButton.style.top = '20px';
    muteButton.style.left = '120px';
    muteButton.style.fontSize = '24px';
    muteButton.style.cursor = 'pointer';
    muteButton.style.zIndex = '200';
    muteButton.style.backgroundColor = 'rgba(0,0,0,0.3)';
    muteButton.style.padding = '5px 10px';
    muteButton.style.borderRadius = '5px';
    
    muteButton.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        muteButton.innerHTML = soundEnabled ? '🔊' : '🔇';
    });
    
    gameContainer.appendChild(muteButton);
}

function gameLoop() {
    if (gameRunning) {
        moveEnemies();
    }
    requestAnimationFrame(gameLoop);
}

createMuteButton();
gameLoop();



function handleMobileInput(event) {
    const input = event.target;
    const value = input.value;
    
    if (value.length > currentTypedWord.length) {
        const newChar = value.slice(-1).toLowerCase();
        if (/^[a-zA-Z]$/.test(newChar)) {
            processCharacter(newChar);
        }
    }
    
    setTimeout(() => {
        input.value = '';
    }, 10);
}

function handleMobileKeydown(event) {
    if (event.key === 'Backspace') {
        event.preventDefault();
        processBackspace();
    }
}

function processCharacter(typedChar) {
    totalCharacters++;
    currentTypedWord += typedChar;
    
    let foundMatch = false;
    
    enemies.forEach((enemy, index) => {
        if (enemy.word.startsWith(currentTypedWord)) {
            const expectedChar = enemy.word[currentTypedWord.length - 1];
            if (typedChar === expectedChar) {
                correctCharacters++;
                playSound('laser');
                fireCharacterLaser(enemy);
                createMiniExplosion(enemy);
            }
            
            if (currentEnemy !== enemy) {
                if (currentEnemy) {
                    currentEnemy.shipElement.classList.remove('targeted');
                    currentEnemy.wordElement.textContent = currentEnemy.originalWord;
                }
                
                currentEnemy = enemy;
                currentEnemy.shipElement.classList.add('targeted');
            }
            
            foundMatch = true;
            
            if (currentTypedWord === enemy.word) {
                score += enemy.word.length * 10;
                updateScoreAndLevel();
                
                const playerRect = playerShip.getBoundingClientRect();
                const enemyRect = enemy.element.getBoundingClientRect();
                fireLaser(
                    playerRect.left + playerRect.width / 2,
                    playerRect.top,
                    enemyRect.left + enemyRect.width / 2,
                    enemyRect.top + enemyRect.height / 2
                );
                
                playSound('explosion');
                createExplosion(enemy.x + 30, enemy.y);
                
                enemy.element.remove();
                enemies.splice(index, 1);
                
                currentTypedWord = '';
                currentEnemy = null;
            }
            
            updateTypingDisplay();
            updateAccuracy();
            return;
        }
    });
    
    if (!foundMatch) {
        if (currentEnemy) {
            currentEnemy.shipElement.classList.remove('targeted');
            currentEnemy.wordElement.textContent = currentEnemy.originalWord;
            currentEnemy = null;
        }
        currentTypedWord = '';
        updateTypingDisplay();
    }
    
    currentWordElement.textContent = currentTypedWord;
    updateAccuracy();
}

function processBackspace() {
    if (currentTypedWord.length > 0) {
        currentTypedWord = currentTypedWord.slice(0, -1);
        currentWordElement.textContent = currentTypedWord;
        
        if (currentEnemy) {
            if (currentTypedWord === '') {
                currentEnemy.shipElement.classList.remove('targeted');
                currentEnemy.wordElement.textContent = currentEnemy.originalWord;
                currentEnemy = null;
            } else if (currentEnemy.word.startsWith(currentTypedWord)) {
                updateTypingDisplay();
            } else {
                currentEnemy.shipElement.classList.remove('targeted');
                currentEnemy.wordElement.textContent = currentEnemy.originalWord;
                currentEnemy = null;
            }
        }
        
        updateTypingDisplay();
    }
}

document.addEventListener('keydown', (event) => {
    if (!gameStarted && startScreen.style.display !== 'none') {
        startGame();
        return;
    }
    
    if (!gameRunning || gameOverScreen.style.display === 'block' || startScreen.style.display === 'block') {
        return;
    }
    
    if (event.key.length === 1 && /^[a-zA-Z]$/.test(event.key)) {
        processCharacter(event.key.toLowerCase());
    } else if (event.key === 'Backspace') {
        processBackspace();
    }
});

function restartGame() {
    gameOverScreen.style.display = 'none';
    startGame();
}

document.addEventListener('touchstart', () => {
    if (gameRunning) {
        const mobileInput = document.getElementById('mobile-input');
        if (mobileInput) {
            mobileInput.focus();
        }
    }
});