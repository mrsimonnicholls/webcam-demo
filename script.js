const video = document.querySelector('#video');
const nav = document.querySelector('#camera-options');
let currentStream = null;

// Stop any running video stream
function stopStream() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }
}

// Start camera with optional constraints
function startStream({ deviceId = null, facingMode = null }) {
    stopStream();

    const constraints = { video: {} };
    if (deviceId) constraints.video.deviceId = { exact: deviceId };
    if (facingMode) constraints.video.facingMode = { exact: facingMode };

    return navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
            currentStream = stream;
            video.srcObject = stream;
        });
}

// Create radio buttons for each camera
function buildCameraOptions(cameras) {
    nav.innerHTML = ''; // Clear any existing

    cameras.forEach((camera, index) => {
        const id = `cam${index}`;
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'camera';
        radio.id = id;
        radio.value = camera.deviceId;
        if (index === 0) radio.checked = true;

        const label = document.createElement('label');
        label.htmlFor = id;
        label.textContent = camera.label || `Camera ${index + 1}`;

        nav.appendChild(radio);
        nav.appendChild(label);

        radio.addEventListener('change', () => {
            if (radio.checked) {
                const isRear = /back|rear|environment/i.test(camera.label);
                startStream({ deviceId: camera.deviceId, facingMode: isRear ? 'environment' : 'user' });
            }
        });
    });
}

// Phase 1: request access to unlock permissions
startStream({ facingMode: 'user' })
    .then(() => navigator.mediaDevices.enumerateDevices())
    .then(devices => {
        const cameras = devices.filter(d => d.kind === 'videoinput');
        buildCameraOptions(cameras);

        // Optional: auto-start the first one
        if (cameras.length > 0) {
            const isRear = /back|rear|environment/i.test(cameras[0].label);
            startStream({ deviceId: cameras[0].deviceId, facingMode: isRear ? 'environment' : 'user' });
        }
    })
    .catch(err => {
        console.error('Permission or device error:', err);
    });