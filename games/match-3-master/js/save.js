var meta = {};

function getStartMeta() {
    return {
        currentPlayer: "",
        players: {},
        scores: {
            classic: createScoreboard(12500n),
            speed: createScoreboard(25000n),
            action: createScoreboard(25000n),
        },
        options: {
            resolution: 2,
            fpsCounter: false,
            showTouches: false,
        },
        versionIndex: 0,
    }
}

function randomID() {
    let hex = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"];
    let str = "";
    for (let a = 0; a < 16; a++) str += hex[Math.floor(Math.random() * hex.length)];
    return str;
}

function load() {
    try {
        meta = (JSON.parse(decodeURIComponent(atob(localStorage.getItem("yam3c")))));
        if (meta.boards) {
            game = meta;
            meta = getStartMeta();
            createPlayer("Player 1", game);
        } else {
            meta = deepCopy(meta, getStartMeta());
        }
        console.log(meta);
    } catch (e) {
        console.log(e);
        meta = getStartMeta();
        meta.versionIndex = versionIndex;
    }
    if (!meta.currentPlayer) {
        createPlayer("Player 1");
    } else {
        loadPlayer();
    }
}

function save() {
    localStorage.setItem("yam3c", btoa(encodeURIComponent(JSON.stringify(meta))));
    savePlayer();
}

var game = {};

function getStartGame() {
    return {
        boards: {},
        stats: {
            level: 1n,
            exp: 0n,
            totalExp: 0n,

            total: 0n,
            powers: {},
            colors: {},

            timePlayed: 0,
        },
        options: {
            autoHint: true,
            forceSwipe: false,
            scorePopups: true,
            compliments: true,
        },
    }
}

function createPlayer(name, startData = {}) {
    let id = randomID();
    meta.players[id] = {
        name
    }
    meta.currentPlayer = id;
    game = deepCopy(startData, getStartGame());
    save();
    return id;
}

function switchPlayer(id) {
    meta.currentPlayer = id;
    loadPlayer();
    save();
}

function deletePlayer(id) {
    localStorage.removeItem("yam3c-" + id);
    delete meta.players[id];
    save();
}


function loadPlayer() {
    try {
        game = deepCopy(JSON.parse(decodeURIComponent(atob(localStorage.getItem("yam3c-" + meta.currentPlayer)))), getStartGame());
        console.log(game);
    } catch (e) {
        console.log(e);
        game = getStartGame();
    }
}

function savePlayer() {
    localStorage.setItem("yam3c-" + meta.currentPlayer, btoa(encodeURIComponent(JSON.stringify(game))));
}

function exportPlayer() {
    let text = meta.currentPlayer + "\n" + meta.players[meta.currentPlayer].name + "\n" + btoa(encodeURIComponent(JSON.stringify(game)));
    
    var element = document.createElement("a");
    element.href = "data:text/plain;charset=utf-8," + encodeURIComponent(text);
    element.download = meta.players[meta.currentPlayer].name + "'s save.yam3s";
    element.click();
}

function importPlayer(popup) {
    var element = document.createElement("input");
    element.type = "file";
    element.oninput = () => {
        element.files[0]?.text().then((txt) => {
            let lines = txt.split("\n");
            function exec() {
                try {
                    game = deepCopy(JSON.parse(decodeURIComponent(atob(lines[2]))), getStartGame());
                    save();
                    loadScreen("main");
                } catch (e) {
                    
                }
            }
            if (lines[0] != meta.currentPlayer) {
                popups.importConflict(popup, lines, "player", exec);
            } else {
                exec();
            }
        });
    }
    element.click();
}

BigInt.prototype.toJSON = function () {
    return this.toString();
};

function deepCopy(target, source) {
    for (item in source) {
        if (target[item] === undefined) target[item] = source[item];
        else if (typeof source[item] == "bigint") target[item] = BigInt(target[item]);
        else if (typeof source[item] == "object") target[item] = deepCopy(target[item], source[item]);
    }
    return target;
}

function addTileToStats(tile) {
    game.stats.total++;
    if (scene.$board?.board.types == 7) {
        game.stats.colors[tile.type] = BigInt(game.stats.colors[tile.type] || 0n) + 1n;
    }
    if (tile.power) {
        game.stats.powers[tile.power] = BigInt(game.stats.powers[tile.power] || 0n) + 1n;
    }
}

function randomName() {
    let vowels = ["a", "e", "i", "o", "u", "y"];
    let consonants = ["b", "c", "d", "f", "g", "h", "j", "k", "l", "m", "n", "p", "q", "r", "s", "t", "v", "w", "x", "z"];
    let consonants2 = ["br", "kr", "pr", "ss", "ch", "ll", "tz"];
    let str = "";
    let pick = (list) => list[Math.floor(Math.random() * list.length)]
    for (let a = 0; a < Math.random() * 2 + 2; a++) {
        let vChance = Math.random();
        let cChance = Math.random();
        str += (cChance < .4 ? pick(consonants2) : cChance < .9 ? pick(consonants) : "")
         + (vChance < .9 ? pick(vowels) : "")
    }
    return str[0].toUpperCase() + str.slice(1);
}

function createScoreboard(factor) {
    return [40n, 36n, 32n, 28n, 24n, 20n, 17n, 14n, 12n, 10n, 8n, 6n, 4n, 2n, 1n].map(x => ({
        name: randomName(),
        score: factor * x,
    }));
}

function addToScoreboard(mode, score) {
    let ref;
    meta.scores[mode].push(ref = {
        name: meta.players[meta.currentPlayer].name,
        id: meta.currentPlayer,
        score,
    });
    meta.scores[mode].sort((x, y) => Number(y.score) - Number(x.score))
    meta.scores[mode].splice(15);
    return meta.scores[mode].indexOf(ref);
}
  