class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        this.load.setPath("./assets/");

        // Load characters spritesheet
        this.load.atlas("platformer_characters", "tilemap-characters-packed.png", "tilemap-characters-packed.json");

        // Load tilemap information
        this.load.audio("jump", "cartoon_jump.wav");
        this.load.audio("step", "walk.mp3");
        this.load.audio("shoot", "friendly_shoot.wav");
        this.load.audio("reload", "reload.mp3");
        this.load.image("initial_bee", "tile_0051.png");
        this.load.image("eButton", "tile_0087.png")
        this.load.image("snowman", "tile_0145.png")
        this.load.image("flying_bee", "tile_0052.png");
        this.load.image("initial_shot", "tile_0043.png");
        this.load.image("bullet", "tile_0044.png")
        this.load.image("idle_walk", "tile_0040.png");
        this.load.image("mid_walk", "tile_0041.png");
        this.load.image("stop_walk", "tile_0042.png");
        this.load.image("food_tiles", "tilemap_packed.png"); // Packed tilemap
        this.load.image("other_tilemap_tiles", "bonnie_tilemap_packed.png");
        this.load.image("cloud_tiles", "bonnie_tilemap_packed.png");
        this.load.image("middleground_tiles", "bonnie_tilemap_packed.png");
        this.load.image("foreground_tiles", "bonnie_tilemap_packed.png");
        this.load.tilemapTiledJSON("Food_Wars", "food_map.tmj");   // Tilemap in JSON

        // Load the tilemap as a spritesheet
        this.load.spritesheet("tilemap_sheet", "tilemap_packed.png", {
            frameWidth: 18,
            frameHeight: 18
        });
        this.load.spritesheet("other_tilemap_sheet", "bonnie_tilemap_packed.png", {
            frameWidth: 16,
            frameHeight: 16,
        })
        

        // Oooh, fancy. A multi atlas is a texture atlas which has the textures spread
        // across multiple png files, so as to keep their size small for use with
        // lower resource devices (like mobile phones).
        // kenny-particles.json internally has a list of the png files
        // The multiatlas was created using TexturePacker and the Kenny
        // Particle Pack asset pack.
        this.load.multiatlas("kenny-particles", "kenny-particles.json");
    }

    create() {
        this.anims.create({
            key: 'walk',
            frames: [
                { key: "idle_walk" },
                { key: "mid_walk" },
                { key: "stop_walk" },
            ],
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: "bee_fly",
            frames: [
                { key: "initial_bee" },
                { key: "flying_bee" },
                { key: "initial_bee" },
            ],
            frameRate: 15,
            repeat: -1
        })

        this.anims.create({
            key: 'idle',
            frames: [
                { key: "idle_walk" },
            ],
            repeat: -1
        });

        this.anims.create({
            key: 'jump',
            frames: [
                { key: "mid_walk" },
            ],
        });

         // ...and pass to the next Scene
         this.scene.start("platformerScene");
    }

    // Never get here since a new scene is started in create()
    update() {
    }
}