class BossManager {
    constructor() {
        this.state = 'dormant'; // dormant, cutscene, lava, pound, vulnerable, jumpPrep, jump, dead
        this.cutsceneStage = 'none';
        this.timer = 0;
        this.health = 200;
        this.maxHealth = 200;
        this.active = false;
        this.exit = null;
        this.exitFade = 0;
        this.rocks = [];
        this.deathParticles = [];
        this.defeatTimer = 0;
        this.shake = 0;
        this.chaseSpeed = 3.36;
        // The PNGs include transparent padding beneath the visible feet.  Keep the collision
        // box to the artwork's actual height so its feet meet the 468px cave floor.
        this.golem = { x: 0, y: 352, width: 120, height: 100, drawHeight: 140, velocityX: 0, velocityY: 0, facingLeft: true, animation: 'stand', frame: 0, animationTimer: 0, flash: 0, chaseDirection: -1, directionLock: 0, stompBounceOffset: 0, stompBounceVelocity: 0 };
        this.poundRounds = 0;
        this.jumpPasses = 0;
        this.jumpCount = 0;
        this.jumpGroundTimer = 0;
        this.landingPoseTimer = 0;
        this.landingSoundPlayed = false;
        this.returnToLavaAfterLanding = false;
        this.defeatAfterFinalJump = false;
        this.jumpVulnerable = false;
        this.redWarning = false;
        this.tooHotCooldown = 0;
        this.contactInvulnerability = 0;
        this.finalVolleyCount = 0;
        this.finalStoneTimer = 0;
        this.airChaseOffset = 0;
        this.airChaseTimer = 0;
        this.stompedMidair = false;
        this.hasEnteredFinalPhase = false;
        this.finalPhasePending = false;
        this.afterHitAction = 'lava';
        this.exitImage = new Image();
        this.exitImage.src = 'images/sprites/foreground/cave-exit.png';
        this.sprites = {};
        this.loadSprites();
        this.hitSmokeImage = new Image();
        this.hitSmokeImage.src = 'images/sprites/enemy/bad-guy-defeated.png';
        this.rockSprites = ['falling-rock-1.png', 'falling-rock-2.png', 'falling-rock-3.png'].map(file => {
            const image = new Image(); image.src = `images/sprites/foreground/${file}`; return image;
        });
    }

    loadSprites() {
        const definitions = {
            stand: ['golem-stand.png'],
            standBlue: ['golem-stand-b.png'],
            run: ['golem-run1.png', 'golem-run2.png', 'golem-run3.png', 'golem-run4.png', 'golem-run5.png', 'golem-run6.png', 'golem-run7.png'],
            runBlue: ['golem-run1-b.png', 'golem-run2-b.png', 'golem-run3-b.png', 'golem-run4-b.png', 'golem-run5-b.png', 'golem-run6-b.png', 'golem-run7-b.png'],
            slam: ['golem-slam1.png', 'golem-slam2.png', 'golem-slam3.png', 'golem-slam4.png', 'golem-slam5.png', 'golem-slam6.png', 'golem-slam7.png', 'golem-slam8.png'],
            // Vulnerability is a stationary recovery window, so never cycle running frames here.
            vulnerable: ['golem-stand-b.png'],
            jump1: ['golem-jump1.png'], jump2: ['golem-jump2.png'], jump3: ['golem-jump3.png'], jump4: ['golem-jump4.png'], jump5: ['golem-jump5.png'],
            jump1Blue: ['golem-jump1-b.png'], jump2Blue: ['golem-jump2-b.png'], jump3Blue: ['golem-jump3-b.png'], jump4Blue: ['golem-jump4-b.png'], jump5Blue: ['golem-jump5-b.png'],
            hit: ['golem-slam4.png']
        };
        Object.entries(definitions).forEach(([name, files]) => {
            this.sprites[name] = files.map(file => { const image = new Image(); image.src = `images/sprites/enemy/${file}`; return image; });
        });
    }

    reset() { this.state = 'dormant'; this.active = false; this.exit = null; this.exitFade = 0; this.rocks = []; this.deathParticles = []; this.defeatTimer = 0; this.timer = 0; this.health = this.maxHealth; this.poundRounds = 0; this.jumpPasses = 0; this.jumpCount = 0; this.jumpGroundTimer = 0; this.landingPoseTimer = 0; this.landingSoundPlayed = false; this.returnToLavaAfterLanding = false; this.defeatAfterFinalJump = false; this.jumpVulnerable = false; this.redWarning = false; this.tooHotCooldown = 0; this.contactInvulnerability = 0; this.finalVolleyCount = 0; this.finalStoneTimer = 0; this.airChaseOffset = 0; this.airChaseTimer = 0; this.stompedMidair = false; this.hasEnteredFinalPhase = false; this.finalPhasePending = false; this.golem.stompBounceOffset = 0; this.golem.stompBounceVelocity = 0; this.afterHitAction = 'lava'; }

    checkForTrigger(playerX, playerY, templeX, level) {
        if (level !== 3 || this.state !== 'dormant' || playerX < templeX - 500) return false;
        this.state = 'cutscene'; this.cutsceneStage = 'arrival'; this.active = true; this.timer = 0;
        this.cutsceneTargetX = playerX + 200;
        this.golem.x = playerX + 520; this.golem.groundY = playerY + 48; this.golem.y = this.golem.groundY - this.golem.height - 180; this.golem.animation = 'run'; this.golem.facingLeft = true;
        return true;
    }

    update(game) {
        if (!this.active) return;
        this.timer++; this.updateAnimation();
        this.updateDeathParticles();
        if (this.exit && this.exitFade < 1) this.exitFade = Math.min(1, this.exitFade + 1 / 60);
        if (this.shake > 0) this.shake--;
        if (this.golem.flash > 0) this.golem.flash--;
        if (this.contactInvulnerability > 0) this.contactInvulnerability--;
        if (this.tooHotCooldown > 0) this.tooHotCooldown--;
        if (this.hitSmoke > 0) this.hitSmoke--;
        if (this.golem.hitPose > 0) this.golem.hitPose--;
        this.updateStompBounce();
        if (this.state === 'cutscene') return this.updateCutscene(game);
        if (this.state === 'arenaFall') return this.updateArenaFall(game);
        if (this.state === 'finalPrep') return this.updateFinalPrep(game);
        if (this.state === 'finalLeap') return this.updateFinalLeap(game);
        if (this.state === 'stoneVolley') return this.updateStoneVolley(game);
        if (this.state === 'finalVulnerable') return this.updateFinalVulnerable(game);
        if (this.state === 'vulnerabilityExit') return this.updateVulnerabilityExit(game);
        if (this.state === 'finalReignite') return this.updateFinalReignite(game);
        if (this.state === 'redBurst') return this.updateRedBurst(game);
        if (this.state === 'hitRecover') return this.updateHitRecover(game);
        if (this.state === 'reigniteFlash') return this.updateReigniteFlash(game);
        if (this.state === 'defeating') {
            // Hold the golem in the hit pose for one full, rumbling second before it bursts.
            this.golem.animation = 'hit';
            this.shake = 12;
            this.defeatTimer++;
            // Start the defeat sting halfway through the rumble so it leads the visual burst.
            if (this.defeatTimer === 30) game.audioManager.playSound('golemDefeated');
            if (this.defeatTimer >= 60) this.explode(game);
            return;
        }
        if (this.state === 'dead') return;
        this.updateRocks(game);
        game.worldManager.updateBossPlatformMotion();
        if (this.golem.hitPose > 0) { this.golem.animation = 'hit'; return; }
        if (this.state === 'pound') {
            this.golem.animation = 'slam';
            if (this.timer === 22) {
                game.audioManager.playSound('golem');
                game.audioManager.playSound('earthquakeRumble');
                game.audioManager.playSound('stonesFalling');
                game.dropBossHeartFromCeiling();
                this.shake = 22;
                this.spawnRocks(game);
            }
            if (this.timer >= 58) { this.poundRounds++; this.state = 'vulnerable'; this.timer = 0; this.golem.animation = 'vulnerable'; }
            return;
        }
        if (this.state === 'vulnerable') {
            this.golem.animation = 'vulnerable';
            if (this.timer >= 180) this.beginVulnerabilityExit('lava');
            return;
        }
        if (this.state === 'jumpPrep') {
            // A crouched, rumbling charge-up makes the upcoming red jump assault unmistakable.
            this.golem.animation = 'hit';
            if (this.timer === 1) game.audioManager.playSound('golemPowerup');
            if (this.timer % 5 === 0) this.shake = 20;
            if (this.timer >= 72) {
                this.state = 'jump'; this.timer = 0; this.jumpPasses = 0; this.jumpCount = 0;
                this.jumpGroundTimer = 0; this.landingPoseTimer = 0; this.landingSoundPlayed = false;
                this.returnToLavaAfterLanding = false; this.jumpVulnerable = false; this.redWarning = false;
                this.golem.velocityX = this.golem.x < 600 ? 5.2 : -5.2;
                this.golem.velocityY = 0; this.golem.facingLeft = this.golem.velocityX < 0;
                game.worldManager.beginBossPlatformCollapse();
            }
            return;
        }
        if (this.state === 'jump') {
            this.golem.x += this.golem.velocityX;
            // The first two passes are red; the final third turns blue and can be stomped.
            this.jumpVulnerable = this.jumpPasses >= 2;
            const useBlueJumpSprite = this.jumpVulnerable;
            if (this.landingPoseTimer > 0) {
                if (this.landingPoseTimer > 3) this.setJumpSprite(5, useBlueJumpSprite);
                else this.golem.animation = useBlueJumpSprite ? 'runBlue' : 'run';
                this.landingPoseTimer--;
            } else if (this.golem.velocityY === 0) {
                // Run normally between jumps; only the final wind-up frames use jump1.
                if (this.jumpGroundTimer >= 16) this.setJumpSprite(1, useBlueJumpSprite);
                else this.golem.animation = useBlueJumpSprite ? 'runBlue' : 'run';
                if (++this.jumpGroundTimer >= 8) {
                    // The final pass gets one clearly heavier, higher arc before the arena returns.
                    this.golem.velocityY = this.jumpPasses >= 2 ? -13 : -11;
                    this.jumpCount++;
                    this.jumpGroundTimer = 0;
                    this.landingSoundPlayed = false;
                }
            } else {
                const jumpPhase = this.golem.velocityY < -3 ? 2 : (this.golem.velocityY <= 2 ? 3 : 4);
                this.setJumpSprite(jumpPhase, useBlueJumpSprite);
                const groundDistance = this.golem.groundY - this.golem.height - this.golem.y;
                if (!this.landingSoundPlayed && this.golem.velocityY > 0 && groundDistance < 300) {
                    this.landingSoundPlayed = true;
                    game.audioManager.playSound('golemLanding');
                }
                this.golem.y += this.golem.velocityY;
                this.golem.velocityY += 0.42;
                if (this.golem.y >= this.golem.groundY - this.golem.height) {
                    this.golem.y = this.golem.groundY - this.golem.height;
                    this.golem.velocityY = 0;
                    this.jumpGroundTimer = 0;
                    this.landingPoseTimer = 6;
                    this.shake = this.returnToLavaAfterLanding ? 24 : 12;
                    if (this.returnToLavaAfterLanding) {
                        this.state = 'lava'; this.timer = 0; this.poundRounds = 0;
                        this.jumpVulnerable = false; this.redWarning = false;
                        this.returnToLavaAfterLanding = false;
                        game.worldManager.restoreBossPlatforms();
                        if (this.defeatAfterFinalJump) {
                            this.defeatAfterFinalJump = false;
                            this.die(game);
                        }
                        return;
                    }
                }
            }
            if (this.golem.x <= 80 || this.golem.x >= 1000) {
                this.golem.x = Math.max(80, Math.min(1000, this.golem.x));
                this.golem.velocityX *= -1;
                this.golem.facingLeft = this.golem.velocityX < 0;
                this.jumpPasses++;
                if (this.jumpPasses >= 3) {
                    // If the last pass reaches the wall mid-air, let gravity finish the landing.
                    if (this.golem.velocityY === 0) {
                        this.state = 'lava'; this.timer = 0; this.poundRounds = 0;
                        this.jumpVulnerable = false; this.redWarning = false;
                        this.shake = 24;
                        game.worldManager.restoreBossPlatforms();
                    } else {
                        this.returnToLavaAfterLanding = true;
                    }
                }
            }
            return;
        }
        // Lava mode: chase the player, then periodically pound the floor.
        this.golem.animation = 'run';
        const playerIsElevated = !game.player.isGrounded || game.player.y + game.player.height < this.golem.groundY - 30;
        if (playerIsElevated) {
            // Do not trace the player perfectly while they are jumping or perched.  The golem
            // keeps pressure on them, but deliberately patrols an offset lane instead.
            if (--this.airChaseTimer <= 0) {
                const side = Math.random() < .5 ? -1 : 1;
                this.airChaseOffset = side * (125 + Math.random() * 85);
                this.airChaseTimer = 36 + Math.floor(Math.random() * 30);
            }
        } else {
            this.airChaseTimer = 0;
            this.airChaseOffset = 0;
        }
        const chaseTargetX = Math.max(120, Math.min(1080, game.player.x + this.airChaseOffset));
        const desiredDirection = chaseTargetX < this.golem.x ? -1 : 1;
        if (this.golem.directionLock > 0) {
            this.golem.directionLock--;
        } else if (desiredDirection !== this.golem.chaseDirection && Math.abs(game.player.x - this.golem.x) > 28) {
            // Commit to each turn briefly, rather than flipping every frame around the player.
            this.golem.chaseDirection = desiredDirection;
            this.golem.directionLock = 36;
        }
        const direction = this.golem.chaseDirection;
        this.golem.facingLeft = direction < 0;
        const previousX = this.golem.x;
        const chaseSpeed = playerIsElevated ? this.chaseSpeed * .58 : this.chaseSpeed;
        const nextX = Math.max(80, Math.min(1000, this.golem.x + direction * chaseSpeed));
        const isBlockedByArenaWall = nextX === this.golem.x;
        this.golem.x = nextX;
        // Do not run in place when the player is tucked behind a sealed cave wall.
        this.golem.animation = isBlockedByArenaWall ? 'stand' : 'run';
        const isTooCloseBelowPlatform = playerIsElevated && Math.abs(game.player.x - this.golem.x) < 220;
        if (this.timer >= 200 && isTooCloseBelowPlatform) {
            // Step out from beneath a perched player before telegraphing the floor pound.
            const retreatDirection = this.golem.x < game.player.x ? -1 : 1;
            this.golem.x = Math.max(80, Math.min(1000, this.golem.x + retreatDirection * this.chaseSpeed));
            this.golem.facingLeft = retreatDirection < 0;
            this.golem.animation = Math.abs(this.golem.x - previousX) < .01 ? 'stand' : 'run';
            if (this.timer < 300) return;
        }
        if (Math.abs(this.golem.x - previousX) < .01) this.golem.animation = 'stand';
        if (this.timer >= 240) {
            this.timer = 0;
            if (this.poundRounds >= 2) { this.state = 'jumpPrep'; }
            else { this.state = 'pound'; this.golem.animation = 'slam'; }
        }
    }

    updateCutscene(game) {
        if (this.cutsceneStage === 'arrival') {
            this.golem.x = Math.max(this.cutsceneTargetX, this.golem.x - 6);
            this.golem.y = Math.min(this.golem.groundY - this.golem.height, this.golem.y + 5);
            if (this.timer > 70 && this.golem.x <= this.cutsceneTargetX) { this.cutsceneStage = 'quake'; this.timer = 0; this.golem.animation = 'slam'; this.shake = 28; game.audioManager.playSound('golem'); game.audioManager.playSound('earthquakeRumble'); }
        } else if (this.cutsceneStage === 'quake' && this.timer > 95) {
            this.cutsceneStage = 'falling'; this.timer = 0;
            game.prepareLevelThreeCollapseBonuses();
            game.audioManager.playSound('falling');
        } else if (this.cutsceneStage === 'falling') {
            if (this.timer === 1) game.worldManager.beginCutsceneSceneryFall(this.golem.x + 55, 340, 215);
            game.worldManager.updateCutsceneSceneryFall();
            if (this.timer <= 90) {
                this.golem.y += 12;
                game.player.y += 12;
                game.pet.y += 12;
            }
            // Completion bonuses are credited as their score cards begin fading.  Their
            // full five-second lifetime is longer than their visible travel, so do not
            // hold the sequence until every expired card is removed.
            const bonusesCredited = game.floatingScores.every(score => score.pendingPoints === null);
            if (this.timer > 105 && bonusesCredited) game.showLevelThreeCompletion();
        }
    }

    enterArena() {
        this.state = 'arenaFall'; this.timer = 0; this.golem.x = 850; this.golem.y = -150; this.golem.groundY = 452; this.golem.animation = 'stand'; this.golem.facingLeft = true; this.golem.chaseDirection = -1; this.golem.directionLock = 0; this.airChaseOffset = 0; this.airChaseTimer = 0; this.rocks = [];
    }

    updateArenaFall(game) {
        this.golem.y += 13;
        if (this.golem.y < this.golem.groundY - this.golem.height) return;
        this.golem.y = this.golem.groundY - this.golem.height;
        this.state = 'lava'; this.timer = 0; this.shake = 34;
        game.audioManager.playSound('golemLanding');
        game.audioManager.playSound('earthquakeRumble');
    }

    spawnRocks(game) {
        const columns = [95, 235, 375, 515, 655, 795, 935, 1075];
        const bossCenter = this.golem.x + this.golem.width / 2;
        const dodgeDirection = game.player.x < bossCenter ? -1 : 1;
        const dodgeCenter = Math.max(120, Math.min(1080, game.player.x + dodgeDirection * 125));
        const safeLaneHalfWidth = 95;
        const eligibleColumns = columns
            .map((x, index) => ({ x, index }))
            .filter(({ x }) => {
                const center = x + 21;
                const inDodgeLane = Math.abs(center - dodgeCenter) < safeLaneHalfWidth;
                const besideBoss = Math.abs(center - bossCenter) < 135;
                return !inDodgeLane && !besideBoss;
            })
            .sort(() => Math.random() - .5);

        // Every ground pound gets a substantial five-stone ceiling shower. Prefer the safe
        // columns first, then fill from the remaining columns if the boss/player exclusion
        // left fewer than five candidates.
        const selected = eligibleColumns.slice(0, 5);
        columns.forEach((x, index) => {
            if (selected.length >= 5 || selected.some(column => column.index === index)) return;
            selected.push({ x, index });
        });

        selected.forEach((column, i) => {
            const size = 32 + Math.random() * 28;
            const x = column.x + (Math.random() - .5) * 24;
            // Stagger horizontally only; every rock starts completely above the ceiling.
            this.rocks.push({ x, baseX: x, y: -size - 8, width: size, height: size, phase: 'ceilingWarning', age: 0, alpha: 0, sprite: Math.floor(Math.random() * this.rockSprites.length), entrySoundPlayed: false });
        });
    }

    updateRocks(game) {
        this.rocks = this.rocks.filter(rock => {
            if (rock.phase) {
                rock.age++;
                if (rock.phase === 'ceilingWarning') {
                    rock.alpha = Math.min(1, rock.age / 12);
                    rock.x = rock.baseX + Math.sin(rock.age * .7) * 2.5;
                    if (rock.age >= 30) { rock.phase = 'ceilingFall'; rock.velocityY = .45; rock.x = rock.baseX; }
                } else if (rock.phase === 'ceilingFall') {
                    rock.velocityY += .046; rock.y += rock.velocityY;
                    if (rock.y + rock.height > 468) { this.shake = Math.max(this.shake, 6); return false; }
                    if (this.overlaps(rock, game.player) && !game.hasArmor) game.takeDamage(game.player.x < rock.x ? -1 : 1);
                } else if (rock.phase === 'rise') {
                    // Final-phase stones are summoned from beneath the cave floor.  Their
                    // bottom stays planted on the ground as they emerge, making the rise
                    // read as a ground attack rather than a ceiling drop.
                    rock.alpha = Math.min(1, rock.age / 10);
                    rock.y = Math.max(rock.hoverY, rock.startY - rock.age * 3.1);
                    if (rock.y <= rock.hoverY) { rock.y = rock.hoverY; rock.phase = 'hover'; rock.age = 0; }
                } else if (rock.phase === 'fly') {
                    rock.x += rock.velocityX; rock.y += rock.velocityY;
                    if (this.overlaps(rock, game.player) && !game.hasArmor) game.takeDamage(rock.direction);
                    // Use the actual inner edges of the arena walls, rather than letting
                    // the projectile visibly pass into the wall before it impacts.
                    if (rock.x < 68 || rock.x + rock.width > 1132) {
                        rock.x = Math.max(68, Math.min(1132 - rock.width, rock.x));
                        rock.phase = 'impactSmoke'; rock.age = 0; rock.alpha = 0;
                        this.shake = 12; game.audioManager.playSound('thud'); game.audioManager.playSound('golemLanding');
                    }
                } else if (rock.phase === 'impactSmoke') {
                    // The enemy-defeated puff gets a short, readable beat before it
                    // dissolves into the spent third rock.
                    rock.smokeAlpha = Math.min(1, rock.age / 5);
                    if (rock.age >= 12) { rock.phase = 'impactSink'; rock.sprite = 2; rock.age = 0; }
                } else if (rock.phase === 'impactSink') {
                    const progress = Math.min(1, rock.age / 28);
                    rock.alpha = progress;
                    rock.smokeAlpha = 1 - progress;
                    rock.y += 1.9;
                    if (rock.age >= 28) { rock.phase = 'impactFade'; rock.age = 0; }
                } else if (rock.phase === 'impactFade') {
                    rock.alpha = Math.max(0, 1 - rock.age / 20);
                    rock.y += 2.6;
                }
                return !['impactFade'].includes(rock.phase) || rock.age < 20;
            }
            rock.velocityY += 0.0384; rock.y += rock.velocityY;
            if (!rock.entrySoundPlayed && rock.y >= 0) {
                rock.entrySoundPlayed = true;
                game.audioManager.playSound('fallingRock');
            }
            if (rock.y + rock.height > 468) { this.shake = Math.max(this.shake, 6); return false; }
            if (this.overlaps(rock, game.player) && !game.hasArmor) game.takeDamage(game.player.x < rock.x ? -1 : 1);
            return true;
        });
    }

    checkCollisions(game) {
        if (!this.active || this.state === 'cutscene' || this.state === 'dead' || this.contactInvulnerability > 0) return;
        // A successful stomp buys the player a real recovery window.  The boss cannot be
        // stomped again during it, and its body stays harmless until it has fully reignited.
        const postStompRecovery = ['hitRecover', 'reigniteFlash', 'vulnerabilityExit', 'finalPrep', 'finalLeap'].includes(this.state);
        if (postStompRecovery) return;
        const p = game.player, b = this.golem;
        if (!this.overlaps(p, b)) return;
        const playerCenter = p.x + p.width / 2;
        const headZone = playerCenter >= b.x - 28 && playerCenter <= b.x + b.width + 28;
        const landedOnHead = headZone && p.velocityY > 0 && p.y + p.height - p.velocityY <= b.y + 62;
        if ((this.state === 'vulnerable' || this.state === 'finalVulnerable' || (this.state === 'jump' && this.jumpVulnerable)) && landedOnHead) {
            const stompedMidair = this.state === 'jump';
            this.health -= 25; this.golem.flash = 60; this.contactInvulnerability = 30; this.golem.hitPose = this.state === 'jump' ? 0 : 18; this.golem.animation = 'hit'; this.hitSmoke = this.health <= 0 ? 60 : 28; this.golem.stompBounceVelocity = -3; p.velocityY = -9; p.isGrounded = false;
            if (stompedMidair) {
                this.golem.velocityY = 4;
                this.golem.velocityX = 0;
                this.stompedMidair = true;
            }
            game.addScore(100, '#FFD700', 'Head Stomp');
            game.audioManager.playSound(Math.random() < 0.5 ? 'grunt1Low' : 'grunt2Low');
            if (this.health <= 0 && this.state === 'jump') {
                this.defeatAfterFinalJump = true;
                this.afterHitAction = 'land'; this.state = 'hitRecover'; this.timer = 0;
            } else if (this.health <= 0) this.die(game);
            else {
                if (this.health <= 50 && !this.hasEnteredFinalPhase) {
                    // The threshold stomp immediately cancels the old pattern. Keep a brief
                    // hit reaction (and let an airborne golem land) before its final tell.
                    this.finalPhasePending = true;
                    this.afterHitAction = 'final'; this.state = 'hitRecover'; this.timer = 0;
                    return;
                }
                const isFinalRecovery = this.state === 'finalVulnerable' || (this.state === 'vulnerabilityExit' && this.afterVulnerabilityExit === 'stoneVolley');
                this.afterHitAction = this.state === 'jump' ? 'land' : (isFinalRecovery ? 'stoneVolley' : (this.health <= 50 ? 'final' : 'lava'));
                this.state = 'hitRecover'; this.timer = 0;
            }
        } else if (landedOnHead && (this.state === 'lava' || (this.state === 'jump' && !this.jumpVulnerable))) {
            if (this.tooHotCooldown === 0) {
                game.uiRenderer.showMessage('Too hot!', 75, '#ff6b35');
                this.tooHotCooldown = 75;
            }
            if (!game.hasArmor) game.takeDamage(p.x < b.x ? -1 : 1);
        } else if (this.state !== 'vulnerable' && this.state !== 'finalVulnerable' && !(this.state === 'jump' && this.jumpVulnerable) && !game.hasArmor) {
            game.takeDamage(p.x < b.x ? -1 : 1);
        }
        // Blue/vulnerable contact is deliberately harmless; only a descending head-stomp damages it.
    }

    reignite(game) {
        // Recovering after a pound must retain its place in the three-pound pattern.
        // Only a completed/interrupted jump starts a new three-pound cycle.
        const resetPoundCycle = this.state === 'jump';
        // A stomp during the blue final pass launches the finishing heavy jump.  It must land
        // naturally so the earthquake can bring the collapsed platforms back.
        if (this.state === 'jump') {
            this.jumpGroundTimer = 0;
            this.landingPoseTimer = 0;
            this.landingSoundPlayed = false;
            this.returnToLavaAfterLanding = true;
            this.jumpVulnerable = false;
            this.redWarning = false;
            this.golem.velocityY = -13;
            game.audioManager.playSound('golemReignite');
            return;
        }
        this.state = 'lava'; this.timer = 0;
        if (resetPoundCycle) this.poundRounds = 0;
        this.golem.animation = 'stand';
        game.audioManager.playSound('golemReignite');
    }
    beginFinalPhase(game) {
        this.hasEnteredFinalPhase = true;
        this.finalPhasePending = false;
        this.state = 'finalPrep'; this.timer = 0; this.golem.animation = 'hit';
        this.finalVolleyCount = 0; this.rocks = [];
        game.audioManager.playSound('golemPowerup');
    }
    updateFinalPrep(game) {
        this.updateRocks(game);
        game.worldManager.updateBossPlatformMotion();
        this.golem.animation = 'slam';
        if (this.timer === 22) {
            game.audioManager.playSound('golem');
            game.audioManager.playSound('earthquakeRumble');
            game.dropBossHeartFromCeiling();
            this.shake = 28;
        }
        if (this.timer % 5 === 0) this.shake = 24;
        if (this.timer >= 70) {
            this.state = 'finalLeap'; this.timer = 0; this.golem.velocityY = -15;
            // A -15 launch with .48 gravity is airborne for 64 frames. Match the
            // horizontal travel to that full arc so the golem lands at center naturally.
            this.golem.velocityX = (540 - this.golem.x) / 64;
            this.golem.facingLeft = this.golem.velocityX < 0;
            game.worldManager.beginBossPlatformCollapse();
            this.shake = 28;
        }
    }
    updateFinalLeap(game) {
        this.updateRocks(game);
        game.worldManager.updateBossPlatformMotion();
        this.golem.x += this.golem.velocityX; this.golem.y += this.golem.velocityY; this.golem.velocityY += .48; this.setJumpSprite(this.golem.velocityY < 0 ? 2 : 4, false);
        if (this.golem.y < this.golem.groundY - this.golem.height) return;
        this.golem.y = this.golem.groundY - this.golem.height; this.state = 'stoneVolley'; this.timer = 0; this.finalVolleyCount = 0; this.shake = 38;
        game.audioManager.playSound('golemLanding'); game.audioManager.playSound('earthquakeRumble');
    }
    updateStoneVolley(game) {
        this.updateRocks(game);
        game.worldManager.updateBossPlatformMotion();
        this.golem.animation = 'slam';
        // Each volley gets its own complete pound: stones push up during the wind-up, then
        // launch on the exact impact frame instead of drifting away long after the fist lands.
        if (this.timer === 1) {
            [-1, 1].forEach((direction, index) => this.rocks.push({
                // Start completely underground, then settle just above the floor on
                // opposite sides of the golem.  Only rock 1/2 are used for the attack.
                x: direction < 0 ? this.golem.x - 72 : this.golem.x + this.golem.width + 18,
                y: 468, startY: 468, hoverY: 399, width: 54, height: 54,
                sprite: (this.finalVolleyCount + index) % 2,
                phase: 'rise', direction, volley: this.finalVolleyCount, age: 0, alpha: 0
            }));
        }
        // Hold the raised rocks for a clear half-second warning, then land the pound and
        // launch together. The 76-frame cycle leaves 30% more room between volleys.
        if (this.timer === 52) {
            this.rocks.forEach(rock => {
                if (rock.volley !== this.finalVolleyCount || rock.phase !== 'hover') return;
                rock.phase = 'fly'; rock.velocityX = rock.direction * 10.5; rock.velocityY = 0;
            });
            this.shake = 20; game.audioManager.playSound('golem'); game.audioManager.playSound('stonesFalling'); game.dropBossHeartFromCeiling();
            this.finalVolleyCount++;
            // The third throw is also a pound.  Its impact opens the blue recovery window.
            if (this.finalVolleyCount >= 3) { this.state = 'finalVulnerable'; this.timer = 0; this.golem.animation = 'vulnerable'; return; }
        }
        if (this.timer >= 76) {
            this.timer = 0;
            this.golem.frame = 0;
            this.golem.animationTimer = 0;
        }
    }
    updateFinalVulnerable(game) {
        this.updateRocks(game);
        game.worldManager.updateBossPlatformMotion();
        this.golem.animation = 'vulnerable';
        if (this.timer >= 180) this.beginVulnerabilityExit('stoneVolley');
    }
    beginVulnerabilityExit(nextAction) {
        this.state = 'vulnerabilityExit';
        this.timer = 0;
        this.afterVulnerabilityExit = nextAction;
        this.golem.animation = 'standBlue';
    }
    updateVulnerabilityExit(game) {
        this.updateRocks(game);
        game.worldManager.updateBossPlatformMotion();
        // Do not pause on a solid-blue frame between a stomp and the power-up tell.
        this.golem.animation = Math.floor(this.timer / 5) % 2 === 0 ? 'standBlue' : 'stand';
        // Keep the blue state active while its red concentric-ring tell plays, then switch
        // immediately when that tell has finished.
        if (this.timer < 36) return;
        game.audioManager.playSound('golemReignite');
        if (this.afterVulnerabilityExit === 'stoneVolley') {
            this.state = 'stoneVolley'; this.timer = 0; this.finalVolleyCount = 0;
            this.golem.frame = 0; this.golem.animationTimer = 0;
            return;
        }
        if (this.afterVulnerabilityExit === 'final') return this.beginFinalPhase(game);
        this.state = 'lava'; this.timer = 0; this.golem.animation = 'stand';
    }
    updateFinalReignite(game) {
        this.updateRocks(game); game.worldManager.updateBossPlatformMotion();
        this.golem.animation = Math.floor(this.timer / 5) % 2 === 0 ? 'standBlue' : 'stand';
        if (this.timer >= 40) { this.state = 'redBurst'; this.timer = 0; game.audioManager.playSound('golemPowerup'); }
    }
    updateRedBurst(game) {
        this.updateRocks(game); game.worldManager.updateBossPlatformMotion(); this.golem.animation = 'stand';
        if (this.timer >= 20) { this.state = 'stoneVolley'; this.timer = 0; this.finalVolleyCount = 0; this.finalStoneTimer = 30; }
    }
    updateHitRecover(game) {
        this.updateRocks(game);
        this.golem.animation = 'hit';
        if (this.stompedMidair) {
            this.golem.y += this.golem.velocityY;
            this.golem.velocityY += .5;
            if (this.golem.y >= this.golem.groundY - this.golem.height) {
                this.golem.y = this.golem.groundY - this.golem.height;
                this.golem.velocityY = 0;
                this.stompedMidair = false;
                game.audioManager.playSound('golemLanding');
            }
        }
        if (this.finalPhasePending && !this.stompedMidair && this.timer >= 24) {
            this.beginFinalPhase(game);
            return;
        }
        if (this.timer >= 60 && !this.stompedMidair) { this.state = 'reigniteFlash'; this.timer = 0; }
    }
    updateReigniteFlash(game) {
        this.updateRocks(game);
        // Use the same stationary pose in blue and red so the flash never reads as a turn.
        this.golem.animation = Math.floor(this.timer / 5) % 2 === 0 ? 'standBlue' : 'stand';
        if (this.timer < 40) return;
        game.audioManager.playSound('golemReignite');
        if (this.afterHitAction === 'land') {
            this.state = 'jump'; this.timer = 0; this.returnToLavaAfterLanding = true;
            this.golem.velocityX = 0; this.golem.velocityY = Math.max(2, this.golem.velocityY);
            this.jumpVulnerable = false; this.redWarning = false;
            return;
        }
        // A stomped recovery uses the same red-ring tell as a timed recovery before the
        // golem leaves its blue/vulnerable state.
        this.beginVulnerabilityExit(this.afterHitAction);
    }
    die(game) {
        this.state = 'defeating'; this.rocks = [];
        this.defeatTimer = 0;
        this.shake = 12;
        game.audioManager.playSound('earthquakeRumble');
    }
    explode(game) {
        this.state = 'dead';
        this.shake = 32;
        game.finishBossFightTimer();
        // Flush with the arena's right wall so the doorway reads as part of the cave.
        this.exit = { x: 1128, y: 328, width: 80, height: 140 };
        this.exitFade = 0;
        for (let i = 0; i < 55; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 5.5;
            const life = 60 + Math.random() * 45;
            const colorRoll = Math.random();
            const color = colorRoll < .4 ? '#77777d' : (colorRoll < .8 ? '#b3b3ba' : '#9f70dc');
            this.deathParticles.push({ x: this.golem.x + 60, y: this.golem.y + 55, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 2.5, life, maxLife: life, size: 3 + Math.random() * 6, color });
        }
        game.addScore(10000, '#FFD700', 'Stone Golem Defeated');
        // The boss is the timed objective; the peaceful walk to the temple is untimed.
        if (game.levelEndTime === 0) game.levelEndTime = performance.now();
        game.audioManager.playMusic('winner');
        game.uiRenderer.showMessage('Stone Golem Defeated! Head to the exit.', 420, '#FFD700');
    }
    updateDeathParticles() {
        this.deathParticles = this.deathParticles.filter(particle => { particle.x += particle.vx; particle.y += particle.vy; particle.vy += .16; particle.vx *= .97; particle.life--; return particle.life > 0; });
    }
    updateStompBounce() {
        if (this.golem.stompBounceVelocity === 0) return;
        this.golem.stompBounceOffset += this.golem.stompBounceVelocity;
        this.golem.stompBounceVelocity += .3;
        if (this.golem.stompBounceVelocity > 0 && this.golem.stompBounceOffset >= 0) {
            this.golem.stompBounceOffset = 0;
            this.golem.stompBounceVelocity = 0;
        }
    }
    checkExit(player) { return this.exit && this.exitFade >= 1 && this.overlaps(player, this.exit); }
    overlaps(a, b) { return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y; }
    setJumpSprite(phase, blueVariant) {
        const animation = `jump${phase}${blueVariant ? 'Blue' : ''}`;
        if (this.golem.animation !== animation) {
            this.golem.animation = animation;
            this.golem.frame = 0;
            this.golem.animationTimer = 0;
        }
    }
    updateAnimation() { const frames = this.sprites[this.golem.animation] || []; if (++this.golem.animationTimer >= 8) { this.golem.animationTimer = 0; this.golem.frame = (this.golem.frame + 1) % Math.max(1, frames.length); } }

    render(ctx, cameraX) {
        if (!this.active) return;
        ctx.save();
        this.rocks.forEach(rock => {
            const sprite = this.rockSprites[rock.sprite];
            if (!sprite.complete) return;
            ctx.save();
            ctx.globalAlpha = rock.alpha === undefined ? 1 : rock.alpha;
            ctx.drawImage(sprite, rock.x - cameraX, rock.y, rock.width, rock.height);
            if ((rock.phase === 'impactSmoke' || rock.phase === 'impactSink') && this.hitSmokeImage.complete) {
                ctx.globalAlpha = rock.smokeAlpha === undefined ? 1 : rock.smokeAlpha;
                ctx.drawImage(this.hitSmokeImage, rock.x - cameraX - 12, rock.y - 12, 78, 78);
            }
            ctx.restore();
        });
        if (this.state === 'jumpPrep' || this.state === 'redBurst' || this.state === 'vulnerabilityExit') this.renderJumpPrep(ctx, cameraX);
        if (this.state === 'finalPrep') this.renderFinalPrep(ctx, cameraX);
        if (this.state !== 'dead') this.renderGolem(ctx, cameraX);
        this.deathParticles.forEach(particle => { ctx.globalAlpha = particle.life / particle.maxLife; ctx.fillStyle = particle.color; ctx.fillRect(particle.x - cameraX - particle.size / 2, particle.y - particle.size / 2, particle.size, particle.size); });
        ctx.globalAlpha = 1;
        if (this.hitSmoke > 0 && this.hitSmokeImage.complete) {
            const isDefeatSmoke = this.hitSmoke > 28;
            const smokeLifetime = isDefeatSmoke ? 60 : 28;
            const size = (isDefeatSmoke ? 160 : 80) + (smokeLifetime - this.hitSmoke) * 2;
            ctx.globalAlpha = this.hitSmoke / smokeLifetime;
            const centerX = this.golem.x - cameraX + this.golem.width / 2;
            const centerY = this.golem.y + this.golem.stompBounceOffset + this.golem.height * .7;
            ctx.drawImage(this.hitSmokeImage, centerX - size / 2, centerY - size / 2, size, size);
            ctx.globalAlpha = 1;
        }
        if (this.exit) { ctx.save(); ctx.globalAlpha = this.exitFade; if (this.exitImage.complete) ctx.drawImage(this.exitImage, this.exit.x - cameraX, this.exit.y, this.exit.width, this.exit.height); else { ctx.fillStyle = '#55d7ff'; ctx.fillRect(this.exit.x - cameraX, this.exit.y, this.exit.width, this.exit.height); } ctx.restore(); }
        ctx.restore();
    }
    renderJumpPrep(ctx, cameraX) {
        const centerX = this.golem.x - cameraX + this.golem.width / 2;
        const centerY = this.golem.y + this.golem.stompBounceOffset + this.golem.height * .72;
        // Three staggered red energy rings pulse outward from the crouching golem.
        const isVulnerabilityExit = this.state === 'vulnerabilityExit';
        const ringDelay = isVulnerabilityExit ? 6 : 12;
        const ringDuration = isVulnerabilityExit ? 30 : 72;
        for (let ring = 0; ring < 3; ring++) {
            const progress = Math.max(0, Math.min(1, (this.timer - ring * ringDelay) / (ringDuration - ring * ringDelay)));
            if (progress <= 0) continue;
            const radius = 34 + progress * (155 + ring * 24);
            const gradient = ctx.createRadialGradient(centerX, centerY, radius * .74, centerX, centerY, radius);
            gradient.addColorStop(0, 'rgba(255, 45, 35, 0)');
            gradient.addColorStop(.62, `rgba(255, 65, 45, ${.82 * (1 - progress * .3)})`);
            gradient.addColorStop(1, 'rgba(255, 25, 20, 0)');
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 5 - ring;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
    renderFinalPrep(ctx, cameraX) {
        const centerX = this.golem.x - cameraX + this.golem.width / 2;
        const centerY = this.golem.y + this.golem.stompBounceOffset + this.golem.height * .72;
        // The final-phase warning uses purple rings to distinguish its intro pound from the
        // red vulnerability-exit signal.
        for (let ring = 0; ring < 3; ring++) {
            const progress = Math.max(0, Math.min(1, (this.timer - ring * 9) / (60 - ring * 9)));
            if (progress <= 0) continue;
            const radius = 36 + progress * (150 + ring * 22);
            ctx.strokeStyle = `rgba(180, 92, 255, ${.85 * (1 - progress * .35)})`;
            ctx.lineWidth = 5 - ring;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
    renderCutsceneAlert(ctx, player) {
        if (this.state !== 'cutscene') return;
        const growProgress = Math.min(1, this.timer / 24);
        const spring = Math.sin(growProgress * Math.PI * 3) * (1 - growProgress) * .28;
        const scale = .55 + growProgress * .45 + spring;
        const flash = this.timer < 30 ? .58 + .42 * Math.abs(Math.sin(this.timer * .95)) : 1;
        ctx.save();
        ctx.globalAlpha = growProgress * flash;
        ctx.translate(player.x + player.width / 2, player.y - 38);
        ctx.scale(scale, scale);
        // Pixel-art exclamation mark: a distinct stem and square dot, not a font glyph.
        ctx.fillStyle = '#3a0909';
        ctx.fillRect(-10, -42, 20, 34);
        ctx.fillRect(-9, 2, 18, 18);
        ctx.fillStyle = '#ff3131';
        ctx.fillRect(-6, -38, 12, 25);
        ctx.fillRect(-5, 6, 10, 10);
        ctx.restore();
    }
    renderFade(ctx, cameraX = 0, worldSpace = false) {
        if (this.state !== 'cutscene' || (this.cutsceneStage !== 'quake' && this.cutsceneStage !== 'falling')) return;
        const crackProgress = this.cutsceneStage === 'quake' ? Math.min(1, this.timer / 70) : 1;
        // The ground should disappear quickly once the collapse starts, ahead of the
        // characters' longer fall into the boss arena.
        const collapseProgress = this.cutsceneStage === 'falling' ? Math.min(1, this.timer / 48) : 0;
        const originX = worldSpace ? this.golem.x + 55 : Math.max(90, Math.min(ctx.canvas.width - 90, this.golem.x - cameraX + 55));
        const groundTop = this.golem.groundY || 468;
        const groundDepth = Math.max(80, ctx.canvas.height - groundTop - 16);
        const crackHeights = [.88, .64, .96, .73, .82, .91];
        const branches = [-210, -135, -45, 50, 140, 230].map((offset, index) => {
            const bend = index % 2 === 0 ? -1 : 1;
            const height = groundDepth * crackHeights[index];
            return [[offset, 0], [offset + bend * 12, height * .28], [offset - bend * 9, height * .62], [offset + bend * 18, height]];
        });
        ctx.save();
        if (collapseProgress > 0) {
            // Only the cracked section collapses.  The mask grows upward from the broken
            // floor, taking any nearby tree/plant bases with it while leaving the rest of
            // the level (including the distant temple) intact.
            // The player and pet stand left of the golem, while the temple is immediately
            // to its right.  Keep the break broad on the player side but short of the temple.
            const leftHalfWidth = 115 + collapseProgress * 225;
            const rightHalfWidth = 90 + collapseProgress * 125;
            const left = originX - leftHalfWidth;
            const right = originX + rightHalfWidth;
            ctx.beginPath();
            ctx.moveTo(left, groundTop);
            ctx.lineTo(left + 38, ctx.canvas.height);
            ctx.lineTo(right - 32, ctx.canvas.height);
            ctx.lineTo(right, groundTop);
            ctx.closePath();
            ctx.clip();
            // A hard, descending fade front erases the ground from its surface down.
            const fadeFront = groundTop + groundDepth * collapseProgress;
            const fadeGradient = ctx.createLinearGradient(0, groundTop, 0, fadeFront + 34);
            fadeGradient.addColorStop(0, 'rgba(8, 7, 21, .96)');
            fadeGradient.addColorStop(.86, 'rgba(8, 7, 21, .96)');
            fadeGradient.addColorStop(1, 'rgba(8, 7, 21, 0)');
            ctx.fillStyle = fadeGradient;
            ctx.fillRect(left, groundTop, leftHalfWidth + rightHalfWidth, Math.min(groundDepth, fadeFront - groundTop + 34));
            ctx.restore();
            ctx.save();
        }
        ctx.beginPath();
        branches.forEach(points => {
            const drawCount = Math.max(1, Math.ceil((points.length - 1) * crackProgress) + 1);
            ctx.moveTo(originX + points[0][0], groundTop + points[0][1]);
            for (let i = 1; i < Math.min(points.length, drawCount); i++) ctx.lineTo(originX + points[i][0], groundTop + points[i][1]);
        });
        // Small angled branches give each vertical split a spiderweb look.
        branches.forEach((points, index) => {
            if (crackProgress < .35) return;
            const branchPoint = points[2];
            const direction = index % 2 === 0 ? -1 : 1;
            ctx.moveTo(originX + branchPoint[0], groundTop + branchPoint[1]);
            ctx.lineTo(originX + branchPoint[0] + direction * 38 * crackProgress, groundTop + branchPoint[1] + 22 * crackProgress);
        });
        // Split each main fracture into small, irregular tendrils for a dense spiderweb.
        if (crackProgress > .28) branches.forEach((points, index) => {
            const direction = index % 2 === 0 ? -1 : 1;
            [1, 2].forEach(segmentIndex => {
                const point = points[segmentIndex];
                const length = (17 + index * 3 + segmentIndex * 4) * crackProgress;
                const rise = (8 + segmentIndex * 6) * crackProgress;
                ctx.moveTo(originX + point[0], groundTop + point[1]);
                ctx.lineTo(originX + point[0] + direction * length, groundTop + point[1] + rise);
                // A tiny offshoot from the tendril keeps the cracks naturally uneven.
                ctx.lineTo(originX + point[0] + direction * (length + 8 * crackProgress), groundTop + point[1] + rise + (index % 3 - 1) * 9 * crackProgress);
            });
        });
        // A long split crosses the ground beneath the vertical spiderweb fractures.
        if (crackProgress > .2) {
            const horizontalY = groundTop + groundDepth * .42;
            const span = 360 * crackProgress;
            ctx.moveTo(originX - span, horizontalY - 7);
            ctx.lineTo(originX - span * .42, horizontalY + 5);
            ctx.lineTo(originX + span * .16, horizontalY - 4);
            ctx.lineTo(originX + span, horizontalY + 8);
        }
        ctx.strokeStyle = `rgba(25, 17, 27, ${0.3 + crackProgress * 0.65})`;
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.restore();
    }
    renderGolem(ctx, cameraX) { const frames = this.sprites[this.golem.animation] || []; const sprite = frames[this.golem.frame] || frames[0]; if (!sprite) return; const x = this.golem.x - cameraX; const y = this.golem.y + this.golem.stompBounceOffset; const h = this.golem.drawHeight; ctx.save(); if (this.golem.flash > 0 && Math.floor(this.golem.flash / 10) % 2 === 0) ctx.globalAlpha = .72; if (this.golem.facingLeft) { ctx.scale(-1, 1); ctx.drawImage(sprite, -x - this.golem.width, y, this.golem.width, h); } else ctx.drawImage(sprite, x, y, this.golem.width, h); ctx.restore(); }
    get isCutscene() { return this.state === 'cutscene'; }
}
