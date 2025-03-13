import { generateGrid } from './grid.js';
import { setupPanAndZoom } from './interaction.js';
import { project, unproject } from './projection.js';
import { setupTooltip } from './tooltip.js';

document.addEventListener('DOMContentLoaded', () => {
    const svgElement = document.getElementById('mainSvg');
    const contentGroup = document.getElementById('contentGroup');

    generateGrid(contentGroup, 10); // Generate grid with step size of 10
    setupPanAndZoom(svgElement, contentGroup); // Enable pan and zoom
    centerGrid(contentGroup, svgElement);   // Center the grid
    setupTooltip(svgElement, contentGroup, unproject); // Enable tooltip

    // let resizeTimeout;
    // window.addEventListener('resize', () => {
    //     clearTimeout(resizeTimeout);
    //     resizeTimeout = setTimeout(centerGrid, 100);
    // });
    window.addEventListener('resize', () => {
        centerGrid(contentGroup, svgElement);
    });
});

function centerGrid(contentGroup, svgElement, baseWidth = 600, baseHeight = 600) {
    const rect = svgElement.getBoundingClientRect();
    const panX = (rect.width - baseWidth) / 2;
    const panY = (rect.height - baseHeight) / 2;
    contentGroup.setAttribute('transform', `translate(${panX} ${panY})`);
}

document.addEventListener('DOMContentLoaded', () => {
    const svgElement = document.getElementById('mainSvg');
    const contentGroup = document.getElementById('contentGroup');

    generateGrid(contentGroup, 10); // Generate grid with step size of 10
    centerGrid(contentGroup, svgElement); // Center the grid
    setupPanAndZoom(svgElement, contentGroup); // Enable pan and zoom
});
