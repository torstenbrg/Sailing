const svgElement = document.getElementById('mainSvg');
const contentGroup = document.getElementById('contentGroup');
const tooltip = document.getElementById("tooltip")

const pi = Math.PI, tan = Math.tan, log = Math.log;
const rpd = pi / 360, exp = Math.exp, atan = Math.atan;

const minLat = -60, maxLat = 80, step = 10;
const mercYMin = log(tan(pi / 4 + (minLat * rpd))) / pi;
const mercYMax = log(tan(pi / 4 + (maxLat * rpd))) / pi;
const mercY0 = log(tan(pi / 4 + (0 * rpd))) / pi; // Mercator Y at equator
const maxMercYDelta = Math.max(mercY0 - mercYMin, mercYMax - mercY0);
const baseWidth = 600, baseHeight = 600;
const mercScale = baseHeight / (2 * maxMercYDelta); // Scale to fit entire range

let scale = 1;
let panX = 0, panY = 0;
let isDragging = false;
let lastX = 0, lastY = 0;