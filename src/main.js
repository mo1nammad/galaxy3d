import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// debugger
import { GUI } from "dat.gui";
const gui = new GUI();
// scene
const scene = new THREE.Scene();

const Sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const camera = new THREE.PerspectiveCamera(
  75,
  Sizes.width / Sizes.height,
  0.05,
  100
);
camera.position.set(0, 4, 8);

// renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(Sizes.width, Sizes.height);
document.body.appendChild(renderer.domElement);

// controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.update();
controls.enableDamping = true;

const ambientLight = new THREE.AmbientLight("#86cdff", 0.6);
scene.add(ambientLight);

// const axesHelper = new THREE.AxesHelper(5);
// scene.add(axesHelper);
// gallaxy
const galaxyParams = {
  galaxy: null, // galaxy itself

  count: 32320,
  size: 0.02,
  radius: 6,
  branches: 3,
  spin: 1.266,
  randomness: 0.21,
  randomnessPow: 4,
  insideColor: "#4d7bf2",
  outsideColor: "#bf6330",
};

const generateGalaxy = () => {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(galaxyParams.count * 3);
  const colors = new Float32Array(galaxyParams.count * 3);

  const colorInside = new THREE.Color(galaxyParams.insideColor);
  const colorOutside = new THREE.Color(galaxyParams.outsideColor);

  for (let i = 0; i < galaxyParams.count; i++) {
    // each loop creates one vertice containing x,y,z
    const i3 = i * 3;

    const radius = Math.random() * galaxyParams.radius;
    const spinAngle = galaxyParams.spin * radius;
    const branchesAngle =
      ((i % galaxyParams.branches) / galaxyParams.branches) * Math.PI * 2;

    // randomness

    const randomX =
      expoRandom(galaxyParams.randomnessPow, galaxyParams.randomness) * radius;
    const randomY =
      expoRandom(galaxyParams.randomnessPow, galaxyParams.randomness) * radius;
    const randomZ =
      expoRandom(galaxyParams.randomnessPow, galaxyParams.randomness) * radius;

    positions[i3] = Math.cos(branchesAngle + spinAngle) * radius + randomX; //x
    positions[i3 + 1] = 0 + randomY; // y
    positions[i3 + 2] = Math.sin(branchesAngle + spinAngle) * radius + randomZ; // z

    // ---colors

    const mixedColor = colorInside.clone();
    const alpha = radius / galaxyParams.radius;
    mixedColor.lerp(colorOutside, alpha);

    colors[i3 + 0] = mixedColor.r; // r
    colors[i3 + 1] = mixedColor.g; // g
    colors[i3 + 2] = mixedColor.b; // b
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  // material
  const material = new THREE.PointsMaterial({
    size: galaxyParams.size,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
  });

  // points
  galaxyParams.galaxy = new THREE.Points(geometry, material);
  scene.add(galaxyParams.galaxy);
};
generateGalaxy();

const reGenerateGalaxy = () => {
  if (!galaxyParams.galaxy) return;

  galaxyParams.galaxy.geometry.dispose();
  galaxyParams.galaxy.material.dispose();
  scene.remove(galaxyParams.galaxy);

  generateGalaxy();
};

gui.add(galaxyParams, "count", 0, 100000, 20).onFinishChange(reGenerateGalaxy);
gui.add(galaxyParams, "size", 0, 1, 0.02).onFinishChange(reGenerateGalaxy);
gui.add(galaxyParams, "radius", 1, 10, 0.5).onFinishChange(reGenerateGalaxy);
gui.add(galaxyParams, "branches", 1, 10, 1).onFinishChange(reGenerateGalaxy);
gui.add(galaxyParams, "spin", -5, 5, 0.001).onFinishChange(reGenerateGalaxy);
gui
  .add(galaxyParams, "randomness", 0, 2, 0.01)
  .onFinishChange(reGenerateGalaxy);
gui
  .add(galaxyParams, "randomnessPow", 1, 5, 1)
  .onFinishChange(reGenerateGalaxy);

gui.addColor(galaxyParams, "insideColor").onFinishChange(reGenerateGalaxy);
gui.addColor(galaxyParams, "outsideColor").onFinishChange(reGenerateGalaxy);

window.addEventListener("resize", () => {
  Sizes.width = window.innerWidth;
  Sizes.height = window.innerHeight;

  camera.aspect = Sizes.width / Sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(Sizes.width, Sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

function animate() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();

function expoRandom(pow, control) {
  const x = Math.random();

  return Math.pow(x, pow) * control * (Math.random() >= 0.5 ? -0.8 : 0.8);
}
