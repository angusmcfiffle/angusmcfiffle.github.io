screens.game = function () {

    let boardArgs = {}
    let boardData = {}
    let onupdate = () => {}
    
    if (currentMode == "classic") {
        boardArgs.alwaysHaveMoves = false;
        onupdate = () => {
            scene.$board.scoreMulti = scene.$board.data.level;
        }
    } else if (currentMode == "action") {
        boardArgs.types = 6;
        onupdate = () => {
            scene.$board.scoreMulti = scene.$board.data.level;
        }
    } else if (currentMode == "speed") {
        scene.append(controls.base({
            position: Ex(-10000, -10000),
            size: Ex(180, 60),
        }), "multibox")
        scene.$multibox.append(controls.rect({
            position: Ex(0, 0),
            size: Ex(0, 0, 100, 100),
            fill: "#888a",
        }), "fill")
        scene.$multibox.append(controls.label({
            position: Ex(0, 0, 50, 50),
            scale: 300,
            style: "700",
            fill: "#fff",
        }), "text")

        boardData.time = 300;
        boardData.xpOffset = 0;
        boardData.maxLevel = 1n;
        onupdate = () => {
            if (!scene.$board.paused) {
                scene.$board.data.xpOffset = Math.min(scene.$board.data.xpOffset + Number(scene.$board.data.level) * delta / 1000, Number(scene.$board.exp));
                scene.$board.data.level = (scene.$board.exp - BigInt(Math.floor(scene.$board.data.xpOffset || 0))) / 50n + 1n;
                if (scene.$board.data.level > scene.$board.data.maxLevel) scene.$board.data.maxLevel = scene.$board.data.level;
            }
            scene.$multibox.position = scene.$board.position;
            scene.$multibox.size = scene.$board.size;
            let xpDiff = Number(scene.$board.exp) - scene.$board.data.xpOffset;
            scene.$multibox.$fill.size.ey = (xpDiff % 50) * 2;
            scene.$multibox.$fill.position.ey = 100 - scene.$multibox.$fill.size.ey;
            scene.$multibox.$text.text = scene.$board.data.level > 1n ? scene.$board.data.level.toLocaleString("en-US") + "x" : "";
            scene.$board.scoreMulti = 5n * scene.$board.data.level;
        }
    }

    // The Score
    scene.append(controls.rect({
        position: Ex(-10000, -10000),
        size: Ex(180, 60),
        text: 0,
        fill: "#555a",
    }), "scorebox")
    scene.$scorebox.append(controls.rect({
        position: Ex(2, 2),
        size: Ex(-4, -4, 100, 100),
        fill: "#555a",
    }), "fill")
    scene.append(controls.label({
        position: Ex(-10000, -10000),
        scale: 30,
        text: 0,
    }), "score")
    scene.append(controls.label({
        position: Ex(-10000, -10000),
        scale: 20,
        text: 0,
    }), "level")

    // The hint button
    scene.append(controls.button({
        position: Ex(-10000, -10000),
        size: Ex(180, 60),
        fill: "#aaa7",
        onclick() {
            scene.$board.showHint();
        }
    }), "hintbtn")
    scene.$hintbtn.append(controls.rect({
        position: Ex(2, 2),
        size: Ex(-4, -4, 100, 100),
        fill: "#000a",
    }), "fill")
    scene.$hintbtn.$fill.append(controls.rect({
        size: Ex(0, 0, 100, 100),
        fill: "#000",
    }), "bar")
    scene.$hintbtn.append(controls.label({
        position: Ex(0, 0, 50, 50),
        scale: 25,
        style: "italic",
        text: "Hint",
    }), "text")

    // The menu button
    scene.append(controls.button({
        position: Ex(-10000, -10000),
        size: Ex(180, 60),
        fill: "#aaa7",
        onclick() {
            if (!isAnimating) {
                let popup = popups.gamemenu();
                scene.$board.paused = true;
                let close = popup.close;
                popup.close = () => {
                    setTimeout(() => scene.$board.paused = false, 300);
                    close();
                };
            }
        }
    }), "menubtn")
    scene.$menubtn.append(controls.rect({
        position: Ex(2, 2),
        size: Ex(-4, -4, 100, 100),
        fill: "#000a",
    }), "fill")
    scene.$menubtn.append(controls.label({
        position: Ex(0, 0, 50, 50),
        scale: 25,
        style: "italic",
        text: "Menu",
    }), "text")

    // The progress bar
    scene.append(controls.gembar({
        position: Ex(-10000, -10000),
        size: Ex(600, 40),
        fill: "#555a",
    }), "progress")

    // The board
    scene.append(controls.board({
        board: Board({
            types: boardArgs.types ?? 7
        }),
        position: Ex(-10000, -10000),
        size: Ex(600, 600),
        data: {
            level: 1n,
            ...boardData
        },
        clickthrough: true
    }), "board")

    // The splash text
    scene.$board.append(controls.label({
        position: Ex(0, 0, 50, 50),
        scale: 50,
        stroke: "black",
        style: "700",
        thickness: 8,
        wrap: true,
    }), "splash")

    scene.$board.board.alwaysHaveMoves = boardArgs.alwaysHaveMoves ?? scene.$board.board.alwaysHaveMoves;

    var introFactor = 1;
    let isAnimating = true;
    let waiter = 0;
    scene.append(controls.base({
        onupdate() {
            if (!scene.$board.paused) {
                game.stats.timePlayed += delta;
                if (currentMode == "speed" && !isAnimating) scene.$board.data.time -= delta / 1000;
            }

            onupdate();

            scene.$score.text = (scene.$board.score - BigInt(Math.round(scene.$board.lerpScore))).toLocaleString("en-US");
            scene.$hintbtn.$fill.$bar.size = Ex(0, 0, Math.min(Math.max(scene.$board.hintCooldown / 5000, 0), 1) * 100, 100);

            let level = Number(scene.$board.data.level) - 1;

            let goal = getLevelGoal(level);

            if (currentMode == "speed") {
                let time = Math.max(scene.$board.data.time, 0)
                scene.$level.text = Math.floor(time / 60) + ":" + Math.floor(time % 60).toFixed(0).padStart(2, "0");
                scene.$progress.progress = (scene.$board.data.time / 300);
            } else {
                scene.$level.text = "Level " + scene.$board.data.level.toLocaleString("en-US");
                scene.$progress.progress += (Number(scene.$board.exp) / goal - scene.$progress.progress) * (1 - 0.01 ** (delta / 1000));
            }

            if (mainCanvas.width / scale >= 1000) {
                scene.$scorebox.position = Ex(-450, -300, 50, 50);
                scene.$scorebox.size = Ex(280, 100);
                scene.$score.position = Ex(-310, -265, 50, 50);
                scene.$score.scale = 30;
                scene.$level.position = Ex(-310, -230, 50, 50);
                scene.$level.scale = 20;
                scene.$hintbtn.position = Ex(-390, 90, 50, 50);
                scene.$hintbtn.size = Ex(180, 120);
                scene.$menubtn.position = Ex(-390, 230, 50, 50);
                scene.$menubtn.size = Ex(180, 60);
                scene.$progress.position = Ex(-150, 280, 50, 50);
                scene.$board.position = Ex(-150, -320, 50, 50);
            } else {
                scene.$scorebox.position = Ex(-300, -380, 50, 50);
                scene.$scorebox.size = Ex(600, 60),
                scene.$score.position = Ex(-150, -350, 50, 50);
                scene.$score.scale = 25;
                scene.$level.position = Ex(150, -350, 50, 50);
                scene.$level.scale = 25;
                scene.$hintbtn.position = Ex(-90, 210, 50, 65);
                scene.$hintbtn.size = Ex(180, 60);
                scene.$menubtn.position = Ex(-270, 210, 50, 65);
                scene.$menubtn.size = Ex(150, 60);
                scene.$progress.position = Ex(-300, 280, 50, 50);
                scene.$board.position = Ex(-300, -320, 50, 50);
            }

            if (introFactor > 0)
            {
                scene.$scorebox.position.ex -= 100 * introFactor;
                scene.$score.position.ex -= 100 * introFactor;
                scene.$level.position.ex -= 100 * introFactor;
                scene.$hintbtn.position.ex -= 100 * introFactor;
                scene.$menubtn.position.ex -= 100 * introFactor;
                scene.$progress.position.ex += 100 * introFactor;
                scene.$board.position.ex += 100 * introFactor;
            }

            if (scene.$board.fallCount == 0) {
                waiter++;
                if (waiter == 2) {
                    if (!isAnimating && Number(scene.$board.exp) >= goal) {
                        isAnimating = true;
                        levelUp();
                    } else if (scene.$board.moves.count == 0) {
                        if (currentMode == "classic") {
                            splash("NO MORE MOVES");
                            gameOver();
                        } else {
                            let tiles = Object.values(scene.$board.board.tiles);
                            let tile;
                            while (!tile || tile.power)
                                tile = tiles[Math.floor(Math.random() * tiles.length)]
                            tile.type = 7;
                            tile.power = "cube"
                        }
                    } else if (currentMode == "action" && Object.values(scene.$board.board.tiles).find((x => !x?.anim && x?.power == "countdown" && x.countdown <= 0))) {
                        splash("GAME OVER");
                        gameOver();
                    } else {

                        if (game.options.compliments) {
                            let score = scene.$board.expCascade * BigInt(scene.$board.cascade);
                            if (currentMode == "action") score /= 2n;
                            let comp = "";
                            if (score > 50n && currentMode != "endless") comp = "NICE";
                            if (score > 100n) comp = "EXCELLENT";
                            if (score > 200n) comp = "AMAZING";
                            if (score > 400n) comp = "INCREDIBLE";
                            if (score > 800n) comp = "SPECTACULAR";
                            if (score > 1600n) comp = "EXTRAORDINARY";
                            if (score > 3200n) comp = "UNBELIEVABLE";
                            if (comp) {
                                let board = scene.$board;
                                let size = Math.min(board.rect.width / board.board.width, board.rect.height / board.board.height) / scale;
                                scene.$board.scorePopups.push({
                                    pos: { x: scene.$board.board.width / 2, y: scene.$board.board.height / 2 - 25 / size },
                                    color: 6,
                                    text: comp,
                                    type: "comp",
                                    exp: BigInt(Math.ceil(Math.sqrt(Number(score)))) / 10n,
                                })
                                scene.$board.scorePopups.push({
                                    pos: { x: scene.$board.board.width / 2, y: scene.$board.board.height / 2 + 25 / size},
                                    color: 6,
                                    text: "(" + scene.$board.scoreCascade.toLocaleString("en-US") + " total points)",
                                    type: "total",
                                    exp: 0n,
                                })
                            }
                        }
                        
                        scene.$board.save();
                    }
                } else if (waiter > 2) {
                    if (currentMode == "speed" && scene.$board.data.time <= 0 && game.boards["speed"]) {
                        splash("TIME'S UP");
                        gameOver();
                    }
                }
            } else {
                waiter = 0;
            }
        }
    }), "logic")

    function intro(x) {
        introFactor = 1 - ease.quart.out(Math.min(x / 2000, 1));
        if (x >= 2000) {
            scene.$board.clickthrough = false;
            isAnimating = false;
            return true;
        }
    }

    function splash(text) {
        function bounce (x) {
            const c4 = (2 * Math.PI) / 3;
            
            return x === 0
                ? 0
                : x === 1
                ? 1
                : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
        }
        function anim1(x) {
            if (!scene.$board) return true;
            scene.$board.$splash.scale = 50 * bounce(x / 3000);
            scene.$board.$splash.size.x = 10 * scene.$board.$splash.scale;
            scene.$board.$splash.alpha = 3 - x / 1000;
            if (x >= 3000) {
                return true;
            }
        }

        scene.$board.$splash.text = text;
        startAnimation(anim1);
    }

    function levelUp() {
        function anim1(x) {
            introFactor = ease.quart.in(clamp01((x - 1000) / 1000));
            if (x >= 2500) {

                let exp = getAwardXP(scene.$board.exp);

                scene.$board.data.level++;

                rankBarLevelPopup(exp, () => {
                    for (let x = 0; x < board.width; x++) {
                        for (let y = 0; y < board.height; y++) {
                            let tile = board.tiles[x + y * 100];
                            tile.offset = { x: 0, y: board.height + (mainCanvas.height / 1000) / scale * board.height + Math.random() };
                            tile.velocity = { x: 0, y: board.height - y * 2 - 5 };
                        }
                    }
                    startAnimation(intro);
                    setTimeout(() => splash("LEVEL " + scene.$board.data.level.toLocaleString("en-US")), 2000);
                });
                scene.$board.exp = 0n;
                scene.$board.speed = 0.25;
                
                let board = scene.$board.board;
                board.scramble();

                isAnimating = false;

                scene.$board.save();
                return true;
            }
        }

        isAnimating = true;

        scene.$board.clickthrough = true;
        splash("LEVEL COMPLETED");
        startAnimation(anim1);
    }

    function gameOver() {
        delete game.boards[currentMode];
        save();
        setTimeout(() => popups.result(), 3000);
    }

    scene.$board.load();
    scene.$logic.onupdate();
    startAnimation(intro);
    setTimeout(() => splash("GO"), 2000);
}
