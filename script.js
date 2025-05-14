const video = document.querySelector('#video');
const nav = document.querySelector('#camera-options');
let currentStream = null;

// Helper to stop any running stream
function stopStream() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }
}

// Main stream starter — supports facingMode and deviceId
function startStream({ deviceId = null, facingMode = null }) {
    stopStream();

    const constraints = {
        video: {}
    };

    if (deviceId) {
        constraints.video.deviceId = { exact: deviceId };
    } else if (facingMode) {
        constraints.video.facingMode = { exact: facingMode };
    }

    navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
            currentStream = stream;
            video.srcObject = stream;
        })
        .catch(err => {
            console.error('Error starting stream:', err);
        });
}

// Build camera switcher UI
navigator.mediaDevices.enumerateDevices()
    .then(devices => {
        const cameras = devices.filter(d => d.kind === 'videoinput');

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

        // Default to front camera on mobile, or first cam on desktop
        const defaultFacing = /iPhone|iPad|Android/i.test(navigator.userAgent) ? 'user' : null;
        if (defaultFacing) {
            startStream({ facingMode: defaultFacing });
        } else if (cameras.length > 0) {
            startStream({ deviceId: cameras[0].deviceId });
        }
    });