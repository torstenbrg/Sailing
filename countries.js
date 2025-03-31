
async function readAllCountryData() {
    await countryDictionary();
    await Promise.all(Object.keys(countryNames).map(async country => {
        const res = await fetch(`./paths/${country}.txt`);
        countryData[country] = await res.text();
    }));
}
async function countryDictionary() {
    let res = await fetch("./paths/all_countries.js");
    let file = await res.text();
    rows = file.split('\n');
    let countries = rows[0].split('|');
    let longNames = rows[1].split('|');
    countryNames = Object.fromEntries(
        countries.map((country, index) => [country, longNames[index]])
    );
}
function loadContryPaths() {
    const excluded = "antarctica".split("|");
    const countryGroup = document.getElementById('countryGroup');
    const pathT = document.getElementById('pathTemplate');
    
    let countries = Object.keys(countryNames)
        .filter(country => !excluded.includes(country));

    countries.forEach(country => {
        let path = pathT.cloneNode();
        countryGroup.appendChild(path);
        const d = processSvgPath(countryData[country], project);
        path.setAttribute('id', country)
        path.setAttribute('d', d);
    });
}
function processSvgPath(mercPath, project) {
    const coordRegex = /(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?),(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g;
    const xyPath = mercPath.replace(coordRegex, (match, lon, lat) => {
        const { x, y } = project(parseFloat(lon), parseFloat(lat));
        return `${x},${y}`;
    });
    return xyPath;
}

