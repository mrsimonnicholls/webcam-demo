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
                    startStream(camera.deviceId);
                }
            });
        });

        if (cameras.length > 0) {
            startStream(cameras[0].deviceId);
        }
    });

function startStream(deviceId) {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }

    navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } }
    })
        .then(stream => {
            currentStream = stream;
            video.srcObject = stream;
        })
        .catch(err => {
            console.error('Error starting camera:', err);
        });
}