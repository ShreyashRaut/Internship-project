/**
 * ============================================================
 *  WEATHER APP — app.js  (Vivid Redesign)
 *  Replace API_KEY below with your OpenWeatherMap key.
 * ============================================================
 */

"use strict";

/* ── CONFIG ── */
const API_KEY = "122ee0a479620319bd37e6ad94c5e91a";
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

/* ── DOM REFS ── */
const body         = document.getElementById("body");
const cityInput    = document.getElementById("cityInput");
const searchBtn    = document.getElementById("searchBtn");
const geoBtn       = document.getElementById("geoBtn");
const errorMsg     = document.getElementById("errorMsg");
const spinnerWrap  = document.getElementById("spinnerWrap");
const weatherCard  = document.getElementById("weatherCard");
const emptyState   = document.getElementById("emptyState");

const cityNameEl      = document.getElementById("cityName");
const countryDateEl   = document.getElementById("countryDate");
const localTimeEl     = document.getElementById("localTime");
const weatherIconEl   = document.getElementById("weatherIcon");
const weatherDescEl   = document.getElementById("weatherDesc");
const tempValueEl     = document.getElementById("tempValue");
const feelsLikeEl     = document.getElementById("feelsLike");
const humidityEl      = document.getElementById("humidity");
const windSpeedEl     = document.getElementById("windSpeed");
const pressureEl      = document.getElementById("pressure");
const visibilityEl    = document.getElementById("visibility");
const sunriseSunsetEl = document.getElementById("sunriseSunset");
const lastUpdatedEl   = document.getElementById("lastUpdated");
const unitToggle      = document.getElementById("unitToggle");
const iconGlow        = document.getElementById("iconGlow");

/* ── STATE ── */
let currentUnit   = "metric";
let cachedWeather = null;
let clockInterval = null;

/* ════════════════════════════════
   PARTICLE CANVAS BACKGROUND
   Draws tiny floating star dots
════════════════════════════════ */
(function initParticles() {
  const canvas = document.getElementById("particleCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let W, H, particles = [];

  // Resize canvas to fill window
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  // Create N particles
  function createParticles(n) {
    particles = [];
    for (let i = 0; i < n; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.6 + 0.3,          // radius 0.3 – 1.9
        vx: (Math.random() - 0.5) * 0.25,       // x velocity
        vy: (Math.random() - 0.5) * 0.15,       // y drift
        opacity: Math.random() * 0.7 + 0.15,
        pulse: Math.random() * Math.PI * 2,     // phase offset for twinkle
      });
    }
  }
  createParticles(130);

  // Animation loop
  function draw() {
    ctx.clearRect(0, 0, W, H);

    particles.forEach((p) => {
      // Twinkle effect via sine wave on opacity
      p.pulse += 0.015;
      const alpha = p.opacity * (0.6 + 0.4 * Math.sin(p.pulse));

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.fill();

      // Move
      p.x += p.vx;
      p.y += p.vy;

      // Wrap around edges
      if (p.x < -5)  p.x = W + 5;
      if (p.x > W+5) p.x = -5;
      if (p.y < -5)  p.y = H + 5;
      if (p.y > H+5) p.y = -5;
    });

    requestAnimationFrame(draw);
  }
  draw();
})();

/* ════════════════════════════════
   EVENT LISTENERS
════════════════════════════════ */
searchBtn.addEventListener("click", handleSearch);
cityInput.addEventListener("keydown", (e) => { if (e.key === "Enter") handleSearch(); });
geoBtn.addEventListener("click", handleGeo);

// Unit toggle
unitToggle.addEventListener("click", (e) => {
  const btn = e.target.closest(".u-btn");
  if (!btn) return;
  const newUnit = btn.dataset.unit;
  if (newUnit === currentUnit) return;

  document.querySelectorAll(".u-btn").forEach((b) => {
    b.classList.toggle("active", b.dataset.unit === newUnit);
    b.setAttribute("aria-pressed", b.dataset.unit === newUnit ? "true" : "false");
  });

  currentUnit = newUnit;
  if (cachedWeather) renderTemperatures(cachedWeather);
});

/* ════════════════════════════════
   SEARCH & GEO HANDLERS
════════════════════════════════ */
function handleSearch() {
  const city = cityInput.value.trim();
  if (!city) { showError("Please enter a city name."); return; }
  fetchWeatherByCity(city);
}

function handleGeo() {
  if (!navigator.geolocation) { showError("Geolocation not supported."); return; }
  showSpinner(); clearError();

  navigator.geolocation.getCurrentPosition(
    ({ coords }) => fetchWeatherByCoords(coords.latitude, coords.longitude),
    (err) => {
      hideSpinner();
      const msgs = { 1:"Location access denied.", 2:"Location unavailable.", 3:"Request timed out." };
      showError(msgs[err.code] || "Unable to get location.");
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
  );
}

/* ════════════════════════════════
   FETCH FUNCTIONS
════════════════════════════════ */
async function fetchWeatherByCity(city) {
  const url = `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${currentUnit}`;
  await fetchAndRender(url);
}

async function fetchWeatherByCoords(lat, lon) {
  const url = `${BASE_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${currentUnit}`;
  await fetchAndRender(url);
}

async function fetchAndRender(url) {
  showSpinner(); clearError();

  // Guard: placeholder key check
  if (!API_KEY || API_KEY === "YOUR_API_KEY_HERE") {
    hideSpinner();
    showError("⚠️ Add your OpenWeatherMap API key in app.js (line 11).");
    return;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || `Error ${response.status}`);
    }
    const data = await response.json();
    data._fetchedUnit = currentUnit;
    cachedWeather = data;
    renderWeatherCard(data);
  } catch (error) {
    hideSpinner();
    showError(formatError(error.message));
  }
}

/* ════════════════════════════════
   RENDER
════════════════════════════════ */
function renderWeatherCard(data) {
  const {
    name,
    sys: { country, sunrise, sunset },
    timezone,
    weather: [{ description, icon, main: condGroup }],
    main: { temp, feels_like, humidity, pressure },
    wind: { speed: windSpeed },
    visibility,
    dt,
  } = data;

  // Location & date
  cityNameEl.textContent    = name;
  countryDateEl.textContent = `${country} · ${unixToLocalDate(dt, timezone)}`;

  // Live clock
  startLocalClock(timezone);

  // Icon
  weatherIconEl.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
  weatherIconEl.alt = description;
  weatherDescEl.textContent = description;

  // Temperatures
  renderTemperatures(data);

  // Stats
  humidityEl.textContent    = `${humidity}%`;
  windSpeedEl.textContent   = `${windSpeed.toFixed(1)} ${currentUnit === "metric" ? "m/s" : "mph"}`;
  pressureEl.textContent    = `${pressure} hPa`;
  visibilityEl.textContent  = visibility ? `${(visibility / 1000).toFixed(1)} km` : "N/A";
  sunriseSunsetEl.textContent =
    `${unixToLocalTime(sunrise, timezone)} / ${unixToLocalTime(sunset, timezone)}`;

  // Last updated
  lastUpdatedEl.textContent = `Updated ${new Date().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" })}`;

  // Theme
  applyTheme(condGroup);

  // Show card
  hideSpinner();
  emptyState.hidden  = true;
  weatherCard.hidden = false;
}

function renderTemperatures(data) {
  const { main: { temp, feels_like }, wind: { speed } } = data;
  const fetchedUnit = data._fetchedUnit || "metric";
  const needConvert = fetchedUnit !== currentUnit;
  const sym  = currentUnit === "metric" ? "°C" : "°F";
  const wSym = currentUnit === "metric" ? "m/s" : "mph";

  const t  = needConvert ? convertTemp(temp, fetchedUnit)       : temp;
  const fl = needConvert ? convertTemp(feels_like, fetchedUnit) : feels_like;
  const ws = needConvert ? convertWind(speed, fetchedUnit)      : speed;

  tempValueEl.textContent  = `${Math.round(t)}${sym}`;
  feelsLikeEl.textContent  = `${Math.round(fl)}${sym}`;
  windSpeedEl.textContent  = `${ws.toFixed(1)} ${wSym}`;
}

/* ════════════════════════════════
   THEME
════════════════════════════════ */
function applyTheme(condGroup) {
  // Remove previous theme classes
  [...body.classList].forEach(c => { if (c.startsWith("weather-")) body.classList.remove(c); });

  const map = {
    Clear:"weather-clear", Clouds:"weather-clouds",
    Rain:"weather-rain", Drizzle:"weather-rain",
    Thunderstorm:"weather-storm", Snow:"weather-snow",
    Mist:"weather-mist", Smoke:"weather-mist", Haze:"weather-mist",
    Dust:"weather-mist", Fog:"weather-mist", Sand:"weather-mist",
    Ash:"weather-mist", Squall:"weather-storm", Tornado:"weather-storm",
  };

  body.classList.add(map[condGroup] || "weather-default");
}

/* ════════════════════════════════
   CLOCK
════════════════════════════════ */
function startLocalClock(tzOffset) {
  if (clockInterval) clearInterval(clockInterval);
  const tick = () => {
    const localMs = Date.now() + tzOffset * 1000;
    localTimeEl.textContent = new Date(localMs).toUTCString().slice(17, 25);
  };
  tick();
  clockInterval = setInterval(tick, 1000);
}

/* ════════════════════════════════
   HELPERS
════════════════════════════════ */
function unixToLocalDate(unix, tz) {
  return new Date((unix + tz) * 1000).toUTCString().slice(0, 16);
}
function unixToLocalTime(unix, tz) {
  return new Date((unix + tz) * 1000).toUTCString().slice(17, 22);
}
function convertTemp(v, from) {
  return from === "metric" ? (v * 9/5) + 32 : (v - 32) * 5/9;
}
function convertWind(v, from) {
  return from === "metric" ? v * 2.23694 : v / 2.23694;
}
function formatError(msg) {
  const m = msg.toLowerCase();
  if (m.includes("city not found") || m.includes("404")) return "City not found. Check spelling.";
  if (m.includes("401") || m.includes("invalid api key"))  return "Invalid API key. Please check your key in app.js.";
  if (m.includes("failed to fetch") || m.includes("network")) return "Network error. Check your connection.";
  return `Error: ${msg}`;
}

/* ── UI STATE ── */
function showSpinner() { spinnerWrap.hidden = false; weatherCard.hidden = true; }
function hideSpinner() { spinnerWrap.hidden = true; }
function showError(msg) { errorMsg.textContent = msg; }
function clearError()   { errorMsg.textContent = ""; }

/* ── INIT: auto-detect if permission already granted ── */
(function init() {
  if ("permissions" in navigator) {
    navigator.permissions.query({ name: "geolocation" }).then((r) => {
      if (r.state === "granted") handleGeo();
    });
  }
})();
