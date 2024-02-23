popups.gamemenu = function (parent) {
    if (popupAnim) return;

    let popup = doPopup(parent);
    popup.$title.text = "Menu";
    
    ButtonWithText(popup.$content, {
        position: Ex(30, 40, 0, 75),
        size: Ex(-60, 60, 100),
    }, "How to Play", () => {
        popups.help(popup);
    });
    
    ButtonWithText(popup.$content, {
        position: Ex(30, 120, 0, 75),
        size: Ex(-40, 60, 50),
    }, "Main Menu", () => {
        if (scene.$board.fallCount == 0) scene.$board.save();
        loadScreen("main");
    });

    ButtonWithText(popup.$content, {
        position: Ex(10, 120, 50, 75),
        size: Ex(-40, 60, 50),
    }, "Continue →", () => {
        popup.close();
    });

    return popup;
}
