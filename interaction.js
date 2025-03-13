
function setupPanAndZoom(svgElement, contentGroup) {
    let scale = 1;
    let panX = 0, panY = 0;
    let isDragging = false;
    let lastX = 0, lastY = 0;

    function updateView() {
        contentGroup.setAttribute(
            'transform',
            `translate(${panX} ${panY}) scale(${scale})`
        );
    }

    svgElement.addEventListener('wheel', (e) => {
        e.preventDefault();
        const rect = svgElement.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
        const newScale = Math.max(0.1, Math.min(scale * zoomFactor, 20));
        panX -= ((mouseX - panX) * (newScale - scale)) / scale;
        panY -= ((mouseY - panY) * (newScale - scale)) / scale;
        scale = newScale;
        updateView();
    });

    svgElement.addEventListener('mousedown', (e) => {
        isDragging = true;
        svgElement.style.cursor = 'grabbing';
        lastX = e.clientX;
        lastY = e.clientY;
    });

    svgElement.addEventListener('mousemove', (e) => {
        if (isDragging) {
            panX += (e.clientX - lastX) / scale;
            panY += (e.clientY - lastY) / scale;
            lastX = e.clientX;
            lastY = e.clientY;
            updateView();
        }
    });

    svgElement.addEventListener('mouseup', resetDrag);
    svgElement.addEventListener('mouseleave', resetDrag);

    function resetDrag() {
        isDragging = false;
        svgElement.style.cursor = 'grab';
    }
}

export { setupPanAndZoom };
