let controls = {
    base(args) {
        return {
            id: "",
            controls: [],
            append(ct, id = "") {
                this.controls.push(ct);
                if (id) {
                    this["$" + id] = ct;
                    ct.id = id;
                }
            },
            remove(ct) {
                let index = this.controls.indexOf(ct);
                if (index > 0) {
                    this.controls.splice(index, 1);
                    if (ct.id && this.controls["$" + ct.id]) delete this.controls["$" + ct.id];
                }
            },

            position: Ex(0, 0),
            size: Ex(0, 0),
            rect: Rect(0, 0),

            alpha: 1,
            clickthrough: false,

            __mouseIn: false,

            render() {},

            onupdate() {},
            onpointerin() {},
            onpointerout() {},
            onpointerdown() {},
            onpointermove() {},
            onpointerup() {},
            onmousewheel() {},
            ...args
        }
    },
    rect(args) {
        return {
            ...controls.base(),
            fill: "white",
            radius: 0,

            render() {
                ctx.fillStyle = this.fill;
                if (this.radius) {
                    let radius = this.radius * scale;
                    ctx.beginPath();
                    ctx.moveTo(this.rect.x + radius, this.rect.y);
                    ctx.arc(
                        this.rect.x + this.rect.width - radius, 
                        this.rect.y + radius,
                        radius, Math.PI * -.5, 0
                    );
                    ctx.arc(
                        this.rect.x + this.rect.width - radius, 
                        this.rect.y + this.rect.height - radius,
                        radius, 0, Math.PI * .5
                    );
                    ctx.arc(
                        this.rect.x + radius,
                        this.rect.y + this.rect.height - radius, 
                        radius, Math.PI * .5, Math.PI
                    );
                    ctx.arc(
                        this.rect.x + radius, 
                        this.rect.y + radius,
                        radius, Math.PI, Math.PI * 1.5
                    );
                    ctx.fill();
                } else {
                    ctx.fillRect(this.rect.x, this.rect.y, this.rect.width, this.rect.height);
                }
            },
            ...args
        }
    },
    image(args) {
        return {
            ...controls.base(),
            src: "",

            render() {
                ctx.drawImage(this.src, this.rect.x, this.rect.y, this.rect.width, this.rect.height);
            },
            ...args
        }
    },
    button(args) {
        return {
            ...controls.rect(),

            fillHover: "#fff7",
            fillActive: "#0003",

            __mouseActive: false,

            onpointerin() {
                mainCanvas.style.cursor = "pointer";
            },

            onpointerout() {
                mainCanvas.style.cursor = "";
            },

            onpointerdown() {
                this.__mouseActive = true;
                let handler = (e) => {
                    this.__mouseActive = false;
                    if (this.__mouseIn) this.onclick();
                    document.removeEventListener("pointerup", handler);
                }
                document.addEventListener("pointerup", handler);
            },

            onclick() {},
            
            render() {
                ctx.fillStyle = this.fill;
                
                let level = this.__mouseActive * this.__mouseIn;
                if (!isTouch) level += this.__mouseIn 

                if (this.radius) {
                    let radius = this.radius * scale;
                    ctx.beginPath();
                    ctx.moveTo(this.rect.x + radius, this.rect.y);
                    ctx.arc(
                        this.rect.x + this.rect.width - radius, 
                        this.rect.y + radius,
                        radius, Math.PI * -.5, 0
                    );
                    ctx.arc(
                        this.rect.x + this.rect.width - radius, 
                        this.rect.y + this.rect.height - radius,
                        radius, 0, Math.PI * .5
                    );
                    ctx.arc(
                        this.rect.x + radius,
                        this.rect.y + this.rect.height - radius, 
                        radius, Math.PI * .5, Math.PI
                    );
                    ctx.arc(
                        this.rect.x + radius, 
                        this.rect.y + radius,
                        radius, Math.PI, Math.PI * 1.5
                    );
                    ctx.fill();
                    if (level >= 1) {
                        ctx.fillStyle = this.fillHover;
                        ctx.fill();
                        if (level >= 2) {
                            ctx.fillStyle = this.fillActive;
                            ctx.fill();
                        }
                    }
                } else {
                    ctx.fillRect(this.rect.x, this.rect.y, this.rect.width, this.rect.height);
                    if (level >= 1) {
                        ctx.fillStyle = this.fillHover;
                        ctx.fillRect(this.rect.x, this.rect.y, this.rect.width, this.rect.height);
                        if (level >= 2) {
                            ctx.fillStyle = this.fillActive;
                            ctx.fillRect(this.rect.x, this.rect.y, this.rect.width, this.rect.height);
                        }
                    }
                }
            },

            ...args
        }
    },
    label(args) {
        return {
            ...controls.base(),
            fill: "white",
            stroke: "#0000",
            thickness: 4,
            text: "",
            scale: 16,
            style: "normal",
            font: fontFamily,
            align: "center",
            baseline: "middle",
            wrap: false,
            lines: [],
            oldArgs: {},

            render() {
                ctx.fillStyle = this.fill;
                ctx.strokeStyle = this.stroke;
                ctx.lineWidth = this.thickness * scale;
                ctx.textAlign = this.align;
                ctx.textBaseline = this.baseline;
                ctx.font = this.style + " " + (this.scale * scale) + "px " + this.font;

                let lines;
                let pos = this.rect.y;

                if (this.oldArgs.width == this.rect.width && this.oldArgs.height == this.rect.height && this.oldArgs.font == ctx.font && this.oldArgs.text == this.text) {
                    lines = this.lines;
                } else if (!this.wrap) {
                    lines = this.text.split("\n");
                } else {
                    let newLines = [];
                    for (let line of this.text.split("\n")) {
                        let words = line.split(" ");
                        let newLine = "";
                        for (let word of words) {
                            if (ctx.measureText(newLine + word).width > this.rect.width) {
                                newLines.push(newLine);
                                newLine = word + " ";
                            } else {
                                newLine += word + " ";
                            }
                        }
                        newLines.push(newLine);
                    }
                    lines = newLines;
                }

                this.oldArgs = {
                    width: this.rect.width,
                    height: this.rect.height,
                    font: ctx.font,
                    text: this.text
                }

                for (let line of lines) {
                    ctx.strokeText(line, this.rect.x, pos);
                    ctx.fillText(line, this.rect.x, pos);
                    pos += this.scale * scale * 1.2;
                }

                this.lines = lines;
            },
            ...args
        }
    },
    input(args) {
        let ct = {
            ...controls.button(),
            value: "",
            type: "text",
            maxlength: null,
            mask: true,
            fillHover: "#fff3",
            fillActive: "#0000",
            element: null,
            
            onpointerin() {
                mainCanvas.style.cursor = "text";
            },

            onclick() {
                let input = document.createElement("input");
                input.value = this.value;
                input.type = this.type;
                input.maxlength = this.maxlength + "";

                let handler = (e) => {
                    if (!this.__mouseIn) input.blur();
                };
                
                blurHandler = () => {
                    input.remove();
                    document.removeEventListener("pointerdown", handler);
                    this.element = null;
                }

                input.oninput = () => {
                    this.value = input.value;
                    if (this.maxlength) this.value = this.value.substring(0, this.maxlength);
                    input.value = this.value;
                }
                input.onblur = () => {
                    blurHandler();
                }

                document.addEventListener("pointerdown", handler)
                document.body.append(input);
                input.focus();
                this.element = input;
            },

            onupdate() {
                this.$content.text = this.value;
                if (this.element) {
                    this.element.time = (this.element.time ?? 0) + delta;
                    ctx.font = this.$content.style + " " + (this.$content.scale) + "px " + this.$content.font;
                    let widthStart = ctx.measureText(this.element.value.substring(0, this.element.selectionStart)).width;
                    let widthEnd = this.element.selectionStart == this.element.selectionEnd ? widthStart : ctx.measureText(this.element.value.substring(0, this.element.selectionEnd)).width;
                    this.$caret.alpha = Math.cos(this.element.time / 500) / 2 + .5;
                    this.$caret.position.x = (this.element.selectionDirection == "forward" ? widthEnd : widthStart) + this.$content.position.x;
                    if (widthStart != widthEnd) {
                        this.$selection.alpha = 1;
                        this.$selection.position.x = widthStart + this.$content.position.x;
                        this.$selection.size.x = widthEnd - widthStart;
                    } else {
                        this.$selection.alpha = 0;
                    }
                } else {
                    this.$caret.alpha = 0;
                    this.$selection.alpha = 0;
                }
            },

            ...args
        }
        ct.append(controls.rect({
            position: Ex(30, -15, 0, 50),
            size: Ex(2, 30),
            fill: "#7af7",
        }), "selection")
        ct.append(controls.rect({
            position: Ex(30, -15, 0, 50),
            size: Ex(2, 30),
            fill: "#fff",
        }), "caret")
        ct.append(controls.label({
            position: Ex(30, 0, 0, 50),
            scale: 25,
            font: fontFamily,
            align: "left",
        }), "content")
        return ct;
    },
    gembar(args) {
        return {
            ...controls.rect(),

            progress: 0,

            borderWidth: 4,
            tileSize: 8,
            
            render() {
                ctx.fillStyle = this.fill;
                ctx.fillRect(
                    this.rect.x, this.rect.y, 
                    this.rect.width, this.rect.height
                );

                ctx.fillStyle = "#0007";
                ctx.fillRect(
                    this.rect.x + this.borderWidth * scale, this.rect.y + this.borderWidth * scale, 
                    this.rect.width - this.borderWidth * scale * 2, this.rect.height - this.borderWidth * scale * 2
                );

                let width = Math.round((this.rect.width / scale - this.borderWidth * 2) / this.tileSize);
                let height = Math.round((this.rect.height / scale - this.borderWidth * 2) / this.tileSize);
                let area = width * height;
                let fillArea = this.progress * area;

                let count = 0;

                ctx.strokeStyle = "#0007";
                ctx.lineWidth = 1 * scale;

                loop:
                for (let x = 0; x < width; x++) {
                    for (let y = 0; y < height; y++) {
                        count++;
                        if (count > fillArea) break loop;
                        ctx.fillStyle = "hsl(" + ((time / 50 + (x + y) * 5) % 360) + "deg, 100%, 80%)";
                        ctx.fillRect(
                            this.rect.x + (this.borderWidth + this.tileSize * x) * scale, 
                            this.rect.y + (this.borderWidth + this.tileSize * y) * scale, 
                            this.tileSize * scale, this.tileSize * scale
                        );
                        ctx.strokeRect(
                            this.rect.x + (this.borderWidth + this.tileSize * x + 0.5) * scale, 
                            this.rect.y + (this.borderWidth + this.tileSize * y + 0.5) * scale, 
                            (this.tileSize - 1) * scale, (this.tileSize - 1) * scale
                        );
                    }
                }
            },

            ...args
        }
    },
    scroller(args) {
        let ct = {
            ...controls.rect(),

            __mouseActive: false,
            scrollPos: 0,
            scrollSpd: 0,
            mask: true,

            onupdate() {
                let max = Math.max((this.$content.rect.height - this.rect.height) / scale, 0);

                if (!this.__mouseActive) {
                    this.scrollPos += this.scrollSpd * delta / 1000;
                    this.scrollSpd *= 0.1 ** (delta / 1000);
                    if (this.scrollPos > 0) {
                        this.scrollSpd *= 1e-3 ** (delta / 1000);
                        this.scrollPos *= 1e-3 ** (delta / 1000);
                    } else if (this.scrollPos < -max) {
                        let p = this.scrollPos + max;
                        this.scrollSpd *= 1e-3 ** (delta / 1000);
                        this.scrollPos = -max + p * 1e-3 ** (delta / 1000);
                    }
                }

                this.$content.position.y = this.scrollPos;

                if (this.$content.position.y > 0) {
                    this.$content.position.y -= this.scrollPos * (1 - 1 / (1 + this.scrollPos / 150));
                } else if (this.$content.position.y < -max) {
                    let p = this.scrollPos + max;
                    this.$content.position.y -= p * (1 - 1 / (1 - p / 150));
                }
            },

            onpointerdown(pos, args) {
                this.__mouseActive = true;
                let startPos = mousePos;
                let startScr = this.scrollPos;
                let scrTime = time;
                let isScrolling = false;
                let movehandler = (e) => {
                    let pos = {
                        x: e.clientX * resScale,
                        y: e.clientY * resScale,
                    }
                    if (!isScrolling && Math.abs(startPos.y - pos.y) < 10 * scale) return;
                    isScrolling = true;
                    let d = startScr + (pos.y - startPos.y) / scale;
                    this.scrollSpd = (d - this.scrollPos) / delta * 1000;
                    this.scrollPos = d;
                    this.$content.clickthrough = true;
                    scrTime = time;
                }
                let uphandler = (e) => {
                    this.__mouseActive = false;
                    if (Math.abs(this.scrollSpd) < 20 || time - scrTime > 100) this.scrollSpd = 0;
                    this.$content.clickthrough = false;

                    document.removeEventListener("pointermove", movehandler);
                    document.removeEventListener("pointerup", uphandler);
                }
                document.addEventListener("pointermove", movehandler);
                document.addEventListener("pointerup", uphandler);
            },

            onmousewheel(pos, args) {
                this.scrollPos -= Math.sign(args.deltaY) * 50;
            },

            render() {
                ctx.fillStyle = this.fill;
                ctx.fillRect(this.rect.x, this.rect.y, this.rect.width, this.rect.height);
                let fraction = this.$content.rect.height / this.rect.height;
                if (fraction > 1) {
                    ctx.fillStyle = "#aaa";
                    let offset = (this.rect.y - this.$content.rect.y);
                    ctx.fillRect(
                        this.rect.x + this.rect.width - 5 * scale, 
                        this.rect.y + this.rect.height * offset / this.rect.height / fraction, 
                        5 * scale, 
                        this.rect.height / fraction
                    );
                } 
            },

            ...args
        }
        ct.append(controls.base({
            size: Ex(0, 0, 100),
        }), "content")
        return ct;
    },
    board(args) {
        return {
            ...controls.base(),
            board: Board(),
            back1: "#666666cc",
            back2: "#888888cc",

            swapPos: null,
            matches: {count: 0},
            moves: {count: -1},
            fallCount: 0,

            score: 0n,
            lerpScore: 0,
            exp: 0n,

            cascade: 0,
            powerCascade: 0,
            scoreCascade: 0n,
            expCascade: 0n,
            
            scorePopups: [],
            effects: [],

            hint: null,
            hintCooldown: 0,
            hintAutoTimer: 0,

            paused: false,
            pauseTimer: 0,
            pauseFader: 0,
            speed: 0.25,

            speedMulti: 1,
            scoreMulti: 1n,

            __mouseActive: false,
            onupdate() {
                if (this.paused) return;
                
                let matched = false;
                let matchScores = [];
                let matchTiles = {};
                let powerScores = [];
                let powers = [];
                for (let id in this.matches) {
                    if (id == "count") continue;
                    let match = this.matches[id];
                    let matchable = true;
                    let tiles = {};
                    let manual = false;

                    let powerHoz = [];
                    if (match.hozLength) {
                        for (let c = 0; c - match.hozLength; c++) {
                            let tile = this.board.tiles[match.hozStart + c];
                            matchable &&= tile && !tile.offset.y && !tile.anim;
                            tiles[match.hozStart + c] = (tiles[match.hozStart + c] ?? 0) + 1;
                            if (tile && tile.swapCheck !== undefined) {
                                manual = true;
                                powerHoz.unshift(match.hozStart + c);
                                this.board.tiles[match.hozStart + c].isMatch = true;
                            } else {
                                powerHoz.push(match.hozStart + c);
                            }
                        }
                    }

                    let powerVet = [];
                    if (match.vetLength) {
                        for (let c = 0; c - match.vetLength; c++) {
                            let tile = this.board.tiles[match.vetStart + c * 100];
                            matchable &&= tile && !tile.offset.y && !tile.anim;
                            tiles[match.vetStart + c * 100] = (tiles[match.vetStart + c * 100] ?? 0) + 1;
                            if (tile && tile.swapCheck !== undefined) {
                                manual = true;
                                powerVet.unshift(match.vetStart + c * 100);
                                this.board.tiles[match.vetStart + c * 100].isMatch = true;
                            } else {
                                powerVet.push(match.vetStart + c * 100);
                            }
                        }
                    }

                    if (matchable) {
                        let popup;
                        if (match.hozLength) matchScores.push(popup = {
                            pos: {
                                x: (match.hozStart % 100) + match.hozLength / 2,
                                y: Math.floor(match.hozStart / 100) + .5,
                            },
                            color: this.board.tiles[match.hozStart].type,
                            score: 50n * 3n ** BigInt(match.hozLength - 3),
                            exp: 2n * BigInt(match.hozLength) - 3n,
                            manual
                        });
                        if (match.vetLength) matchScores.push(popup = {
                            pos: {
                                x: (match.vetStart % 100) + .5,
                                y: Math.floor(match.vetStart / 100) + match.vetLength / 2,
                            },
                            color: this.board.tiles[match.vetStart].type,
                            score: 50n * 3n ** BigInt(match.vetLength - 3),
                            exp: 2n * BigInt(match.vetLength) - 3n,
                            manual
                        });

                        if (powerHoz.length >= 4) powers.push(powerHoz);
                        if (powerVet.length >= 4) powers.push(powerVet);
                        
                        console.log(this.matches, tiles);

                        for (let tile in tiles) {
                            this.board.tiles[tile].popup = popup;
                            matchTiles[tile] = (matchTiles[tile] ?? 0) + tiles[tile];
                        }
                    }
                }

                let swapChecked = {};
                for (let id in this.board.tiles) {
                    let tile = this.board.tiles[id];
                    if (!tile) continue;

                    if (tile.swapCheck !== undefined) {
                        let swapid = tile.swapCheck;
                        let swap = this.board.tiles[tile.swapCheck];
                        swapChecked[swapid] = true;

                        if (swap?.swapCheck == id && !this.anim && !swap.anim) {
                            if (!swapChecked[id] && !tile.isMatch && !swap.isMatch) {
                                tile.anim = "swap";
                                tile.animTime = 1e-6;
                                tile.animArgs = { 
                                    revert: true,
                                    offset: { 
                                        x: (tile.swapCheck % 100) - (id % 100), 
                                        y: Math.floor(tile.swapCheck / 100) - Math.floor(id / 100), 
                                    }
                                };
                                swap.anim = "swap";
                                swap.animTime = 1e-6;
                                swap.animArgs = { 
                                    revert: true,
                                    offset: { 
                                        x: (id % 100) - (tile.swapCheck % 100), 
                                        y: Math.floor(id / 100) - Math.floor(tile.swapCheck / 100), 
                                    }
                                };
                                delete tile.swapCheck;
                                delete swap.swapCheck;
                            }
                            
                            delete tile.isMatch;
                            delete swap.isMatch;
                        } else {
                            delete tile.swapCheck;
                            delete swap?.swapCheck;
                        }
                    } 
                }
                    

                let fallCount = this.board.width * this.board.height;
                let swaps = {};
                for (let id of Object.keys(this.board.tiles).reverse()) {
                    let tile = this.board.tiles[id];
                    if (!tile) continue;
                    
                    tile.lifetime = (tile.lifetime || 0) + delta / 1000;
                    
                    if (tile.anim == "fade") {
                        tile.animTime += delta / (tile.animArgs.manual ? 250 : 500);
                        if (tile.animTime >= 1) {
                            if (tile.swapCheck !== undefined) {
                                delete this.board.tiles[tile.swapCheck]?.swapCheck;
                                delete tile.swapCheck;
                            }
                            this.board.tiles[id] = null;
                            matched = true;
                        }
                    } else if (tile.anim == "power-fade") {
                        tile.animTime += delta / 500;
                        if (tile.animTime >= 1) {
                            this.board.tiles[id] = null;
                            matched = true;
                        }
                    } else if (tile.anim == "power-match") {
                        tile.animTime -= delta / 1000;
                        if (tile.animArgs.pause) this.pauseTimer = Math.max(this.pauseTimer, tile.animArgs.pause);
                        if (tile.animTime <= 0) {
                            if (tile.animArgs.score) powerScores.push({
                                pos: {
                                    x: (id % 100) + (tile.offset.x) + .5, 
                                    y: Math.floor(id / 100) - (tile.offset.y) + .5, 
                                },
                                popup: tile.animArgs.popup,
                                color: tile.type,
                                score: tile.animArgs.score,
                                exp: tile.animArgs.exp
                            })
                            
                            if (tile.animArgs.fourd) {
                                tile.power = "cube";
                                tile.type = 7;
                                delete tile.anim
                                delete tile.animTime
                                delete tile.animArgs
                                delete matchTiles[id];
                            } else {
                                tile.anim = "power-fade";
                                tile.animTime = 0;
                                tile.animArgs = { manual: false };
                                matchTiles[id] = matchTiles[id] ?? 1;
                            }

                        }
                    } else if (tile.anim == "transform") {
                        tile.animTime -= delta / 1000;
                        if (tile.animTime <= 0) {
                            delete tile.anim;
                            delete tile.animTime;
                            delete tile.animArgs;
                        }
                    } else if (tile.anim == "swap") {
                        tile.animTime += delta / 250;
                        if (tile.animTime >= 1) {
                            swaps[+id + tile.animArgs.offset.x + tile.animArgs.offset.y * 100] = tile;
                            if (!tile.animArgs.revert) tile.swapCheck = id;
                            delete tile.anim;
                            delete tile.animTime;
                            delete tile.animArgs;
                            matched = true;
                        }
                    } else if (this.pauseTimer > 0) {
                        tile.velocity.y = 0;
                    } else if (tile.offset.y > 0 || tile.velocity.y != 0) {
                        let limit = 0;
                        let count = 1;
                        while (count * 100 + +id < this.board.height * 100) {
                            limit = Math.max((this.board.tiles[count * 100 + +id]?.offset.y - 0.001 || 0), limit);
                            count++;
                        }
                        tile.offset.y = Math.max(tile.offset.y + tile.velocity.y * delta * this.speed * this.speedMulti / 1000, limit);
                        tile.velocity.y = tile.offset.y > limit ? tile.velocity.y - delta * this.speed * this.speedMulti / 30 : Math.max(0, tile.velocity.y);
                    } else {
                        fallCount --;
                    }
                }

                for (let id in matchTiles) {
                    let toPower = "";
                    if (matchTiles[id] >= 2) {
                        toPower = "star";
                    }

                    let tile = this.board.tiles[id];
                    
                    let triggered;
                    if (!(triggered = tile.counted)) {
                        addTileToStats(tile);
                        tile.counted = true;
                    }

                    if (triggered) {

                    } else if (tile.type == 7) {
                        let power = tile.power;
                        let type = tile.trigger.type;
                        let [x, y] = [
                            id % 100,
                            Math.floor(id / 100) - Math.round(tile.offset.y),
                        ]
                        
                        let popup = tile.popup;
                        if (!popup || popup.lifetime >= 1) this.scorePopups.push(popup = {
                            pos: { x: +x + 0.5, y: +y + 0.5 },
                            color: type,
                            score: 0n,
                            exp: 0n,
                        });
                        console.log(popup);
                        
                        let effect; 
                        this.effects.push(effect = {
                            type: "free-lightning",
                            color: type,
                            pos: { x: +x + 0.5, y: +y + 0.5 },
                            targets: [],
                        });

                        for (let tid in this.board.tiles) {
                            let tTile = this.board.tiles[tid];
                            if (!tTile) continue;
                            let [px, py] = [
                                tid % 100,
                                Math.floor(tid / 100) - Math.round(tTile.offset.y),
                            ]
                            if (tTile.type == type && py >= -0.5 && (!tTile.anim || tTile.anim == "fade")) {
                                if (power == "fourd") {
                                    tTile.anim = "power-match";
                                    tTile.trigger = tile;
                                    tTile.popup = popup;
                                    tTile.animTime = (Math.abs(x - px) + Math.abs(y - py)) / 5 + 1;
                                    tTile.animArgs = { score: 250n, exp: 6n, pause: 500, popup, fourd: true };
                                } else if (power == "sphere") {
                                    tTile.anim = "power-match";
                                    tTile.trigger = tile;
                                    tTile.popup = popup;
                                    tTile.power = tTile.power ?? "flame";
                                    tTile.animTime = (Math.abs(x - px) + Math.abs(y - py)) / 5 + 1;
                                    tTile.animArgs = { score: 120n, exp: 4n, pause: 500, popup };
                                } else {
                                    tTile.anim = "power-match";
                                    tTile.trigger = tile;
                                    tTile.popup = popup;
                                    tTile.animTime = (Math.abs(x - px) + Math.abs(y - py)) / 10 + .8;
                                    tTile.animArgs = { score: 50n, exp: 3n, pause: 500, popup };
                                }
                                effect.targets.push({ x: px, y: py, tile: tTile });
                            }
                        }
                    } else if (tile.power == "star") {
                        let [x, y] = [
                            id % 100,
                            Math.floor(id / 100) - Math.round(tile.offset.y),
                        ]

                        let popup = tile.popup;
                        if (!popup || popup.lifetime >= 1) this.scorePopups.push(popup = {
                            pos: { x: +x + 0.5, y: +y + 0.5 },
                            color: tile.type,
                            score: 0n,
                            exp: 0n,
                        });
                        console.log(popup);

                        let effect; 
                        this.effects.push(effect = {
                            type: "lightning",
                            color: tile.type,
                            pos: { x: +x + 0.5, y: +y + 0.5 },
                            targets: [{ x, y, tile }],
                        });

                        for (let tid in this.board.tiles) {
                            let tTile = this.board.tiles[tid];
                            if (!tTile) continue;
                            let [px, py] = [
                                tid % 100,
                                Math.floor(tid / 100) - Math.round(tTile.offset.y),
                            ]
                            if ((x == px || y == py) && py >= -0.5 && (!tTile.anim || tTile.anim == "fade")) {
                                tTile.anim = "power-match";
                                tTile.animTime = (Math.abs(x - px) + Math.abs(y - py)) / 10 + .8;
                                tTile.animArgs = { score: 40n, exp: 2n, pause: 500, popup };
                                tTile.trigger = tile;
                                tTile.popup = popup;
                                effect.targets.push(tTile);
                            }
                        }
                    } else if (tile.power == "flame") {
                        let [x, y] = [
                            id % 100,
                            Math.floor(id / 100) - Math.round(tile.offset.y),
                        ]

                        let popup = tile.popup;
                        if (!popup || popup.lifetime >= 1) this.scorePopups.push(popup = {
                            pos: { x: +x + 0.5, y: +y + 0.5 },
                            color: tile.type,
                            score: 0n,
                            exp: 0n,
                        });
                        console.log(popup);

                        this.effects.push({
                            type: "explosion",
                            pos: { x: +x + 0.5, y: +y + 0.5 },
                        });

                        for (let tid in this.board.tiles) {
                            let tTile = this.board.tiles[tid];
                            if (!tTile) continue;
                            let [px, py] = [
                                tid % 100,
                                Math.floor(tid / 100) - Math.round(tTile.offset.y),
                            ]
                            if (Math.abs(x - px) < 1.25 && (!tTile.anim || tTile.anim == "fade")) {
                                if (Math.abs(y - py) < 1.25) {
                                    tTile.anim = "power-match";
                                    tTile.animTime = tid != id && tTile.power == "flame" ? 0.25 : 0;
                                    tTile.animArgs = { score: tTile.power == "flame" ? 60n : 15n, exp: 1n, popup };
                                    tTile.trigger = tile;
                                    tTile.popup = popup;
                                } else if (py - y < 0) {
                                    tTile.velocity.y = Math.max(tTile.velocity.y, 5.5 - Math.abs(x - px) * 0.5);
                                    this.speed = 0.4;
                                }
                            }
                        }
                    } else if (tile.power == "nova") {
                        let [x, y] = [
                            id % 100,
                            Math.floor(id / 100) - Math.round(tile.offset.y),
                        ]

                        let popup = tile.popup;
                        if (!popup || popup.lifetime >= 1) this.scorePopups.push(popup = {
                            pos: { x: +x + 0.5, y: +y + 0.5 },
                            color: tile.type,
                            score: 0n,
                            exp: 0n,
                        });
                        console.log(popup);

                        let targets = [{ x, y, tile }];

                        for (let tid in this.board.tiles) {
                            let tTile = this.board.tiles[tid];
                            if (!tTile) continue;
                            let [px, py] = [
                                tid % 100,
                                Math.floor(tid / 100) - Math.round(tTile.offset.y),
                            ]
                            if ((Math.abs(x - px) < 1.25 || Math.abs(y - py) < 1.25) && py >= -0.5 && (!tTile.anim || tTile.anim == "fade")) {
                                tTile.anim = "power-match";
                                tTile.animTime = (Math.abs(x - px) + Math.abs(y - py)) / 10 + .8;
                                tTile.animArgs = { score: 80n, exp: 2n, pause: 500, popup };
                                tTile.trigger = tile;
                                tTile.popup = popup;
                                targets.push(tTile);
                            }
                        }

                        for (let a = -1; a <= 1; a++) this.effects.push(effect = {
                            type: "lightning",
                            color: tile.type,
                            pos: { x: +x + 0.5 + a, y: +y + 0.5 + a },
                            targets,
                        });
                        this.effects.push({
                            type: "explosion",
                            pos: { x: +x + 0.5, y: +y + 0.5 },
                        });
                    } else if (tile.power == "countdown") {
                        let [x, y] = [
                            id % 100,
                            Math.floor(id / 100) - Math.round(tile.offset.y),
                        ]

                        let popup = tile.popup;
                        if (!popup || popup.lifetime >= 1) this.scorePopups.push(popup = {
                            pos: { x: +x + 0.5, y: +y + 0.5 },
                            color: tile.type,
                            score: 0n,
                            exp: 0n,
                        });

                        let weight = BigInt(tile.countdown) + this.data.level;

                        tile.anim = "power-match";
                        tile.animTime = 0;
                        tile.animArgs = { score: weight * 2n, exp: weight / 2n, popup };
                        tile.trigger = tile;
                        tile.popup = popup;
                    }

                    if (toPower) {
                        delete tile.counted;
                        delete tile.popup;
                        tile.anim = "transform";
                        tile.animTime = 1e-6;
                        if (tile.swapCheck !== undefined) {
                            delete this.board.tiles[tile.swapCheck]?.swapCheck;
                            delete tile.swapCheck;
                        }
                        tile.power = toPower;
                    } else if (!["fade", "power-fade", "power-match"].includes(tile.anim)) {
                        tile.anim = "fade";
                        tile.animTime = 1e-6;
                        tile.animArgs = { manual: tile.popup?.manual };
                    }
                }
                
                for (let power of powers) {
                    let tile;
                    for (tile of power) {
                        if (this.board.tiles[tile] && !this.board.tiles[tile].power) {
                            break;
                        }
                    }

                    tile = this.board.tiles[tile];

                    tile.power = {
                        4: "flame",
                        5: "cube",
                        6: "nova",
                        7: "sphere",
                        8: "fourd",
                    }[power.length] ?? "fourd";

                    if (["cube", "sphere", "fourd"].includes(tile.power)) {
                        tile.type = 7;
                    }
                    
                    tile.anim = "transform";
                    tile.lifetime = 0;
                    tile.animTime = 1e-6;
                    delete tile.counted;
                    delete tile.popup;
                }
                
                let manual;
                if (matchScores.length > 0) {
                    matchScores.sort((a, b) => Number(b.score - a.score));
                    for (let id in matchScores) {

                        if (matchScores[id].manual && !manual) {
                            this.cascade = 1;
                            this.powerCascade = 0;
                            this.scoreCascade = this.expCascade = 0n;
                            manual = true;
                        } else this.cascade++;

                        matchScores[id].score *= BigInt(this.cascade) * this.scoreMulti;
                        matchScores[id].exp += BigInt(this.cascade) * 3n;
                        this.score += matchScores[id].score;
                        this.scoreCascade += matchScores[id].score;
                        this.exp += matchScores[id].exp;
                        this.expCascade += matchScores[id].exp;
                        this.lerpScore += Number(matchScores[id].score);
                        if (game.options.scorePopups) this.scorePopups.push(matchScores[id]);
                    }
                }
                
                if (powerScores.length > 0) {
                    for (let id in powerScores) {
                        this.powerCascade++;
                        powerScores[id].score += BigInt(this.powerCascade);
                        powerScores[id].score *= this.scoreMulti;
                        powerScores[id].type = "power";
                        this.score += powerScores[id].score;
                        this.scoreCascade += powerScores[id].score;
                        this.exp += powerScores[id].exp;
                        this.expCascade += powerScores[id].exp;
                        this.lerpScore += Number(powerScores[id].score);
                        if (game.options.scorePopups) {
                            if (powerScores[id].popup) {
                                powerScores[id].popup.score += powerScores[id].score;
                                powerScores[id].popup.exp += powerScores[id].exp;
                                powerScores[id].popup.lifetime = 0;
                                if (this.scorePopups[this.scorePopups.length - 1] != powerScores[id].popup) {
                                    let index = this.scorePopups.indexOf(powerScores[id].popup);
                                    if (index >= 0) {
                                        this.scorePopups.splice(index, 1);
                                        this.scorePopups.push(powerScores[id].popup);
                                    }
                                }
                            } else {
                                this.scorePopups.push(powerScores[id]);
                            }
                        }
                    }
                }

                this.speed = Math.min(this.speed + delta / 1000 * this.speed, 1);
                this.pauseTimer -= delta;
                this.lerpScore *= 0.01 ** (delta / 1000);

                for (let id in swaps) {
                    this.board.tiles[id] = swaps[id];
                }

                if (matched) {
                    let fills = this.board.refill();
                    if (fills.length > 0) {
                        if (currentMode == "action") {
                            let factor = 0.1 * Number(this.data.level) * 0.5 ** Object.values(this.board.tiles).filter(x => x?.power == "countdown").length;
                            if (Math.random() < factor / (factor + 1)) {
                                let tile = fills[Math.floor(Math.random() * fills.length)];
                                this.board.tiles[tile].power = "countdown";
                                this.board.tiles[tile].countdown = Math.max(21 - Number(this.data.level), 7);
                            }
                        }
                    }
                    this.matches = this.board.findMatches();
                }

                if (manual) {
                    if (currentMode == "action") {
                        Object.values(this.board.tiles)
                            .filter(x => !x?.anim && x?.power == "countdown")
                            .forEach(x => x.countdown = Math.max(x.countdown - 1, 0))
                    }
                }

                if (fallCount == 0 && this.fallCount != 0) {
                    this.moves = this.board.findValidMoves();
                }

                if (fallCount > 0) {
                    this.hint = null;
                    this.hintAutoTimer = 0;
                } else {
                    this.hintAutoTimer += delta;
                    if (this.hintAutoTimer > 15000 && game.options.autoHint) {
                        this.showHint();
                        this.hintCooldown = 0;
                    }
                }

                this.fallCount = fallCount;
                this.hintCooldown -= delta;
            },
            makeMatch(oldPos, newPos) {
                if (this.pauseTimer >= 0) return;
                else if (currentMode == "action" && Object.values(this.board.tiles).find(x => x?.power == "countdown" && x.countdown <= 0)) return;
                else if (currentMode == "speed" && this.data.time <= 0) return;

                let oldTile = this.board.tiles[oldPos.x + oldPos.y * 100];
                let newTile = this.board.tiles[newPos.x + newPos.y * 100];
                if (
                    !oldTile || oldTile.offset.y || oldTile.anim || oldTile.swapCheck ||
                    !newTile || newTile.offset.y || newTile.anim || newTile.swapCheck
                ) return;

                if (oldTile.type == 7) {
                    [oldPos, newPos] = [newPos, oldPos];
                    [oldTile, newTile] = [newTile, oldTile];
                }

                this.powerCascade = this.cascade = 0;

                if (newTile.type == 7) {
                    this.cascade++;

                    if (oldTile.type == 7) {
                        let scores = {
                            "cube": 1n,
                            "sphere": 2n,
                            "fourd": 5n,
                        }
                        let score = 50n * scores[newTile.power] * scores[oldTile.power];
                        let exp = scores[newTile.power] + scores[oldTile.power] / 2n;
                        
                        let [x, y] = [
                            (oldPos.x + newPos.x) / 2, (oldPos.y + newPos.y) / 2,
                        ]

                        let popup;
                        this.scorePopups.push(popup = {
                            pos: {
                                x: (oldPos.x + newPos.x) / 2,
                                y: (oldPos.y + newPos.y) / 2,
                            },
                            color: 7,
                            score: 0n,
                            exp: 0n,
                        });
                        
                        let effect; 
                        this.effects.push(effect = {
                            type: "free-lightning",
                            color: null,
                            pos: { x: +x + 0.5, y: +y + 0.5 },
                            targets: [],
                        });

                        for (let tid in this.board.tiles) {
                            let tTile = this.board.tiles[tid];
                            if (!tTile) continue;
                            let [px, py] = [
                                tid % 100,
                                Math.floor(tid / 100) - Math.round(tTile.offset.y),
                            ]
                            if (py >= -0.5 && (!tTile.anim || tTile.anim == "fade")) {
                                tTile.anim = "power-match";
                                tTile.animTime = (Math.abs(x - px) + Math.abs(y - py)) / 10 + .8;
                                tTile.animArgs = { score, exp, pause: 500, popup };
                                tTile.trigger = newTile;
                            }
                            effect.targets.push({ x: px, y: py, tile: tTile });
                        }
                    } else {
                        newTile.anim = "power-match";
                        newTile.animTime = 0;
                        newTile.animArgs = {};
                        newTile.trigger = oldTile;
                    }
                } else {
                    oldTile.anim = "swap";
                    oldTile.animTime = 1e-6;
                    oldTile.animArgs = { offset: { x: newPos.x - oldPos.x, y: newPos.y - oldPos.y } };
                    newTile.anim = "swap";
                    newTile.animTime = 1e-6;
                    newTile.animArgs = { offset: { x: -oldTile.animArgs.offset.x, y: -oldTile.animArgs.offset.y } };
                }
                
            },
            showHint() {
                if (this.fallCount || this.hintCooldown > 0) return;
                if (this.moves.count <= 0) return;
                let list = Object.keys(this.moves);
                list.splice(list.indexOf("count"), 1);
                let chosen = list[Math.floor(Math.random() * list.length)];
                this.hint = {
                    x: chosen % 100,
                    y: Math.floor(chosen / 100),
                    time: 0,
                    type: this.moves[chosen].vet ? (
                        this.moves[chosen].hoz ? ["vet", "hoz"][Math.floor(Math.random() * 2)] : "vet"
                    ) : "hoz"
                }
                this.hintCooldown = 5000;
                this.hintAutoTimer = -Infinity;
            },
            onpointerdown(e) {
                let size = Math.min(this.rect.width / this.board.width, this.rect.height / this.board.height);
                let pos = {
                    x: Math.floor((e.x - this.rect.x) / size),
                    y: Math.floor((e.y - this.rect.y) / size),
                }
                
                if (this.swapPos) {
                    if (Math.abs(pos.x - this.swapPos.x) + Math.abs(pos.y - this.swapPos.y) == 1 && !game.options.forceSwipe) {
                        this.makeMatch(this.swapPos, pos);
                        this.swapPos = null;
                    } else if (Math.abs(pos.x - this.swapPos.x) + Math.abs(pos.y - this.swapPos.y) == 0) {
                        this.swapPos = null;
                    } else {
                        this.swapPos = pos;
                    }
                } else {
                    this.swapPos = pos;
                }
                this.__mouseActive = true;
                let handler = (e) => {
                    this.__mouseActive = false;
                    document.removeEventListener("pointerup", handler);
                }
                document.addEventListener("pointerup", handler);
                this.hint = null;
            },
            onpointermove(e) {
                let size = Math.min(this.rect.width / this.board.width, this.rect.height / this.board.height);
                let pos = {
                    x: Math.floor((e.x - this.rect.x) / size),
                    y: Math.floor((e.y - this.rect.y) / size),
                }
                if (this.__mouseActive && this.swapPos && Math.abs(pos.x - this.swapPos.x) + Math.abs(pos.y - this.swapPos.y) == 1) {
                    this.makeMatch(this.swapPos, pos);
                    this.swapPos = null;
                } 
            },
            onpointerup(e) {
                let size = Math.min(this.rect.width / this.board.width, this.rect.height / this.board.height);
                let pos = {
                    x: Math.floor((e.x - this.rect.x) / size),
                    y: Math.floor((e.y - this.rect.y) / size),
                }
                if (this.swapPos) {
                    if (Math.abs(pos.x - this.swapPos.x) + Math.abs(pos.y - this.swapPos.y) == 1) {
                        this.makeMatch(this.swapPos, pos);
                    }
                }
            },
            drawTile(type, x, y, stroke, fill, size) {
                ctx.fillStyle = fill;
                ctx.strokeStyle = stroke;
                ctx.lineWidth = size * .03;
                // TODO: Deyandere this
                if (type == 0) {
                    ctx.fillRect(
                        x - size * .3375, y - size * .3375, 
                        size * .675, size * .675
                    );
                    ctx.strokeRect(
                        x - size * .3375, y - size * .3375, 
                        size * .675, size * .675
                    );
                } else if (type == 1) {
                    ctx.beginPath();
                    ctx.moveTo(x, y - size * .3875);
                    for (let a = 1; a <= 5; a++) {
                        ctx.lineTo(
                            x - size * (Math.sin(Math.PI * a / 2.5) * .3875),
                            y - size * (Math.cos(Math.PI * a / 2.5) * .3875)
                        );
                    }
                    ctx.fill();
                    ctx.stroke();
                } else if (type == 2) {
                    ctx.beginPath();
                    ctx.moveTo(x + size * .4, y);
                    for (let a = 1; a <= 4; a++) {
                        ctx.lineTo(
                            x + size * (Math.cos(Math.PI * a / 2) * .4),
                            y + size * (Math.sin(Math.PI * a / 2) * .4)
                        );
                    }
                    ctx.fill();
                    ctx.stroke();
                } else if (type == 3) {
                    ctx.beginPath();
                    ctx.moveTo(x, y - size * .35);
                    for (let a = 1; a <= 3; a++) {
                        ctx.lineTo(
                            x + size * (Math.sin(Math.PI * a / 1.5) * .4),
                            y + size * (Math.cos(Math.PI * a / 1.5) * -.45 + .10)
                        );
                    }
                    ctx.fill();
                    ctx.stroke();
                } else if (type == 4) {
                    ctx.beginPath();
                    ctx.moveTo(x, y + size * .3625);
                    for (let a = 1; a <= 6; a++) {
                        ctx.lineTo(
                            x + size * (Math.sin(Math.PI * a / 3) * .3625),
                            y + size * (Math.cos(Math.PI * a / 3) * .3625)
                        );
                    }
                    ctx.fill();
                    ctx.stroke();
                } else if (type == 5) {
                    ctx.beginPath();
                    ctx.moveTo(x, y + size * .35);
                    for (let a = 1; a <= 3; a++) {
                        ctx.lineTo(
                            x + size * (Math.sin(Math.PI * a / 1.5) * .4),
                            y + size * (Math.cos(Math.PI * a / 1.5) * .45 - .10)
                        );
                    }
                    ctx.fill();
                    ctx.stroke();
                } else if (type == 6) {
                    ctx.beginPath();
                    ctx.arc(x, y, size * .35, 0, Math.PI*2);
                    ctx.fill();
                    ctx.stroke();
                }
            },
            render() {
                let size = Math.min(this.rect.width / this.board.width, this.rect.height / this.board.height);
                let colors = ["#ff0000", "#49e400", "#0065eb", "#ff00e4", "#fb5500", "#eecb00", "#fff7ea"];

                // Background
                for (let x = 0; x < this.board.width; x++) {
                    for (let y = 0; y < this.board.height; y++) {
                        ctx.fillStyle = (x + y) % 2 ? this.back2 : this.back1;
                        ctx.fillRect(
                            this.rect.x + size * x, 
                            this.rect.y + size * y, 
                            size, 
                            size, 
                        );
                    }
                }

                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.font = 32 * scale + "px " + fontFamily;
                ctx.lineWidth = 5 * scale;

                function ease(x) {
                    const c1 = 2.5;
                    const c3 = c1 + 1;
                    
                    return c3 * x * x * x - c1 * x * x;
                }

                // Tiles
                if (!this.paused || currentMode != "speed") {
                    for (let x = 0; x < this.board.width; x++) {
                        for (let y = this.board.height - 1; y >= 0; y--) {
                            let tile = this.board.tiles[x + y * 100];
                            if (!tile) continue;


                            let fade = ["fade", "power-fade"].includes(tile.anim) ? tile.animTime : 0;
                            let tScale = (fade <= 0 ? 1 : 1 - ease(fade));
                            let offset = {
                                x: tile.offset.x,
                                y: tile.offset.y
                            }

                            if (tile.anim == "swap") {
                                let lerp = 0.5 - Math.cos(tile.animTime * Math.PI) / 2;
                                offset.x += tile.animArgs.offset.x * lerp;
                                offset.y -= tile.animArgs.offset.y * lerp;
                                tScale *= 0.8 ** ((offset.x + offset.y) * Math.sin(tile.animTime * Math.PI));
                            } else if (tile.anim == "power-match") {
                                offset.x += Math.random() * .1 - .05;
                                offset.y += Math.random() * .1 - .05;
                            }

                            ctx.font = 20 * scale * tScale + "px " + fontFamily;
                            
                            if (tile.type < 7) {

                                this.drawTile(
                                    tile.type,
                                    this.rect.x + size * (x + offset.x + .54), 
                                    this.rect.y + size * (y - offset.y + .54), 
                                    fade ? "white" : "#000a",
                                    fade ? "white" : "#000a",
                                    size * tScale, 
                                );
                                    
                                if (fade) {

                                } else if (tile.power == "star") {
                                    for (let a = 0; a < 5; a++) {
                                        this.drawTile(
                                            tile.type,
                                            this.rect.x + size * (x + offset.x + .45 + Math.random() * .1), 
                                            this.rect.y + size * (y - offset.y + .45 + Math.random() * .1), 
                                            "#ddf7",
                                            "#0000",
                                            size * tScale * 1.1, 
                                        );
                                    }
                                } else if (tile.power == "flame") {
                                    for (let a = 0; a < 5; a++) {
                                        this.drawTile(
                                            tile.type,
                                            this.rect.x + size * (x + offset.x + .5), 
                                            this.rect.y + size * (y - offset.y + .5), 
                                            "#fa37",
                                            "#0000",
                                            size * tScale * (1.1 + Math.sin(tile.lifetime * 1.2 ** a) * (.1 + a * .01)), 
                                        );
                                    }
                                } else if (tile.power == "nova") {
                                    for (let a = 0; a < 5; a++) {
                                        let t = (tile.lifetime * 1.2 ** a / 5) % 1;
                                        this.drawTile(
                                            6,
                                            this.rect.x + size * (x + offset.x + .5), 
                                            this.rect.y + size * (y - offset.y + .5), 
                                            "rgba(255, 255, 255, " + (1 - t) + ")",
                                            "rgba(255, 255, 255, " + (1 - t) / 2 + ")",
                                            size * tScale * (t * 1.5 + 0.5), 
                                        );
                                    }
                                }

                                this.drawTile(
                                    tile.type,
                                    this.rect.x + size * (x + offset.x + .5), 
                                    this.rect.y + size * (y - offset.y + .5), 
                                    fade ? "white" : "#ddd",
                                    fade ? "black" : colors[tile.type],
                                    size * tScale, 
                                );

                                if (tile.power == "countdown") {
                                    for (let a = 0; a < 3; a++) {
                                        this.drawTile(
                                            tile.type,
                                            this.rect.x + size * (x + offset.x + .5), 
                                            this.rect.y + size * (y - offset.y + .5), 
                                            "#000",
                                            "#0000",
                                            size * tScale * (1.1 + 0.1 * a), 
                                        );
                                    }
                                    ctx.font = "bold " + 0.6 * size * tScale + "px " + fontFamily;
                                    ctx.lineWidth = 0.1 * size * tScale;
                                    ctx.strokeStyle = "white";
                                    ctx.strokeText(
                                        tile.countdown.toLocaleString("en-US"),
                                        this.rect.x + size * (x + offset.x + .5), 
                                        this.rect.y + size * (y - offset.y + .52), 
                                    );
                                    ctx.fillStyle = "black";
                                    ctx.fillText(
                                        tile.countdown.toLocaleString("en-US"),
                                        this.rect.x + size * (x + offset.x + .5), 
                                        this.rect.y + size * (y - offset.y + .52), 
                                    );  
                                }
                            } else {

                                for (let a = (tile.lifetime / 4 % .2); a < 2; a += 0.2) {
                                    this.drawTile(
                                        Math.floor(tile.lifetime * 5 - a * 20 + 2.5) % 7,
                                        this.rect.x + size * (x + offset.x + .5), 
                                        this.rect.y + size * (y - offset.y + .5), 
                                        "hsla(" + (((tile.lifetime + a * 2) * 100) % 360) + "deg, 100%, 70%, " + a * 0.5 + ")",
                                        "rgba(0, 0, 0, " + a * 0.5 + ")",
                                        size * tScale * (1 + (1 - a)), 
                                    );
                                }
                                let type = -1;

                                if (tile.power == "cube") type = 0;
                                if (tile.power == "sphere") type = 6;
                                if (tile.power == "fourd") type = 4;

                                this.drawTile(
                                    type,
                                    this.rect.x + size * (x + offset.x + .54), 
                                    this.rect.y + size * (y - offset.y + .54), 
                                    fade ? "white" : "#000a",
                                    fade ? "white" : "#000a",
                                    size * tScale, 
                                );
                                
                                this.drawTile(
                                    type,
                                    this.rect.x + size * (x + offset.x + .5), 
                                    this.rect.y + size * (y - offset.y + .5), 
                                    "hsl(" + ((tile.lifetime * 100) % 360) + "deg, 100%, 70%)",
                                    "#000",
                                    size * tScale, 
                                );
                            }
                        }
                    }
                }

                if (this.hint) {
                    this.hint.time += delta;
                    ctx.globalAlpha = 0.5 + Math.sin(time / 50) / 2;
                    ctx.strokeStyle = "white";
                    ctx.lineWidth = 2 * scale;
                    let margin = Math.max(500 - this.hint.time, 0) * scale;
                    ctx.strokeRect(
                        this.rect.x + size * this.hint.x - margin, 
                        this.rect.y + size * this.hint.y - margin, 
                        size * (this.hint.type == "hoz" ? 2 : 1) + margin * 2, 
                        size * (this.hint.type == "vet" ? 2 : 1) + margin * 2,  
                    );
                    ctx.globalAlpha = 1;
                }

                // Swap indicator
                if (this.swapPos) {
                    ctx.strokeStyle = "#aaaaaa";
                    ctx.lineWidth = 4 * scale;
                    ctx.strokeRect(
                        this.rect.x + size * this.swapPos.x + 2 * scale, 
                        this.rect.y + size * this.swapPos.y + 2 * scale, 
                        size - 4 * scale, 
                        size - 4 * scale, 
                    );
                }

                // Effect fader
                this.pauseFader = clamp01(this.pauseFader + (this.pauseTimer > 0 ? 2 : -1) * delta / 1000);

                if (this.pauseFader) {
                    ctx.fillStyle = "rgba(0, 0, 0, " + this.pauseFader * 0.4 + ")";
                    ctx.fillRect(
                        0, 
                        0, 
                        mainCanvas.width, 
                        mainCanvas.height, 
                    );
                }

                // Effects
                for (let id in this.effects) {
                    let effect = this.effects[id];

                    if (effect.type == "explosion") {
                        ctx.globalAlpha = 1 - effect.time;
                        ctx.fillStyle = "#fa37";
                        ctx.strokeStyle = "#fa3";
                        ctx.lineWidth = size / 10;
                        for (let a = 0; a < 3; a++) {
                            ctx.beginPath();
                            ctx.arc(
                                this.rect.x + size * effect.pos.x, 
                                this.rect.y + size * effect.pos.y, 
                                size * (1.5 + (effect.time - (0.25 * a)) * (0.25 * a + 0.1)), 0, Math.PI*2
                            );
                            ctx.fill();
                            ctx.beginPath();
                            ctx.arc(
                                this.rect.x + size * effect.pos.x, 
                                this.rect.y + size * effect.pos.y, 
                                size * (1.5 + (effect.time - (0.25 * a)) * (0.5 * a + 0.2)), 0, Math.PI*2
                            );
                            ctx.stroke();
                        }
                        ctx.globalAlpha = 1;
                        effect.time = (effect.time || 0) + delta / 1000;
                    } else if (effect.type == "lightning") {
                        for (let a = 0; a < 3; a++) {
                            ctx.beginPath();
                            ctx.moveTo(
                                this.rect.x, 
                                this.rect.y + size * (effect.pos.y + Math.random() * .6 - .3), 
                            );
                            for (let x = 1; x <= this.board.width; x++) {
                                ctx.lineTo(
                                    this.rect.x + size * x, 
                                    this.rect.y + size * (effect.pos.y + Math.random() * .6 - .3), 
                                );
                            }
                            ctx.moveTo(
                                this.rect.x + size * (effect.pos.x + Math.random() * .6 - .3), 
                                this.rect.y, 
                            );
                            for (let y = 1; y <= this.board.width; y++) {
                                ctx.lineTo(
                                    this.rect.x + size * (effect.pos.x + Math.random() * .6 - .3), 
                                    this.rect.y + size * y, 
                                );
                            }

                            ctx.lineWidth = size / (a + 4);
                            ctx.strokeStyle = colors[effect.color];
                            ctx.stroke();
                            ctx.lineWidth = size / (a + 2);
                            ctx.strokeStyle = "#ddf5";
                            ctx.stroke();
                        }

                        let isInc = true;
                        for (let target of effect.targets) if (target.anim == "power-match") {
                            isInc = false;
                            break;
                        }
                        if (isInc) effect.time = (effect.time || 0) + delta / 500;
                        else effect.time = 0;
                    } else if (effect.type == "free-lightning") {
                        for (let a = 0; a < 3; a++) {
                            let pos = effect.pos;
                            let poses = [...effect.targets];
                            ctx.beginPath();
                            while (poses.length) {
                                for (let p of poses) {
                                    p.dist = ((p.x - pos.x) ** 2 + (p.y - pos.y) ** 2 + (Math.random() * 2) ** 2);
                                }
                                poses.sort((x, y) => x.dist - y.dist);
                                pos = poses.shift();
                                if (pos.tile.anim != "power-fade" && pos.tile.animTime < 1) ctx.lineTo(
                                    this.rect.x + size * (pos.x + Math.random() * .6 + .2), 
                                    this.rect.y + size * (pos.y + Math.random() * .6 + .2), 
                                );
                            }

                            ctx.lineWidth = size / (a * 4 + 8);
                            ctx.strokeStyle = colors[effect.color];
                            ctx.stroke();
                            ctx.lineWidth = size / (a * 2 + 4);
                            ctx.strokeStyle = "#fff5";
                            ctx.stroke();
                        }

                        let isInc = true;
                        for (let target of effect.targets) if (target.tile.anim == "power-match") {
                            isInc = false;
                            break;
                        }
                        if (isInc) effect.time = (effect.time || 0) + delta / 500;
                        else effect.time = 0;
                    }

                    if (effect.time >= 1) {
                        this.effects.splice(+id, 1);
                    }
                }
                
                // Score popups
                ctx.fillStyle = "#000000";

                ease = (x) => {
                    const c4 = (2 * Math.PI) / 3;
                    
                    return x === 0
                        ? 0
                        : x === 1
                        ? 1
                        : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
                }
                
                while (this.scorePopups.length > 0 && this.scorePopups[0].lifetime >= 1) {
                    this.scorePopups.shift();
                }

                for (let popup of this.scorePopups) {
                    let dur = ["comp", "total"].includes(popup.type) ? 3000 : 2000;

                    if (popup.text || popup.score > 0) {
                        let exp = Number(popup.exp);
                        let str = popup.text ?? popup.score.toLocaleString("en-US");
                        let tScale = ease(Math.min((popup.time ?? 0) * dur / 2000, 1)) 
                            * (ease(Math.min((popup.lifetime ?? 0) * dur / 2000, 1)) * .25 + .75) 
                            * scale;
                        if (popup.type == "power") tScale *= .75;
                        if (popup.type == "total") tScale *= .75;
                        else tScale *= Math.max(Math.min(exp / 20 + .5, 1.5), 1);

                        ctx.globalAlpha = Math.min(2 - popup.lifetime * 2, 1);
                        ctx.font = (popup.type == "total" ? "" : "bold ") + 40 * tScale + "px " + fontFamily;
                        ctx.strokeStyle = colors[popup.color] + "77";

                        ctx.lineWidth = (popup.type == "power" ? 8 : 10) * tScale;
                        ctx.strokeText(
                            str,
                            this.rect.x + popup.pos.x * size, 
                            this.rect.y + (popup.pos.y - (popup.time ?? 0)) * size, 
                        );
                            
                        if (popup.exp > 10) {
                            ctx.strokeStyle = "hsla(" + popup.time * 1000 + "deg, 100%, 50%, " + clamp01(exp / 10 - 1) + ")";
                            ctx.strokeText(
                                str,
                                this.rect.x + popup.pos.x * size, 
                                this.rect.y + (popup.pos.y - (popup.time ?? 0)) * size, 
                            );
                        }

                        ctx.strokeStyle = (popup.type == "power" ? "#ffffff77" : "#ffffff");
                        ctx.lineWidth = 5 * tScale;

                        ctx.strokeText(
                            str,
                            this.rect.x + popup.pos.x * size, 
                            this.rect.y + (popup.pos.y - (popup.time ?? 0)) * size, 
                        );
                        ctx.fillText(
                            str,
                            this.rect.x + popup.pos.x * size, 
                            this.rect.y + (popup.pos.y - (popup.time ?? 0)) * size, 
                        );
                            
                        if (popup.exp > 20) {
                            ctx.fillStyle = "hsla(" + (popup.time + 0.2) * 1000 + "deg, 100%, 25%, " + clamp01(exp / 20 - 1) + ")";
                            ctx.fillText(
                                str,
                                this.rect.x + popup.pos.x * size, 
                                this.rect.y + (popup.pos.y - (popup.time ?? 0)) * size, 
                            );
                    
                            ctx.fillStyle = "#000000";
                        }
                    }

                    popup.time = (popup.time ?? 0) + delta / dur
                    popup.lifetime = (popup.lifetime ?? 0) + delta / dur
                }
                ctx.globalAlpha = 1;
            },
            save() {
                let data = {
                    score: this.score,
                    exp: this.exp,
                    data: this.data,
                    board: "",
                }

                let powers = {
                    star: "A",
                    flame: "B",
                    cube: "C",
                    nova: "D",
                    sphere: "E",
                    fourd: "F",
                    countdown: "X",
                };

                for (let x = 0; x < this.board.width; x++) {
                    for (let y = 0; y < this.board.height; y++) {
                        let tile = this.board.get(x, y);
                        data.board += tile.type.toString()[0] + (powers[tile.power] || "_");
                        if (tile.power == "countdown") data.board += tile.countdown.toString(36).padStart(2, "0");
                    }
                }
                game.boards[currentMode] = data;
                save();
            },
            load() {
                let data = game.boards[currentMode];
                if (!data) return;

                this.score = BigInt(data.score);
                this.exp = BigInt(data.exp);
                this.data = deepCopy(data.data, this.data);

                let powers = {
                    A: "star",
                    B: "flame",
                    C: "cube",
                    D: "nova",
                    E: "sphere",
                    F: "fourd",
                    X: "countdown",
                };

                let p = 0;
                for (let x = 0; x < this.board.width; x++) {
                    for (let y = 0; y < this.board.height; y++) {
                        let tile = this.board.get(x, y) || { lifetime: 0 };
                        tile.type = +(data.board[p]);
                        tile.power = powers[data.board[p + 1]] || "";
                        tile.offset = { x: 0, y: 0 };
                        this.board.tiles[x + y * 100] = tile;
                        p += 2;
                        if (tile.power == "countdown") {
                            tile.countdown = parseInt(data.board[p] + data.board[p + 1], 36);
                            p += 2;
                        }
                    }
                }
            },
            ...args,
        }
    }
}