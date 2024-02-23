popups.importConflict = function (parent, lines, reason, exec) {
    if (popupAnim) return;

    let popup = doPopup(parent);
    popup.$title.text = "Hold up!";

    popup.$content.append(controls.label({
        position: Ex(0, -40, 50, 25),
        size: Ex(-60, 0, 100),
        scale: 25,
        text: 
            {
                player: "This backup is meant for another player (" + lines[1] + ")"
            }[reason] + "\n\nWould you still want to restore this player backup?",
        wrap: true,
    }), "subtitle")

    ButtonWithText(popup.$content, {
        position: Ex(30, 40, 0, 75),
        size: Ex(-60, 60, 100),
    }, "Yes", () => {
        exec();
    });

    ButtonWithText(popup.$content, {
        position: Ex(30, 120, 0, 75),
        size: Ex(-60, 60, 100),
    }, "No", () => {
        popup.close();
    });
    
    return popup;
}