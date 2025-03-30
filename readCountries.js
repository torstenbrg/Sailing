const countryData = {};
let countryNames = {};
async function readAllCountries() {
    const countries = allCountries.split('|');
    const names = longNames.split('|');
    countryNames = Object.fromEntries(
        countries.map((country, key) => [country, names[key]])
    );
    await Promise.all(countries.map(async country => {
        const response = await fetch(`./paths/${country}.txt`);
        countryData[country] = await response.text();
    }));
}


// function readAllCountries() {
//     const countries = allCountries.split('|');
//     const names = longNames.split('|');
//     let loadedCount = 0;
//     countryNames = Object.fromEntries(
//         countries.map((country, key) => [country, names[key]])
//     );
//     return new Promise((resolve) => {
//         countries.forEach(country => {
//             fetch(`./paths/${country}.txt`)
//                 .then(response => response.text())
//                 .then(data => {
//                     countryData[country] = data;
//                     if (++loadedCount === countries.length) {
//                         resolve(); 
//                     }
//                 });
//         });
//     });
// }
