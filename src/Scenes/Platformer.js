class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    init() {
        // variables and settings
        this.ACCELERATION = 400;
        this.DRAG = 1200;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 1000;
        this.JUMP_VELOCITY = -490;
        this.PARTICLE_VELOCITY = 50;
        this.SCALE = 2.0;
        this.BULLET_SPEED = 600;
        this.MAX_BULLETS = 10; // Initialize the maximum number of bullets
        this.RELOAD_TIME = 2000; // Reload time in milliseconds
        this.isReloading = false; // Track if reloading is in progress
        this.BEE_SPEED = 200;
        this.BEE_MOVEMENT_RANGE = 10; // Range in pixels above and below the spawn point
        this.playerHeatlh = 100;
        this.lastStepTime = 0; //track the time of the last step
        this.gameOverFlag = false;
        this.MAX_HEALTH = 100;


        // Define bee spawn positions
        this.BEE_SPAWN_POSITIONS = [
            { x: 660, y: 260 },
            { x: 690, y: 230 },
            { x: 730, y: 260 },
            { x: 250, y: 290 },
            { x: 274, y: 250 },
            { x: 304, y: 290 },
            { x: 324, y: 250 },
            { x: 344, y: 290 },
            { x: 324, y: 130 },
            { x: 550, y: 40 },
            { x: 1000, y: 220 },
            { x: 1200, y: 250 },
            { x: 1100, y: 200 },
            { x: 1190, y: 140 },
            { x: 1400, y: 30 },
            { x: 1300, y: 200 },
            { x: 1300, y: 60 },
            { x: 1240, y: 80 },
            { x: 1100, y: 60 },
            { x: 1040, y: 60 },




            // Add more positions as needed
        ];
    }

    create() {
        // Create a new tilemap game object which uses 18x18 pixel tiles, and is
        // 45 tiles wide and 25 tiles tall.
        this.map = this.add.tilemap("Food_Wars", 18, 18, 90, 20);

        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tileset_food = this.map.addTilesetImage("food_tilemap", "food_tiles");
        this.tileset_other = this.map.addTilesetImage("bonnie_tilemap_packed", "other_tilemap_tiles");
        this.tileset_skyOver = this.map.addTilesetImage("bonnie_overlay", "other_tilemap_tiles");
        this.tileset_middleground = this.map.addTilesetImage("bonnie_overlay", "other_tilemap_tiles");
        this.tileset_foreground = this.map.addTilesetImage("bonnie_overlay", "other_tilemap_tiles");



        // Create a layer
        this.skyLayer = this.map.createLayer("Sky", this.tileset_other, 0, 0);
        this.skyOverLayer = this.map.createLayer("Over-Sky", this.tileset_skyOver, 0, 0);
        this.middlegroundLayer = this.map.createLayer("MiddleGround", this.tileset_middleground, 0, 0);
        this.foregroundLayer = this.map.createLayer("ForeGround", this.tileset_foreground, 0, 0);
        this.groundLayer = this.map.createLayer("Ground-n-Platforms", this.tileset_food, 0, 0);

        this.skyLayer.setScrollFactor(0);
        this.skyLayer.setPosition(0, 225);
        this.skyOverLayer.setScrollFactor(0);
        this.skyOverLayer.setPosition(0, 225);
        this.middlegroundLayer.setScrollFactor(0.5);
        this.middlegroundLayer.setPosition(25, 114);
        this.foregroundLayer.setScrollFactor(0.2);
        this.foregroundLayer.setPosition(25, 181);

        

        // Make it collidable
        this.groundLayer.setCollisionByProperty({
            collides: true
        });

        

        this.bees = this.physics.add.group();

        this.burgers = this.map.createFromObjects("Objects", {
            name: "Burger",
            key: "tilemap_sheet",
            frame: 90
        });

        // Bullet group
        this.bullets = this.physics.add.group({
            defaultKey: 'bullet',
            maxSize: this.MAX_BULLETS,
            createCallback: (bullet) => {
                bullet.body.allowGravity = false;
            }
        });

        this.backgroundMusic = this.sound.add('music');

        if (!this.backgroundMusic.isPlaying) {
        this.backgroundMusic.play({
            loop:true
        });
    }

        this.snowman = this.physics.add.sprite(100, 250, 'snowman');
        this.snowman.setInteractive();
        this.snowman.setCollideWorldBounds(true);
        this.physics.add.collider(this.bullets, this.snowman, this.bulletHitSnowman, null, this);
        this.physics.add.collider(this.snowman, this.groundLayer);

        this.sushi = this.physics.add.sprite(27, 24, 'sushi');
        this.sushi.body.allowGravity = false; // Disable gravity for the sushi
        this.sushi.setImmovable(true); // Make the sushi immovable

        this.tweens.add({
            targets: this.sushi,
            scale: 1.2, // Scale factor for pulsation
            duration: 200, // Duration for scaling up
            yoyo: true, // Play the tween in reverse (scaling down)
            repeat: -1 // Repeat indefinitely
        });



        // Set the initial bullets left value
        this.bulletsLeft = this.MAX_BULLETS;
        //1530, 36

        this.donut = this.physics.add.sprite(1500, 36, 'donut');
        this.donut.body.allowGravity = false; // Disable gravity for the donut
        this.donut.setImmovable(true); // Make the donut immovable

        
   

        // Create the text object for bullets left
        this.bulletText = this.add.text(0, 0, `BULLETS X ${this.bulletsLeft}`, {
            font: '18px hey',
            fill: '#ffffff'
        });

        //health text
        this.healthText = this.add.text(0, 20, `HEALTH: ${this.playerHeatlh}`, {
            font: '18px Arial',
            fill: '#ffffff'
        });

        //ePrompt handler
        this.eButtonPrompt = this.add.sprite(this.snowman.x + 1, this.snowman.y - 5, 'eButton');
        this.eButtonPrompt.setOrigin(0.5);

        this.tweens.add({
            targets: this.eButtonPrompt,
            scale: 1.8, // Scale factor for pulsation
            duration: 200, // Duration for scaling up
            yoyo: true, // Play the tween in reverse (scaling down)
            repeat: -1 // Repeat indefinitely
        });



        this.textBox = this.add.text(this.snowman.x, this.snowman.y - 20, 'Get to the birthday Cake!\nMove with the arrow keys\nPress SPACE to shoot\nPress F to reload\nPress R to restart\nCollect BURGERS to regain health\nOther types of food grant power-ups\nPress H to hide this message', {
            font: '8px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            wordWrap: {
                width: 200,  // Adjust the width to your preference
            },
            padding: {
                x: 4,  // Adjust the padding as needed
                y: 4,
            },
            align: 'center', // Align the text to the left
        });
        
        this.textBox.setOrigin(0.5);
        this.textBox.setVisible(false);


        // set up player avatar
        my.sprite.player = this.physics.add.sprite(20, 200, "tile_0040.png");
        my.sprite.player.setCollideWorldBounds(true);

        my.sprite.player.setSize(my.sprite.player.width / 2, my.sprite.player.height / 2);
        my.sprite.player.setOffset(my.sprite.player.width - 31.5, my.sprite.player.height - 33);

        // Spawn multiple bees
        this.BEE_SPAWN_POSITIONS.forEach(pos => {
            this.spawnBEE(pos.x, pos.y);
        });

        // Enable collision handling
        this.physics.add.collider(my.sprite.player, this.groundLayer);

        this.physics.add.overlap(this.bullets, this.bees, this.beeHitByBullet, null, this);


        //handle collisions between bullets and bees
        this.physics.add.collider(my.sprite.player, this.bees, this.playerHitByBee, null, this);

        this.burgers = this.physics.add.group();

        const burgerPositions = [
            { x: 170, y: 180 },
            { x: 510, y: 220 },
            { x: 1070, y: 50 },
        ]

        burgerPositions.forEach(pos => {
            let burger = this.burgers.create(pos.x, pos.y, 'burger');
            burger.body.allowGravity = false;
        });

        this.physics.add.overlap(my.sprite.player, this.burgers, this.collectBurger, null, this);

        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();
        this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.rKey = this.input.keyboard.addKey('R');
        this.reloadKey = this.input.keyboard.addKey('F'); // Add reload key
        this.eKey = this.input.keyboard.addKey('E');
        this.hKey = this.input.keyboard.addKey('H');

        // debug key listener (assigned to D key)
        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true;
            this.physics.world.debugGraphic.clear();
        }, this);

        // TODO: Add movement vfx here
        // movement vfx
        my.vfx.walking = this.add.particles(0, 0, "kenny-particles", {
            frame: ['dirt_01.png', 'dirt_03.png'],
            scale: {start: 0.001, end: 0.06},
            lifespan: 200,
            alpha: {start: 1, end: 0.1},
        });
        my.vfx.walking.stop();

        my.vfx.jumping = this.add.particles(0, 0, "kenny-particles", {
            frame: ['muzzle_01.png', 'muzzle_02.png'],
            scale: {start: 0.001, end: 0.06},
            lifespan: 200,
            alpha: {start: 1, end: 0.1},
        });
        my.vfx.jumping.stop();

        // Initial shot sprite
        this.initialShot = this.add.sprite(0, 0, 'initial_shot');
        this.initialShot.setVisible(false);

        // TODO: add camera code here
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 1, 1); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(25, 1);
        this.cameras.main.setZoom(this.SCALE);

        // Disable gravity for bullets
        this.bullets.children.iterate(function (bullet) {
            bullet.body.allowGravity = false;
        });
    }

    update() {
        const currentTime = this.time.now;
        if (cursors.left.isDown) {
            my.sprite.player.setAccelerationX(-this.ACCELERATION);
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);
            // TODO: add particle following code here
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth / 2 - 10, my.sprite.player.displayHeight / 2 - 5, false);
            my.vfx.walking.setParticleSpeed(-this.PARTICLE_VELOCITY, 0);

            // Only play smoke effect if touching the ground
            if (my.sprite.player.body.blocked.down) {
                my.vfx.walking.start();
                if (currentTime - this.lastStepTime > 400) {
                    this.sound.play("step", {
                        volume : 1
                    });
                    this.lastStepTime = currentTime;
                }
            }

        } else if (cursors.right.isDown) {
            my.sprite.player.setAccelerationX(this.ACCELERATION);
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);
            // TODO: add particle following code here
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth / 2 - 10, my.sprite.player.displayHeight / 2 - 5, false);
            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            // Only play smoke effect if touching the ground
            if (my.sprite.player.body.blocked.down) {
                my.vfx.walking.start();
                if (currentTime - this.lastStepTime > 100) {
                    this.sound.play("step", {
                        volume : 1
                    });
                    this.lastStepTime = currentTime;
                }
            }

        } else {
            // Set acceleration to 0 and have DRAG take over
            my.sprite.player.setAccelerationX(0);
            my.sprite.player.setDragX(this.DRAG);
            my.sprite.player.anims.play('idle');
            // TODO: have the vfx stop playing
            my.vfx.walking.stop();
        }

        // player jump
        // note that we need body.blocked rather than body.touching b/c the former applies to tilemap tiles and the latter to the "ground"
        if (!my.sprite.player.body.blocked.down) {
            my.sprite.player.anims.play('jump');
        }
        if (my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up)) {
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
            this.sound.play("jump", {
                volume: 0.4
            });
        }


        if (Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.restart();
            this.backgroundMusic.stop();
            this.gameOverFlag = false;
            this.gameOverSoundPlayed = false;

        }

        // Reload mechanic
        if (Phaser.Input.Keyboard.JustDown(this.reloadKey) && !this.isReloading) {
            this.reloadBullets();
            this.sound.play("reload", {
                volume: 0.3
            });
        }

        // Shooting mechanic
        if (Phaser.Input.Keyboard.JustDown(this.spacebar) && !this.isReloading && this.bulletsLeft > 0) {
            this.shootBullet();
            this.sound.play("shoot", {
                volume: 1
            });
            
        }

        if (this.eKey.isDown) {
            this.textBox.setVisible(true);
            this.eButtonPrompt.setVisible(false);
        } 

        if (Phaser.Input.Keyboard.JustDown(this.hKey)) {
            this.textBox.setVisible(false);
            this.eButtonPrompt.setVisible(true);
        }    
        

        // Update bullets
        this.bullets.children.each(function (bullet) {
            if (bullet.active && (bullet.x > this.physics.world.bounds.width || bullet.x < 0)) {
                bullet.setActive(false);
                bullet.setVisible(false);
            }
        }, this);

        this.bees.children.iterate(function (bee) {
            if (bee && bee.active) {
                bee.setVelocityY(this.BEE_SPEED * bee.direction.y);


                if (bee.y < bee.minY) {
                    bee.y = bee.minY;
                    bee.direction.y = 1;
                } else if (bee.y > bee.maxY) {
                    bee.y = bee.maxY;
                    bee.direction.y = -1;
                }
            }
        }, this);


        if (this.playerHeatlh <= 0 && !this.gameOverFlag) {
            this.gameOver();
        }

        if (my.sprite.player.y > this.physics.world.bounds.height - 500) {
            this.gameOver();

            return;
        }

        this.physics.overlap(my.sprite.player, this.donut, this.collectDonut, null, this);
        this.physics.overlap(my.sprite.player, this.sushi, this.collectSushi, null, this);


        

        // Update bullet text position with camera
        const camera = this.cameras.main;
        const textPositionX = camera.worldView.x; // 10 pixels from the left edge of the camera's visible area
        const textPositionY = camera.worldView.y; // 10 pixels from the top edge of the camera's visible area
        this.bulletText.setPosition(textPositionX, textPositionY);
        this.healthText.setPosition(textPositionX, textPositionY + 20);
    }

    spawnBEE(x, y) {
        let bee = this.bees.create(x, y, 'initial_bee');
        bee.play('bee_fly');
        bee.body.allowGravity = false;
        bee.direction = new Phaser.Math.Vector2(0, 1);
        bee.minY = y - this.BEE_MOVEMENT_RANGE;
        bee.maxY = y + this.BEE_MOVEMENT_RANGE;
    }

    collectBurger(player, burger) {
        this.sound.play("eating");
        burger.destroy();
        this.playerHeatlh += 10;
        if (this.playerHeatlh > this.MAX_HEALTH) {
            this.playerHeatlh = this.MAX_HEALTH;
        }
        this.healthText.setText(`HEALTH: ${this.playerHeatlh}`);
    }

    collectSushi(player, sushi) {
        sushi.destroy();
        this.sound.play("powerup");
        this.MAX_BULLETS = 20;
        this.bulletsLeft = this.MAX_BULLETS;
        this.updateBulletText();
    }

    playerHitByBee(player, bee) {
        this.sound.play("damage");
        this.playerHeatlh -= 10;
        this.updateHealthText();

        let knockbackDirection = player.x < bee.x ? -1 : 1;

        player.setVelocityX(knockbackDirection * 300);
        player.setVelocityY(-200);

        bee.setVelocityX(0);
        bee.setVelocityY(0);

        this.tweens.add({
            targets: player,
            alpha: 0,
            duration: 100,
            ease: 'Linear',
            yoyo: true,
            repeat: 5,
            onComplete: () => {
                player.alpha = 1;
            }
        });

       
    }



    beeHitByBullet(bullet, bee) {
        this.sound.play("hit", {
            volume: 4
        });
        bullet.destroy();

        let knockbackDirection = bullet.x < bee.x ? 1 : -1;

        bee.setVelocityX(knockbackDirection * 50);
        bee.setVelocityY(-100);

        bee.setVelocityY(0);
        

        this.tweens.add({
            targets: bee,
            alpha: 0,
            duration: 50,
            ease: 'Linear',
            yoyo: true,
            repeat: 5,
            onComplete: () => {
                bee.destroy();
            }
        });
    }

    bulletHitSnowman(bullet, snowman) {
        snowman.destroy();
        bullet.destroy();
        this.sound.play("gasp", {
            volume: 3
        });
        this.sound.play("grunt");
    }

    // Function to handle donut collection
collectDonut() {
    // Remove the donut sprite
    this.donut.destroy();
    
    // Call the win function
    this.winGame();
}

// Function to handle winning the game
winGame() {
    this.sound.play('victory', {
        volume: 0.5
    });
    this.sound.play('win', {
        volume: 2
    });
    // Display win message
    const camera = this.cameras.main;
    const centerX = camera.worldView.x + camera.worldView.width / 2;
    const centerY = camera.worldView.y + camera.worldView.height / 2;
    const winText = this.add.text(centerX, centerY, 'VICTORY!', {
        fontSize: '64px',
        fill: '#00ff00',
        backgroundColor: '#000000'
    }).setOrigin(0.5);

    // Stop player movement

    // Stop player controls
  
}



    shootBullet() {
        if (this.bulletsLeft > 0) { // Check if bullets are available
            // Flash the initial shot
            const xOffset = my.sprite.player.flipX ? -10 : 14;
            this.initialShot.setPosition(my.sprite.player.x + xOffset, my.sprite.player.y);
            this.initialShot.setVisible(true);
            this.time.delayedCall(100, () => {
                this.initialShot.setVisible(false);
            });

            // Get a bullet from the bullets group
            let bullet = this.bullets.get(my.sprite.player.x, my.sprite.player.y);
            if (bullet) {
                bullet.setActive(true);
                bullet.setVisible(true);

                // Reset bullet properties
                bullet.body.allowGravity = false;

                if (my.sprite.player.flipX){
                    bullet.body.velocity.x = -this.BULLET_SPEED;
                } else {
                    bullet.body.velocity.x = this.BULLET_SPEED;
                }
                this.bulletsLeft--;
                this.updateBulletText();
            }
        }
    }

    reloadBullets() {
        this.isReloading = true;
        this.bulletText.setText(`RELOADING...`);

        this.time.delayedCall(this.RELOAD_TIME, () => {
            this.bulletsLeft = this.MAX_BULLETS;
            this.updateBulletText();
            this.isReloading = false;
            this.bulletText.setText(`BULLETS X ${this.bulletsLeft}`);
        }, null, this);
    }

    updateHealthText() {
        this.healthText.setText(`HEALTH: ${this.playerHeatlh}`);
    }

    updateBulletText() {
        this.bulletText.setText(`BULLETS X ${this.bulletsLeft}`);
    }

    gameOver() {
   
        // Create a big text box in the middle of the screen
        const camera = this.cameras.main;
        const centerX = camera.worldView.x + camera.worldView.width / 2;
        const centerY = camera.worldView.y + camera.worldView.height / 2;
        const gameOverText = this.add.text(centerX, centerY, '     GAME OVER\nPress R to Restart', {
            fontSize: '32px',
            fill: '#ff0000',
            backgroundColor: '#000000'
        }).setOrigin(0.5);


    
        // Stop player movement
        my.sprite.player.setVelocity(0);
        my.sprite.player.setAcceleration(0);
        my.sprite.player.anims.play('idle');
        my.sprite.player.setVisible(false);
        my.sprite.player.body.enable = false;
        // Stop player controls
        this.input.keyboard.removeAllListeners();
        my.sprite.player.body.moves = false;
    }



   
}
