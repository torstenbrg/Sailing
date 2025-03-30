let windData = {};
let portData = {};
let db;
const openRequest = indexedDB.open("DataDB", 1);
openRequest.onsuccess = (event) => { 
    db = event.target.result; 
    console.log("Database opened successfully");
};
openRequest.onupgradeneeded = (event) => {
    db = event.target.result;
    if (!db.objectStoreNames.contains('winds')) {
        const objectStore = db.createObjectStore("winds", { keyPath: "coords" });
        objectStore.createIndex("latLon", ["lat", "lon"], { unique: false });
    }
};
openRequest.onerror = (event) => {
    console.error("Database failed to open", event);
};
function saveWindDataToDB(key, data) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction("winds", "readwrite");
        const objectStore = transaction.objectStore("winds");
        const request = objectStore.put({ coords: key, data });
        request.onsuccess = () => resolve();
        request.onerror = (event) => reject(event.target.error);
    });
}
// function getWindData() {
//     const transaction = db.transaction("winds", "readonly");
//     const store = transaction.objectStore("winds");
//     const request = store.getAll();
//     request.onsuccess = (event) => {
//         event.target.result.forEach(rec => {
//             windData[rec.coords] = rec.data;
//         });
//         windData = result;
//         resolve(result);
//     }
//     request.onerror = () => {
//         console.warn("Failed to read wind data from DB");
//         resolve({});       
//     };
// }
function getWindData() {
    return new Promise((resolve) => {
        const result = {}; // Local object to avoid race conditions
        const transaction = db.transaction("winds", "readonly");
        const store = transaction.objectStore("winds");
        const request = store.getAll();
        request.onsuccess = (event) => {
            event.target.result?.forEach(rec => {
                result[rec.coords] = rec.data;
            });
            windData = result; // Update global only after processing
            resolve(result);
        };
        request.onerror = () => resolve({});
    });
}
