let startTime = 0;
let elapsedTime = 0;
let interval;
let running = false;
let lapCounter = 1;

const display = document.getElementById("display");
const needle = document.getElementById("needle");
const laps = document.getElementById("laps");
const startBtn = document.getElementById("startBtn");

function format(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const seconds = totalSeconds % 60;
    const minutes = Math.floor(totalSeconds / 60) % 60;
    const hours = Math.floor(totalSeconds / 3600);

    return (
        String(hours).padStart(2, "0") + " : " +
        String(minutes).padStart(2, "0") + " : " +
        String(seconds).padStart(2, "0")
    );
}

function update() {
    elapsedTime = Date.now() - startTime;
    display.textContent = format(elapsedTime);

    const seconds = (elapsedTime / 1000) % 60;
    const rotation = seconds * 6; // 360deg / 60
    needle.style.transform = `translateX(-50%) rotate(${rotation}deg)`;
}

startBtn.onclick = () => {
    if (!running) {
        running = true;
        startBtn.textContent = "PAUSE";
        startTime = Date.now() - elapsedTime;
        interval = setInterval(update, 100);
    } else {
        running = false;
        startBtn.textContent = "START";
        clearInterval(interval);

        const lap = document.createElement("div");
        lap.textContent = `Lap ${lapCounter++}  —  ${format(elapsedTime)}`;
        laps.prepend(lap);
    }
};

document.getElementById("resetBtn").onclick = () => {
    running = false;
    clearInterval(interval);
    elapsedTime = 0;
    display.textContent = "00 : 00 : 00";
    needle.style.transform = "translateX(-50%) rotate(0deg)";
    startBtn.textContent = "START";
    laps.innerHTML = "";
    lapCounter = 1;
};
