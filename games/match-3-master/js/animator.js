let animations = [];

function startAnimation(func) {
    animations.push({
        func,
        time: 0,
    })
    func(0);
}

function updateAnimations() {
    for (let a = 0; a < animations.length; a++) {
        let data = animations[a];
        data.time += delta;
        if (data.func(data.time)) {
            animations.splice(a, 1);
            a--;
        }
    }
}

function makeEase(func) {
    return {
        in: x => func(x),
        out: x => 1 - func(1 - x),
        inout: x => x < 0.5 ? func(x * 2) / 2 : (1 - func(2 - x * 2)) / 2 + .5
    }
}
function clamp01(x) {
    return Math.min(Math.max(x, 0), 1);
}

let ease = {
    linear: makeEase(x => x),
    quad: makeEase(x => x ** 2),
    cubic: makeEase(x => x ** 3),
    quart: makeEase(x => x ** 4),
    quint: makeEase(x => x ** 5),
}