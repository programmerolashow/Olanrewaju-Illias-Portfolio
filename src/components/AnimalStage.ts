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

/** A skill ball: its colour and the skill's icon (an inline <svg> to copy onto the ball). */
export type BallSpec = { colour: string; icon: SVGElement | null };

/** Where the floor's physics puts each ball: x in px, y = height above the floor in px, rot = roll angle (radians, clockwise). */
export type BallPose = { x: number; y: number; rot: number };

export type AnimalStage = {
  update: (poses: AnimalPose[], dt: number, balls?: BallPose[]) => void;
  kick: (index: number) => void;
  resize: (width: number, height: number) => void;
  dispose: () => void;
};

/**
 * The ball's surface: its colour with the skill icon printed in white on the side facing the viewer (and again on
 * the back). SphereGeometry's u = 0.25 faces the camera; the icon is sized so it looks about 20px across on the ball.
 */
const ballTexture = (spec: BallSpec) => {
  const W = 512;
  const H = 256;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = spec.colour;
  ctx.fillRect(0, 0, W, H);
  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;
  if (spec.icon) {
    const svg = spec.icon.cloneNode(true) as SVGElement;
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svg.setAttribute("width", "96");
    svg.setAttribute("height", "96");
    svg.removeAttribute("class");
    svg.setAttribute("style", "color:#ffffff");
    const img = new Image();
    img.onload = () => {
      for (const u of [0.25, 0.75]) ctx.drawImage(img, W * u - 48, H / 2 - 48, 96, 96);
      texture.needsUpdate = true;
    };
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.outerHTML)}`;
  }
  return texture;
};

export const createAnimalStage = async (
  canvas: HTMLCanvasElement,
  kinds: AnimalKind[],
  ballSpecs: BallSpec[] = [],
  ballRadius = 18,
  /** Height (px above the canvas bottom) of the surface the balls rest on. */
  ballFloor = 0,
): Promise<AnimalStage> => {
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

  // Skill balls: lit spheres in front of the animals (z), each with a contact shadow like the animals' that shrinks
  // and fades as the ball flies up. Each shadow has its own material so its opacity can change on its own.
  const ballGeo = new THREE.SphereGeometry(ballRadius, 32, 24);
  const balls = ballSpecs.map((spec) => {
    const mesh = new THREE.Mesh(ballGeo, new THREE.MeshStandardMaterial({ map: ballTexture(spec), roughness: 0.38, metalness: 0.05 }));
    const shadow = new THREE.Mesh(shadowGeo, shadowMat.clone());
    scene.add(mesh, shadow);
    return { mesh, shadow };
  });
  const BALL_Z = 80;

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

    update(poses, dt, ballPoses = []) {
      ballPoses.forEach((b, i) => {
        const ball = balls[i];
        if (!ball) return;
        ball.mesh.position.set(b.x, ballFloor + b.y + ballRadius, BALL_Z);
        // CSS rotate() turns clockwise; three.js turns counter-clockwise about z.
        ball.mesh.rotation.z = -b.rot;
        const lift = Math.min(1, b.y / 260);
        ball.shadow.position.set(b.x, ballFloor + 1, BALL_Z - 40);
        ball.shadow.scale.set(ballRadius * (0.95 - lift * 0.45), 3.2, 1);
        (ball.shadow.material as THREE.MeshBasicMaterial).opacity = 0.26 * (1 - lift * 0.7);
      });
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
      ballGeo.dispose();
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose();
          (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => {
            (m as THREE.MeshStandardMaterial).map?.dispose();
            m.dispose();
          });
        }
      });
      renderer.dispose();
    },
  };
};
