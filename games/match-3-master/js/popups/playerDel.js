popups.playerDel = function (parent, id) {
    if (popupAnim) return;

    let popup = doPopup(parent);
    popup.$title.text = "Delete Player?";

    ButtonWithText(popup.$content, {
        position: Ex(30, 40, 0, 75),
        size: Ex(-60, 60, 100),
    }, "Yes", () => {
        deletePlayer(id);
        let p = popup;
        while (p) {
            p.close();
            p = p.parent;
            popupAnim = false;
        }
        popups.switcher();
    });

    ButtonWithText(popup.$content, {
        position: Ex(30, 120, 0, 75),
        size: Ex(-60, 60, 100),
    }, "No", () => {
        popup.close();
    });
    
    return popup;
}