popups.switcher = function (parent) {
    if (popupAnim) return;

    let popup = doPopup(parent);
    popup.$title.text = "Player Switcher";

    popup.$content.append(controls.scroller({
        position: Ex(0, -100, 0, 25),
        size: Ex(0, 120, 100, 50),
        fill: 0
    }), "view");

    let holder = popup.$content.$view.$content

    function addEntry(id) {
        let y = holder.size.y;
        let btn = ButtonWithText(holder, {
            position: Ex(30, y + 20),
            size: Ex(-60, 60, 100),
        }, meta.currentPlayer == id ? "⮞   " + meta.players[id].name + "   ⮜" : meta.players[id].name, () => {
            popups.playerOpt(popup, id);
        });
        holder.size.y += 80;
    }

    for (let id in meta.players) addEntry(id);

    ButtonWithText(popup.$content, {
        position: Ex(30, 40, 0, 75),
        size: Ex(-40, 60, 50),
    }, "New Player", () => {
        popups.playerName(popup);
    });
    
    ButtonWithText(popup.$content, {
        position: Ex(10, 40, 50, 75),
        size: Ex(-40, 60, 50),
    }, "Manage Storage", () => {
        popups.storage(popup);
    });

    ButtonWithText(popup.$content, {
        position: Ex(30, 120, 0, 75),
        size: Ex(-60, 60, 100),
    }, "Back", () => {
        popup.close();
    });
    
    return popup;
}