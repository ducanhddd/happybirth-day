// Vũ trụ 3D với Three.js
let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 2000);
let renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setClearColor(0x000010, 1);
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('bg-3d').appendChild(renderer.domElement);

// Sao 3D
let starGeo = new THREE.BufferGeometry();
let starCount = 1500;
let positions = new Float32Array(starCount * 3);
for (let i = 0; i < starCount; i++) {
    let x = (Math.random() - 0.5) * 2000;
    let y = (Math.random() - 0.5) * 2000;
    let z = -Math.random() * 1800;
    positions[i*3] = x;
    positions[i*3+1] = y;
    positions[i*3+2] = z;
}
starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
let starMat = new THREE.PointsMaterial({color: 0xffffff, size: 1.3});
let starField = new THREE.Points(starGeo, starMat);
scene.add(starField);

camera.position.z = 5;

function animate() {
    requestAnimationFrame(animate);
    starField.rotation.y += 0.0008;
    starField.rotation.x += 0.0004;
    let pos = starGeo.getAttribute('position');
    for (let i = 0; i < starCount; i++) {
        let z = pos.getZ(i);
        z += 1.1;
        if (z > 100) z = -1800 + Math.random() * 40;
        pos.setZ(i, z);
    }
    pos.needsUpdate = true;
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Countdown & birthday message
const countdownElem = document.getElementById('countdown');
const birthdayMsg = document.getElementById('birthday-message');
const birthdayContainer = document.querySelector('.birthday-container');
let countdownNumbers = [3,2,1];
let idx = 0;

function showCountdownNumber(num) {
    countdownElem.innerHTML = '';
    let dot = document.createElement('div');
    dot.className = 'dot-number';
    dot.textContent = num;
    countdownElem.appendChild(dot);
    setTimeout(() => {
        dot.style.opacity = 0;
    }, 800);
}

function startCountdown() {
    if(idx < countdownNumbers.length) {
        showCountdownNumber(countdownNumbers[idx]);
        setTimeout(() => {
            idx++;
            startCountdown();
        }, 1100);
    } else {
        countdownElem.style.display = 'none';
        showBirthdayMessage();
    }
}

function showBirthdayMessage() {
    birthdayMsg.style.display = '';
    setTimeout(() => {
        birthdayMsg.style.opacity = 0;
        setTimeout(() => {
            birthdayMsg.style.display = 'none';
            birthdayContainer.style.display = '';
        }, 700);
    }, 1600); // hiện lời chúc 1.6 giây
}

window.addEventListener('DOMContentLoaded', () => {
    countdownElem.style.display = '';
    birthdayMsg.style.display = 'none';
    birthdayContainer.style.display = 'none';
    startCountdown();
});
