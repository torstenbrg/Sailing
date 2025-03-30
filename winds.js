const windGroup = document.getElementById('windGroup');
const arrowT = document.getElementById('arrowTemplate');

async function loadWinds() {
    windData = await getWindData();
    if (Object.keys(windData).length === 0) return console.log("Wind data loaded from database");
    await Promise.all(getCoordinates(45, 50, -20, - 10).map(async ([lat, lon]) => {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=wind_speed_10m,wind_direction_10m&timezone=UTC&windspeed_unit=kn`;
        try {
            const res = await fetch(url);
            if (!res.ok) { throw new Error(`HTTP error! status: ${res.status}`); }
            const data = await res.json();
            windData[`${lat},${lon}`] = data;
        } catch {
            console.error("Error fetching wind data:", error);
        }
    }));
    Object.entries(windData).forEach(([key, data]) => saveWindDataToDB(key, data));
}
function getCoordinates(S, N, W, E) {
    let coords = [];
    for (let lon = W; lon <= E; lon += stepLon) {
        for (let lat = S; lat <= N; lat += stepLat) {
            coords.push([lat, lon]);
        }
    }
    return coords;
}
