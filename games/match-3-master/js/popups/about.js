popups.about = function (parent) {
    if (popupAnim) return;

    let popup = doPopup(parent);
    popup.$title.text = "About";

    popup.$content.append(controls.scroller({
        position: Ex(0, -100, 0, 25),
        size: Ex(0, 200, 100, 50),
        fill: 0
    }), "view");

    let holder = popup.$content.$view.$content

    function addTitle(title) {
        let y = holder.size.y;
        holder.append(controls.label({
            position: Ex(0, y + 20, 50),
            text: title,
            scale: 20,
            fill: "#aaa",
            baseline: "top",
        }));
        holder.size.y += 24;
    }
    function addLine(title) {
        let y = holder.size.y;
        holder.append(controls.label({
            position: Ex(0, y + 20, 50),
            text: title,
            scale: 25,
            baseline: "top",
        }));
        holder.size.y += 30;
    }
    
    holder.append(controls.label({
        position: Ex(100, 80),
        text: "Yet Another\nMatch-3 Clone.",
        align: "left",
        scale: 50,
        style: "700",
    }));

    holder.size.y += 180;

    addLine("Version " + version);
    
    holder.size.y += 40;

    addTitle("Created by:");
    ButtonWithText(holder, {
        position: Ex(30, holder.size.y + 30),
        size: Ex(-60, 60, 100),
    }, "ducdat0507", () => {
        window.open("https://ducdat0507.github.io", '_blank');;
    });
    
    holder.size.y += 120;

    addTitle("This game is open source!");
    ButtonWithText(holder, {
        position: Ex(30, holder.size.y + 30),
        size: Ex(-60, 60, 100),
    }, "GitHub Repository", () => {
        window.open("https://github.com/ducdat0507/match-3", '_blank');;
    });
    
    holder.size.y += 120;

    addTitle("Made with HTML5 and vanilla JavaScript.");
    addTitle("(zero libraries used!!!!)");
    
    holder.size.y += 40;

    addTitle("This game is inspired by other match-3 games (duh),");
    addTitle("most dominantly the Bejeweled series and such.");
    
    holder.size.y += 40;

    addTitle("Font attribution:");
    ButtonWithText(holder, {
        position: Ex(30, holder.size.y + 30),
        size: Ex(-60, 60, 100),
    }, '"Overused Grotesk" by RandomMaerks', () => {
        window.open("https://github.com/RandomMaerks/Overused-Grotesk/", '_blank');;
    });
    holder.size.y += 70;
    holder.append(controls.rect({
        position: Ex(30, holder.size.y + 30),
        size: Ex(-60, 2, 100),
        fill: "#fff7",
    }));
    holder.size.y += 12;
    ButtonWithText(holder, {
        position: Ex(30, holder.size.y + 30),
        size: Ex(-60, 60, 100),
    }, "View Font License", () => {
        window.open("./css/FONT-LICENSE.txt", '_blank');;
    });

    holder.size.y += 120;

    addTitle("Not made with Unity");
    holder.append(controls.image({
        position: Ex(-20, holder.size.y + 20, 50),
        size: Ex(40, 40),
        src: res.images["no-unity"],
    }));
    
    holder.size.y += 110;

    ButtonWithText(popup.$content, {
        position: Ex(30, 120, 0, 75),
        size: Ex(-60, 60, 100),
    }, "Back", () => {
        popup.close();
    });
    
    return popup;
}