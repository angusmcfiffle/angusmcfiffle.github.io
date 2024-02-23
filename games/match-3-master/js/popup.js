var popups = {};

let popupAnim = false;

function doPopup(parent) {
    let popup;
    scene.append(popup = controls.rect({
        position: parent ? Ex(-280, 0, 50) : Ex(0, 0),
        size: parent ? Ex(560, 0, 0, 100) : Ex(0, 0, 100, 100),
        fill: "#0000",
        close() {
            if (!popupAnim) {
                popupAnim = true;
                outtro();
            }
        },
        parent,
    }))
    popup.append(controls.rect({
        position: Ex(-280, 0, 50),
        size: Ex(560, 0, 0, 100),
        fill: "#444",
        alpha: 0,
    }), "back")
    popup.append(controls.rect({
        position: Ex(-276, 0, 50),
        size: Ex(552, 0, 0, 100),
        fill: "#0007",
        alpha: 0,
    }), "content")
    popup.append(controls.label({
        position: Ex(-246, -80, 50, 20),
        scale: 50,
        style: "700",
        fill: "#aaa",
        align: "left",
        baseline: "alphabetic",
        alpha: 0,
    }), "title")
    popup.append(controls.rect({
        position: Ex(-280, 0, 50, 100),
        size: Ex(560, 0, 0, 100),
        fill: "#777",
    }), "fill")

    function setContentAlpha(value) {
        if (parent) parent.$back.alpha = 1 - value;
        popup.$back.alpha = popup.$content.alpha = popup.$title.alpha = value;
        popup.$content.clickthrough = value == 0;
    }

    function intro() {
        function anim1(x) {
            popup.$fill.position.ey = 100 * (1 - clamp01(x / 150));
            popup.fill = "rgba(0, 0, 0, " + clamp01(x / 150) * .75 + ")";
            if (x >= 150) {
                setContentAlpha(1);
                startAnimation(anim2);
                return true;
            }
        }
        function anim2(x) {
            popup.$fill.size.ey = 100 * (1 - clamp01(x / 150));
            if (x >= 150) {
                popupAnim = false;
                return true;
            }
        }
        startAnimation(anim1);
    }

    function outtro() {
        function anim1(x) {
            popup.$fill.size.ey = 100 * clamp01(x / 150);
            if (x >= 150) {
                setContentAlpha(0);
                mainCanvas.style.cursor = "";
                startAnimation(anim2);
                return true;
            }
        }
        function anim2(x) {
            popup.$fill.position.ey = 100 * clamp01(x / 150);
            popup.fill = "rgba(0, 0, 0, " + (1 - clamp01(x / 150)) * .75 + ")";
            if (x >= 150) {
                scene.remove(popup);
                popupAnim = false;
                return true;
            }
        }
        startAnimation(anim1);
    }

    popupAnim = true;
    intro();

    return popup;
}