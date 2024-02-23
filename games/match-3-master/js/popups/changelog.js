popups.changelog = function (parent) {
    if (popupAnim) return;

    let popup = doPopup(parent);
    popup.$title.text = "Changelog";

    popup.$content.append(controls.scroller({
        position: Ex(0, -100, 0, 25),
        size: Ex(0, 200, 100, 50),
        fill: 0,
    }), "view");

    let holder = popup.$content.$view.$content

    function addTitle(title, date) {
        let y = holder.size.y;
        let label;
        holder.append(label = controls.label({
            position: Ex(30, y),
            size: Ex(-60, 40, 100),
            text: title,
            scale: 35,
            style: "700",
            align: "left",
            baseline: "top",
        }));
        if (date) label.append(controls.label({
            position: Ex(0, 10, 100),
            text: date,
            scale: 25,
            fill: "#fffa",
            align: "right",
            baseline: "top",
        }));
    }
    function addItem(content) {
        let y = holder.size.y;
        let label;
        holder.append(label = controls.label({
            position: Ex(70, y + 20),
            size: Ex(-100, 20, 100),
            text: content,
            scale: 25,
            align: "left",
            baseline: "top",
            wrap: true,
        }));
        label.append(controls.label({
            position: Ex(-20, y),
            text: "•",
            scale: 25,
            baseline: "top",
        }));
    }
    addTitle("v0.3.1", "Oct 18, 2023");
    addItem("Fixed importing saves throwing an error when there are player data conflicts.");
    addItem("Fixed keyboard + mouse controls not behaving correctly when lowering the resolution.");
    addItem("Fixed compliments not being correctly scaled.");
    addItem("Miscellaneous adjustments.");

    addTitle("v0.3", "Oct 16, 2023");
    addItem("Added compliments (those text that appears when you make a move that gives a large amount of points).");
    addItem("Added more options.");
    addItem("Some options are now moved to global storage.");
    addItem("Added dates to changelog, scroll bars to scrollers, and other random UI stuff.");

    addTitle("v0.2", "Oct 8, 2023");
    addItem("Three new gamemodes: Classic, Action, and Speed!");
    addItem("Changed the default game font to Overused Grotesk.");
    addItem("Added high score leaderboards for non-endless game modes.");
    addItem("Polished most of the user interface.");
    addItem("Implemented a player backup system.");
    addItem("Tweaked and fixed the game logic (again).");
    
    addTitle("v0.1", "Sep 12, 2023");
    addItem("The game now keeps a changelog! You'll see this panel pop up whenever a content update has been published.");
    addItem("Implemented keyboard controls. Use the arrow keys to move the selected tile and the WASD keys to swap to the corresponding direction.");
    addItem("You can now (re)name players.");
    addItem("Fixed a bug where Γ-shaped intersection matches sometimes are not correctly handled.");
    addItem("Some miscellaneous UI tweaks.");

    addTitle("v0.0 and before", "??? ??, ????");
    addItem("First version, created some stuff.");
    addItem("Released the game on galaxy.click.");
    addItem("Did some other stuff that was not documented.");

    popup.$content.append(controls.base({
        render() {
            holder.size.y = 0;
            for (let item of holder.controls) {
                holder.size.y += item.size.y;
                item.position.y = holder.size.y;
                if (item.lines) {
                    console.log(item.lines);
                    holder.size.y += item.scale * 1.2 * item.lines.length;
                    item.size.y += item.scale * 1.2 * item.lines.length;
                }
            }
            holder.size.y += 40;
            popup.$content.remove(popup.$content.$init);
        }
    }), "init");

    popup.$content.append(controls.base({
        render() {
            let min = -holder.position.y;
            let max = min + popup.$content.$view.rect.height / scale;
            for (let item of holder.controls) {
                item.alpha = item.position.y > max || item.position.y + item.size.y < min ? 0 : 1;
            }
        }
    }), "logic");

    ButtonWithText(popup.$content, {
        position: Ex(30, 120, 0, 75),
        size: Ex(-60, 60, 100),
    }, "Back", () => {
        popup.close();
    });
    
    return popup;
}