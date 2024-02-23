popups.stats = function (parent) {
    if (popupAnim) return;

    let popup = doPopup(parent);
    popup.$title.text = "Statistics";

    popup.$content.append(controls.scroller({
        position: Ex(0, -100, 0, 25),
        size: Ex(0, 200, 100, 50),
        fill: 0
    }), "view");

    let holder = popup.$content.$view.$content

    function addStatEntry(title, data) {
        let y = holder.size.y;
        holder.append(controls.label({
            position: Ex(30, y + 20),
            text: title,
            scale: 25,
            align: "left",
        }));
        holder.append(controls.label({
            position: Ex(-30, y + 20, 100),
            text: data,
            scale: 25,
            align: "right",
        }));
        holder.size.y += 40;
    }

    holder.size.y += 20;

    addStatEntry("Total tiles matched", game.stats.total.toLocaleString("en-US"));

    let powerSubs = {
        flame: "Power tiles",
        star: "Electro tiles",
        cube: "Dark cubes",
        nova: "Nova tiles",
        sphere: "Dark spheres",
        fourd: "Tesseracts",
    }
    for (let a in powerSubs) if (game.stats.powers[a]) {
        addStatEntry("    " + powerSubs[a], BigInt(game.stats.powers[a]).toLocaleString("en-US"));
    }
    
    let tileSubs = {
        0: "Square",
        1: "Pentagon",
        2: "Rhombus",
        3: "Up Triangle",
        4: "Hexagon",
        5: "Down Triangle",
        6: "Circle",
    }
    let colors = ["#ff0000", "#49e400", "#0065eb", "#ff00e4", "#fb5500", "#eecb00", "#fff7ea"];
    let borders = ["#ccc", "#444", "#ccc", "#ccc", "#ccc", "#444", "#555"];
    if (Object.keys(game.stats.colors).length) {
        let best = Object.keys(tileSubs).reduce((x, y) => 
            BigInt(game.stats.colors[x] || 0n) > BigInt(game.stats.colors[y] || 0n) ? x : y, 0
        );
        addStatEntry("Favorite tile type", tileSubs[best]);
        let label = holder.controls[holder.controls.length - 1];
        label.fill = colors[best];
        label.stroke = borders[best];
    }

    holder.size.y += 20;

    if (game.boards.endless) {
        addStatEntry("Current Endless score", BigInt(game.boards.endless.score).toLocaleString("en-US"));
        holder.size.y += 20;
    }

    addStatEntry("Total XP gained", game.stats.totalExp.toLocaleString("en-US"));
    addStatEntry("Total time played", formatDuration(game.stats.timePlayed));
    holder.size.y += 20;

    ButtonWithText(popup.$content, {
        position: Ex(30, 120, 0, 75),
        size: Ex(-60, 60, 100),
    }, "Back", () => {
        popup.close();
    });
    
    return popup;
}