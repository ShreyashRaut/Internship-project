// ── LOADER ──
function hideLoader() {
    document.getElementById('loader').classList.add('hide');
}
setTimeout(hideLoader, 1800);

// ── MOBILE NAV ──
document.getElementById('menuBtn').addEventListener('click', function () {
    document.getElementById('navLinks').classList.toggle('open');
});
document.querySelectorAll('.nav-links a').forEach(function (a) {
    a.addEventListener('click', function () {
        document.getElementById('navLinks').classList.remove('open');
    });
});

// ── SCROLL REVEAL ──
var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
        if (e.isIntersecting) e.target.classList.add('visible');
    });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(function (el) {
    observer.observe(el);
});

// ── SMOOTH SCROLL ──
document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
        e.preventDefault();
        var target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});
