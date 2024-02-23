screens.intro = function () {

    scene.append(controls.label({
        position: Ex(-300, -100, 50, 45),
        size: Ex(500, 0),
        scale: 70,
        text: "Yet Another Match-3 Clone.",
        style: "700",
        wrap: true,
        align: "left",
        alpha: 0,
    }), "title")

    scene.append(controls.label({
        position: Ex(0, 50, 50, 70),
        scale: 25,
        text: "Click or touch the screen to start",
        style: "italic",
        alpha: 0,
    }), "action")

    scene.append(controls.label({
        position: Ex(0, -60, 50, 100),
        scale: 15,
        text: "Version " + version + "\nGame created by ducdat0507",
        style: "italic",
        alpha: 0,
    }), "info")

    let isAnimating = true;

    scene.append(controls.base({
        position: Ex(0, 0),
        size: Ex(0, 0, 100, 100),
        onpointerdown () {
            if (!isAnimating) {
                isAnimating = true;
                startAnimation(outtro);
            }
        },
        onupdate() {
            let tWidth = Math.min(mainCanvas.width / scale, 1000);
            scene.$title.scale = tWidth / 9;
            scene.$title.size = Ex(tWidth * 0.8, 0);
            scene.$title.position.x = -tWidth * 0.4;

            scene.$action.position.y = 50 + Math.sin(time / 1000) * 10;
        }
    }), "logic");

    startAnimation(x => {
        scene.$title.alpha = ease.cubic.out(Math.min(Math.max((x - 100) / 500, 0), 1));
        scene.$action.alpha = ease.cubic.out(Math.min(Math.max((x - 300) / 500, 0), 1));
        scene.$info.alpha = ease.cubic.out(Math.min(Math.max((x - 500) / 500, 0), 1)) * 0.5;
        if (x >= 1000) isAnimating = false;
        return x >= 1000;
    });

    function outtro(x) {
        scene.$title.position.ex = 50 + ease.quart.in(x / 1000) * 100;
        scene.$action.position.ex = 50 - ease.quart.in(x / 1000) * 100;
        scene.$action.alpha = Math.cos(x / 20) / 2 + .5;
        scene.$info.alpha = 0.5 - ease.cubic.in(Math.min(x / 1000, 1)) * 0.5;
        if (x >= 1000) loadScreen("main");
        return x >= 1000;
    }
}