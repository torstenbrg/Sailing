const pi = Math.PI, tan = Math.tan, log = Math.log;
const exp = Math.exp, atan = Math.atan, abs = Math.abs;
const rpd = pi / 180;
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
//window.addEventListener('click', () => debug());
