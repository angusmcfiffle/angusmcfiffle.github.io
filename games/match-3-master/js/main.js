let mainCanvas
let ctx;

let version = "0.3.1";
let versionIndex = 4;

function init() {
    mainCanvas = document.getElementById("main-canvas");
    ctx = mainCanvas.getContext("2d");

    bindPointerEvent("onpointerdown", "mousedown", "touchstart");
    bindPointerEvent("onpointermove", "mousemove", "touchmove");
    bindPointerEvent("onpointerup", "mouseup", "touchend");
    bindPointerEvent("onmousewheel", "wheel");
    window.oncontextmenu = e => false;
    window.onkeydown = handleKeys;
    window.onbeforeunload = () => {
        if (scene.$board && scene.$board.fallCount == 0) scene.$board.save();
    }
    
    load();
    loadRes();
    loadScreen("intro");

    loop();
}

let time = performance.now();
let delta = 0;
let strain = [];
let fps = [];

let scene = controls.base();
let screens = {}
let scale = 1;
let resScale = 1;

let currentMode = "";

function loop(timestamp) {
    delta = (timestamp ?? performance.now()) - time;
    time += delta;
    fps.push(delta);
    if (fps.length > 60) fps.shift();
    delta = Math.max(Math.min(delta, 1000), 0);

    resScale = [0.5, 0.75, 1][meta.options.resolution];
    let width = mainCanvas.width = window.innerWidth * resScale;
    let height = mainCanvas.height = window.innerHeight * resScale;
    scale = Math.min(width / 600, height / 800, window.devicePixelRatio * resScale);
    // ctx.fillStyle = "#000";
    // ctx.fillRect(0, 0, width, height);
    ctx.lineJoin = "round";


    updateAnimations();
    updateInMouseState(scene.controls);
    renderControls(scene.controls, { x: 0, y: 0, width, height });


    if (meta.options.showTouches) {
        if (isDown) {
            ctx.fillStyle = "#aaaa";
            ctx.beginPath();
            ctx.arc(mousePos.x, mousePos.y, 30 * scale, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    if (meta.options.fpsCounter) {
        ctx.fillStyle = "#fff";
        ctx.font = (10 * scale) + "px " + fontFamily;
        ctx.textAlign = "left";
        ctx.textBaseline = "alphabetic";
        ctx.fillText(
            (1000 / fps.reduce((x, y) => x + y, 0) * fps.length).toFixed(2) + "fps ("
                + (1000 / Math.max(...fps)).toFixed(2) + " | "
                + (1000 / fps[fps.length - 1]).toFixed(2) + " | "
                + (1000 / Math.min(...fps)).toFixed(2) + ")",
            15 * scale, height - 35 * scale
        )
        ctx.fillText(
            "strain: " + (strain.reduce((x, y) => x + y, 0) / strain.length).toFixed(2) + "ms",
            15 * scale, height - 20 * scale
        )
    }

    strain.push(performance.now() - time);
    if (strain.length > 10) strain.shift();
    window.requestAnimationFrame(loop);
}

function renderControls(cts, rect, alpha = 1) {
    for (let ct of cts) {
        ct.rect = Rect(
            ct.position.x * scale + ct.position.ex * rect.width / 100 + rect.x,
            ct.position.y * scale + ct.position.ey * rect.height / 100 + rect.y,
            ct.size.x * scale + ct.size.ex * rect.width / 100,
            ct.size.y * scale + ct.size.ey * rect.height / 100,
        );
        let a = alpha * ct.alpha;
        ctx.globalAlpha = a;
        ct.onupdate();
        if (a > 0) {
            if (ct.mask) { 
                ctx.save();
                ctx.beginPath();
                ctx.lineTo(ct.rect.x, ct.rect.y);
                ctx.lineTo(ct.rect.x + ct.rect.width, ct.rect.y);
                ctx.lineTo(ct.rect.x + ct.rect.width, ct.rect.y + ct.rect.height);
                ctx.lineTo(ct.rect.x, ct.rect.y + ct.rect.height);
                ctx.clip();
            }
            ct.render();
        }
        if (ct.controls.length) renderControls (ct.controls, ct.rect, a);
        if (a > 0 && ct.mask) {
            ctx.restore();
        }
    }
}

let pointers = {};
let mousePos = { x: 0, y: 0 }
let lastArgs;
let isTouch;
let isDown;

function updateInMouseState(cts, clickthrough = false, did = false) {
    let did2 = did;
    for (let ct of [...cts].reverse()) {

        let ctr = clickthrough || ct.clickthrough

        if (!ctr && !did && mousePos.x >= ct.rect.x && mousePos.y >= ct.rect.y
            && mousePos.x <= ct.rect.x + ct.rect.width
            && mousePos.y <= ct.rect.y + ct.rect.height) {
            if (!ct.__mouseIn) {
                ct.onpointerin(mousePos, lastArgs);
                ct.__mouseIn = true;
            }
            did = true;
        } else {
            if (ct.__mouseIn) {
                ct.onpointerout(mousePos, lastArgs);
                ct.__mouseIn = false;
            }
        }

        if (ct.controls.length) {
            if (updateInMouseState(ct.controls, ctr, did2)) did = true;
        }

        did2 = did;
    }
    return did;
}

function doPointerEvent(pos, cts, event, args, did = false) {
    let did2 = did;
    for (let ct of [...cts].reverse()) {
        if (ct.clickthrough) continue;

        if (!did && pos.x >= ct.rect.x && pos.y >= ct.rect.y
            && pos.x <= ct.rect.x + ct.rect.width
            && pos.y <= ct.rect.y + ct.rect.height) {
            ct[event](pos, args);
            did = true;
        }

        if (ct.controls.length) {
            if (doPointerEvent(pos, ct.controls, event, args, did2)) did = true;
        }

        did2 = did;
    }
    return did;
}

function doMouseEvent(e, type) {
    if (type == "onpointerdown") isDown = true;
    else if (type == "onpointerup") isDown = false;
    let pos = mousePos = { x: e.clientX * resScale, y: e.clientY * resScale };
    lastArgs = e;
    doPointerEvent(pos, scene.controls, type, e);
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    isTouch = false;
    return false;
}
function doTouchEvent(e, type) {
    if (type == "onpointerdown") isDown = true;
    else if (type == "onpointerup") isDown = false;
    for (let touch of e.changedTouches) {
        let pos = mousePos = { x: touch.clientX * resScale, y: touch.clientY * resScale };
        touch.touches = e.touches;
        lastArgs = touch;
        doPointerEvent(pos, scene.controls, type, touch);
    }
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    isTouch = true;
    return false;
}

function loadScreen(screenName, clear = true) {
    if (clear) scene = controls.base();
    screens[screenName]();
}

function bindPointerEvent(type, mouse, touch) {
    window.addEventListener(mouse, e => doMouseEvent(e, type));
    window.addEventListener(touch, e => doTouchEvent(e, type), { passive: false });
}

function handleKeys(e) {
    if (e.repeat) return;

    if (scene.$board) {
        if (scene.$board.clickthrough) return;

        let swapPos = scene.$board.swapPos;
        let board = scene.$board.board;

        if (!swapPos) {
            let rect = scene.$board.rect;
            let size = Math.min(rect.width / board.width, rect.height / board.height);
            swapPos = {
                x: Math.floor((mousePos.x - rect.x) / size),
                y: Math.floor((mousePos.y - rect.y) / size),
            }
        }
        
        let { x, y } = swapPos;

        switch (e.key) {
            case "w": scene.$board.makeMatch(swapPos, { x, y: y - 1 }); break;
            case "s": scene.$board.makeMatch(swapPos, { x, y: y + 1 }); break;
            case "a": scene.$board.makeMatch(swapPos, { x: x - 1, y }); break;
            case "d": scene.$board.makeMatch(swapPos, { x: x + 1, y }); break;
            case "ArrowUp": scene.$board.swapPos = { x, y: Math.max(y - 1, 0) }; break;
            case "ArrowDown": scene.$board.swapPos = { x, y: Math.min(y + 1, board.height - 1) }; break;
            case "ArrowLeft": scene.$board.swapPos = { x: Math.max(x - 1, 0), y }; break;
            case "ArrowRight": scene.$board.swapPos = { x: Math.min(x + 1, board.width - 1), y }; break;
        }
    }
}