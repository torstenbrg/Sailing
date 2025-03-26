const svg = document.getElementById('mainSvg');
const lineT = document.getElementById('lineTemplate');
const rectT = document.getElementById('rectTemplate');
const pathT = document.getElementById('pathTemplate');
const circT = document.getElementById('circTemplate');
const group = document.getElementById('contentGroup');
const portGroup = document.getElementById('portGroup');
const tooltip = document.getElementById("tooltip");
const loader = document.getElementById("loader");

const pi = Math.PI, tan = Math.tan, log = Math.log;
const exp = Math.exp, atan = Math.atan, abs = Math.abs;
const rpd = pi / 180;

let latS = -60, latN = 85
let stepLon = 10, stepLat = 5;
let lonW = -180, lonE = 180;
let dec = 5;
let w = 0, h = 0;
let panX = 0, panY = 0;
let lastX = 0, lastY = 0;
let isDragging = false;
let isResizing = false;
let isZooming = false;
let scale = 1
let animationFrameId = null;

let coordsNW = { x: 0, y: 0 }, coordsSE = { x: 0, y: 0 }
let grid = { w: 0, h: 0 };
let fx = 0, fy = 0;
let projectY = lat => log(tan(pi / 4 + (lat * rpd) / 2));
let px0 = projectY(1e-9) / 1e-9; // with equator = 40075 km ~ 40 mm

function project(lon, lat) {
    let y = fy * log(tan(pi / 4 + (lat * rpd) / 2));
    y = abs(y) < 1e-10 ? 0 : y;
    return { x: lon * fx, y: -y };
}
function unproject(x, y) {
    let lat = 2 * (atan(exp(y / fy)) - pi / 4) / rpd;
    return { lon: x / fx, lat: -lat };
}
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
    const line = lineT.cloneNode();
    line.removeAttribute('id');
    line.setAttribute('class', `${lin}`)
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('stroke', '#c0c0c0')
    if (x1 == 0 || y1 == 0) { line.setAttribute('class', 'zero') }
    group.appendChild(line);
}
function updatePan() {
    group.setAttribute('transform', `translate(${panX} ${panY}) scale(${scale})`);
    portGroup.setAttribute('transform', `translate(${panX} ${panY}) scale(${scale})`);
    document.querySelectorAll('#portGroup circle').forEach(circle => {
        let f = (scale > 3) ? 3 / scale : 1 / scale
        circle.setAttribute("r", f);
    });
}
function centerGrid() {
    if (!isResizing) {
        const w = window.innerWidth, h = window.innerHeight;
        panX = (w / scale - grid.w) / 2 - coordsNW.x;
        panY = (h / scale - grid.h) / 2 - coordsNW.y;
    }
    updatePan();
}
portGroup.addEventListener('click', function(e) {
    const portElement = e.target.closest('circle.port');
    if (portElement) {
        const name = portElement.getAttribute('name');
        const url = 'https://' + portElement.getAttribute('website');
        if (url) {
            console.log(`Port clicked: ${url}`)
            // e.preventDefault;
            // window.open(url, '_blank', 'noopener,noreferrer');
        }
    }
});
svg.addEventListener('wheel', e => {
    //e.preventDefault();
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
        //let port = (element.classList.contains('port') ? '\n' + element.getAttribute('name') : '')
        let port = '', site='';
        if (element.classList.contains('port')) {
            port = '\n' + element.getAttribute('name');
            let t = element.getAttribute('website');
            if (t) {site = '\n' + t}
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
            tooltip.textContent = `${name}\nLon: ${lonPadded}\nLat: ${latPadded}${port}${site}`;
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
//window.addEventListener('click', () => debug());
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
function processSvgPath(mercPath, project) {
    const coordRegex = /(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?),(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g;
    const xyPath = mercPath.replace(coordRegex, (match, lon, lat) => {
        const { x, y } = project(parseFloat(lon), parseFloat(lat));
        return `${x},${y}`;
    });
    return xyPath;
}
function loadContryPaths() {
    const excluded = "antarctica".split("|");
    let countries = allCountries.split('|')
        .filter(country => !excluded.includes(country))
        .sort();
    countries.forEach(country => {
        let path = pathT.cloneNode();
        group.appendChild(path);
        const d = processSvgPath(countryData[country], project);
        path.setAttribute('id', country)
        path.setAttribute('d', d);
    });
}
async function loadPorts() {
    const response = await fetch('./ports.txt');
    const text = await response.text();
    const lines = text.split('\n');
    return lines.map(line => {
        const [name, longitude, latitude, website] = line.split(',');
        return { name, longitude: parseFloat(longitude), latitude: parseFloat(latitude), website };
    });
}
function createPortMarkers(ports) {
    ports.forEach(port => {
        const { x, y } = project(port.longitude, port.latitude);
        if (isNaN(x) || isNaN(y)) {
            console.log(`Invalid coordinates for port ${port.name}`, { x, y });
            return;
        }
        const pc = circT.cloneNode();
        pc.removeAttribute('id')
        pc.setAttribute("cx", x);
        pc.setAttribute("cy", y);
        pc.setAttribute("r", "4");
        pc.classList.add("port");
        pc.setAttribute("name", port.name);
        pc.setAttribute("website", port.website);
        portGroup.appendChild(pc);
    });
}
async function showTheMap() {
    loader.style.display = 'flex';
    void loader.offsetHeight; // trick to ensure DOM cahnges are applied immediately
    await new Promise(resolve => {
        requestAnimationFrame(async () => {
            svg.style.display = "none"
            contentGroup.innerHTML = '';
            prepareGrid();
            loadContryPaths();
            generateGrid();
            const ports = await loadPorts();
            createPortMarkers(ports);
            centerGrid();
            showVariables();
            setTimeout(resolve, 10);
        });
    });
    loader.style.display = 'none';
    svg.style.display = "block";
}
showTheMap();


//await new Promise(r => setTimeout(r, 10));
// new Promise(r => setTimeout(r, 1)) // Tiny delay to ensure loader paints | after showTheMAp