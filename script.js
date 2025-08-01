// Basic 3D Birthday Web with countdown and starfield
let scene, camera, renderer, controls;
let starGeo, stars;
let pointsGroup;
let font;
let currentText = "3";
let countdown = 3;
let countdownInterval;
let overlay = document.getElementById("overlay");
let state = "countdown"; // countdown -> wish

function randomColor() {
  const colors = [
    0xff69b4, 0xffb347, 0x8affb1, 0x4cafff, 0xe6e6fa, 0xf0f, 0x0ff, 0xffff00
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

function createUniverseBackground() {
  // Gradient + Nebula + Starfield
  // We'll use a large number of colored points for the nebula
  const bg = new THREE.Group();
  // Nebula points
  for (let i = 0; i < 800; i++) {
    let mat = new THREE.PointsMaterial({ 
      color: randomColor(), 
      size: Math.random() * 4 + 2, 
      transparent: true, 
      opacity: 0.08 + Math.random() * 0.15 
    });
    let geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(
        (Math.random() - 0.5) * 800, 
        (Math.random() - 0.5) * 800, 
        -400 + Math.random() * 200
      )
    ]);
    let point = new THREE.Points(geo, mat);
    bg.add(point);
  }
  // Stars
  for (let i = 0; i < 4000; i++) {
    let mat = new THREE.PointsMaterial({
      color: 0xffffff, 
      size: Math.random() * 0.8 + 0.1, 
      transparent: true,
      opacity: Math.random() * 0.8 + 0.2
    });
    let geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(
        (Math.random() - 0.5) * 1000,
        (Math.random() - 0.5) * 1000,
        -500 + Math.random() * 500
      )
    ]);
    let point = new THREE.Points(geo, mat);
    bg.add(point);
  }
  scene.add(bg);
}

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 1, 2000);
  camera.position.set(0, 0, 220);

  renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("webgl"), antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000010);

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.2;

  createUniverseBackground();

  // Load font
  let fontLoader = new THREE.FontLoader();
  fontLoader.load('https://cdn.jsdelivr.net/npm/three@0.152.2/examples/fonts/helvetiker_bold.typeface.json', function(loadedFont) {
    font = loadedFont;
    showCountdown();
  });

  window.addEventListener('resize', onWindowResize, false);
  animate();
}

function onWindowResize() {
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function getPointsFromText(text, font, size = 40, density = 0.65) {
  // Create points from text geometry
  let shapes = font.generateShapes(text, size);
  let geometry = new THREE.ShapeGeometry(shapes);
  geometry.center();

  // Get points along the shapes, reduce to a reasonable number
  let points = [];
  shapes.forEach(shape => {
    let pts = shape.getPoints(50);
    for (let i = 0; i < pts.length; i += Math.round(1/density)) {
      points.push(new THREE.Vector3(pts[i].x, pts[i].y, 0));
    }
  });
  return points;
}

function createPointsMesh(points) {
  let group = new THREE.Group();
  points.forEach(pt => {
    let geo = new THREE.SphereGeometry(1.8 + Math.random()*0.6, 12, 12);
    let mat = new THREE.MeshStandardMaterial({
      color: randomColor(),
      emissive: 0x222222,
      metalness: 0.7,
      roughness: 0.25
    });
    let mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(pt);
    // Randomize initial position for "scatter" effect
    mesh.userData.target = pt.clone();
    mesh.userData.start = pt.clone().add(new THREE.Vector3(
      (Math.random()-0.5)*100,
      (Math.random()-0.5)*100,
      (Math.random()-0.5)*50
    ));
    mesh.position.copy(mesh.userData.start);
    group.add(mesh);
  });
  return group;
}

function animatePoints(group, direction = "in", duration = 1.2) {
  // direction: 'in' = assemble, 'out' = scatter
  let timeStart = performance.now();
  let animate = () => {
    let t = (performance.now() - timeStart) / (duration * 1000);
    t = Math.min(1, t);
    group.children.forEach(mesh => {
      let from = direction === "in" ? mesh.userData.start : mesh.userData.target;
      let to = direction === "in" ? mesh.userData.target : mesh.userData.start;
      let ease = direction === "in" 
        ? (1-Math.cos(Math.PI*t))/2 // easeInOutCos
        : Math.sin(Math.PI*t/2);    // easeOutSin
      mesh.position.lerpVectors(from, to, ease);
    });
    if (t < 1) {
      requestAnimationFrame(animate);
    }
  };
  animate();
}

function showCountdown() {
  if (pointsGroup) scene.remove(pointsGroup);
  let pts = getPointsFromText(String(countdown), font, 40, 0.70);
  pointsGroup = createPointsMesh(pts);
  pointsGroup.position.set(0, 0, 0);
  scene.add(pointsGroup);
  animatePoints(pointsGroup, "in", 0.8);

  overlay.innerHTML = "";
  state = "countdown";

  countdownInterval = setTimeout(() => {
    animatePoints(pointsGroup, "out", 0.5);
    setTimeout(() => {
      countdown--;
      if (countdown > 0) showCountdown();
      else showBirthday();
    }, 600);
  }, 1100);
}

function showBirthday() {
  if (pointsGroup) scene.remove(pointsGroup);
  let msg = "Chúc Mừng Sinh Nhật!";
  let pts = getPointsFromText(msg, font, 12, 0.5);
  pointsGroup = createPointsMesh(pts);
  pointsGroup.position.set(0, 0, 0);
  scene.add(pointsGroup);
  animatePoints(pointsGroup, "in", 1.5);

  overlay.innerHTML = `<h1>Chúc Mừng Sinh Nhật!</h1><div style="font-size:1.5rem; margin-top: 1rem;">🎂✨🎉</div>`;
  state = "wish";
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

init();
