popups.options = function (parent) {
    if (popupAnim) return;

    let popup = doPopup(parent);
    popup.$title.text = "Options";

    popup.$content.append(controls.scroller({
        position: Ex(0, -100, 0, 25),
        size: Ex(0, 200, 100, 50),
        fill: 0
    }), "view");

    let holder = popup.$content.$view.$content

    function addTitle(title) {
        let y = holder.size.y;
        holder.append(controls.label({
            position: Ex(30, y + 60),
            text: title,
            scale: 35,
            style: "700",
            align: "left",
        }));
        holder.size.y += 95;
    }

    function addList(id, title, desc = null, perPlayer = false, min = 0, max = 10, replacement = null) {
        let options = window[perPlayer ? "game" : "meta"].options;
        let y = holder.size.y;
        if (desc) holder.append(controls.label({
            position: Ex(30, y + 35),
            size: Ex(-330, 0, 100),
            text: desc,
            scale: 20,
            fill: "#fffa",
            align: "left",
            wrap: true,
        }));
        holder.append(controls.label({
            position: Ex(30, desc ? y + 10 : y + 30),
            text: title,
            scale: 25,
            style: perPlayer ? "italic" : "",
            align: "left",
        }));
        let upbutton = ButtonWithText(holder, {
            position: Ex(-90, desc ? y + 5 : y, 100),
            size: Ex(60, 60),
        }, "+", () => {
            options[id] = Math.min(options[id] + 1, max);
            save();
            update();
        });
        let text;
        holder.append(text = controls.label({
            position: Ex(-150, desc ? y + 35 : y + 30, 100),
            text: "",
            scale: 25,
        }));
        let downbutton = ButtonWithText(holder, {
            position: Ex(-270, desc ? y + 5 : y, 100),
            size: Ex(60, 60),
        }, "-", () => {
            options[id] = Math.max(options[id] - 1, min);
            save();
            update();
        });
        function update() {
            text.text = (replacement ? replacement[options[id]] ?? options[id] : options[id]).toString();
        }
        update();
        holder.size.y += desc ? 90 : 80;
    }

    function addToggle(id, title, desc = null, perPlayer = false) {
        let options = window[perPlayer ? "game" : "meta"].options;
        let y = holder.size.y;
        if (desc) holder.append(controls.label({
            position: Ex(30, y + 35),
            size: Ex(-240, 0, 100),
            text: desc,
            scale: 20,
            fill: "#fffa",
            align: "left",
            wrap: true,
        }));
        holder.append(controls.label({
            position: Ex(30, desc ? y + 10 : y + 30),
            text: title,
            scale: 25,
            style: perPlayer ? "italic" : "",
            align: "left",
        }));
        let button = ButtonWithText(holder, {
            position: Ex(-150, desc ? y + 5 : y, 100),
            size: Ex(120, 60),
        }, "", () => {
            options[id] = !options[id];
            save();
            update();
        });
        function update() {
            button.$text.text = options[id] ? "ON" : "OFF";
        }
        update();
        holder.size.y += desc ? 90 : 80;
    }

    addTitle("Display");
    addList("resolution", "Resolution", "Decreasing may improve performance.", false, 0, 2, ["LOW", "MED", "HIGH"]);
    addToggle("scorePopups", "Show Score Popups", "", true);
    addToggle("compliments", "Show Compliments", "Show responses when you gain large amounts of points in a move.", true);

    addTitle("Gameplay");
    addToggle("autoHint", "Auto-Hint", "Automatically show hints if you idle for too long.", true);
    addToggle("forceSwipe", "Force Swipe to Swap", "If on, clicking on an adjacent tile will select it instead of making a swap.", true);

    addTitle("Debug Stuff");
    addToggle("fpsCounter", "Show FPS Counter", "Show performance stats at the bottom left corner of the screen.");
    addToggle("showTouches", "Show Presses", "Visualize presses on the screen. Useful for recording.");

    holder.size.y += 20;

    holder.append(controls.label({
        position: Ex(0, holder.size.y + 40, 50),
        size: Ex(-60, 0, 100),
        text: "Options that have italicized titles are saved on a per-player basis.\n\n"
            + "For storage related settings please go to the Player Switcher (the ⇆ on the main screen) and select the \"Manage Storage\" option.",
        scale: 20,
        fill: "#fffa",
        wrap: true,
    }));

    holder.size.y += 220;

    ButtonWithText(popup.$content, {
        position: Ex(30, 120, 0, 75),
        size: Ex(-60, 60, 100),
    }, "Back", () => {
        popup.close();
    });
    
    return popup;
}