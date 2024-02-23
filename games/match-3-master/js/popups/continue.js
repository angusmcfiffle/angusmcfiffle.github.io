popups.continue = function (parent, mode, decideMode) {
    if (popupAnim) return;

    let popup = doPopup(parent);
    popup.$title.text = "Continue?";

    popup.$content.append(controls.label({
        position: Ex(0, -40, 50, 25),
        size: Ex(-60, 0, 100),
        scale: 25,
        text: 
            "There is a saved game in progress, what will you do?\n\n" +
            "Pressing \"New Game\" will forfeit your current game.",
        wrap: true,
    }), "subtitle")

    ButtonWithText(popup.$content, {
        position: Ex(30, 40, 0, 75),
        size: Ex(-40, 60, 50),
    }, "New Game", () => {
        delete game.boards[mode];
        decideMode(mode, true);
        popup.close();
    });
    ButtonWithText(popup.$content, {
        position: Ex(10, 40, 50, 75),
        size: Ex(-40, 60, 50),
    }, "Continue", () => {
        decideMode(mode, true);
        popup.close();
    });

    ButtonWithText(popup.$content, {
        position: Ex(30, 120, 0, 75),
        size: Ex(-60, 60, 100),
    }, "Back", () => {
        popup.close();
    });
    
    return popup;
}