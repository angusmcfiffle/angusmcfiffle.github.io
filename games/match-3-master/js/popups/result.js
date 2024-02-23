popups.result = function (parent) {
    if (popupAnim) return;

    let popup = doPopup(parent);
    
    popup.$content.append(controls.label({
        position: Ex(0, -150, 50, 25),
        text: "Final Score",
        fill: "#fff7",
        scale: 25,
    }))
    
    popup.$content.append(controls.label({
        position: Ex(0, -100, 50, 25),
        text: scene.$board.score.toLocaleString("en-US"),
        style: "700",
        scale: 50,
    }))
    
    popup.$content.append(controls.scroller({
        position: Ex(0, -50, 0, 25),
        size: Ex(0, -50, 100, 50),
        fill: "#0007",
    }), "view");

    let rank = addToScoreboard(currentMode, scene.$board.score);

    let holder = popup.$content.$view.$content;
    let index = 0;
    
    function addScoreEntry(title, data, back) {
        let y = holder.size.y;
        if (rank == index) holder.append(controls.rect({
            position: Ex(0, y),
            size: Ex(0, 60, 100),
            fill: "#fff3",
        })); else if (back) holder.append(controls.rect({
            position: Ex(0, y),
            size: Ex(0, 60, 100),
            fill: "#fff1",
        }));
        index++;
        holder.append(controls.label({
            position: Ex(80, y + 30),
            text: index + ".",
            scale: 25,
            align: "right",
        }));
        holder.append(controls.label({
            position: Ex(100, y + 30),
            text: title,
            scale: 25,
            align: "left",
        }));
        holder.append(controls.label({
            position: Ex(-30, y + 30, 100),
            text: data,
            scale: 25,
            align: "right",
        }));
        holder.size.y += 60;
    }

    for (let score of meta.scores[currentMode]) {
        addScoreEntry(meta.players[score.id]?.name ?? score.name, BigInt(score.score).toLocaleString("en-US"), index % 2 - 1)
    }

    let exp = getAwardXP(scene.$board.exp);
    game.stats.exp += exp;
    save();
    let progress;

    popup.$content.append(progress = controls.gembar({
        position: Ex(-248, -28, 50, 75),
        size: Ex(496, 56),
        fill: "#777a",
    }), "progress")
    progress.append(controls.label({
        position: Ex(10, -25),
        align: "left",
        scale: 25,
    }), "rank")
    progress.append(controls.label({
        position: Ex(-10, -25, 100),
        align: "right",
        style: "italic",
        scale: 25,
    }), "title")
    progress.append(controls.label({
        position: Ex(0, 30, 50, 100),
        scale: 25,
    }), "goal")
    
    let popup2;
    popup.$content.append(popup2 = controls.rect({
        position: Ex(-150, -180, 50, 75),
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

    let isAnimating = true;

    function init() {
        game.stats.exp -= exp;
        let {level, goal} = getRankData();
        progress.progress = Number(game.stats.exp) / Number(goal);
        progress.$rank.text = "Rank " + game.stats.level.toLocaleString("en-US");
        progress.$title.text = titles[level] || titles[titles.count - 1];
        progress.$goal.text = (goal - game.stats.exp).toLocaleString("en-US") + " XP to next level";
        popup2.$add.text = "+" + (exp).toLocaleString("en-US") + " XP";
        startAnimation(anim1);
    }

    function anim1(x) {
        if (!isAnimating) return true;
        popup2.alpha = ease.quart.inout(clamp01((x - 900) / 300));
        popup2.position.y = -210 + 50 * ease.quart.inout(clamp01((x - 900) / 300));
        if (x > 1200) {
            setTimeout(() => startAnimation(anim2), 1000);
            return true;
        }
    }

    let totalExp = Number(exp);
    let levelUpCooldown = 0;
    function anim2(x) {
        if (!isAnimating) return true;

        levelUpCooldown -= delta;
        if (levelUpCooldown > 0) return;

        let {level, goal} = getRankData();
        let inc = BigInt(Math.ceil(Math.max(totalExp / 5000, Number(goal) / 5000) * delta));
        if (inc > exp) inc = exp;
        if (inc > goal - game.stats.exp) inc = goal - game.stats.exp;
        game.stats.exp += inc;
        exp -= inc;
        
        progress.progress = Number(game.stats.exp) / Number(goal);
        progress.$rank.text = "Rank " + game.stats.level.toLocaleString("en-US");
        progress.$title.text = titles[level] || titles[titles.count - 1];
        progress.$goal.text = (goal - game.stats.exp).toLocaleString("en-US") + " XP to next level";
        popup2.$add.text = "+" + (exp).toLocaleString("en-US") + " XP";

        if (game.stats.exp >= goal) {
            levelUpCooldown = 800;
        } else if (exp == 0) {
            setTimeout(() => startAnimation(anim3), 1500);
            return true;
        }
    }

    function anim3(x) {
        if (!isAnimating) return true;
        popup2.alpha = 1 - ease.quart.in(clamp01(x / 500));
        popup2.position.y = -160 - 50 * ease.quart.in(clamp01(x / 500));
        if (x > 500) {
            popup.$content.remove(popup2);
            isAnimating = false;
            return true;
        }
    }
    
    ButtonWithText(popup.$content, {
        position: Ex(30, 120, 0, 75),
        size: Ex(-40, 60, 50),
    }, "Main Menu", () => {
        isAnimating = false;
        game.stats.exp += exp;
        loadScreen("main");
    });

    ButtonWithText(popup.$content, {
        position: Ex(10, 120, 50, 75),
        size: Ex(-40, 60, 50),
    }, "Restart", () => {
        isAnimating = false;
        game.stats.exp += exp;
        loadScreen("game");
    });

    init();
    
    return popup;
}