popups.playerOpt = function (parent, id) {
    if (popupAnim) return;

    let popup = doPopup(parent);
    popup.$title.text = meta.players[id].name;

    if (meta.currentPlayer != id) {
        ButtonWithText(popup.$content, {
            position: Ex(30, -40, 0, 75),
            size: Ex(-60, 60, 100),
        }, "Switch Player", () => {
            switchPlayer(id);
            loadScreen("main");
        });
        ButtonWithText(popup.$content, {
            position: Ex(30, 40, 0, 75),
            size: Ex(-60, 60, 100),
        }, "Delete Player", () => {
            popups.playerDel(popup, id);
        });
    } else {
        popup.$content.append(controls.label({
            position: Ex(0, 70, 50, 75),
            scale: 25,
            style: "italic",
            text: "This is the current player"
        }))
    }

    ButtonWithText(popup.$content, {
        position: Ex(30, 120, 0, 75),
        size: Ex(-60, 60, 100),
    }, "Back", () => {
        popup.close();
    });
    
    return popup;
}