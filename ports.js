async function loadPorts() {
    const response = await fetch('./ports.txt');
    const text = await response.text();
    const lines = text.split('\n');
    return lines.map(line => {
        const [name, longitude, latitude, website] = line.split(',');
        return { name, longitude: parseFloat(longitude), latitude: parseFloat(latitude), website };
    });
}
async function createPortMarkers() {
    const circT = document.getElementById('circTemplate');
    let ports = await loadPorts();
    ports.forEach(port => {
        const { x, y } = project(port.longitude, port.latitude);
        if (isNaN(x) || isNaN(y)) {
            console.log(`Invalid coordinates for port ${port.name}`, { x, y });
            return;
        }
        const pc = circT.cloneNode();
        portGroup.appendChild(pc);
        pc.removeAttribute('id')
        pc.setAttribute("cx", x);
        pc.setAttribute("cy", y);
        pc.setAttribute("r", "2");
        pc.classList.add("port");
        pc.setAttribute("name", port.name);
        pc.setAttribute("website", port.website);
    });
}
