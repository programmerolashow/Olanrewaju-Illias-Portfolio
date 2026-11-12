/**
 * 3D animals for the About section floor (SkillFloor). Loaded lazily, only once the floor scrolls into view, so
 * three.js stays out of the main bundle.
 *
 * Models: Quaternius "Animated Animal Pack" (CC0, public domain) from poly.pizza, slimmed to the clips used here.
 * The stage uses an orthographic camera where one world unit is one CSS pixel, so the floor's 2D physics (x in px)
 * maps straight onto the 3D scene.
 */
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";

export type AnimalKind = "husky" | "shiba-inu" | "fox";

/** What the floor's physics tells each animal every frame. */
export type AnimalPose = {
  x: number;
  dir: 1 | -1;
  /** px per second along the floor; picks walk vs gallop and matches the clip speed to it. */
  speed: number;
  moving: boolean;
};

const HEIGHT_PX: Record<AnimalKind, number> = { husky: 60, "shiba-inu": 50, fox: 46 };
/** Ground speed (px/s) at which each clip looks natural at 1x, so feet don't slide. */
const WALK_PX_S = 55;
const GALLOP_PX_S = 170;

type Animal = {
  root: THREE.Group;
  holder: THREE.Group;
  mixer: THREE.AnimationMixer;
  actions: Record<string, THREE.AnimationAction>;
  current: string;
  heading: number;
};

export type AnimalStage = {
  update: (poses: AnimalPose[], dt: number) => void;
  kick: (index: number) => void;
  resize: (width: number, height: number) => void;
  dispose: () => void;
};

export const createAnimalStage = async (canvas: HTMLCanvasElement, kinds: AnimalKind[]): Promise<AnimalStage> => {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xffffff, 0x4b5f3a, 2.2));
  const sun = new THREE.DirectionalLight(0xffffff, 2.4);
  sun.position.set(-200, 400, 300);
  scene.add(sun);

  // 1 unit = 1px, looking straight at the floor (a tilt would lift the animals off the grass). The three-quarter
  // turn of each animal (see update) gives the depth instead.
  const camera = new THREE.OrthographicCamera(0, 1, 1, 0, -1000, 1000);
  camera.position.set(0, 0, 400);

  const loader = new GLTFLoader();
  const templates = new Map<AnimalKind, Awaited<ReturnType<GLTFLoader["loadAsync"]>>>();
  await Promise.all(
    [...new Set(kinds)].map(async (kind) => {
      templates.set(kind, await loader.loadAsync(`/models/${kind}.glb`));
    }),
  );

  const shadowGeo = new THREE.CircleGeometry(1, 24);
  const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22, depthWrite: false });

  const animals: Animal[] = kinds.map((kind) => {
    const gltf = templates.get(kind)!;
    const model = cloneSkinned(gltf.scene) as THREE.Group;
    // The armature carries its own scale; measure with world matrices applied, or the size is off by that factor.
    model.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const scale = HEIGHT_PX[kind] / size.y;
    model.scale.setScalar(scale);
    model.position.y = -box.min.y * scale;

    const root = new THREE.Group();
    root.add(model);
    // Soft contact shadow: a flat ellipse facing the camera, kept out of the turning group so it stays wide.
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.scale.set(Math.max(size.x, size.z) * scale * 0.42, 3.5, 1);
    shadow.position.set(0, 1, -40);
    const holder = new THREE.Group();
    holder.add(root, shadow);
    scene.add(holder);

    const mixer = new THREE.AnimationMixer(model);
    const actions: Record<string, THREE.AnimationAction> = {};
    for (const clip of gltf.animations) actions[clip.name] = mixer.clipAction(clip);
    actions.Attack?.setLoop(THREE.LoopOnce, 1);
    if (actions.Attack) actions.Attack.clampWhenFinished = true;
    actions.Idle?.play();
    return { root, holder, mixer, actions, current: "Idle", heading: Math.PI / 2 };
  });

  const play = (a: Animal, name: string, fade = 0.25) => {
    if (a.current === name || !a.actions[name]) return;
    const next = a.actions[name];
    next.reset().play();
    a.actions[a.current]?.crossFadeTo(next, fade, false);
    a.current = name;
  };

  let width = 1;
  let height = 1;
  const groundY = 8; // px above the bottom of the canvas: standing on the grass

  return {
    resize(w, h) {
      width = Math.max(1, w);
      height = Math.max(1, h);
      renderer.setSize(width, height, false);
      camera.left = 0;
      camera.right = width;
      camera.top = height;
      camera.bottom = 0;
      camera.updateProjectionMatrix();
    },

    kick(index) {
      const a = animals[index];
      if (!a?.actions.Attack) return;
      play(a, "Attack", 0.12);
      const done = (e: { action: THREE.AnimationAction }) => {
        if (e.action !== a.actions.Attack) return;
        a.mixer.removeEventListener("finished", done);
        play(a, "Idle", 0.3);
      };
      a.mixer.addEventListener("finished", done);
    },

    update(poses, dt) {
      poses.forEach((pose, i) => {
        const a = animals[i];
        if (!a) return;
        a.holder.position.set(pose.x, groundY, (i - 1) * 30);
        // Face the way it's going, turned a little toward the viewer (three-quarter view), turning smoothly.
        const target = pose.dir === 1 ? Math.PI / 2 - 0.35 : -Math.PI / 2 + 0.35;
        a.heading += (target - a.heading) * Math.min(1, dt * 8);
        a.root.rotation.y = a.heading;

        if (a.current !== "Attack") {
          if (pose.moving) {
            const gallop = pose.speed > 100;
            play(a, gallop ? "Gallop" : "Walk");
            a.actions[a.current].timeScale = pose.speed / (gallop ? GALLOP_PX_S : WALK_PX_S);
          } else {
            play(a, "Idle");
          }
        }
        a.mixer.update(dt);
      });
      renderer.render(scene, camera);
    },

    dispose() {
      animals.forEach((a) => a.mixer.stopAllAction());
      shadowGeo.dispose();
      shadowMat.dispose();
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose();
          (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose());
        }
      });
      renderer.dispose();
    },
  };
};
