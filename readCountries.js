const countryData = {};
let countryNames = {};
function loadAllCountries() {
    let countries = allCountries.split('|')
    let names = longNames.split('|');
    countryNames = Object.fromEntries(
        countries.map((country, key) => [country, names[key]])
    );
    const fetchPromises = countries.map(country => {// Create an array of fetch promises
        let url = `./paths/${country}.txt`;
        return fetch(url)
            .then(response => response.text())
            .then(data => { countryData[country] = data; });
    });
    Promise.all(fetchPromises).then(() => { // Wait for all fetch requests to complete and the load main script
        const script = document.createElement('script');
        script.src = './script.js';
        document.head.appendChild(script);
    });
}
loadAllCountries();