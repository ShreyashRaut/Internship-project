/* NAVBAR COLOR TRANSITION */
window.addEventListener("scroll", () => {
    const navbar = document.getElementById("navbar");

    let scroll = window.scrollY;
    let maxScroll = 300;

    if (scroll > maxScroll) scroll = maxScroll;

    let progress = scroll / maxScroll;
    let value = Math.round(255 - (255 * progress));

    navbar.style.background = `rgb(${value}, ${value}, ${value})`;

    const links = document.querySelectorAll(".nav-links a");
    const logo = document.querySelector(".brand");

    if (progress > 0.5) {
        links.forEach(link => link.style.color = "white");
        logo.style.color = "white";
    } else {
        links.forEach(link => link.style.color = "black");
        logo.style.color = "black";
    }
});

/* SCROLL REVEAL */
const reveals = document.querySelectorAll(".reveal");

function revealOnScroll() {
    const trigger = window.innerHeight * 0.85;

    reveals.forEach(section => {
        const top = section.getBoundingClientRect().top;
        if (top < trigger) section.classList.add("active");
    });
}

window.addEventListener("scroll", revealOnScroll);
revealOnScroll();

/* CURSOR GLOW */
const glow = document.getElementById("cursor-glow");

window.addEventListener("mousemove", (e) => {
    glow.style.left = e.clientX + "px";
    glow.style.top = e.clientY + "px";
});

/* PARTICLES */
const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];

for (let i = 0; i < 80; i++) {
    particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2 + 1,
        dx: (Math.random() - 0.5) * 0.5,
        dy: (Math.random() - 0.5) * 0.5
    });
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
        p.x += p.dx;
        p.y += p.dy;

        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,170,255,0.5)";
        ctx.fill();
    });

    requestAnimationFrame(animateParticles);
}

animateParticles();
