const svg = document.getElementById('mainSvg');
const group = document.getElementById('contentGroup');
const portGroup = document.getElementById('portGroup');
const tooltip = document.getElementById("tooltip");
const loader = document.getElementById("loader");
let latS = -60, latN = 85
let lonW = -180, lonE = 180;
let stepLat = 5,stepLon = 10;
let dec = 5;
let w = 0, h = 0;
let panX = 0, panY = 0;
let lastX = 0, lastY = 0;
let isDragging = false;
let isResizing = false;
let isZooming = false;
let scale = 1
let coordsNW = { x: 0, y: 0 }, coordsSE = { x: 0, y: 0 }
let grid = { w: 0, h: 0 };
let fx = 0, fy = 0;

const gridGroup = document.getElementById('gridGroup');
let lin = "lat";
function generateGrid() {
    for (let lat = latS; lat <= latN; lat += stepLat) {
        let y = project(0, lat).y;
        createLine(coordsNW.x, y, coordsSE.x, y);
    }
    lin = "lon"
    for (let lon = lonW; lon <= lonE; lon += stepLon) {
        let x = project(lon, 0).x;
        createLine(x, coordsNW.y, x, coordsSE.y);
    }
}
function createLine(x1, y1, x2, y2) {
    const lineT = document.getElementById('lineTemplate');
    const line = lineT.cloneNode();
    gridGroup.appendChild(line);
    line.removeAttribute('id');
    line.setAttribute('class', `${lin}`)
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    if (x1 == 0 || y1 == 0) { line.setAttribute('class', 'zero') }
}
function updatePan() {
    portGroup.querySelectorAll('circle').forEach(circle => {
        let f = (scale > 3) ? 4 / scale : 2 / scale
        circle.setAttribute("r", f);
    });
    group.setAttribute('transform', `translate(${panX} ${panY}) scale(${scale})`);
}
function centerGrid() {
    if (!isResizing) {
        const w = window.innerWidth, h = window.innerHeight;
        panX = (w / scale - grid.w) / 2 - coordsNW.x;
        panY = (h / scale - grid.h) / 2 - coordsNW.y;
    }
    updatePan();
}
portGroup.addEventListener('click', function (e) {
    const portElement = e.target //.closest('circle.port');
    if (portElement) {
        const name = portElement.getAttribute('name');
        const url = 'https://' + portElement.getAttribute('website');
        if (url) {
            console.log(`Port clicked: ${name} ${url}`)
            // e.preventDefault;
            // window.open(url, '_blank', 'noopener,noreferrer');
        }
    }
});
svg.addEventListener('wheel', e => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    const zoomFactor = e.deltaY < 0 ? 1.05 : 0.95;
    const newScale = Math.max(0.1, Math.min(scale * zoomFactor, 100));
    panX -= ((mouseX - panX) * (newScale - scale)) / scale;
    panY -= ((mouseY - panY) * (newScale - scale)) / scale;
    scale = newScale;
    updatePan();
});
svg.addEventListener('mousedown', e => {
    isDragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
});
svg.addEventListener('mouseup', () => isDragging = false);
svg.addEventListener('mouseleave', () => isDragging = false);
svg.addEventListener('mousemove', e => {
    if (isDragging) {
        panX += e.clientX - lastX;
        panY += e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
        tooltip.style.visibility = 'hidden';
        updatePan();
    } else {
        const rect = svg.getBoundingClientRect();
        const x = (e.clientX - panX) / scale;
        const y = (e.clientY - panY) / scale;
        const element = document.elementFromPoint(e.clientX, e.clientY);
        let port = '', site = '';
        if (element.classList.contains('port')) {
            port = '\n' + element.getAttribute('name');
            let t = element.getAttribute('website');
            if (t) { site = '\n' + t }
        }

        let id = element.getAttribute('id');
        let name = (id in countryNames) ? countryNames[id] : 'Water'
        const degrees = unproject(x, y);
        const lonOK = degrees.lon >= lonW && degrees.lon <= lonE
        const latOK = degrees.lat >= latS && degrees.lat <= latN
        if (lonOK && latOK) {
            const latString = degrees.lat.toFixed(dec).toString();
            const lonString = degrees.lon.toFixed(dec).toString();
            const latPadded = latString.padStart(5 + dec);
            const lonPadded = lonString.padStart(5 + dec);
            tooltip.textContent = `${name}\nLat: ${latPadded}\nLon: ${lonPadded}${port}${site}`;
            tooltip.style.visibility = 'visible';
        } else {
            tooltip.style.visibility = 'hidden';
        }
    }
});
function resizeWindow() {
    isResizing = true;
    showTheMap();
    isResizing = false;
}
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resizeWindow(), 100);
});
function prepareGrid() {
    w = window.innerWidth, h = window.innerHeight;
    const Δlon = lonE - lonW; //Δlat = latN - latS, 
    fx = 0.95 * w / Δlon; // at least 2.5% margin left and right
    fy = fx / px0; // lets fx define fy with px0
    coordsNW = project(lonW, latN), coordsSE = project(lonE, latS);
    grid = { w: coordsSE.x - coordsNW.x, h: coordsSE.y - coordsNW.y };
    if (grid.h > h) {
        const fitFactor = .95 * h / grid.h;
        fx *= fitFactor, fy = fx / px0;
        coordsNW = project(lonW, latN), coordsSE = project(lonE, latS);
        grid = { w: coordsSE.x - coordsNW.x, h: coordsSE.y - coordsNW.y };
    }
}

async function showTheMap() {
    loader.style.display = 'flex';
    void loader.offsetHeight; // Ensure DOM changes apply immediately
    await new Promise(requestAnimationFrame); // Wait for next frame
    svg.style.display = "none";
    prepareGrid(); // sets scales for lat lon projections
    await readAllCountryData();
    loadContryPaths();
    generateGrid();
    createPortMarkers();
    await loadWinds();
    centerGrid();
    //showVariables();
    loader.style.display = 'none';
    svg.style.display = "block";
}
function showVariables() {
    let ss = ["Variables"]
    ss.push(`px0 = ${px0} `);
    ss.push(`fx = ${fx} fy = ${fy}`);
    ss.push(`coordsNW=x: ${coordsNW.x.toFixed(0)}, y: ${coordsNW.y.toFixed(0)}`)
    ss.push(`coordsSE=x: ${coordsSE.x.toFixed(0)}, y: ${coordsSE.y.toFixed(0)}`)
    ss.push(`grid=w:${grid.w.toFixed(0)}, h:${grid.h.toFixed(0)}`);
    ss.push(`w=${w} h=${h}`)
    console.log(ss.join('\n'));
}

