const svg = document.getElementById('mainSvg');
const lineT = document.getElementById('lineTemplate');
const contentGroup = document.getElementById('contentGroup');
const tooltip = document.getElementById("tooltip")

const baseWidth = 700, baseHeight = 700;
const pi = Math.PI, tan = Math.tan, log = Math.log
const rpd = pi / 360, exp = Math.exp, atan = Math.atan;
const dec = 5;

const minLat = -60, maxLat = 80, step = 10;
const minLon = -180, maxLon = 180

const mercYMin = log(tan(pi / 4 + (minLat * rpd))) / pi;
const mercYMax = log(tan(pi / 4 + (maxLat * rpd))) / pi;
const mercY0 = log(tan(pi / 4 + (0 * rpd))) / pi; // Mercator Y at equator
const maxMercYDelta = Math.max(mercY0 - mercYMin, mercYMax - mercY0);
const mercScale = baseHeight / (2 * maxMercYDelta); // Scale to fit entire range

let scale = 1;
let panX = 0, panY = 0;
let isDragging = false;
let lastX = 0, lastY = 0;

function project(lat, lon) {
    const mercY = log(tan(pi / 4 + (lat * rpd))) / pi;
    return {
        x: (lon + 180) / 360 * baseWidth,
        y: baseHeight / 2 - (mercY - mercY0) * mercScale
    };
}
function unproject(x, y) {
    const mercY = mercY0 + (baseHeight / 2 - y) / mercScale;
    const lat = (atan(exp(mercY * pi)) - pi / 4) / rpd;
    return { lat: lat, lon: (x / baseWidth) * 360 - 180 };
}
function generateGrid() {
    contentGroup.innerHTML = '';
    for (let lat = minLat; lat <= maxLat; lat += step) {
        const start = project(lat, -180);
        const end = project(lat, 180);
        createLine(start.x, start.y, end.x, end.y);
    }
    for (let lon = minLon; lon <= maxLon; lon += step) {
        const start = project(minLat, lon);
        const end = project(maxLat, lon);
        createLine(start.x, start.y, end.x, end.y);
    }
}
function createLine(x1, y1, x2, y2) {
    const line = lineT.cloneNode();
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('stroke', '#ccc');
    line.setAttribute('stroke-width', 0.5);
    contentGroup.appendChild(line);
}
function centerGrid() {
    const rect = svg.getBoundingClientRect();
    panX = (rect.width / scale - baseWidth) / 2;
    panY = (rect.height / scale - baseHeight) / 2;
    contentGroup.setAttribute('transform', `translate(${panX} ${panY}) scale(${scale})`);
}
svg.addEventListener('wheel', e => {
    e.preventDefault();
    const rect = svg.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const newScale = Math.max(0.1, Math.min(scale * zoomFactor, 20));
    panX -= ((mouseX - panX) * (newScale - scale)) / scale;
    panY -= ((mouseY - panY) * (newScale - scale)) / scale;
    scale = newScale;
    contentGroup.setAttribute('transform', `translate(${panX} ${panY}) scale(${scale})`);
});
svg.addEventListener('mousedown', e => {
    isDragging = true;
    svg.style.cursor = 'grabbing';
    lastX = e.clientX;
    lastY = e.clientY;
});
svg.addEventListener('mousemove', e => {
    if (isDragging) {
        panX += (e.clientX - lastX) / scale;
        panY += (e.clientY - lastY) / scale;
        lastX = e.clientX;
        lastY = e.clientY;
        tooltip.style.visibility = 'hidden';
        contentGroup.setAttribute('transform', `translate(${panX} ${panY}) scale(${scale})`);
    } else {
        const rect = svg.getBoundingClientRect();
        const x = (e.clientX - rect.left - panX) / scale;
        const y = (e.clientY - rect.top - panY) / scale;
        const coords = unproject(x, y);
        const lonOK = coords.lon >= -180 && coords.lon <= 180
        const latOK = coords.lat >= minLat && coords.lat <= maxLat
        if (lonOK && latOK) {
            const latString = coords.lat.toFixed(dec).toString();
            const lonString = coords.lon.toFixed(dec).toString();
            const latPadded = latString.padStart(5 + dec);
            const lonPadded = lonString.padStart(5 + dec);
            tooltip.textContent = `Lat: ${latPadded}\nLon: ${lonPadded}`;
            tooltip.style.visibility = 'visible';
        } else {
            tooltip.style.visibility = 'hidden';
        }
    }
});
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(centerGrid, 100);
});
svg.addEventListener('mouseup', () => resetDrag());
svg.addEventListener('mouseleave', () => resetDrag());
window.addEventListener('click', () => debug());
function resetDrag() {
    isDragging = false;
    svg.style.cursor = 'grab';
}
function debug() {

    return;

    let lon = 20, lat = 0, x = 0, y = 0;
    const coords = project(lat, lon)
    const pos = unproject(coords.x, coords.y);
    for (lat = -60; lat <= 60; lat += 10) {
        const coords = project(lat, lon)
        const pos = unproject(coords.x, coords.y);
        let s = "";
        s = `lat: ${lat.toFixed(2)}`;
        s += `  y: ${coords.y.toFixed(2)}`;
        s += `  lat: ${pos.lat.toFixed(2)}`;
        console.log(s);
    }
};
generateGrid();
centerGrid();
