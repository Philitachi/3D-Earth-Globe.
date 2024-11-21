import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"; // Import OrbitControls
import * as dat from "lil-gui";

let scene;
let camera;
let renderer;
let controls;
let earthmesh; // To reference the earth mesh
let asteroidmesh; // To reference the asteroid mesh
let debrisGroup; // To reference the group of debris

function main() {
  const canvas = document.querySelector("canvas.webgl");

  scene = new THREE.Scene();

  // Camera setup
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 4;
  scene.add(camera);

  renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  renderer.autoClear = false;
  renderer.setClearColor(0x00000, 0.0);

  // Create texture loader
  const textureLoader = new THREE.TextureLoader();

  // Load textures for the Earth
  const earthTexture = textureLoader.load("earthmap.jpg");
  const specularTexture = textureLoader.load("specularmap.jpg");
  const citylightsTexture = textureLoader.load("citylightsmap.jpg");
  const bumpTexture = textureLoader.load("earthbump.jpg");
  const cloudTexture = textureLoader.load("earthCloud.png");
  const galaxyTexture = textureLoader.load("galaxy.png");

  // Load textures for the Asteroid
  const asteroidTexture = textureLoader.load("asteroid.jpg");
  const rockTexture = textureLoader.load("rockTexture.jpg");

  // Earth geometry and material
  const earthgeometry = new THREE.SphereGeometry(0.6, 32, 32);
  const earthmaterial = new THREE.MeshPhongMaterial({
    roughness: 1,
    metalness: 0,
    map: earthTexture,
    bumpMap: bumpTexture,
    bumpScale: 0.3,
  });

  earthmesh = new THREE.Mesh(earthgeometry, earthmaterial);
  scene.add(earthmesh);

  // Set ambient light
  const ambientlight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientlight);

  // Set point light
  const pointerlight = new THREE.PointLight(0xffffff, 0.9);
  pointerlight.position.set(5, 3, 5);
  scene.add(pointerlight);

  // Cloud geometry and material
  const cloudgeometry = new THREE.SphereGeometry(0.63, 32, 32);
  const cloudmaterial = new THREE.MeshPhongMaterial({
    map: cloudTexture,
    transparent: true,
  });

  const cloudmesh = new THREE.Mesh(cloudgeometry, cloudmaterial);
  scene.add(cloudmesh);

  // Star geometry and material
  const stargeometry = new THREE.SphereGeometry(80, 64, 64);
  const starmaterial = new THREE.MeshBasicMaterial({
    map: galaxyTexture,
    side: THREE.BackSide,
  });

  const starmesh = new THREE.Mesh(stargeometry, starmaterial);
  scene.add(starmesh);

  // Increase the size of the asteroid geometry
  const asteroidgeometry = new THREE.DodecahedronGeometry(4); // Increased size for visibility
  const asteroidmaterial = new THREE.MeshPhongMaterial({
    color: 0x888888,
    emissive: 0x555555,
    emissiveIntensity: 0.5,
    roughness: 0.7,
    metalness: 0.3,
    map: asteroidTexture,
  });

  asteroidmesh = new THREE.Mesh(asteroidgeometry, asteroidmaterial);
  asteroidmesh.position.set(30, 0, 0); // Position the asteroid far from the Earth
  scene.add(asteroidmesh);
  asteroidmesh.visible = false;

  // Add larger debris pieces (increase size for better visibility)
  debrisGroup = new THREE.Group();
  for (let i = 0; i < 50; i++) {
    // Increase the size of debris pieces
    const debrisGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5); // Larger cubes for debris
    const debrisMaterial = new THREE.MeshPhongMaterial({
      color: 0x777777,
      map: rockTexture,
    });

    const debrisPiece = new THREE.Mesh(debrisGeometry, debrisMaterial);
    debrisPiece.position.set(
      (Math.random() - 0.5) * 6, // Increased scattering area
      (Math.random() - 0.5) * 6,
      (Math.random() - 0.5) * 6
    );

    debrisGroup.add(debrisPiece);
  }

  asteroidmesh.add(debrisGroup); // Attach debris group to asteroid

  // OrbitControls for mouse interaction
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.25; // Optional: smooth out the rotation
  controls.screenSpacePanning = false; // Prevent panning up and down

  controls.maxPolarAngle = Math.PI; // Allows full 360-degree rotation in any direction

  // Initialize GUI
  const gui = new dat.GUI();
  const textureOptions = {
    earthTexture: "earthmap", // Default earth texture
    asteroidTexture: "asteroid", // Default asteroid texture
    wireframe: false, // New wireframe toggle option
  };

  // Add a GUI controller for changing Earth textures
  gui
    .add(textureOptions, "earthTexture", [
      "earthmap",
      "specularmap",
      "citylightsmap",
    ])
    .name("Select Earth Texture")
    .onChange(function (value) {
      if (value === "earthmap") {
        earthmesh.material.map = earthTexture;
      } else if (value === "specularmap") {
        earthmesh.material.map = specularTexture;
      } else if (value === "citylightsmap") {
        earthmesh.material.map = citylightsTexture;
      }
      earthmesh.material.needsUpdate = true; // Ensure the material is updated after texture change
    });

  // Add a GUI controller for changing Asteroid textures
  gui
    .add(textureOptions, "asteroidTexture", ["asteroid", "rock"])
    .name("Select Asteroid Texture")
    .onChange(function (value) {
      if (value === "asteroid") {
        asteroidmesh.material.map = asteroidTexture;
      } else if (value === "rock") {
        asteroidmesh.material.map = rockTexture;
      }
      asteroidmesh.material.needsUpdate = true;
    });

  // Add a checkbox to toggle the wireframe mode for Earth
  gui
    .add(textureOptions, "wireframe")
    .name("Earth Wireframe")
    .onChange(function (value) {
      earthmesh.material.wireframe = value; // Toggle the wireframe property
      earthmesh.material.needsUpdate = true; // Update the material when the wireframe option changes
    });

  // Animate function
  const animate = () => {
    requestAnimationFrame(animate);

    // Slow down the Earth's rotation
    earthmesh.rotation.y -= 0.0009;

    // Slow down the background rotation
    starmesh.rotation.y += 0.0001;

    // Update controls
    cloudmesh.rotation.y += 0.0005;
    controls.update();

    // Show asteroid if zoomed out far enough
    if (camera.position.z > 15) {
      asteroidmesh.visible = true;
    } else {
      asteroidmesh.visible = false;
    }

    render();
  };

  // Render function
  const render = () => {
    renderer.render(scene, camera);
  };

  animate();
}

// Resize event listener
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

window.onload = main;
