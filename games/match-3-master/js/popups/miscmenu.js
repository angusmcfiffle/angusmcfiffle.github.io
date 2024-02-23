popups.miscmenu = function (parent) {
    if (popupAnim) return;

    let popup = doPopup(parent);
    popup.$title.text = "Menu";
    popup.$content.append(controls.scroller({
        position: Ex(0, -100, 0, 25),
        size: Ex(0, 200, 100, 50),
        fill: 0
    }), "view");

    let holder = popup.$content.$view.$content

    function addEntry(title, id) {
        let y = holder.size.y;
        let btn = ButtonWithText(holder, {
            position: Ex(30, y + 20),
            size: Ex(-60, 60, 100),
        }, title, () => {
            popups[id](popup);
        });
        holder.size.y += 80;
    }

    addEntry("How to Play", "help");
    addEntry("Options", "options");
    addEntry("About", "about");
    addEntry("Changelog", "changelog");

    holder.size.y += 20;

    

    ButtonWithText(popup.$content, {
        position: Ex(30, 120, 0, 75),
        size: Ex(-60, 60, 100),
    }, "Back", () => {
        popup.close();
    });
    
    return popup;
}
