

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


