popups.scores = function (parent) {
    if (popupAnim) return;

    let popup = doPopup(parent);
    popup.$title.text = "High Scores";

    let offset = 0;
    let targetOffset = 0;

    popup.$content.append(controls.scroller({
        position: Ex(0, 0, 0, 25),
        size: Ex(0, 100, 100, 50),
        fill: 0
    }), "view");

    let holder = popup.$content.$view.$content;

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

    let index = 0;
    function addScoreEntry(title, data, back) {
        let y = holder.size.y;
        if (back) holder.append(controls.rect({
            position: Ex(0, y),
            size: Ex(0, 60, 100),
            fill: "#fff1",
        }));
        index++;
        holder.append(controls.label({
            position: Ex(80, y + 30),
            text: index + ".",
            scale: 25,
            align: "right",
        }));
        holder.append(controls.label({
            position: Ex(100, y + 30),
            text: title,
            scale: 25,
            align: "left",
        }));
        holder.append(controls.label({
            position: Ex(-30, y + 30, 100),
            text: data,
            scale: 25,
            align: "right",
        }));
        holder.size.y += 60;
    }

    let modeList = {
        classic: "Classic",
        speed: "Speed",
        action: "Action",
    }
    let modeKeys = Object.keys(modeList);
    let viewingMode = "";

    function setMode(mode) {
        viewingMode = mode;
        let keyIndex = modeKeys.indexOf(mode);
        popup.$content.$title.$textprev.text = modeList[modeKeys[(keyIndex + modeKeys.length - 1) % modeKeys.length]];
        popup.$content.$title.$text.text = modeList[modeKeys[keyIndex]];
        popup.$content.$title.$textnext.text = modeList[modeKeys[(keyIndex + 1) % modeKeys.length]];
        
        holder.controls = [];
        popup.$content.$view.scrollPos = popup.$content.$view.scrollSpd =  holder.size.y = index = 0;
        for (let score of meta.scores[mode]) {
            addScoreEntry(meta.players[score.id]?.name ?? score.name, BigInt(score.score).toLocaleString("en-US"), index % 2 - 1)
        }
    }

    setMode("classic");

    ButtonWithText(popup.$content, {
        position: Ex(30, 120, 0, 75),
        size: Ex(-60, 60, 100),
    }, "Back", () => {
        popup.close();
    });
    
    return popup;
}