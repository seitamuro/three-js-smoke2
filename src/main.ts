import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import "./style.css";
import { smoke, fire, grass, floor } from "./texture";
import vertexSprite from "./shader/sprite.vert";
import fragmentSprite from "./shader/sprite.frag";

/**
 * Setup Scene , Camera and etc
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};
const canvas = document.querySelector(".webgl") as HTMLCanvasElement;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(0.25, -0.25, 1);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
scene.add(camera);

/**
 * Geometry
 */
interface StringKeyTexture {
  [key: string]: THREE.Texture;
}

interface StringKeyMesh {
  [key: string]: THREE.Mesh;
}

interface StringKeyMaterial {
  [key: string]: THREE.Material;
}

class SmokeEmitter {
  position: THREE.Vector3;
  radius_1: number = 0.02;
  radius_2: number = 1;
  radius_height: number = 5;
  add_time: number = 0.1;
  elapsed: number = 0;
  live_time_from: number = 7;
  live_time_to: number = 7.5;
  opacity_decrease: number = 0.08;
  rotation_from: number = 0.5;
  rotation_to: number = 1;
  speed_from: number = 0.005;
  speed_to: number = 0.01;
  scale_from: number = 0.2;
  scale_increase: number = 0.004;
  color_from: THREE.Color = new THREE.Color(0x111111);
  color_to: THREE.Color = new THREE.Color(0x000000);
  color_speed_from: number = 0.4;
  color_speed_to: number = 0.4;
  brightness_from: number = 1;
  brightness_to: number = 1;
  opacity: number = 1;
  blend: number = 0.8;
  texture: number = 1;
  direction: THREE.Vector3 = new THREE.Vector3();
  particles_smoke: any[] = [];
  clock: THREE.Clock = new THREE.Clock();
  wind: THREE.Vector3 = new THREE.Vector3(0.002, 0, 0);
  texture_smoke: StringKeyTexture = {};
  mesh: StringKeyMesh = {};
  mat: StringKeyMaterial = {};

  constructor(
    position: THREE.Vector3,
    geometry: THREE.BoxGeometry,
    scene: THREE.Scene,
    parameters: {}
  ) {
    this.position = position;
    Object.assign(this, parameters);

    const textureLoader = new THREE.TextureLoader();
    this.texture_smoke["smoke"] = textureLoader.load(smoke);
    this.texture_smoke["fire"] = textureLoader.load(fire);
    this.texture_smoke["grass"] = textureLoader.load(grass);
    this.texture_smoke["floor"] = textureLoader.load(floor);

    this.mat["sprite"] = new THREE.ShaderMaterial({
      uniforms: {
        map: {
          value: [
            this.texture_smoke["smoke"],
            this.texture_smoke["fire"],
            this.texture_smoke["grass"],
          ],
        },
        time: { value: 0 },
      },
      vertexShader: vertexSprite,
      fragmentShader: fragmentSprite,
      transparent: true,
      depthWrite: false,
      blending: THREE.CustomBlending,
      blendEquation: THREE.AddEquation,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneMinusSrcAlphaFactor,
    });

    this.mesh["sprite"] = new THREE.Mesh(geometry, this.mat["sprite"]);
    this.mesh["sprite"].frustumCulled = false;
    this.mesh["sprite"].matrixAutoUpdate = false;
    this.mesh["sprite"].updateMatrixWorld = () => {};
    scene.add(this.mesh["sprite"]);
  }

  emit() {
    let radius_1 = this.radius_1 * Math.sqrt(Math.random());
    let theta_1 = 2 * Math.PI * Math.random();
    let x_1 = this.position.x + radius_1 * Math.cos(theta_1);
    let z_1 = this.position.z + radius_1 * Math.sin(theta_1);

    let radius_2 = this.radius_2 * Math.sqrt(Math.random());
    let theta_2 = 2 * Math.PI * Math.random();
    let x_2 = this.position.x + radius_2 * Math.cos(theta_2);
    let z_2 = this.position.z + radius_2 * Math.sin(theta_2);

    this.direction.x = x_2 - x_1;
    this.direction.y = this.radius_height;
    this.direction.z = z_2 - z_1;

    let speed =
      Math.random() * (this.speed_to - this.speed_from) + this.speed_from;

    this.direction = this.direction.normalize();

    let brightness =
      Math.random() * (this.brightness_to - this.brightness_from) +
      this.brightness_from;

    this.particles_smoke.push({
      offset: [x_1, this.position.y, z_1],
      scale: [this.scale_from, this.scale_from],
      quaternion: new THREE.Vector4(
        this.direction.x,
        this.direction.y,
        this.direction.z,
        3
      ),
      rotation:
        Math.random() * (this.rotation_to - this.rotation_from) +
        this.rotation_from,
      color: [1, 1, 1, this.opacity],
      blend: this.blend,
      texture: this.texture,
      live:
        Math.random() * (this.live_time_to - this.live_time_from) +
        this.live_time_from,
      scale_increase: this.scale_increase,
      opacity_decrease: this.opacity_decrease,
      color_from: [
        this.color_from.r * brightness,
        this.color_from.g * brightness,
        this.color_from.b * brightness,
      ],
      color_to: [
        this.color_to.r * brightness,
        this.color_to.g * brightness,
        this.color_to.b * brightness,
      ],
      color_speed:
        Math.random() * (this.color_speed_to - this.color_speed_from) +
        this.color_speed_from,
      color_pr: 0,
    });
  }

  update() {
    this.elapsed += clock.elapsedTime;
    let add = Math.floor(this.elapsed / this.add_time);
    this.elapsed -= add * this.add_time;
    if (add > (0.016 / this.add_time) * 60 * 1) {
      this.elapsed = 0;
      add = 0;
    }

    while (add--) {
      this.emit();
    }

    let i = 0;
    const alive = new Array(this.particles_smoke.length);
    for (let item of this.particles_smoke) {
      if (item.color_pr < 1) {
        item.color_pr += item.color_speed * clock.elapsedTime;
        item.color[0] =
          item.color_from[0] +
          (item.color_to[0] - item.color_from[0]) * item.color_pr;
        item.color[1] =
          item.color_from[1] +
          (item.color_to[0] - item.color_from[1]) * item.color_pr;
        item.color[2] =
          item.color_from[2] +
          (item.color_to[0] - item.color_from[2]) * item.color_pr;
      } else {
        item.color[0] = item.color_to[0];
        item.color[1] = item.color_to[1];
        item.color[2] = item.color_to[2];
      }

      item.offset[0] += item.quaternion.x * item.wind.x * clock.elapsedTime;
      item.offset[1] += item.quaternion.y * item.wind.y * clock.elapsedTime;
      item.offset[2] += item.quaternion.z * item.wind.z * clock.elapsedTime;
      item.scale[0] += item.scale_increase * clock.elapsedTime;
      item.scale[1] += item.scale_increase * clock.elapsedTime;

      if (item.live > 0) {
        item.live -= clock.elapsedTime;
      } else {
        item.color[3] -= item.opacity_decrease * clock.elapsedTime;
      }
      if (item.color[3] > 0) {
        alive[i] = item;
        i++;
      }
      this.particles_smoke = alive.slice(0, i);
    }
  }
}

/**
 * Animation
 */
const clock = new THREE.Clock();
const smokeEmitter = new SmokeEmitter(
  new THREE.Vector3(0, 0, 0),
  new THREE.BoxGeometry(1, 1, 1),
  scene,
  {}
);
smokeEmitter.emit();

const animate = () => {
  const elapsedTime = clock.getElapsedTime();

  smokeEmitter.update();

  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(animate);
};

animate();
