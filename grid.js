import { project } from './projection.js';

function generateGrid(contentGroup, step) {
    contentGroup.innerHTML = '';
    for (let lat = -60; lat <= 80; lat += step) {
        const start = project(lat, -180);
        const end = project(lat, 180);
        createLine(contentGroup, start.x, start.y, end.x, end.y);
    }
    for (let lon = -180; lon <= 180; lon += step) {
        const start = project(-60, lon);
        const end = project(80, lon);
        createLine(contentGroup, start.x, start.y, end.x, end.y);
    }
}

function createLine(contentGroup, x1, y1, x2, y2) {
    //const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    const line = document.getElementById("lineTemplate").cloneNode();
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('stroke', '#ccc');
    line.setAttribute('stroke-width', 0.5);
    contentGroup.appendChild(line);
}

export { generateGrid };
