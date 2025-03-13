
const pi = Math.PI, tan = Math.tan, log = Math.log;
const rpd = pi / 360, exp = Math.exp, atan = Math.atan;

const minLat = -60, maxLat = 80;
const mercYMin = log(tan(pi / 4 + (minLat * rpd))) / pi;
const mercYMax = log(tan(pi / 4 + (maxLat * rpd))) / pi;
const mercY0 = log(tan(pi / 4 + (0 * rpd))) / pi; // Mercator Y at equator
const maxMercYDelta = Math.max(mercY0 - mercYMin, mercYMax - mercY0);
const baseWidth = 600, baseHeight = 600;
const mercScale = baseHeight / (2 * maxMercYDelta); // Scale to fit entire range

function project(lat, lon) {
    const mercY = log(tan(pi / 4 + (lat * rpd))) / pi;
    return {
        x: (lon + 180) / 360 * baseWidth,
        y: baseHeight / 2 - (mercY - mercY0) * mercScale,
    };
}

function unproject(x, y) {
    const mercY = mercY0 + (baseHeight / 2 - y) / mercScale;
    const lat = (atan(exp(mercY * pi)) - pi / 4) / rpd;
    return { lat: lat, lon: (x / baseWidth) * 360 - 180 };
}

export { project, unproject };
