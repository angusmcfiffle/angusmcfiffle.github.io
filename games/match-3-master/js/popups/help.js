popups.help = function (parent) {
    if (popupAnim) return;

    let popup = doPopup(parent);
    popup.$title.text = "How to Play";
    
    let offset = 0;
    let targetOffset = 0;

    popup.$content.append(controls.scroller({
        position: Ex(0, -100, 0, 25),
        size: Ex(0, 100, 100),
        fill: "#0007",
        mask: true,
    }), "title");
    popup.$content.$title.append(controls.label({
        position: Ex(0, 0, 50, 50),
        text: "⮜",
        style: "700",
        fill: "#777",
        stroke: "#ccc",
        scale: 40,
    }), "prev");
    popup.$content.$title.append(controls.label({
        position: Ex(0, 0, 50, 50),
        text: "⮞",
        style: "700",
        fill: "#777",
        stroke: "#ccc",
        scale: 40,
    }), "next");
    popup.$content.$title.append(controls.label({
        position: Ex(0, 0, 50, 50),
        text: "Classic",
        style: "700",
        scale: 40,
    }), "text");
    popup.$content.$title.append(controls.label({
        position: Ex(0, 0, 50, 50),
        text: "Classic",
        style: "700",
        scale: 40,
    }), "textprev");
    popup.$content.$title.append(controls.label({
        position: Ex(0, 0, 50, 50),
        text: "Classic",
        style: "700",
        scale: 40,
    }), "textnext");
    popup.$content.$title.append(controls.base({
        position: Ex(0, 0),
        size: Ex(0, 0, 100, 100),
        onupdate() {
            offset += (targetOffset - offset) * (1 - (0.0001) ** (delta / 1000));
            if (offset < -0.5) {
                offset++;
                targetOffset++;
                let keyIndex = modeKeys.indexOf(viewingMode);
                setMode(modeKeys[(keyIndex + 1) % modeKeys.length]);
            }else if (offset > 0.5) {
                offset--;
                targetOffset--;
                let keyIndex = modeKeys.indexOf(viewingMode);
                setMode(modeKeys[(keyIndex + modeKeys.length - 1) % modeKeys.length]);
            }
        },
        onpointerdown() {
            if (mousePos.x < this.rect.x + this.rect.width / 2) targetOffset++;
            else targetOffset--;
        },
        render() {
            let title = popup.$content.$title;

            let sizeprev = ctx.measureText(title.$textprev.text).width;
            let size = ctx.measureText(title.$text.text).width;
            let sizenext = ctx.measureText(title.$textnext.text).width;

            title.$text.position.x = size * offset / scale;
            title.$textprev.position.x = title.$text.position.x - (sizeprev + size) / 2 / scale - 25;
            title.$textnext.position.x = title.$text.position.x + (sizenext + size) / 2 / scale + 25;

            title.$text.alpha = 1 - Math.abs(offset) / 1.5;
            title.$textprev.alpha = 1 - Math.abs(offset - 1) / 1.5;
            title.$textnext.alpha = 1 - Math.abs(offset + 1) / 1.5;

            let arrOffset = 50 + 10 * Math.sin(time / 2500);

            title.$prev.position.x = title.$text.position.x / 2 - (size / 2 / scale + arrOffset);
            title.$next.position.x = title.$text.position.x / 2 + (size / 2 / scale + arrOffset);

            title.$prev.alpha = title.$next.alpha = 1 - Math.abs(offset) * 2;
        }
    }), "logic");

    popup.$content.append(controls.label({
        position: Ex(0, -180, 50, 50),
        size: Ex(-60, 0, 100),
        scale: 25,
        wrap: true,
    }), "body")

    let modeList = {
        general: "General",
        classic: "Classic",
        speed: "Speed",
        action: "Action",
        endless: "Endless",
    }
    let modeKeys = Object.keys(modeList);
    let viewingMode = "";

    function setMode(mode) {
        viewingMode = mode;
        let keyIndex = modeKeys.indexOf(mode);
        popup.$content.$title.$textprev.text = modeList[modeKeys[(keyIndex + modeKeys.length - 1) % modeKeys.length]];
        popup.$content.$title.$text.text = modeList[modeKeys[keyIndex]];
        popup.$content.$title.$textnext.text = modeList[modeKeys[(keyIndex + 1) % modeKeys.length]];
        
        popup.$content.$body.text = {
            general: 
                "\n\nSwap adjacent tiles to make matches of 3 in a row.\n\n" +
                "\n\nEarn more points by matching more than 3 tiles in a row or making chain reactions.\n\n" +
                "\n\nMake a match of 4+ tiles to obtain special tiles with different properties!",
            classic: 
                "\n\nMake matches to fill up the rainbow meter below the board and level up.\n\n" +
                "\n\nYour level multiply your score! Level up to gain points faster.\n\n" +
                "\n\nTry not to run out of moves! Once you do, it's game over!",
            speed: 
                "\n\nMake matches to fill up the multiplier meter and score more points.\n\n" +
                "\n\nThe multiplier meter depletes over time, so try to make matches quickly!\n\n" +
                "\n\nYou only have 5 minutes. Make every second count!",
            action: 
                "\n\nMake matches to fill up the rainbow meter below the board and level up.\n\n" +
                "\n\nYour level multiply your score! Level up to gain points faster.\n\n" +
                "\n\nCountdown tiles will drop into the board. Don't let any count to zero!",
            endless: 
                "\n\n\n\n\n\n\n\n" +
                "\n\nIn this mode, the game can't end. Reach your inner peace with this stress-free mode!\n\n",
        }[mode];
    }

    setMode(scene.$board ? currentMode : "general");

    ButtonWithText(popup.$content, {
        position: Ex(30, 120, 0, 75),
        size: Ex(-60, 60, 100),
    }, "Back", () => {
        popup.close();
    });
    
    return popup;
}
