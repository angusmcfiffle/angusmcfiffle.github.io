screens.main = function () {

    let modeButtons = [];

    function makeModeButton(target, name, position) {
        let button;
        scene.append(button = controls.button({
            position: Ex(position.x - 60, position.y - 100, 50, 50),
            size: Ex(120, 120),
            radius: 60,
            fill: "#aaa7",
            target,
            onclick() {
                if (!isAnimating) {
                    isAnimating = true;
                    button.onpointerout();
                    button.__mouseIn = false;
                    decideMode(target);
                }
            }
        }))
        button.append(controls.rect({
            position: Ex(2, 2),
            size: Ex(-4, -4, 100, 100),
            radius: 60,
            fill: "#000a"
        }), "fill")
        button.append(controls.label({
            position: Ex(0, 0, 50, 50),
            scale: 30,
            style: "700",
            text: name,
            stroke: "#000",
            thickness: 8,
        }), "text")
        modeButtons.push(button);
    }

    let {level, goal} = getRankData();

    function decideMode(mode, force = false) {
        if (mode == "?????") {
            isAnimating = false;
            popups.tbd();
            return;
        }
        currentMode = mode;
        if (!force && mode != "endless" && game.boards[mode]) {
            isAnimating = false;
            popups.continue(false, mode, decideMode);
            return;
        }
        startAnimation(x => {
            for (let button of modeButtons) {
                button.clickthrough = true;
                let size = button.size.x = button.size.y;
                if (button.target == mode) {
                    button.radius = button.$fill.radius = 60 + 20 * ease.quart.out(clamp01(x / 500));
                    size = button.size.x = button.size.y = button.radius * 2;
                    button.position.x = (button.position.x + size / 2) / 1e6 ** (delta / 1000) - size / 2;
                    button.position.y = (button.position.y + size / 2) / 1e6 ** (delta / 1000) - size / 2;
                    button.position.ey = 50 - clamp01(ease.cubic.in((x - 1000) / 1000)) * 75;
                } else {
                    button.position.x = (button.position.x + size / 2) / 2 ** (delta / 1000) - size / 2;
                    button.position.y = (button.position.y + size / 2) / 2 ** (delta / 1000) - size / 2;
                    button.alpha = 1 - clamp01(ease.cubic.out(x / 200));
                }
            }
            scene.$profile.position.y = scene.$switchbtn.position.y = scene.$menubtn.position.y = 
                -94 + clamp01(ease.quint.out(x / 1000)) * 200;
            if (x >= 2500) loadScreen("game");
            return x >= 2500;
        })
    }

    makeModeButton("classic",     "CLASSIC",    Ex(-125, -125));
    makeModeButton("speed",       "SPEED",      Ex(125, -125));
    makeModeButton("?????",       "?????",      Ex(0, 0));
    makeModeButton("action",      "ACTION",     Ex(-125, 125));
    makeModeButton("endless",     "ENDLESS",    Ex(125, 125));
    

    scene.append(controls.button({
        position: Ex(-110, -96, 50, 100),
        size: Ex(300, 60),
        fill: "#aaa7",
        onclick() {
            popups.profile();
        }
    }), "profile")
    scene.$profile.append(controls.gembar({
        position: Ex(98, 2),
        size: Ex(-100, -4, 100, 100),
        progress: Number(game.stats.exp) / Number(goal),
        fill: "#000a",
    }), "progress")
    scene.$profile.append(controls.rect({
        position: Ex(2, 2),
        size: Ex(94, -4, 0, 100),
        fill: "#000a",
    }), "rankbox")
    scene.$profile.$rankbox.append(controls.label({
        position: Ex(0, 0, 50, 50),
        text: game.stats.level.toLocaleString("en-US"),
        scale: 25,
    }), "rank")

    ButtonWithText(scene, {
        position: Ex(-390, -96, 50, 100),
        size: Ex(60, 60),
    }, "⇆", () => {
        popups.switcher();
    }, "switchbtn");

    ButtonWithText(scene, {
        position: Ex(210, -96, 50, 100),
        size: Ex(60, 60),
    }, "☰", () => {
        popups.miscmenu();
    }, "menubtn");
    
    
    scene.append(controls.base({
        onupdate() {
            if (mainCanvas.width / scale >= 800) {
                scene.$profile.position.x = -278;
                scene.$profile.size.x = 556;
                scene.$switchbtn.position.x = -350;
                scene.$menubtn.position.x = 290;
            } else {
                scene.$profile.position.x = -198;
                scene.$profile.size.x = 396;
                scene.$switchbtn.position.x = -270;
                scene.$menubtn.position.x = 210;
            }
            
            for (let button of modeButtons) {
                if (button.__mouseIn) {
                    button.$text.stroke = "hsl(" + (time / 10) + "deg, 100%, 15%)";
                    button.$text.fill = "hsl(" + (time / 10 + 40) + "deg, 100%, 85%)";
                } else {
                    button.$text.stroke = "#000";
                    button.$text.fill = "#fff";
                }
            }
        }
    }), "logic")


    let isAnimating = true;

    startAnimation(x => {
        for (let a in modeButtons) {
            modeButtons[a].position.ey = 150 - clamp01(ease.cubic.out((x - 20 * a) / 1000)) * 100;
        }
        scene.$profile.position.y = scene.$switchbtn.position.y = scene.$menubtn.position.y =
            104 - clamp01(ease.cubic.out((x - 250) / 1000)) * 200;

        let length = Math.max(980 + 20 * modeButtons.length, 1250)
        if (x >= length) isAnimating = false;
        return x >= length;
    });
    
    if (meta.versionIndex != versionIndex) {
        meta.versionIndex = versionIndex;
        popups.changelog();
        save();
    }
}