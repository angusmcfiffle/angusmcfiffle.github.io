function Ex(x, y, ex = 0, ey = 0) {
    return { x, y, ex, ey };
}

function Rect(x, y, width = 0, height = 0) {
    return { x, y, width, height };
}

function Board(args = {}) {
    let board = {

        width: 8,
        height: 8,
        types: 7,
        tiles: {},

        alwaysHaveMoves: true,

        get(x, y) {
            return this.tiles[x + y * 100]
        },
        refill() {
            let fills = [];
            let check = true;

            for (let x = 0; x < this.width; x++) {
                let cy = this.height - 1;
                for (let y = cy; y >= 0; y--) {
                    if (this.tiles[x + y * 100]) {
                        check &&= !["fade", "power-fade"].includes(this.tiles[x + y * 100].anim);
                        
                        if (this.tiles[x + y * 100].anim || this.tiles[x + y * 100].swapCheck !== undefined) {
                            cy = y - 1;
                        } else {
                            if (y != cy) {
                                this.tiles[x + cy * 100] = this.tiles[x + y * 100];
                                this.tiles[x + cy * 100].offset.y += cy - y;
                                this.tiles[x + y * 100] = null;
                            }
                            cy--;
                        }
                    }
                }
                if (cy >= 0) {
                    for (let y = 0; y <= cy; y++) {
                        let yPos = Math.max(
                            cy - y + (mainCanvas.height / 800) / scale * this.height - 5,
                            this.tiles[x + (y - 1) * 100]?.offset.y ?? 0,
                        )
                        this.tiles[x + y * 100] = {
                            type: Math.floor(Math.random() * this.types),
                            offset: { x: 0, y: yPos },
                            velocity: { x: 0, y: cy - y },
                            lifetime: 0,
                        }
                        fills.push(x + y * 100);
                    }
                }
            }

            if (this.alwaysHaveMoves && check && fills.length > 0) {
                while (this.findValidMoves().count == 0) {
                    for (let tile of fills) {
                        this.tiles[tile].type = Math.floor(Math.random() * this.types);
                    }
                }
            }

            return fills;
        },
        scramble() {
            do {
                let keys = Object.keys(this.tiles).filter(x => !this.tiles[x].anim);
                let values = keys.map(x => this.tiles[x]);
                for (let key of keys) {
                    let index = Math.floor(Math.random() * values.length);
                    if (this.tiles[key].power == "countdown") this.tiles[key].power = "";
                    this.tiles[key] = values.splice(index, 1)[0];
                }
                console.log(this.tiles);
            } while (this.findMatches().count > 0 || this.findValidMoves().count == 0);
        },
        findMatches() {
            let hozTiles = {}, vetTiles = {}, matches = { count: 0 };
            for (let x = 0; x < this.width; x++) {
                for (let y = 0; y < this.height; y++) {
                    let tile = this.get(x, y);

                    if (!tile) continue;
                    if (tile.type >= 7) continue;

                    if (hozTiles[x + y * 100] === undefined && x < this.width - 2) {
                        let hoz = 1;
                        for (hoz; hoz < this.width - x; hoz++) {
                            if (tile.type == this.get(x + hoz, y)?.type) {
                                hozTiles[x + hoz + y * 100] = x + y * 100;
                            } else {
                                break;
                            }
                        }
                        if (hoz >= 3) {
                            for (let h = 0; h < hoz; h++) {
                                hozTiles[x + h + y * 100] = x + y * 100;
                            }
                            matches[x + y * 100] = {
                                hozStart: x + y * 100,
                                hozLength: hoz,
                            }
                            matches.count++;
                        }
                    }
                    if (vetTiles[x + y * 100] === undefined && y < this.height - 2) {
                        let vet = 1;
                        let hozIndex = x + y * 100;
                        for (vet; vet < this.height - y; vet++) {
                            if (tile.type == this.get(x, y + vet)?.type) {
                                let ind = x + (y + vet) * 100
                                vetTiles[ind] = x + y * 100;
                                if (hozTiles[ind]) hozIndex = hozTiles[ind];
                            } else {
                                break;
                            }
                        }
                        if (vet >= 3) {
                            vetTiles[x + y * 100] = x + y * 100;
                            if (matches[hozIndex] && !matches[hozIndex].vetLength) {
                                matches[hozIndex].vetStart = x + y * 100;
                                matches[hozIndex].vetLength = vet;
                                matches.count++;
                            } else if (matches[x + y * 100] && !matches[x + y * 100].vetLength) {
                                matches[x + y * 100].vetStart = x + y * 100;
                                matches[x + y * 100].vetLength = vet;
                                matches.count++;
                            } else {
                                matches[x + y * 100] = {
                                    vetStart: x + y * 100,
                                    vetLength: vet,
                                }
                                matches.count++;
                            }
                        }
                    }
                }
            }
            return matches;
        },
        findValidMoves() {
            let moves = { count: 0 };
            for (let y = 0; y < this.height; y++) {
                for (let x = 0; x < this.width - 1; x++) {
                    let tileA = this.tiles[x + y * 100];
                    let tileB = this.tiles[x + y * 100 + 1];
                    if (!tileA || tileA.fade || !tileB || tileB.fade) continue;
                    if (tileA.type == tileB.type) continue;
                    
                    if (tileA.type >= 7 || tileB.type >= 7) {
                        moves[x + y * 100] = { hoz: true };
                        moves.count++;
                        continue;
                    }

                    let counter = 0;
                    if (tileA.type == this.tiles[x + y * 100 - 99]?.type) {
                        counter++;
                        if (tileA.type == this.tiles[x + y * 100 - 199]?.type) {
                            counter++;
                        }
                    }
                    if (tileA.type == this.tiles[x + y * 100 + 101]?.type) {
                        counter++;
                        if (tileA.type == this.tiles[x + y * 100 + 201]?.type) {
                            counter++;
                        }
                    }
                    if (counter >= 2 || (
                        tileA.type == this.tiles[x + y * 100 + 2]?.type && 
                        tileA.type == this.tiles[x + y * 100 + 3]?.type
                    )) {
                        moves[x + y * 100] = { hoz: true };
                        moves.count++;
                        continue;
                    }

                    counter = 0;
                    if (tileB.type == this.tiles[x + y * 100 + 100]?.type) {
                        counter++;
                        if (tileB.type == this.tiles[x + y * 100 + 200]?.type) {
                            counter++;
                        }
                    }
                    if (tileB.type == this.tiles[x + y * 100 - 100]?.type) {
                        counter++;
                        if (tileB.type == this.tiles[x + y * 100 - 200]?.type) {
                            counter++;
                        }
                    }
                    if (counter >= 2 || (
                        tileB.type == this.tiles[x + y * 100 - 1]?.type && 
                        tileB.type == this.tiles[x + y * 100 - 2]?.type
                    )) {
                        moves[x + y * 100] = { hoz: true };
                        moves.count++;
                        continue;
                    }
                }
            }
            for (let x = 0; x < this.width; x++) {
                for (let y = 0; y < this.height - 1; y++) {
                    let tileA = this.tiles[x + y * 100];
                    let tileB = this.tiles[x + y * 100 + 100];
                    if (!tileA || tileA.fade || !tileB || tileB.fade) continue;
                    if (tileA.type == tileB.type) continue;
                    
                    if (tileA.type >= 7 || tileB.type >= 7) {
                        moves[x + y * 100] = { ...moves[x + y * 100], vet: true };
                        moves.count++;
                        continue;
                    }

                    let counter = 0;
                    if (tileA.type == this.tiles[x + y * 100 + 99]?.type) {
                        counter++;
                        if (tileA.type == this.tiles[x + y * 100 + 98]?.type) {
                            counter++;
                        }
                    }
                    if (tileA.type == this.tiles[x + y * 100 + 101]?.type) {
                        counter++;
                        if (tileA.type == this.tiles[x + y * 100 + 102]?.type) {
                            counter++;
                        }
                    }
                    if (counter >= 2 || (
                        tileA.type == this.tiles[x + y * 100 + 200]?.type && 
                        tileA.type == this.tiles[x + y * 100 + 300]?.type
                    )) {
                        moves[x + y * 100] = { ...moves[x + y * 100], vet: true };
                        moves.count++;
                        continue;
                    }

                    counter = 0;
                    if (tileB.type == this.tiles[x + y * 100 - 1]?.type) {
                        counter++;
                        if (tileB.type == this.tiles[x + y * 100 - 2]?.type) {
                            counter++;
                        }
                    }
                    if (tileB.type == this.tiles[x + y * 100 + 1]?.type) {
                        counter++;
                        if (tileB.type == this.tiles[x + y * 100 + 2]?.type) {
                            counter++;
                        }
                    }
                    if (counter >= 2 || (
                        tileB.type == this.tiles[x + y * 100 - 100]?.type && 
                        tileB.type == this.tiles[x + y * 100 - 200]?.type
                    )) {
                        moves[x + y * 100] = { ...moves[x + y * 100], vet: true };
                        moves.count++;
                        continue;
                    }
                }
            }
            return moves
        },
        doMatches(matches) {
            if (matches.count == 0) return;

            for (let id in matches) {
                let match = matches[id];
                if (match.hozLength) {
                    for (let c = 0; c - match.hozLength; c++) {
                        this.tiles[match.hozStart + c] = null;
                    }
                }
                if (match.vetLength) {
                    for (let c = 0; c - match.vetLength; c++) {
                        this.tiles[match.vetStart + c * 100] = null;
                    }
                }
            }

            this.refill();
        },
        ...args,
    }

    // Initialization
    {
        for (let x = 0; x < board.width; x++) {
            for (let y = 0; y < board.height; y++) {
                board.tiles[x + y * 100] = {
                    type: Math.floor(Math.random() * board.types),
                    offset: { x: 0, y: 0 },
                    velocity: { x: 0, y: 0 },
                }
            }
        }

        let matches;
        while ((matches = board.findMatches()).count) board.doMatches(matches);

        for (let x = 0; x < board.width; x++) {
            for (let y = 0; y < board.height; y++) {
                let tile = board.tiles[x + y * 100];
                tile.offset = { x: 0, y: board.height + (mainCanvas.height / 1000) / scale * board.height + Math.random() };
                tile.velocity = { x: 0, y: board.height - y * 2 - 5 };
            }
        }
    }

    return board;
}

function ButtonWithText(parent, args, text, onclick, id) {
    let button;
    parent.append(button = controls.button({
        fill: "#aaa7",
        onclick,
        ...args
    }), id)
    button.append(controls.rect({
        position: Ex(2, 2),
        size: Ex(-4, -4, 100, 100),
        fill: "#000a",
    }), "fill")
    button.append(controls.label({
        position: Ex(0, 0, 50, 50),
        scale: 25,
        text,
    }), "text")
    return button;
}


function getRankData() {
    let level, goal;

    while (true) {
        level = game.stats.level - 1n;
        goal = 2500n + 1475n * level + 25n * level * level;
        if (game.stats.exp >= goal) {
            game.stats.exp -= goal;
            game.stats.level ++;
        } else break;
    }

    return {level, goal}
}

function rankBarLevelPopup(exp, onDone, popup = null) {
    game.stats.exp += exp;
    game.stats.totalExp += exp;

    if (!popup) {
        scene.append(popup = controls.rect({
            position: Ex(-270, -90, 50, 50),
            size: Ex(540, 180),
            fill: "#444",
            alpha: 0,
        }))
        popup.append(controls.rect({
            position: Ex(4, 4),
            size: Ex(-8, -8, 100, 100),
            fill: "#0007",
        }), "fill")
    
        popup.append(controls.gembar({
            position: Ex(-249, -28, 50, 50),
            size: Ex(498, 56),
            fill: "#777a",
        }), "progress")
        popup.$progress.append(controls.label({
            position: Ex(10, -25),
            align: "left",
            scale: 25,
        }), "rank")
        popup.$progress.append(controls.label({
            position: Ex(-10, -25, 100),
            align: "right",
            style: "italic",
            scale: 25,
        }), "title")
        popup.$progress.append(controls.label({
            position: Ex(0, 30, 50, 100),
            scale: 25,
        }), "goal")
    }

    let popup2;
    scene.append(popup2 = controls.rect({
        position: Ex(-150, -180, 50, 50),
        size: Ex(300, 60),
        fill: "#444",
        alpha: 0,
    }))
    popup2.append(controls.rect({
        position: Ex(4, 4),
        size: Ex(-8, -8, 100, 100),
        fill: "#0007",
    }), "fill")
    popup2.append(controls.label({
        position: Ex(0, 0, 50, 50),
        scale: 25,
    }), "add")

    function init() {
        game.stats.exp -= exp;
        let {level, goal} = getRankData();
        popup.$progress.progress = Number(game.stats.exp) / Number(goal);
        popup.$progress.$rank.text = "Rank " + game.stats.level.toLocaleString("en-US");
        popup.$progress.$title.text = titles[level] || titles[titles.count - 1];
        popup.$progress.$goal.text = (goal - game.stats.exp).toLocaleString("en-US") + " XP to next level";
        popup2.$add.text = "+" + (exp).toLocaleString("en-US") + " XP";
        startAnimation(anim1);
    }

    function anim1(x) {
        popup.alpha = ease.quart.inout(clamp01(x / 300));
        popup.position.y = -40 - 50 * ease.quart.inout(clamp01(x / 300));
        popup2.alpha = ease.quart.inout(clamp01((x - 300) / 300));
        popup2.position.y = -230 + 50 * ease.quart.inout(clamp01((x - 300) / 300));
        if (x > 600) {
            setTimeout(() => startAnimation(anim2), 1000);
            return true;
        }
    }

    let totalExp = Number(exp);
    let levelUpCooldown = 0;
    function anim2(x) {
        levelUpCooldown -= delta;
        if (levelUpCooldown > 0) return;

        let {level, goal} = getRankData();
        let inc = BigInt(Math.ceil(Math.max(totalExp / 5000, Number(goal) / 5000) * delta));
        if (inc > exp) inc = exp;
        if (inc > goal - game.stats.exp) inc = goal - game.stats.exp;
        game.stats.exp += inc;
        exp -= inc;
        
        popup.$progress.progress = Number(game.stats.exp) / Number(goal);
        popup.$progress.$rank.text = "Rank " + game.stats.level.toLocaleString("en-US");
        popup.$progress.$title.text = titles[level] || titles[titles.count - 1];
        popup.$progress.$goal.text = (goal - game.stats.exp).toLocaleString("en-US") + " XP to next level";
        popup2.$add.text = "+" + (exp).toLocaleString("en-US") + " XP";

        if (game.stats.exp >= goal) {
            levelUpCooldown = 800;
        } else if (exp == 0) {
            setTimeout(() => startAnimation(anim3), 1500);
            return true;
        }
    }

    function anim3(x) {
        popup.alpha = 1 - ease.quart.in(clamp01(x / 500));
        popup.position.y = -90 + 50 * ease.quart.in(clamp01(x / 500));
        popup2.alpha = 1 - ease.quart.in(clamp01(x / 500));
        popup2.position.y = -180 - 50 * ease.quart.in(clamp01(x / 500));
        if (x > 500) {
            scene.remove(popup);
            scene.remove(popup2);
            onDone?.();
            return true;
        }
    }

    requestAnimationFrame(init)
}

function formatDuration(ms) {
    let txt = Math.floor((ms /= 60000) % 60) + "m";
    if ((ms /= 60) >= 1) txt = Math.floor(ms % 24) + "h " + txt;
    if ((ms /= 24) >= 1) txt = Math.floor(ms) + "d " + txt;
    return txt
}

function getAwardXP(exp) {
    let min = (...args) => args.reduce((m, e) => e < m ? e : m);

    if (currentMode == "classic") exp = exp * min(100n + scene.$board.data.level * 5n, 200n) / 100n;
    if (currentMode == "action") exp = exp * min(75n + scene.$board.data.level * 5n, 200n) / 100n;
    if (currentMode == "speed") exp = exp * min(100n + scene.$board.data.maxLevel * 3n, 200n) / 100n;
    return exp;
}

function getLevelGoal(level) {
    return currentMode == "classic" ? 150 + 150 * level : 
           currentMode == "action" ? 150 + 250 * level :
           currentMode == "endless" ? Math.min(250 + 250 * level, 5000) :
           Infinity;
}