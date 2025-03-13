
function setupTooltip(svgElement, contentGroup, unproject) {
    const tooltip = document.getElementById("tooltip")
    svgElement.addEventListener('mousemove', (e) => {
        const rect = svgElement.getBoundingClientRect();
        const x = (e.clientX - rect.left);
        const y = (e.clientY - rect.top);

        const transformMatrix = contentGroup.getScreenCTM().inverse();
        const transformedPoint = svgElement.createSVGPoint();
        transformedPoint.x = x;
        transformedPoint.y = y;
        const { x: tx, y: ty } = transformedPoint.matrixTransform(transformMatrix);

        const coords = unproject(tx, ty);
        if (
            coords.lon >= -180 &&
            coords.lon <= 180 &&
            coords.lat >= -60 &&
            coords.lat <= 80
        ) {
            tooltip.style.visibility = 'visible';
            const dec = 5;
            const latString = coords.lat.toFixed(dec).toString();
            const lonString = coords.lon.toFixed(dec).toString();
            const latPadded = latString.padStart(5 + dec);
            const lonPadded = lonString.padStart(5 + dec);
            tooltip.textContent = `Lat: ${latPadded}\nLon: ${lonPadded}`;
        } else {
            tooltip.style.visibility = 'hidden';
        }
    });

    svgElement.addEventListener('mouseleave', () => {
        tooltip.style.visibility = 'hidden';
    });
}

export { setupTooltip };
