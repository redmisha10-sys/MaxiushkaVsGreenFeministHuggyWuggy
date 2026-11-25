// --- TYPEWRITER VARIABLES ---
let fullText = "* The Green Feminist Huggy-Wuggy blocks the path.";
let displayedText = ""; 
let textIndex = 0;      
let textTimer = 0;      
const TEXT_SPEED = 3;   
let isTextFinished = false;

// --- STATS & VARIABLES ---
let turns = 0;
let menuCooldown = 0; 
const healthBarWidth = 90;
const healthBarHeight = 25;
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let projectiles = [];
let attackTimer = 0;
let buttonChoice = 0;
const boxX = 70;
const boxY = 300;
const boxWidth = 1000;
const boxHeight = 150;

// --- AUDIO PLACEHOLDER ---
// Put a file named "bgm.mp3" in the same folder as your HTML file.
const bgm = new Audio('bgm.mp3'); 
bgm.loop = true;
bgm.volume = 0.4;
let audioStarted = false;

// Mobile browsers block audio until the user interacts with the screen.
function startMusic() {
    if (!audioStarted) {
        bgm.play().catch((e) => console.log("Audio play blocked by browser until interaction."));
        audioStarted = true;
    }
}
// Trigger music on first touch or click
window.addEventListener('touchstart', startMusic, { once: true });
window.addEventListener('mousedown', startMusic, { once: true });

// --- CLAW VARIABLES ---
let clawAngle = 0;
let clawRadius = 45; 
let clawX = 0; 
let clawY = 0;
let clawSpeedX = 0;
let clawSpeedY = 0;
let playerAttackTimer = 0;
let hitTimer = 0;
let lastDamage = 0;
let maxiushkaSpeedX = 0;
let maxiushkaSpeedY = 0;

// --- IMAGES ---
const soulGreenOrange = new Image(); soulGreenOrange.src = "greenorangesoul.png";
const attackText = new Image(); attackText.src = "attacktext.png"; 
const ghwImage = new Image(); ghwImage.src = "ghw.png"; 
const protectiveClawImg = new Image(); protectiveClawImg.src = "protectiveclawimg.png";

const fightImgOrange = new Image(); fightImgOrange.src = "fightimgorange.png";
const actImgOrange = new Image(); actImgOrange.src = "actimgorange.png";
const itemImgOrange = new Image(); itemImgOrange.src = "itemimgorange.png";
const mercyImgOrange = new Image(); mercyImgOrange.src = "mercyimgorange.png";

const fightImgYellow = new Image(); fightImgYellow.src = "fightimgyellow.png";
const actImgYellow = new Image(); actImgYellow.src = "actimgyellow.png";
const itemImgYellow = new Image(); itemImgYellow.src = "itemimgyellow.png";
const mercyImgYellow = new Image(); mercyImgYellow.src = "mercyimgyellow.png";

const buttonWidth = 90;
const buttonHeight = 45;

const buttons = [
    { name: "fight", x: canvas.width * 0.2, imgO: fightImgOrange, imgY: fightImgYellow },
    { name: "act", x: canvas.width * 0.4, imgO: actImgOrange, imgY: actImgYellow },
    { name: "item", x: canvas.width * 0.6, imgO: itemImgOrange, imgY: itemImgYellow },
    { name: "mercy", x: canvas.width * 0.8, imgO: mercyImgOrange, imgY: mercyImgYellow }
];

const State = {
    MENU: 'MENU',
    ACT_MENU: 'ACT_MENU', 
    PLAYER_ATTACK: 'PLAYER_ATTACK',
    ENEMY_ATTACK: 'ENEMY_ATTACK',
    GAME_OVER: 'GAME_OVER',
    VICTORY: 'VICTORY'
};

let actOptions = ["Check", "Heal", "Taunt"];
let actChoice = 0;
let currentState = State.MENU;

const maxiushka = {
    hp: 20000000, maxHp: 20000000, x: 520, y: 375, 
    soulHeight: 20, soulWidth: 20, speed: 2.5, 
    determination: 228, bravery: 1488, kindness: 1488, potuzhnist:20000000,
    feedInventory: 6000 
};

const ghw = {
    hp: 20000, maxHp: 20000, 
    x: 550, y: 50, Height: 100, Width: 60, determination: 1488
};

// --- HELPER FUNCTION: TEXT WRAPPING ---
function wrapText(context, text, x, y, maxWidth, lineHeight) {
    let paragraphs = text.split('\n');
    let currentY = y;

    for (let p = 0; p < paragraphs.length; p++) {
        let words = paragraphs[p].split(' ');
        let line = '';

        for (let n = 0; n < words.length; n++) {
            let testLine = line + words[n] + ' ';
            let metrics = context.measureText(testLine);
            let testWidth = metrics.width;
            
            if (testWidth > maxWidth && n > 0) {
                context.fillText(line, x, currentY);
                line = words[n] + ' ';
                currentY += lineHeight;
            } else {
                line = testLine;
            }
        }
        context.fillText(line, x, currentY);
        currentY += lineHeight; 
    }
}

// --- JOYSTICK & MOBILE CONTROLS ---
const joystickZone = document.getElementById('joystick-zone');
const joystickBase = document.getElementById('joystick-base');
const joystickKnob = document.getElementById('joystick-knob');
const zButton = document.getElementById("z");

let joystickActive = false;
let joystickDx = 0; 
let joystickDy = 0; 
let zActive = false; // FIX: Added missing variable

function getBaseCenter() {
    const rect = joystickBase.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

function applyJoystick(clientX, clientY) {
    const center = getBaseCenter();
    let dx = clientX - center.x;
    let dy = clientY - center.y;
    let distance = Math.hypot(dx, dy); 
    const maxDistance = 40; 
    
    if (distance > maxDistance) {
        dx = (dx / distance) * maxDistance;
        dy = (dy / distance) * maxDistance;
    }
    
    joystickKnob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    joystickDx = dx / maxDistance;
    joystickDy = dy / maxDistance;
}

joystickZone.addEventListener('touchstart', (e) => {
    e.preventDefault();
    joystickActive = true;
    applyJoystick(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
});

joystickZone.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (!joystickActive) return;
    applyJoystick(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
});

joystickZone.addEventListener('touchend', (e) => {
    e.preventDefault();
    joystickActive = false;
    joystickDx = 0;
    joystickDy = 0;
    joystickKnob.style.transform = `translate(-50%, -50%)`; 
});

// FIX: Added touchstart and touchend for the Z button
zButton.addEventListener('touchstart', (e) => {
    e.preventDefault(); 
    zActive = true;
});
zButton.addEventListener('touchend', (e) => {
    e.preventDefault(); 
    zActive = false;
});

// --- GAME LOOP ---
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function updateMenuText() {
    if (ghw.hp > ghw.maxHp * 0.5) {
        if (turns === 0) fullText = "* The Green Feminist Huggy-Wuggy blocks the path.";
        else if (turns % 2 === 0) fullText = "* She prepares her cringe system for some new insults on you.";
        else if (turns % 3 === 0) { fullText = "* She tells you Floppa II is her husband. Your BRAVERY increased."; maxiushka.bravery += 20; }
        else if (turns % 5 === 0) fullText = "* Michael the Just sent you to destroy this cringe-crusader. Don't disappoint him!";
        else if (turns % 7 === 0) fullText = "* The people are astonished at this battle."; 
        else fullText = "* She insults everybody around. She argues Minecraft is for gays.";
    } else {
        if (turns % 2 === 0) fullText = "* The Green Feminist Huggy-Wuggy gets increasingly more overloaded.";
        else if (turns % 3 === 0) { fullText = "* You are partially absorbing her soul."; maxiushka.determination++; ghw.determination -= 1; }
        else if (turns % 5 === 0) fullText = "* Finish her!";
        else fullText = "* All of Memeworld turned against her! Her cringe system shuts down.";
    }
}

function update() {
    // --- CHECK FOR GAME OVER / VICTORY ---
    if (maxiushka.hp <= 0 && currentState !== State.GAME_OVER) {
        currentState = State.GAME_OVER;
        fullText = "RIP Maxiushka\n\nShe lacked the DETERMINATION to continue.\n\nThe world of Memeworld is doomed.";
        textIndex = 0; textTimer = 0; displayedText = ""; isTextFinished = false;
    }
    if (ghw.hp <= 0 && currentState !== State.VICTORY) {
        currentState = State.VICTORY;
        fullText = "You have fully absorbed the soul of this creature!\n\nShe's gonna be your eternal servant. You have gained lots of DETERMINATION and are now a goddess possessing 4 SAVE points.";
        textIndex = 0; textTimer = 0; displayedText = ""; isTextFinished = false;
    }

    // 1. TYPEWRITER LOGIC
    if (!isTextFinished) {
        textTimer++;
        if (textTimer >= TEXT_SPEED) {
            textTimer = 0;
            textIndex++;
            if (textIndex >= fullText.length) {
                textIndex = fullText.length;
                isTextFinished = true;
            }
            displayedText = fullText.substring(0, textIndex);
        }
    }

    // 2. STATE MACHINE
    if (currentState === State.ACT_MENU) {
        if (menuCooldown > 0) menuCooldown--;
        
        if (menuCooldown === 0) {
            // FIX: Grouped conditions for correct OR logic
            if ((keys['ArrowDown'] || (joystickActive && joystickDy > 0.5)) && actChoice < actOptions.length - 1) { 
                actChoice++; menuCooldown = 12; 
            }
            else if ((keys['ArrowUp'] || (joystickActive && joystickDy < -0.5)) && actChoice > 0) { 
                actChoice--; menuCooldown = 12; 
            }
        }

        if ((keys['z'] || keys['Z'] || zActive) && menuCooldown === 0) {
            if (actChoice === 0) { 
                fullText = "* GREEN FEMINIST HUGGY-WUGGY - ATK " + ghw.determination + " DEF " + maxiushka.kindness + "\n* An evil creature who insults everybody around and brings only distraction from normal Memeworld development, but it is full of DETERMINATION. Show no mercy, but be careful.";
            } 
            else if (actChoice === 1) { 
                let healAmount = maxiushka.kindness * 7;
                fullText = "* Your KINDNESS is high enough to even heal yourself! You restored " + healAmount + " HP!";
                maxiushka.hp += healAmount;
                if (maxiushka.hp > maxiushka.maxHp) maxiushka.hp = maxiushka.maxHp; 
            } 
            else if (actChoice === 2) { 
                fullText = "* You call her a cringe-crusader. She is furious.";
                ghw.determination += 60;
            }

            textIndex = 0;
            textTimer = 0;
            displayedText = "";
            isTextFinished = false;

            currentState = State.MENU;
            buttonChoice = 3; 
        }
    }
    else if (currentState === State.MENU) {
        if (menuCooldown > 0) menuCooldown--;

        if (menuCooldown === 0) {
            // FIX: Grouped conditions for correct OR logic
            if ((keys['ArrowRight'] || (joystickActive && joystickDx > 0.5)) && buttonChoice < 3) { 
                buttonChoice++; menuCooldown = 12; 
            }
            else if ((keys['ArrowLeft'] || (joystickActive && joystickDx < -0.5)) && buttonChoice > 0) { 
                buttonChoice--; menuCooldown = 12; 
            }
        }

        if (keys['z'] || keys['Z'] || zActive) {
            if (!isTextFinished) {
                textIndex = fullText.length;
                displayedText = fullText;
                isTextFinished = true;
                menuCooldown = 10; // Small buffer to prevent skipping the menu instantly
            } else {
                if (buttonChoice === 3) { 
                    startAttack(); 
                } 
                else if (buttonChoice === 1) {
                    menuCooldown = 90;
                    currentState = State.ACT_MENU;
                    actChoice = Math.floor(Math.random() * 3); 
                    isTextFinished = true; 
                }
                else if (buttonChoice === 0) {
                    currentState = State.PLAYER_ATTACK;
                    playerAttackTimer = 120; 
                    hitTimer = 0;
                    const CLAW_SPEED = 15;
                    clawSpeedX = Math.cos(clawAngle) * CLAW_SPEED;
                    clawSpeedY = Math.sin(clawAngle) * CLAW_SPEED;
                }
                else if (buttonChoice === 2 && maxiushka.feedInventory > 0) {
                    fullText = "* You ate whiskas. You recovered 5,000,000 HP!";
                    maxiushka.hp += 5000000;
                    if (maxiushka.hp > maxiushka.maxHp) maxiushka.hp = maxiushka.maxHp; 
                    maxiushka.feedInventory -= 1;
                    fullText += " You have " + maxiushka.feedInventory + " packs of feed left.";
                    maxiushka.potuzhnist += 50;
                    maxiushka.determination += 50;
                    
                    textIndex = 0;
                    isTextFinished = false;
                    menuCooldown = 10;
                }
            }
        }
    }
    else if (currentState === State.PLAYER_ATTACK) {
        playerAttackTimer--;
        clawX += clawSpeedX;
        clawY += clawSpeedY;

        if (clawX < ghw.x + (ghw.Width/2) && clawX + 30 > ghw.x - (ghw.Width/2) &&
            clawY < ghw.y + ghw.Height && clawY + 30 > ghw.y) {
            
            if (hitTimer === 0) {
                lastDamage = Math.floor((maxiushka.determination + maxiushka.bravery + maxiushka.potuzhnist - maxiushka.kindness) / 10000);
                ghw.hp -= lastDamage;
                hitTimer = 80; 
                clawSpeedX = 0;
                clawSpeedY = 0; 
            }
        }

        if (hitTimer > 0) hitTimer--;

        if (playerAttackTimer <= 0 || (hitTimer <= 0 && clawSpeedX === 0 && clawSpeedY === 0 && playerAttackTimer < 100)) {
            currentState = State.ENEMY_ATTACK;
            startAttack();
            turns++;
            updateMenuText();
            
            textIndex = 0;
            textTimer = 0;
            displayedText = "";
            isTextFinished = false;
            projectiles = [];
        }
    }
    else if (currentState === State.ENEMY_ATTACK) { 
        attackTimer++;
        
        if (attackTimer > 800) {
            currentState = State.MENU;
            
            textIndex = 0;
            textTimer = 0;
            displayedText = "";
            isTextFinished = false;
        }

        if (attackTimer % 20 === 0) {
            projectiles.push({
                x: Math.random() * canvas.width, y: ghw.y, 
                speedY: Math.random() * 3 + 2, speedX: (Math.random() - 0.5) * 2, 
                height: Math.random() * 50 + 6, width: Math.random() * 100 + 12
            });
        }
        
        // --- MOVEMENT LOGIC (Keyboard + Joystick) ---
        let currentSpeed = maxiushka.speed * 2.5;

        // Check Keyboard (Desktop)
        if (keys['ArrowRight']) maxiushkaSpeedX = currentSpeed;
        else if (keys['ArrowLeft']) maxiushkaSpeedX = -currentSpeed;
        
        if (keys['ArrowDown']) maxiushkaSpeedY = currentSpeed;
        else if (keys['ArrowUp']) maxiushkaSpeedY = -currentSpeed;

        // Check Joystick (Mobile)
        if (joystickActive && (Math.abs(joystickDx) > 0.1 || Math.abs(joystickDy) > 0.1)) {
            maxiushkaSpeedX = joystickDx * currentSpeed;
            maxiushkaSpeedY = joystickDy * currentSpeed;
        } 
        
        // FIX: Orange Soul Momentum (Friction)
        if (!keys['ArrowRight'] && !keys['ArrowLeft'] && !joystickActive) {
            maxiushkaSpeedX *= 0.95; // Slides slowly to a halt
            if (Math.abs(maxiushkaSpeedX) < 0.1) maxiushkaSpeedX = 0;
        }
        if (!keys['ArrowDown'] && !keys['ArrowUp'] && !joystickActive) {
            maxiushkaSpeedY *= 0.95; 
            if (Math.abs(maxiushkaSpeedY) < 0.1) maxiushkaSpeedY = 0;
        }

        // Apply movement
        maxiushka.x += maxiushkaSpeedX;
        maxiushka.y += maxiushkaSpeedY;

        if (maxiushka.x + maxiushka.soulWidth > boxX + boxWidth) { maxiushka.x = boxX + boxWidth - maxiushka.soulWidth; maxiushkaSpeedX = 0; }
        if (maxiushka.x < boxX) { maxiushka.x = boxX; maxiushkaSpeedX = 0; }
        if (maxiushka.y + maxiushka.soulHeight > boxY + boxHeight) { maxiushka.y = boxY + boxHeight - maxiushka.soulHeight; maxiushkaSpeedY = 0; }
        if (maxiushka.y < boxY) { maxiushka.y = boxY; maxiushkaSpeedY = 0; }

        for (let i = projectiles.length - 1; i >= 0; i--) {
            let p = projectiles[i];
            let dist = Math.hypot(clawX - (p.x + p.width/2), clawY - (p.y + p.height/2));
            if (dist < 35) { projectiles.splice(i, 1); }
        }
        
        for (let i = projectiles.length - 1; i >= 0; i--) {
            let p = projectiles[i];
            p.x += p.speedX; p.y += p.speedY;

            if (attackTimer % 20 === 0) {
                if (Math.random() > 0.5) p.speedX += Math.random() * 2 - 1; 
                else p.speedY += Math.random() * 2 - 1;
            }

            if (p.x < maxiushka.x + maxiushka.soulWidth && p.x + p.width > maxiushka.x &&
                p.y < maxiushka.y + maxiushka.soulHeight && p.y + p.height > maxiushka.y) {
                maxiushka.hp -= 400000; 
                projectiles.splice(i, 1);
                continue;
            }

            if (p.y > canvas.height || p.x < -100 || p.x > canvas.width + 100) projectiles.splice(i, 1);
        }
    }

    // --- CLAW ORBITING LOGIC ---
    if (currentState === State.MENU || currentState === State.ENEMY_ATTACK) {
        clawAngle += 0.08;
        clawX = maxiushka.x + (maxiushka.soulWidth / 2) + Math.cos(clawAngle) * clawRadius;
        clawY = maxiushka.y + (maxiushka.soulHeight / 2) + Math.sin(clawAngle) * clawRadius;
    }
}

function draw() { 
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // --- GAME OVER / VICTORY ---
    if (currentState === State.GAME_OVER || currentState === State.VICTORY) {
        ctx.fillStyle = currentState === State.GAME_OVER ? 'red' : 'yellow';
        ctx.font = '30px Hachicro, monospace';
        ctx.textAlign = 'left';
        wrapText(ctx, displayedText, 100, 200, 900, 40);
        return; 
    }

    // Draw Enemy
    if (ghwImage.complete && ghwImage.naturalWidth > 0) {
        ctx.drawImage(ghwImage, ghw.x - (ghw.Width/2), ghw.y, ghw.Width, ghw.Height);
    } else { 
        ctx.fillStyle = 'green'; 
        ctx.fillRect(ghw.x - (ghw.Width/2), ghw.y, ghw.Width, ghw.Height); 
    }

    // Draw Box
    ctx.strokeStyle = 'white'; ctx.lineWidth = 4;
    ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

    // Draw UI Buttons
    if (currentState === State.MENU) {
        for (let i = 0; i < buttons.length; i++) {
            let b = buttons[i];
            if (b.imgO.complete) ctx.drawImage(b.imgO, b.x - (buttonWidth/2), canvas.height - 50, buttonWidth, buttonHeight);
            if (buttonChoice === i) {
                if (b.imgY.complete) ctx.drawImage(b.imgY, b.x - (buttonWidth/2), canvas.height - 50, buttonWidth, buttonHeight);
                if (soulGreenOrange.complete) ctx.drawImage(soulGreenOrange, b.x - 41, canvas.height - 40, maxiushka.soulWidth*1, maxiushka.soulHeight*1);
            }
        }
    }

    // Draw Soul
    if (soulGreenOrange.complete && soulGreenOrange.naturalWidth > 0) {
        ctx.drawImage(soulGreenOrange, maxiushka.x, maxiushka.y, maxiushka.soulWidth, maxiushka.soulHeight);
    } else { 
        ctx.fillStyle = 'red'; 
        ctx.fillRect(maxiushka.x, maxiushka.y, maxiushka.soulWidth, maxiushka.soulHeight); 
    }

    // Draw Claw
    if (protectiveClawImg.complete && protectiveClawImg.naturalWidth > 0) {
        ctx.save(); 
        ctx.translate(clawX, clawY); 
        if (currentState === State.MENU || currentState === State.ENEMY_ATTACK) ctx.rotate(clawAngle + Math.PI/2);
        ctx.drawImage(protectiveClawImg, -15, -15, 30, 30); 
        ctx.restore();
    } else {
        ctx.fillStyle = 'green'; ctx.beginPath(); ctx.arc(clawX, clawY, 10, 0, Math.PI * 2); ctx.fill();
    }

    // Draw ACT Menu
    if (currentState === State.ACT_MENU) {
        ctx.fillStyle = 'white';
        ctx.font = '24px Determination, monospace'; 
        ctx.textAlign = 'left';
        
        for (let i = 0; i < actOptions.length; i++) {
            ctx.fillText(actOptions[i], 200, 250 + (i * 40));
        }

        if (soulGreenOrange.complete) {
            ctx.drawImage(soulGreenOrange, 160, 230 + (actChoice * 40), maxiushka.soulWidth, maxiushka.soulHeight);
        }
    }

    // Draw Damage Number
    if (currentState === State.PLAYER_ATTACK && hitTimer > 0) {
        ctx.fillStyle = "red";
        ctx.font = "30px Hachicro, monospace";
        ctx.textAlign = 'center';
        ctx.fillText(lastDamage, ghw.x, ghw.y - 20);
    }

    // Draw Projectiles
    for (let i = 0; i < projectiles.length; i++) {
        let p = projectiles[i];
        if (attackText.complete && attackText.naturalWidth > 0) {
            ctx.drawImage(attackText, p.x, p.y, p.width, p.height);
        } else { 
            ctx.fillStyle = 'white'; 
            ctx.fillRect(p.x, p.y, p.width, p.height); 
        }
    }

    // Draw UI Text & HP
    if (currentState === State.MENU || currentState === State.ENEMY_ATTACK) {
        ctx.fillStyle = 'white'; 
        ctx.font = '20px Determination, monospace'; 
        ctx.textAlign = 'left'; 
        wrapText(ctx, displayedText, 100, 150, 600, 30); 
        ctx.fillText("MAXIUSHKA", 20, canvas.height - 50);
    }

    // Draw HP Bar
    ctx.fillStyle = 'white'; ctx.font = '20px Determination, monospace'; ctx.textAlign = 'left';
    ctx.fillText("HP: " + Math.ceil(maxiushka.hp) + " / " + maxiushka.maxHp, boxX + 6, boxY + boxHeight + 40);
    ctx.fillStyle = "red"; ctx.fillRect(boxX + 50, boxY + boxHeight + 60, healthBarWidth, healthBarHeight);
    ctx.fillStyle = "yellow"; 
    let hpPercent = Math.max(0, Math.min(1, maxiushka.hp / maxiushka.maxHp));
    ctx.fillRect(boxX + 50, boxY + boxHeight + 60, healthBarWidth * hpPercent, healthBarHeight);
}

const keys = {};
window.addEventListener('keydown', (e) => keys[e.key] = true);
window.addEventListener('keyup', (e) => keys[e.key] = false);

function startAttack() {
    attackTimer = 0;
    currentState = State.ENEMY_ATTACK;
    maxiushka.x = boxX + (boxWidth / 2) - (maxiushka.soulWidth / 2);
    maxiushka.y = boxY + (boxHeight / 2) - (maxiushka.soulHeight / 2);
    maxiushkaSpeedX = 0;
    maxiushkaSpeedY = 0;
}

gameLoop();