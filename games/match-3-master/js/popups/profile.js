popups.profile = function (parent) {
    if (popupAnim) return;

    let popup = doPopup(parent);
    popup.$title.text = "Profile";
    
    popup.$content.append(controls.button({
        position: Ex(-200, -60, 50, 25),
        size: Ex(400, 60),
        fill: "#0000",
        fillHover: "#fff3",
        onclick() {
            popups.playerName(popup, meta.currentPlayer);
        }
    }), "namebox")
    popup.$content.$namebox.append(controls.label({
        position: Ex(0, 85, 50),
        baseline: "alphabetic",
        text: "(click to rename ✏️)",
        alpha: 0.5,
        scale: 15,
    }), "rename")
    popup.$content.$namebox.append(controls.label({
        position: Ex(15, 45),
        align: "left", 
        baseline: "alphabetic",
        style: "700",
        text: meta.players[meta.currentPlayer].name,
        scale: 40,
    }), "name")
    popup.$content.$namebox.append(controls.rect({
        position: Ex(0, -2, 0, 100),
        size: Ex(0, 2, 100),
        fill: "#777a",
    }), "foot")
    
    let {level, goal} = getRankData();
    
    popup.$content.append(controls.gembar({
        position: Ex(-248, 120, 50, 25),
        size: Ex(496, 56),
        progress: Number(game.stats.exp) / Number(goal),
        fill: "#777a",
    }), "progress")
    popup.$content.$progress.append(controls.label({
        position: Ex(10, -25),
        align: "left",
        text: "Rank " + game.stats.level.toLocaleString("en-US"),
        scale: 25,
    }), "rank")
    popup.$content.$progress.append(controls.label({
        position: Ex(-10, -25, 100),
        align: "right",
        style: "italic",
        text: titles[level] || titles[titles.count - 1],
        scale: 25,
    }), "title")
    popup.$content.$progress.append(controls.label({
        position: Ex(0, 30, 50, 100),
        text: (goal - game.stats.exp).toLocaleString("en-US") + " XP to next level",
        scale: 25,
    }), "goal")
    
    ButtonWithText(popup.$content, {
        position: Ex(30, 40, 0, 75),
        size: Ex(-40, 60, 50),
    }, "Statistics", () => {
        popups.stats(popup);
    });

    ButtonWithText(popup.$content, {
        position: Ex(10, 40, 50, 75),
        size: Ex(-40, 60, 50),
    }, "High Scores", () => {
        popups.scores(popup);
    });

    ButtonWithText(popup.$content, {
        position: Ex(30, 120, 0, 75),
        size: Ex(-60, 60, 100),
    }, "Back", () => {
        popup.close();
    });
    
    return popup;
}