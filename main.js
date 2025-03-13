

let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        centerGrid(contentGroup, svgElement);
    }, 100); // Adjust delay as needed
});

function centerGrid() {
    const rect = svgElement.getBoundingClientRect();
    const panX = (rect.width - baseWidth) / 2;
    const panY = (rect.height - baseHeight) / 2;

   console.log(`Initial values: panX=${panX}, panY=${panY}, scale=${scale}`);

    contentGroup.setAttribute('transform', `translate(${panX} ${panY})`);
}

generateGrid();
centerGrid();