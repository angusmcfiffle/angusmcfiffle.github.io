function loadRes() {
    for (let cat in res) {
        for (let id in res[cat]) {
            let img = new Image();
            img.src = res[cat][id];
            res[cat][id] = img;
        }
    }
}

let res = {
    images: {
        "no-unity": "res/i-hate-unity.gif",
    },
}