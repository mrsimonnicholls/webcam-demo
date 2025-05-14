const video = document.querySelector('#video');
const nav = document.querySelector('#camera-options');
let currentStream;

// Get list of video input devices
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
                    const isRear = /back|rear/i.test(camera.label);
                    startStream(camera.deviceId, isRear ? 'environment' : null);
                }
            });
        });

        if (cameras.length > 0) {
            if (cameras.length > 0) {
                const isRear = /back|rear/i.test(cameras[0].label);
                startStream(cameras[0].deviceId, isRear ? 'environment' : null);
            }
        }
    });

function startStream(deviceId, facingModeHint = null) {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }

    const constraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : {}
    };

    // Add facingMode fallback for iOS
    if (facingModeHint) {
        constraints.video.facingMode = { exact: facingModeHint };
    }

    navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
            currentStream = stream;
            video.srcObject = stream;
        })
        .catch(err => {
            console.warn('Primary constraints failed, trying facingMode only…', err);

            // fallback if deviceId failed
            if (facingModeHint) {
                navigator.mediaDevices.getUserMedia({
                    video: { facingMode: { exact: facingModeHint } }
                }).then(stream => {
                    currentStream = stream;
                    video.srcObject = stream;
                }).catch(err => {
                    console.error('Failed to access camera:', err);
                });
            }
        });
}