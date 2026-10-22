import * as THREE from 'three';
import { AgentProfile, DoraemonCharacterKey } from '../types/office';

export interface BuiltCharacterParts {
  leftLeg: THREE.Object3D;
  rightLeg: THREE.Object3D;
  leftArm: THREE.Object3D;
  rightArm: THREE.Object3D;
  headGroup: THREE.Group;
  tailGroup?: THREE.Group;
  propellerGroup?: THREE.Group;
  eyeGroups: THREE.Group[];
  interactableMeshes: THREE.Object3D[];
}

/**
 * Generates a subtle woven fabric / anime cel-shaded gradient texture
 * so clothing surfaces have rich depth instead of flat plastic colors.
 */
function createFabricTexture(
  baseHex: string,
  accentHex: string,
  pattern: 'weave' | 'knit' | 'zigzag_jaian' | 'suit_pinstripe' | 'glossy_dora'
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Vertical soft studio gradient for 3D volumetric shading
  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, baseHex);
  grad.addColorStop(0.65, baseHex);
  grad.addColorStop(1, accentHex);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  if (pattern === 'weave' || pattern === 'knit') {
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.lineWidth = 1;
    const step = pattern === 'knit' ? 6 : 4;
    for (let y = 0; y < 256; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(256, y);
      ctx.stroke();
    }
    for (let x = 0; x < 256; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 256);
      ctx.stroke();
    }
  } else if (pattern === 'suit_pinstripe') {
    ctx.strokeStyle = 'rgba(255,255,255,0.09)';
    ctx.lineWidth = 1.5;
    for (let x = 0; x < 256; x += 14) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 256);
      ctx.stroke();
    }
  } else if (pattern === 'zigzag_jaian') {
    // Iconic Jaian jagged black chest stripe across the middle of the jersey
    ctx.fillStyle = '#18181b';
    ctx.beginPath();
    const topY = 92;
    const botY = 166;
    const peaks = 6;
    const stepX = 256 / peaks;
    ctx.moveTo(0, topY + 18);
    for (let i = 0; i <= peaks; i++) {
      const x = i * stepX;
      const y = i % 2 === 0 ? topY : topY + 26;
      ctx.lineTo(x, y);
    }
    for (let i = peaks; i >= 0; i--) {
      const x = i * stepX;
      const y = i % 2 === 0 ? botY - 26 : botY;
      ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
  }

  // Subtle seam highlights
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  ctx.fillRect(0, 0, 256, 10);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/**
 * Builds a contoured 3D anime eye with sclera, colored iris, pupil,
 * dual white specular catchlights, and upper eyelash arch.
 */
function createSculptedAnimeEye(
  irisColorHex: number,
  scale = 1.0,
  isFemale = false
): THREE.Group {
  const eyeGroup = new THREE.Group();
  eyeGroup.scale.setScalar(scale);

  const scleraMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.15,
    clearcoat: 0.9
  });
  const irisMat = new THREE.MeshPhysicalMaterial({
    color: irisColorHex,
    roughness: 0.12,
    metalness: 0.1,
    clearcoat: 1.0
  });
  const pupilMat = new THREE.MeshBasicMaterial({ color: 0x090d16 });
  const highlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const lashMat = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    roughness: 0.35
  });

  // Sclera base
  const sclera = new THREE.Mesh(
    new THREE.SphereGeometry(0.044, 18, 16),
    scleraMat
  );
  sclera.scale.set(0.95, 1.12, 0.42);
  eyeGroup.add(sclera);

  // Colored Iris
  const iris = new THREE.Mesh(
    new THREE.SphereGeometry(0.031, 16, 14),
    irisMat
  );
  iris.scale.set(0.92, 1.08, 0.38);
  iris.position.set(0, 0, 0.009);
  eyeGroup.add(iris);

  // Deep Pupil
  const pupil = new THREE.Mesh(
    new THREE.SphereGeometry(0.017, 14, 12),
    pupilMat
  );
  pupil.scale.set(0.9, 1.05, 0.35);
  pupil.position.set(0, 0, 0.016);
  eyeGroup.add(pupil);

  // Main upper-left anime catchlight sparkle
  const sparkle1 = new THREE.Mesh(
    new THREE.SphereGeometry(0.0085, 10, 10),
    highlightMat
  );
  sparkle1.position.set(-0.01, 0.011, 0.022);
  eyeGroup.add(sparkle1);

  // Secondary lower-right catchlight
  const sparkle2 = new THREE.Mesh(
    new THREE.SphereGeometry(0.0045, 8, 8),
    highlightMat
  );
  sparkle2.position.set(0.009, -0.009, 0.021);
  eyeGroup.add(sparkle2);

  // Upper 3D Eyelid / Eyelash Arch
  const lashArc = new THREE.Mesh(
    new THREE.TorusGeometry(0.042, isFemale ? 0.0075 : 0.006, 8, 18, Math.PI * 0.85),
    lashMat
  );
  lashArc.rotation.z = Math.PI * 0.075;
  lashArc.position.set(0, 0.006, 0.012);
  eyeGroup.add(lashArc);

  if (isFemale) {
    // Winged outer lash tip for Shizuka
    const wingTip = new THREE.Mesh(
      new THREE.ConeGeometry(0.006, 0.022, 6),
      lashMat
    );
    wingTip.position.set(0.042, 0.022, 0.012);
    wingTip.rotation.z = -0.9;
    eyeGroup.add(wingTip);
  }

  return eyeGroup;
}

/**
 * Builds a curved 3D hair lock using TubeGeometry along a 3D spline with tapered ends.
 */
function createHairStrand(
  points: THREE.Vector3[],
  radius: number,
  material: THREE.Material
): THREE.Mesh {
  const curve = new THREE.CatmullRomCurve3(points);
  const geo = new THREE.TubeGeometry(curve, 14, radius, 8, false);
  // Taper the tip vertices smoothly
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();
  const lastPt = points[points.length - 1];
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const distToTip = v.distanceTo(lastPt);
    if (distToTip < radius * 2.4) {
      const factor = Math.max(0.15, distToTip / (radius * 2.4));
      v.lerp(lastPt, 1 - factor);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
  }
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, material);
  mesh.castShadow = true;
  return mesh;
}

/**
 * Builds a contoured humanoid head with jawline, cheeks, nose, ears, rosy blush, and smile.
 */
function createContouredAnimeHead(
  skinMat: THREE.Material,
  blushMat: THREE.Material,
  mouthMat: THREE.Material,
  headRadius = 0.235
): THREE.Group {
  const group = new THREE.Group();

  // Contoured LatheGeometry head with subtle jawline & cranium dome
  const lathePts: THREE.Vector2[] = [];
  const steps = 18;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps; // 0 = bottom chin, 1 = top crown
    const angle = (t - 0.5) * Math.PI;
    let r = Math.cos(angle) * headRadius;
    const y = Math.sin(angle) * headRadius * 1.06;
    // Slight anime cheek contour in lower half
    if (t < 0.45) {
      r *= 0.88 + t * 0.26;
    }
    lathePts.push(new THREE.Vector2(Math.max(0.001, r), y));
  }
  const headGeo = new THREE.LatheGeometry(lathePts, 28);
  // Flatter Z profile (0.84) so eyes, nose, blush & mouth sit cleanly on the front face plane
  headGeo.scale(0.95, 1.0, 0.84);
  const headMesh = new THREE.Mesh(headGeo, skinMat);
  headMesh.castShadow = true;
  group.add(headMesh);

  // Sculpted 3D Nose (delicate anime nose bridge & tip)
  const nose = new THREE.Mesh(
    new THREE.ConeGeometry(0.02, 0.045, 10),
    skinMat
  );
  nose.rotation.x = Math.PI * 0.45;
  nose.position.set(0, -0.014, headRadius * 0.88);
  group.add(nose);

  // Rosy Anime Cheek Blushes
  [-1, 1].forEach((side) => {
    const blush = new THREE.Mesh(
      new THREE.SphereGeometry(0.032, 12, 10),
      blushMat
    );
    blush.scale.set(1.25, 0.65, 0.25);
    blush.position.set(side * 0.112, -0.036, headRadius * 0.79);
    blush.rotation.y = side * 0.35;
    group.add(blush);
  });

  // Sculpted 3D Ears on left & right
  [-1, 1].forEach((side) => {
    const ear = new THREE.Mesh(
      new THREE.SphereGeometry(0.046, 12, 12),
      skinMat
    );
    ear.scale.set(0.45, 1.15, 0.75);
    ear.position.set(side * (headRadius * 0.93), -0.01, -0.01);
    group.add(ear);
  });

  // Expressive warm smile arc lying flat in the XY face plane
  const smileArc = new THREE.Mesh(
    new THREE.TorusGeometry(0.028, 0.0055, 8, 16, Math.PI * 0.8),
    mouthMat
  );
  smileArc.rotation.z = Math.PI * 1.1;
  smileArc.position.set(0, -0.052, headRadius * 0.85);
  group.add(smileArc);

  return group;
}

/**
 * Builds a sculpted hand with palm, thumb, and fingers.
 */
function createSculptedHand(
  skinMat: THREE.Material,
  isRight: boolean
): THREE.Group {
  const hand = new THREE.Group();
  const palm = new THREE.Mesh(
    new THREE.SphereGeometry(0.044, 14, 12),
    skinMat
  );
  palm.scale.set(0.85, 1.1, 0.65);
  hand.add(palm);

  const thumb = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.013, 0.025, 6, 8),
    skinMat
  );
  thumb.position.set(isRight ? -0.034 : 0.034, -0.005, 0.018);
  thumb.rotation.z = isRight ? 0.6 : -0.6;
  hand.add(thumb);

  [-0.018, -0.006, 0.006, 0.018].forEach((xOff, idx) => {
    const finger = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.01, 0.028 - Math.abs(idx - 1.5) * 0.004, 6, 8),
      skinMat
    );
    finger.position.set(xOff, -0.042, 0.005);
    hand.add(finger);
  });

  return hand;
}

/**
 * Builds a detailed, multi-part 3D shoe (sole, midsole, upper vamp, tongue, strap/laces).
 */
function createSculptedShoe(
  upperMat: THREE.Material,
  soleMat: THREE.Material,
  accentMat: THREE.Material,
  style: 'mary_jane' | 'sneaker' | 'oxford' | 'boot'
): THREE.Group {
  const shoe = new THREE.Group();

  // Contoured Rubber Outsole
  const sole = new THREE.Mesh(
    new THREE.BoxGeometry(0.145, 0.032, 0.25),
    soleMat
  );
  sole.position.set(0, 0.016, 0.035);
  shoe.add(sole);

  // Sculpted Upper Shoe Vamp
  const vamp = new THREE.Mesh(
    new THREE.SphereGeometry(0.072, 16, 14),
    upperMat
  );
  vamp.scale.set(0.98, 0.72, 1.65);
  vamp.position.set(0, 0.055, 0.035);
  vamp.castShadow = true;
  shoe.add(vamp);

  // Heel counter
  const heel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.058, 0.064, 0.075, 14),
    upperMat
  );
  heel.position.set(0, 0.068, -0.035);
  shoe.add(heel);

  if (style === 'mary_jane') {
    // Ankle strap + gold buckle for Shizuka
    const strap = new THREE.Mesh(
      new THREE.TorusGeometry(0.056, 0.01, 8, 16, Math.PI),
      upperMat
    );
    strap.rotation.x = Math.PI * 0.35;
    strap.position.set(0, 0.082, 0.02);
    shoe.add(strap);
  } else if (style === 'sneaker' || style === 'boot') {
    // White toe cap + laces bar
    const toeCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.064, 14, 12),
      soleMat
    );
    toeCap.scale.set(0.96, 0.55, 0.85);
    toeCap.position.set(0, 0.044, 0.1);
    shoe.add(toeCap);

    const stripe = new THREE.Mesh(
      new THREE.BoxGeometry(0.142, 0.018, 0.09),
      accentMat
    );
    stripe.position.set(0, 0.062, 0.03);
    shoe.add(stripe);
  }

  return shoe;
}

/**
 * Main High-Detail 3D Character Builder for the 5 Doraemon Office Specialists.
 * Replaces simple boxes/cylinders with contoured LatheGeometry bodies, multi-jointed
 * limbs, sculpted hair locks, expressive 3D anime eyes with catchlights, and role props.
 */
export function buildDetailedDoraemonCharacter(
  agent: AgentProfile,
  bodyGroup: THREE.Group
): BuiltCharacterParts {
  const interactableMeshes: THREE.Object3D[] = [];
  const eyeGroups: THREE.Group[] = [];
  let tailGroup: THREE.Group | undefined;
  let propellerGroup: THREE.Group | undefined;
  const leftLeg = new THREE.Group();
  const rightLeg = new THREE.Group();
  const leftArm = new THREE.Group();
  const rightArm = new THREE.Group();
  const headGroup = new THREE.Group();

  // Shared high-craft PBR materials
  const skinMat = new THREE.MeshPhysicalMaterial({
    color: 0xffdfc4,
    roughness: 0.48,
    metalness: 0.02,
    sheen: 0.25,
    sheenRoughness: 0.6,
    sheenColor: new THREE.Color(0xffb4a2)
  });

  const blushMat = new THREE.MeshBasicMaterial({
    color: 0xfb7185,
    transparent: true,
    opacity: 0.42
  });

  const smileMouthMat = new THREE.MeshStandardMaterial({
    color: 0xe11d48,
    roughness: 0.35
  });

  const pureWhiteMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.3,
    metalness: 0.04,
    clearcoat: 0.3
  });

  const goldMat = new THREE.MeshPhysicalMaterial({
    color: 0xfacc15,
    roughness: 0.18,
    metalness: 0.9,
    clearcoat: 0.8,
    emissive: 0xca8a04,
    emissiveIntensity: 0.18
  });

  const redAccentMat = new THREE.MeshPhysicalMaterial({
    color: 0xef4444,
    roughness: 0.22,
    metalness: 0.1,
    clearcoat: 0.75
  });

  const darkMetalMat = new THREE.MeshPhysicalMaterial({
    color: 0x1e293b,
    roughness: 0.25,
    metalness: 0.8
  });

  if (agent.characterKey === 'doraemon') {
    // =========================================================================
    // 1. DORAEMON (ĐÔ-RÊ-MON) — TRƯỞNG PHÒNG QUẢN LÝ CHUNG & ĐIỀU PHỐI
    // Sculpted Figurine Finish + Executive Navy/Gold Director Lapel & 4D Pocket Gadgets
    // =========================================================================
    const doraBlueTex = createFabricTexture('#0096e6', '#0284c7', 'glossy_dora');
    const doraBlueMat = new THREE.MeshPhysicalMaterial({
      map: doraBlueTex,
      color: 0x00a0f0,
      roughness: 0.24,
      metalness: 0.08,
      clearcoat: 0.65,
      clearcoatRoughness: 0.18
    });

    const navyCapeMat = new THREE.MeshPhysicalMaterial({
      color: 0x1e3a8a,
      roughness: 0.42,
      metalness: 0.15,
      sheen: 0.5
    });

    // Articulated Legs + Plump Sculpted Cat Paws with Toe Grooves
    leftLeg.position.set(-0.18, 0.44, 0);
    rightLeg.position.set(0.18, 0.44, 0);
    [leftLeg, rightLeg].forEach((legGrp) => {
      const hipJoint = new THREE.Mesh(
        new THREE.SphereGeometry(0.125, 16, 14),
        doraBlueMat
      );
      const legCyl = new THREE.Mesh(
        new THREE.CylinderGeometry(0.13, 0.115, 0.28, 18),
        doraBlueMat
      );
      legCyl.position.y = -0.14;
      legCyl.castShadow = true;

      const paw = new THREE.Mesh(
        new THREE.SphereGeometry(0.155, 20, 16),
        pureWhiteMat
      );
      paw.scale.set(1.08, 0.62, 1.38);
      paw.position.set(0, -0.33, 0.045);
      paw.castShadow = true;

      legGrp.add(hipJoint, legCyl, paw);
    });
    bodyGroup.add(leftLeg, rightLeg);

    // Sculpted Contoured Torso via LatheGeometry
    const torsoPts = [
      new THREE.Vector2(0.01, -0.38),
      new THREE.Vector2(0.28, -0.34),
      new THREE.Vector2(0.41, -0.18),
      new THREE.Vector2(0.44, 0.02),
      new THREE.Vector2(0.41, 0.22),
      new THREE.Vector2(0.33, 0.35),
      new THREE.Vector2(0.01, 0.38)
    ];
    const torsoGeo = new THREE.LatheGeometry(torsoPts, 32);
    const torso = new THREE.Mesh(torsoGeo, doraBlueMat);
    torso.position.set(0, 0.78, 0);
    torso.castShadow = true;
    interactableMeshes.push(torso);
    bodyGroup.add(torso);

    // Executive Manager Vest Trim / Shoulder Epaulettes with Gold Fringe
    [-1, 1].forEach((side) => {
      const epaulette = new THREE.Mesh(
        new THREE.BoxGeometry(0.16, 0.04, 0.22),
        navyCapeMat
      );
      epaulette.position.set(side * 0.36, 1.1, 0);
      epaulette.rotation.z = -side * 0.22;
      const goldTrim = new THREE.Mesh(
        new THREE.BoxGeometry(0.17, 0.045, 0.04),
        goldMat
      );
      goldTrim.position.set(side * 0.37, 1.1, 0.1);
      goldTrim.rotation.z = -side * 0.22;
      bodyGroup.add(epaulette, goldTrim);
    });

    // Sculpted White Belly Patch + 3D Recessed 4D Magic Pocket
    const belly = new THREE.Mesh(
      new THREE.SphereGeometry(0.345, 24, 20),
      pureWhiteMat
    );
    belly.scale.set(1.02, 0.94, 0.48);
    belly.position.set(0, 0.76, 0.28);
    bodyGroup.add(belly);

    // 4D Magic Pocket with sculpted lip & gadget peeking out
    const pocketRim = new THREE.Mesh(
      new THREE.TorusGeometry(0.19, 0.016, 12, 24, Math.PI),
      new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.35 })
    );
    pocketRim.rotation.z = Math.PI;
    pocketRim.position.set(0, 0.78, 0.435);
    bodyGroup.add(pocketRim);

    const pocketBag = new THREE.Mesh(
      new THREE.CylinderGeometry(0.19, 0.18, 0.05, 24, 1, false, 0, Math.PI),
      pureWhiteMat
    );
    pocketBag.rotation.z = Math.PI / 2;
    pocketBag.rotation.y = Math.PI / 2;
    pocketBag.position.set(0, 0.77, 0.42);
    bodyGroup.add(pocketBag);

    // Red Collar + Sculpted Golden Bell with detail ring & slit
    const collar = new THREE.Mesh(
      new THREE.TorusGeometry(0.325, 0.048, 16, 32),
      redAccentMat
    );
    collar.rotation.x = Math.PI / 2;
    collar.position.set(0, 1.12, 0.02);
    bodyGroup.add(collar);

    const bellGroup = new THREE.Group();
    bellGroup.position.set(0, 1.09, 0.38);
    const bellSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.085, 20, 20),
      goldMat
    );
    const bellBand = new THREE.Mesh(
      new THREE.TorusGeometry(0.084, 0.012, 10, 24),
      goldMat
    );
    bellBand.rotation.x = Math.PI / 2;
    const bellHole = new THREE.Mesh(
      new THREE.SphereGeometry(0.022, 10, 10),
      darkMetalMat
    );
    bellHole.position.set(0, -0.02, 0.075);
    bellGroup.add(bellSphere, bellBand, bellHole);
    bodyGroup.add(bellGroup);

    // Cute Red Tail with stem at the back
    tailGroup = new THREE.Group();
    tailGroup.position.set(0, 0.62, -0.43);
    const tailStem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.018, 0.08, 8),
      darkMetalMat
    );
    tailStem.rotation.x = Math.PI / 3;
    const tailBall = new THREE.Mesh(
      new THREE.SphereGeometry(0.068, 16, 16),
      redAccentMat
    );
    tailBall.position.set(0, 0.03, -0.05);
    tailGroup.add(tailStem, tailBall);
    bodyGroup.add(tailGroup);

    // Articulated Arms + White Spherical Hands + Director Coordination Pad
    leftArm.position.set(-0.42, 1.04, 0);
    rightArm.position.set(0.42, 1.04, 0);
    [leftArm, rightArm].forEach((armGrp, idx) => {
      const isRight = idx === 1;
      const shoulder = new THREE.Mesh(
        new THREE.SphereGeometry(0.105, 16, 14),
        doraBlueMat
      );
      const upperArm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.088, 0.34, 16),
        doraBlueMat
      );
      upperArm.position.set(isRight ? 0.05 : -0.05, -0.15, 0.03);
      upperArm.rotation.z = isRight ? -0.28 : 0.28;
      upperArm.rotation.x = -0.22;

      const handSphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.118, 20, 18),
        pureWhiteMat
      );
      handSphere.position.set(isRight ? 0.1 : -0.1, -0.34, 0.09);
      armGrp.add(shoulder, upperArm, handSphere);
    });

    // Executive Director Holo-Pad in Doraemon's right hand
    const directorPad = new THREE.Group();
    directorPad.position.set(0.12, -0.32, 0.22);
    directorPad.rotation.set(-0.4, -0.25, 0);
    const padFrame = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.3, 0.025),
      darkMetalMat
    );
    const padScreen = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.26, 0.028),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    directorPad.add(padFrame, padScreen);
    rightArm.add(directorPad);
    bodyGroup.add(leftArm, rightArm);

    // Sculpted Oversized Doraemon Head + Chubby Cheeks + 3D Curved Whiskers + Takecopter
    headGroup.position.set(0, 1.56, 0);
    const headSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.44, 32, 28),
      doraBlueMat
    );
    headSphere.scale.set(1.04, 0.98, 0.98);
    headSphere.castShadow = true;
    interactableMeshes.push(headSphere);
    headGroup.add(headSphere);

    // Sculpted White Face Muzzle + Chubby Cheek Pouches
    const whiteFace = new THREE.Mesh(
      new THREE.SphereGeometry(0.38, 28, 24),
      pureWhiteMat
    );
    whiteFace.scale.set(1.04, 0.92, 0.58);
    whiteFace.position.set(0, -0.03, 0.22);
    headGroup.add(whiteFace);

    [-1, 1].forEach((side) => {
      const cheekPouch = new THREE.Mesh(
        new THREE.SphereGeometry(0.16, 18, 16),
        pureWhiteMat
      );
      cheekPouch.scale.set(1.1, 0.82, 0.75);
      cheekPouch.position.set(side * 0.24, -0.09, 0.28);
      headGroup.add(cheekPouch);
    });

    // Big Expressive Oval Eyes + Dual Specular Catchlights
    [-0.098, 0.098].forEach((xEye) => {
      const doraEyeGrp = new THREE.Group();
      doraEyeGrp.position.set(xEye, 0.13, 0.4);

      const eyeWhite = new THREE.Mesh(
        new THREE.SphereGeometry(0.105, 20, 18),
        pureWhiteMat
      );
      eyeWhite.scale.set(0.86, 1.22, 0.45);

      const iris = new THREE.Mesh(
        new THREE.SphereGeometry(0.044, 16, 14),
        darkMetalMat
      );
      iris.scale.set(0.85, 1.15, 0.45);
      iris.position.set(-xEye * 0.28, 0, 0.04);

      const catchlight = new THREE.Mesh(
        new THREE.SphereGeometry(0.015, 10, 10),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      catchlight.position.set(-xEye * 0.35 - 0.01, 0.02, 0.058);

      doraEyeGrp.add(eyeWhite, iris, catchlight);
      eyeGroups.push(doraEyeGrp);
      headGroup.add(doraEyeGrp);
    });

    // Glossy Red Spherical Nose with highlight + philtrum line
    const redNose = new THREE.Mesh(
      new THREE.SphereGeometry(0.068, 20, 18),
      redAccentMat
    );
    redNose.position.set(0, 0.04, 0.47);
    headGroup.add(redNose);

    const philtrum = new THREE.Mesh(
      new THREE.BoxGeometry(0.014, 0.15, 0.014),
      darkMetalMat
    );
    philtrum.position.set(0, -0.05, 0.445);
    headGroup.add(philtrum);

    // 6 Curved 3D Whiskers using TubeGeometry
    [-1, 1].forEach((side) => {
      [-0.06, 0, 0.06].forEach((yOff, wIdx) => {
        const curve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(side * 0.12, -0.03 + yOff, 0.43),
          new THREE.Vector3(side * 0.25, -0.02 + yOff * 1.3, 0.41),
          new THREE.Vector3(side * 0.37, -0.03 + (wIdx - 1) * 0.08, 0.35)
        ]);
        const whisker = new THREE.Mesh(
          new THREE.TubeGeometry(curve, 10, 0.008, 6, false),
          darkMetalMat
        );
        headGroup.add(whisker);
      });
    });

    // Cheerful Sculpted Red Smile Mouth + Tongue
    const smileMouth = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 20, 16, 0, Math.PI, 0, Math.PI * 0.55),
      smileMouthMat
    );
    smileMouth.rotation.x = Math.PI * 0.55;
    smileMouth.scale.set(1.15, 0.55, 0.65);
    smileMouth.position.set(0, -0.13, 0.38);
    headGroup.add(smileMouth);

    // Iconic Bamboo-Copter (Chong chóng tre - Takecopter) on top of Doraemon's head!
    const copterGroup = new THREE.Group();
    copterGroup.position.set(0, 0.44, 0);
    const copterBase = new THREE.Mesh(
      new THREE.SphereGeometry(0.045, 14, 12),
      goldMat
    );
    copterBase.scale.set(1, 0.6, 1);
    const copterMast = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.014, 0.11, 10),
      goldMat
    );
    copterMast.position.y = 0.055;
    propellerGroup = new THREE.Group();
    propellerGroup.position.y = 0.11;
    const copterRotor = new THREE.Mesh(
      new THREE.BoxGeometry(0.34, 0.012, 0.038),
      goldMat
    );
    propellerGroup.add(copterRotor);
    copterGroup.add(copterBase, copterMast, propellerGroup);
    headGroup.add(copterGroup);

    bodyGroup.add(headGroup);
  } else if (agent.characterKey === 'shizuka') {
    // =========================================================================
    // 2. SHIZUKA (XUKA) — CSKH, BÁO GIÁ, HỢP ĐỒNG & PHIẾU GIAO HÀNG
    // Sculpted Pleated Dress, Peter Pan Collar, Cardigan Vest, Layered Pigtails & Ribbons
    // =========================================================================
    const pinkFabricTex = createFabricTexture('#ec4899', '#be185d', 'weave');
    const pinkDressMat = new THREE.MeshPhysicalMaterial({
      map: pinkFabricTex,
      color: 0xf472b6,
      roughness: 0.42,
      metalness: 0.05,
      sheen: 0.65,
      sheenColor: new THREE.Color(0xfbcfe8)
    });

    const magentaVestMat = new THREE.MeshPhysicalMaterial({
      color: 0xdb2777,
      roughness: 0.38,
      metalness: 0.08,
      sheen: 0.5
    });

    const hairBrownMat = new THREE.MeshPhysicalMaterial({
      color: 0x2e1a12,
      roughness: 0.36,
      metalness: 0.12,
      clearcoat: 0.45,
      clearcoatRoughness: 0.28
    });

    // Tapered Legs + White Knee Socks + Sculpted Mary Jane Shoes
    leftLeg.position.set(-0.12, 0.66, 0);
    rightLeg.position.set(0.12, 0.66, 0);
    [leftLeg, rightLeg].forEach((legGrp) => {
      const thigh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.078, 0.066, 0.28, 16),
        skinMat
      );
      thigh.position.y = -0.14;

      const knee = new THREE.Mesh(
        new THREE.SphereGeometry(0.065, 14, 12),
        skinMat
      );
      knee.position.y = -0.28;

      const sock = new THREE.Mesh(
        new THREE.CylinderGeometry(0.064, 0.054, 0.28, 16),
        pureWhiteMat
      );
      sock.position.y = -0.43;

      const shoe = createSculptedShoe(
        magentaVestMat,
        darkMetalMat,
        goldMat,
        'mary_jane'
      );
      shoe.position.set(0, -0.65, 0);

      legGrp.add(thigh, knee, sock, shoe);
    });
    bodyGroup.add(leftLeg, rightLeg);

    // Sculpted Pleated A-Line Skirt (Smooth Fluted Vertex Geometry)
    const skirtGroup = new THREE.Group();
    skirtGroup.position.set(0, 0.74, 0);
    const skirtGeo = new THREE.CylinderGeometry(0.175, 0.335, 0.42, 48, 8);
    const sPos = skirtGeo.attributes.position;
    for (let i = 0; i < sPos.count; i++) {
      const vx = sPos.getX(i);
      const vy = sPos.getY(i);
      const vz = sPos.getZ(i);
      const r = Math.hypot(vx, vz);
      if (r > 0.01) {
        const theta = Math.atan2(vz, vx);
        // Stronger pleat flutes toward the bottom hem, smooth at the waist
        const hemWeight = (0.21 - vy) / 0.42;
        const flute = 1 + Math.cos(theta * 14) * 0.045 * hemWeight;
        sPos.setX(i, vx * flute);
        sPos.setZ(i, vz * flute);
      }
    }
    skirtGeo.computeVertexNormals();
    const skirtBase = new THREE.Mesh(skirtGeo, pinkDressMat);
    skirtBase.castShadow = true;
    skirtGroup.add(skirtBase);

    // White Lace Hem Trim
    const laceHem = new THREE.Mesh(
      new THREE.TorusGeometry(0.335, 0.018, 10, 32),
      pureWhiteMat
    );
    laceHem.rotation.x = Math.PI / 2;
    laceHem.position.y = -0.2;
    skirtGroup.add(laceHem);
    bodyGroup.add(skirtGroup);

    // Contoured Feminine Bodice (LatheGeometry) + Waist Ribbon Belt + Peter Pan Collar
    const bodicePts = [
      new THREE.Vector2(0.17, -0.22),
      new THREE.Vector2(0.155, -0.06),
      new THREE.Vector2(0.215, 0.1),
      new THREE.Vector2(0.2, 0.22),
      new THREE.Vector2(0.11, 0.26)
    ];
    const bodice = new THREE.Mesh(
      new THREE.LatheGeometry(bodicePts, 28),
      pinkDressMat
    );
    bodice.scale.set(1.04, 1.0, 0.82);
    bodice.position.set(0, 1.14, 0);
    bodice.castShadow = true;
    interactableMeshes.push(bodice);
    bodyGroup.add(bodice);

    // Waist Belt + Gold Clasp
    const waistBelt = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.185, 0.055, 24),
      magentaVestMat
    );
    waistBelt.scale.set(1.04, 1, 0.84);
    waistBelt.position.set(0, 0.95, 0);
    const goldBuckle = new THREE.Mesh(
      new THREE.BoxGeometry(0.07, 0.06, 0.03),
      goldMat
    );
    goldBuckle.position.set(0, 0.95, 0.155);
    bodyGroup.add(waistBelt, goldBuckle);

    // Crisp White Peter Pan Collar + Red Bow Tie at Neck
    const collarRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.145, 0.032, 12, 24),
      pureWhiteMat
    );
    collarRing.rotation.x = Math.PI / 2 + 0.12;
    collarRing.position.set(0, 1.37, 0.01);
    bodyGroup.add(collarRing);

    const neckBow = new THREE.Group();
    neckBow.position.set(0, 1.33, 0.165);
    [-1, 1].forEach((s) => {
      const loop = new THREE.Mesh(
        new THREE.ConeGeometry(0.035, 0.075, 10),
        redAccentMat
      );
      loop.rotation.z = s * Math.PI * 0.45;
      loop.position.x = s * 0.032;
      neckBow.add(loop);
    });
    bodyGroup.add(neckBow);

    // Sculpted Puff-Sleeve Arms + Tapered Forearms + Sculpted Hands + Contract Folder
    leftArm.position.set(-0.25, 1.32, 0);
    rightArm.position.set(0.25, 1.32, 0);
    [leftArm, rightArm].forEach((armGrp, idx) => {
      const isRight = idx === 1;
      const puffSleeve = new THREE.Mesh(
        new THREE.SphereGeometry(0.082, 16, 14),
        pinkDressMat
      );
      puffSleeve.scale.set(0.95, 1.15, 0.95);
      puffSleeve.position.y = -0.04;

      const upperArm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.056, 0.048, 0.24, 14),
        skinMat
      );
      upperArm.position.y = -0.18;

      const forearm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.048, 0.042, 0.22, 14),
        skinMat
      );
      forearm.position.set(0, -0.38, isRight ? 0.06 : 0.02);
      forearm.rotation.x = isRight ? -0.45 : -0.15;

      const hand = createSculptedHand(skinMat, isRight);
      hand.position.set(0, -0.48, isRight ? 0.11 : 0.04);

      armGrp.add(puffSleeve, upperArm, forearm, hand);
    });

    // Detailed CSKH Contract & Delivery Note Portfolio in Shizuka's right hand
    const folderGroup = new THREE.Group();
    folderGroup.position.set(0.04, -0.44, 0.18);
    folderGroup.rotation.set(-0.35, -0.2, 0.1);
    const board = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.3, 0.022),
      magentaVestMat
    );
    const paper = new THREE.Mesh(
      new THREE.BoxGeometry(0.19, 0.27, 0.026),
      pureWhiteMat
    );
    const clip = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.03, 0.032),
      goldMat
    );
    clip.position.y = 0.135;
    folderGroup.add(board, paper, clip);
    rightArm.add(folderGroup);
    bodyGroup.add(leftArm, rightArm);

    // Sculpted Anime Head + DetailedEyes + Layered Bangs & Twin Braided Pigtails
    headGroup.position.set(0, 1.6, 0);
    const contouredHead = createContouredAnimeHead(
      skinMat,
      blushMat,
      smileMouthMat,
      0.225
    );
    interactableMeshes.push(contouredHead);
    headGroup.add(contouredHead);

    // Sculpted Anime Eyes + Eyebrows
    [-0.078, 0.078].forEach((xEye, idx) => {
      const eye = createSculptedAnimeEye(0x3b2314, 1.0, true);
      eye.position.set(xEye, 0.025, 0.205);
      eye.rotation.y = (idx === 0 ? -1 : 1) * 0.14;
      eyeGroups.push(eye);
      headGroup.add(eye);

      const brow = new THREE.Mesh(
        new THREE.TorusGeometry(0.042, 0.0055, 6, 14, Math.PI * 0.75),
        hairBrownMat
      );
      brow.position.set(xEye, 0.082, 0.205);
      brow.rotation.z = Math.PI * 0.12;
      headGroup.add(brow);
    });

    // Multi-layered Hair Crown tilted back so front face & eyes are 100% open
    const hairDome = new THREE.Mesh(
      new THREE.SphereGeometry(0.236, 24, 20, 0, Math.PI * 2, 0, Math.PI * 0.44),
      hairBrownMat
    );
    hairDome.rotation.x = -0.38;
    hairDome.position.set(0, 0.045, -0.025);
    headGroup.add(hairDome);

    // Sculpted Parted Anime Bangs framing the top forehead & temples (above eyebrows)
    [-0.14, -0.08, 0.0, 0.08, 0.14].forEach((xB, bIdx) => {
      const isSideLock = Math.abs(bIdx - 2) === 2;
      const bangStrand = createHairStrand(
        [
          new THREE.Vector3(xB * 0.5, 0.23, 0.05),
          new THREE.Vector3(xB * 0.95, 0.18, 0.17),
          new THREE.Vector3(
            xB * 1.18,
            isSideLock ? 0.05 : 0.115 + Math.abs(bIdx - 2) * 0.01,
            isSideLock ? 0.15 : 0.195
          )
        ],
        0.028,
        hairBrownMat
      );
      headGroup.add(bangStrand);
    });

    // Signature Twin Pigtails with Sculpted Ribbons & Layered Braids
    [-1, 1].forEach((side) => {
      // Yellow/Gold Ribbon Bow at temple/ear level
      const bowCenter = new THREE.Mesh(
        new THREE.SphereGeometry(0.036, 12, 12),
        goldMat
      );
      bowCenter.position.set(side * 0.23, -0.03, -0.02);
      headGroup.add(bowCenter);

      [-1, 1].forEach((wing) => {
        const bowLoop = new THREE.Mesh(
          new THREE.ConeGeometry(0.034, 0.07, 10),
          goldMat
        );
        bowLoop.position.set(side * 0.24, -0.03 + wing * 0.028, -0.02);
        bowLoop.rotation.x = wing * 0.6;
        bowLoop.rotation.z = side * 0.4;
        headGroup.add(bowLoop);
      });

      // Curved Pigtail Lock (TubeGeometry with organic curve over shoulders)
      const pigtailLock = createHairStrand(
        [
          new THREE.Vector3(side * 0.22, -0.03, -0.02),
          new THREE.Vector3(side * 0.3, -0.14, 0.03),
          new THREE.Vector3(side * 0.33, -0.28, 0.07),
          new THREE.Vector3(side * 0.29, -0.39, 0.09)
        ],
        0.056,
        hairBrownMat
      );
      headGroup.add(pigtailLock);
    });

    bodyGroup.add(headGroup);
  } else if (agent.characterKey === 'suneo') {
    // =========================================================================
    // 3. SUNEO (XÊKO) — PHỤ TRÁCH KẾ TOÁN, CÔNG NỢ, HỢP ĐỒNG ĐỐI TÁC & HÓA ĐƠN
    // Tailored Pinstripe Executive Blazer, Gold Silk Tie, Sculpted Swept Spiky Hair
    // =========================================================================
    const suitTex = createFabricTexture('#0d9488', '#115e59', 'suit_pinstripe');
    const suitMat = new THREE.MeshPhysicalMaterial({
      map: suitTex,
      color: 0x14b8a6,
      roughness: 0.36,
      metalness: 0.12,
      sheen: 0.55
    });

    const slacksMat = new THREE.MeshPhysicalMaterial({
      color: 0x451a03,
      roughness: 0.52,
      metalness: 0.08
    });

    const jetHairMat = new THREE.MeshPhysicalMaterial({
      color: 0x0f172a,
      roughness: 0.28,
      metalness: 0.18,
      clearcoat: 0.6
    });

    // Tailored Trousers + Oxford Dress Shoes
    leftLeg.position.set(-0.13, 0.66, 0);
    rightLeg.position.set(0.13, 0.66, 0);
    [leftLeg, rightLeg].forEach((legGrp) => {
      const thigh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.092, 0.08, 0.3, 16),
        slacksMat
      );
      thigh.position.y = -0.15;
      const shin = new THREE.Mesh(
        new THREE.CylinderGeometry(0.078, 0.068, 0.3, 16),
        slacksMat
      );
      shin.position.y = -0.43;
      const shoe = createSculptedShoe(
        slacksMat,
        darkMetalMat,
        goldMat,
        'oxford'
      );
      shoe.position.set(0, -0.65, 0);
      legGrp.add(thigh, shin, shoe);
    });
    bodyGroup.add(leftLeg, rightLeg);

    // Sculpted Executive Blazer Torso (LatheGeometry) + Lapels + Dress Shirt + Gold Tie
    const blazerPts = [
      new THREE.Vector2(0.19, -0.32),
      new THREE.Vector2(0.175, -0.1),
      new THREE.Vector2(0.22, 0.14),
      new THREE.Vector2(0.23, 0.28),
      new THREE.Vector2(0.12, 0.33)
    ];
    const blazer = new THREE.Mesh(
      new THREE.LatheGeometry(blazerPts, 28),
      suitMat
    );
    blazer.scale.set(1.06, 1.0, 0.78);
    blazer.position.set(0, 1.0, 0);
    blazer.castShadow = true;
    interactableMeshes.push(blazer);
    bodyGroup.add(blazer);

    // White Dress Shirt V-Front + Silk Gold Necktie
    const shirtFront = new THREE.Mesh(
      new THREE.ConeGeometry(0.11, 0.32, 4),
      pureWhiteMat
    );
    shirtFront.rotation.z = Math.PI;
    shirtFront.scale.set(1, 1, 0.35);
    shirtFront.position.set(0, 1.16, 0.145);
    bodyGroup.add(shirtFront);

    const goldTie = new THREE.Mesh(
      new THREE.BoxGeometry(0.045, 0.26, 0.02),
      goldMat
    );
    goldTie.position.set(0, 1.12, 0.172);
    bodyGroup.add(goldTie);

    // Leather Belt + Gold Buckle
    const belt = new THREE.Mesh(
      new THREE.CylinderGeometry(0.192, 0.192, 0.048, 24),
      slacksMat
    );
    belt.scale.set(1.06, 1, 0.79);
    belt.position.set(0, 0.72, 0);
    const buckle = new THREE.Mesh(
      new THREE.BoxGeometry(0.065, 0.052, 0.025),
      goldMat
    );
    buckle.position.set(0, 0.72, 0.155);
    bodyGroup.add(belt, buckle);

    // Tailored Blazer Arms + Gold Wristwatch + Accounting Ledger in Hand
    leftArm.position.set(-0.27, 1.28, 0);
    rightArm.position.set(0.27, 1.28, 0);
    [leftArm, rightArm].forEach((armGrp, idx) => {
      const isRight = idx === 1;
      const shoulder = new THREE.Mesh(
        new THREE.SphereGeometry(0.078, 14, 12),
        suitMat
      );
      const upper = new THREE.Mesh(
        new THREE.CylinderGeometry(0.072, 0.062, 0.26, 14),
        suitMat
      );
      upper.position.y = -0.14;
      const lower = new THREE.Mesh(
        new THREE.CylinderGeometry(0.062, 0.052, 0.24, 14),
        suitMat
      );
      lower.position.set(0, -0.36, isRight ? 0.05 : 0.02);
      lower.rotation.x = isRight ? -0.4 : -0.15;

      const cuff = new THREE.Mesh(
        new THREE.CylinderGeometry(0.054, 0.054, 0.03, 14),
        pureWhiteMat
      );
      cuff.position.set(0, -0.47, isRight ? 0.09 : 0.035);

      const hand = createSculptedHand(skinMat, isRight);
      hand.position.set(0, -0.52, isRight ? 0.11 : 0.045);

      armGrp.add(shoulder, upper, lower, cuff, hand);
    });

    // Accounting Ledger & VAT Binder in Suneo's right hand
    const ledger = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.28, 0.045),
      goldMat
    );
    ledger.position.set(0.04, -0.46, 0.18);
    ledger.rotation.set(-0.35, -0.2, 0);
    rightArm.add(ledger);
    bodyGroup.add(leftArm, rightArm);

    // Sculpted Head + Suneo's Signature Swept-Forward 3D Pompadour Hair Locks
    headGroup.position.set(0, 1.56, 0);
    const contouredHead = createContouredAnimeHead(
      skinMat,
      blushMat,
      smileMouthMat,
      0.22
    );
    interactableMeshes.push(contouredHead);
    headGroup.add(contouredHead);

    // Subtle contoured Suneo upper-lip snout
    const snout = new THREE.Mesh(
      new THREE.SphereGeometry(0.068, 16, 14),
      skinMat
    );
    snout.scale.set(1.15, 0.58, 1.35);
    snout.position.set(0, -0.045, 0.2);
    headGroup.add(snout);

    // Sharp Anime Eyes + Confident Brows
    [-0.075, 0.075].forEach((xEye, idx) => {
      const eye = createSculptedAnimeEye(0x0f766e, 0.96, false);
      eye.position.set(xEye, 0.03, 0.2);
      eye.rotation.y = (idx === 0 ? -1 : 1) * 0.12;
      eyeGroups.push(eye);
      headGroup.add(eye);

      const brow = new THREE.Mesh(
        new THREE.BoxGeometry(0.068, 0.014, 0.015),
        jetHairMat
      );
      brow.position.set(xEye, 0.088, 0.205);
      brow.rotation.z = idx === 0 ? -0.18 : 0.18;
      headGroup.add(brow);
    });

    // Hair Crown tilted back + 5 Sculpted Swept-Forward Suneo Spikes above forehead
    const hairCrown = new THREE.Mesh(
      new THREE.SphereGeometry(0.228, 22, 18, 0, Math.PI * 2, 0, Math.PI * 0.44),
      jetHairMat
    );
    hairCrown.rotation.x = -0.38;
    hairCrown.position.set(0, 0.045, -0.025);
    headGroup.add(hairCrown);

    [-0.12, -0.06, 0, 0.06, 0.12].forEach((xSpike, sIdx) => {
      const spikeCurve = createHairStrand(
        [
          new THREE.Vector3(xSpike * 0.6, 0.18, 0.02),
          new THREE.Vector3(xSpike * 0.95, 0.25, 0.15),
          new THREE.Vector3(
            xSpike * 1.22,
            0.28 - Math.abs(sIdx - 2) * 0.022,
            0.29
          )
        ],
        0.042 - Math.abs(sIdx - 2) * 0.004,
        jetHairMat
      );
      headGroup.add(spikeCurve);
    });

    bodyGroup.add(headGroup);
  } else if (agent.characterKey === 'nobita') {
    // =========================================================================
    // 4. NOBITA — NHÂN VIÊN THIẾT KẾ ĐỒ HỌA & KỸ THUẬT CHẾ BẢN CMYK
    // Knitted Golden Sweater, White Polo Collar, Navy Shorts, Sneakers, Round Glasses & Wacom Tablet
    // =========================================================================
    const yellowKnitTex = createFabricTexture('#facc15', '#eab308', 'knit');
    const yellowSweaterMat = new THREE.MeshPhysicalMaterial({
      map: yellowKnitTex,
      color: 0xfde047,
      roughness: 0.48,
      metalness: 0.04,
      sheen: 0.55
    });

    const navyShortsMat = new THREE.MeshPhysicalMaterial({
      color: 0x1e3a8a,
      roughness: 0.55,
      metalness: 0.08
    });

    const cyanSneakerMat = new THREE.MeshPhysicalMaterial({
      color: 0x0ea5e9,
      roughness: 0.35,
      metalness: 0.12
    });

    const softBlackHairMat = new THREE.MeshPhysicalMaterial({
      color: 0x18181b,
      roughness: 0.38,
      metalness: 0.1,
      clearcoat: 0.35
    });

    // Tapered Legs + Navy Shorts + White Socks + Sculpted Sneakers
    leftLeg.position.set(-0.13, 0.66, 0);
    rightLeg.position.set(0.13, 0.66, 0);
    [leftLeg, rightLeg].forEach((legGrp) => {
      const shortsLeg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.095, 0.26, 16),
        navyShortsMat
      );
      shortsLeg.position.y = -0.13;

      const knee = new THREE.Mesh(
        new THREE.SphereGeometry(0.068, 14, 12),
        skinMat
      );
      knee.position.y = -0.27;

      const calf = new THREE.Mesh(
        new THREE.CylinderGeometry(0.068, 0.056, 0.22, 16),
        skinMat
      );
      calf.position.y = -0.38;

      const sock = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.058, 0.1, 14),
        pureWhiteMat
      );
      sock.position.y = -0.52;

      const sneaker = createSculptedShoe(
        cyanSneakerMat,
        pureWhiteMat,
        yellowSweaterMat,
        'sneaker'
      );
      sneaker.position.set(0, -0.65, 0);

      legGrp.add(shortsLeg, knee, calf, sock, sneaker);
    });
    bodyGroup.add(leftLeg, rightLeg);

    // Sculpted Contoured Sweater Torso (LatheGeometry) + Navy Hip Shorts Waistband
    const sweaterPts = [
      new THREE.Vector2(0.19, -0.32),
      new THREE.Vector2(0.185, -0.12),
      new THREE.Vector2(0.215, 0.12),
      new THREE.Vector2(0.22, 0.26),
      new THREE.Vector2(0.12, 0.32)
    ];
    const torso = new THREE.Mesh(
      new THREE.LatheGeometry(sweaterPts, 28),
      yellowSweaterMat
    );
    torso.scale.set(1.05, 1.0, 0.78);
    torso.position.set(0, 1.02, 0);
    torso.castShadow = true;
    interactableMeshes.push(torso);
    bodyGroup.add(torso);

    // Shorts Pelvis Band + Belt
    const pelvisShorts = new THREE.Mesh(
      new THREE.CylinderGeometry(0.195, 0.2, 0.14, 24),
      navyShortsMat
    );
    pelvisShorts.scale.set(1.05, 1, 0.78);
    pelvisShorts.position.set(0, 0.7, 0);
    bodyGroup.add(pelvisShorts);

    // Crisp White Polo Collar + CMYK Designer Badge on Chest
    const poloCollar = new THREE.Mesh(
      new THREE.TorusGeometry(0.135, 0.028, 12, 24),
      pureWhiteMat
    );
    poloCollar.rotation.x = Math.PI / 2 + 0.1;
    poloCollar.position.set(0, 1.34, 0.01);
    bodyGroup.add(poloCollar);

    // CMYK 4-Color Swatch Badge on Nobita's chest
    [0x06b6d4, 0xec4899, 0xfacc15, 0x18181b].forEach((cHex, cIdx) => {
      const swatch = new THREE.Mesh(
        new THREE.BoxGeometry(0.024, 0.038, 0.015),
        new THREE.MeshBasicMaterial({ color: cHex })
      );
      swatch.position.set(-0.08 + cIdx * 0.026, 1.18, 0.172);
      bodyGroup.add(swatch);
    });

    // Articulated Arms + White Cuffs + Sculpted Hands + Wacom Pen Display Tablet
    leftArm.position.set(-0.26, 1.28, 0);
    rightArm.position.set(0.26, 1.28, 0);
    [leftArm, rightArm].forEach((armGrp, idx) => {
      const isRight = idx === 1;
      const shoulder = new THREE.Mesh(
        new THREE.SphereGeometry(0.075, 14, 12),
        yellowSweaterMat
      );
      const upper = new THREE.Mesh(
        new THREE.CylinderGeometry(0.068, 0.058, 0.25, 14),
        yellowSweaterMat
      );
      upper.position.y = -0.14;
      const lower = new THREE.Mesh(
        new THREE.CylinderGeometry(0.058, 0.05, 0.24, 14),
        yellowSweaterMat
      );
      lower.position.set(0, -0.36, isRight ? 0.05 : 0.02);
      lower.rotation.x = isRight ? -0.42 : -0.18;

      const whiteCuff = new THREE.Mesh(
        new THREE.CylinderGeometry(0.052, 0.052, 0.032, 14),
        pureWhiteMat
      );
      whiteCuff.position.set(0, -0.47, isRight ? 0.095 : 0.04);

      const hand = createSculptedHand(skinMat, isRight);
      hand.position.set(0, -0.52, isRight ? 0.115 : 0.05);

      armGrp.add(shoulder, upper, lower, whiteCuff, hand);
    });

    // Wacom Graphic Design Tablet in Nobita's right hand
    const wacomTablet = new THREE.Group();
    wacomTablet.position.set(0.04, -0.46, 0.18);
    wacomTablet.rotation.set(-0.35, -0.2, 0);
    const tabletBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.18, 0.022),
      darkMetalMat
    );
    const tabletScreen = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.14, 0.025),
      new THREE.MeshBasicMaterial({ color: 0xa855f7 })
    );
    wacomTablet.add(tabletBody, tabletScreen);
    rightArm.add(wacomTablet);
    bodyGroup.add(leftArm, rightArm);

    // Sculpted Head + Expressive Anime Eyes + Iconic Oversized Round Glasses + Layered Hair
    headGroup.position.set(0, 1.58, 0);
    const contouredHead = createContouredAnimeHead(
      skinMat,
      blushMat,
      smileMouthMat,
      0.228
    );
    interactableMeshes.push(contouredHead);
    headGroup.add(contouredHead);

    // Sculpted Anime Eyes behind Nobita's Round Optical Glasses
    [-0.082, 0.082].forEach((xGlass, idx) => {
      const eye = createSculptedAnimeEye(0x1e293b, 0.95, false);
      eye.position.set(xGlass, 0.025, 0.205);
      eyeGroups.push(eye);
      headGroup.add(eye);

      // Glossy Optical Lens
      const lens = new THREE.Mesh(
        new THREE.CylinderGeometry(0.078, 0.078, 0.01, 24),
        new THREE.MeshPhysicalMaterial({
          color: 0xe0f2fe,
          transparent: true,
          opacity: 0.35,
          roughness: 0.08,
          clearcoat: 1.0
        })
      );
      lens.rotation.x = Math.PI / 2;
      lens.position.set(xGlass, 0.025, 0.238);

      // Thick Iconic Round Frame
      const rim = new THREE.Mesh(
        new THREE.TorusGeometry(0.078, 0.012, 12, 28),
        darkMetalMat
      );
      rim.position.set(xGlass, 0.025, 0.24);

      // Temple arm going back to ear
      const temple = new THREE.Mesh(
        new THREE.BoxGeometry(0.012, 0.012, 0.22),
        darkMetalMat
      );
      temple.position.set(
        xGlass + (idx === 0 ? -0.075 : 0.075),
        0.025,
        0.13
      );

      headGroup.add(lens, rim, temple);
    });

    // Bridge between glasses
    const bridge = new THREE.Mesh(
      new THREE.BoxGeometry(0.044, 0.014, 0.014),
      darkMetalMat
    );
    bridge.position.set(0, 0.025, 0.242);
    headGroup.add(bridge);

    // Sculpted Hair Dome tilted back + Layered Parted Bangs above glasses
    const hairDome = new THREE.Mesh(
      new THREE.SphereGeometry(0.238, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.44),
      softBlackHairMat
    );
    hairDome.rotation.x = -0.38;
    hairDome.position.set(0, 0.045, -0.025);
    headGroup.add(hairDome);

    [-0.13, -0.06, 0.02, 0.08, 0.14].forEach((xB) => {
      const lock = createHairStrand(
        [
          new THREE.Vector3(xB * 0.5, 0.23, 0.04),
          new THREE.Vector3(xB * 0.95, 0.19, 0.16),
          new THREE.Vector3(xB * 1.12, 0.13, 0.195)
        ],
        0.028,
        softBlackHairMat
      );
      headGroup.add(lock);
    });

    bodyGroup.add(headGroup);
  } else if (agent.characterKey === 'chaian') {
    // =========================================================================
    // 5. CHAIAN (CHAIEN) — PHỤ TRÁCH MARKETING & PHÁT TRIỂN THỊ TRƯỜNG
    // Heroic V-Taper Muscular Physique, Zigzag Orange Jersey, Wristbands & Megaphone
    // =========================================================================
    bodyGroup.scale.set(1.18, 1.07, 1.18);

    const jaianJerseyTex = createFabricTexture(
      '#f97316',
      '#c2410c',
      'zigzag_jaian'
    );
    const orangeJerseyMat = new THREE.MeshPhysicalMaterial({
      map: jaianJerseyTex,
      color: 0xfb923c,
      roughness: 0.42,
      metalness: 0.06,
      sheen: 0.45
    });

    const cargoPantsMat = new THREE.MeshPhysicalMaterial({
      color: 0x1e293b,
      roughness: 0.6,
      metalness: 0.08
    });

    const darkHairMat = new THREE.MeshPhysicalMaterial({
      color: 0x1c1917,
      roughness: 0.4,
      metalness: 0.12
    });

    // Strong Articulated Legs + Cargo Pockets + High-Top Boots
    leftLeg.position.set(-0.15, 0.68, 0);
    rightLeg.position.set(0.15, 0.68, 0);
    [leftLeg, rightLeg].forEach((legGrp) => {
      const thigh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.115, 0.098, 0.32, 16),
        cargoPantsMat
      );
      thigh.position.y = -0.16;
      const shin = new THREE.Mesh(
        new THREE.CylinderGeometry(0.095, 0.082, 0.3, 16),
        cargoPantsMat
      );
      shin.position.y = -0.45;
      const boot = createSculptedShoe(
        darkMetalMat,
        pureWhiteMat,
        orangeJerseyMat,
        'boot'
      );
      boot.position.set(0, -0.66, 0);
      legGrp.add(thigh, shin, boot);
    });
    bodyGroup.add(leftLeg, rightLeg);

    // Sculpted Muscular V-Taper Torso (LatheGeometry) with Zigzag Pattern
    const jaianTorsoPts = [
      new THREE.Vector2(0.23, -0.34),
      new THREE.Vector2(0.24, -0.12),
      new THREE.Vector2(0.29, 0.14),
      new THREE.Vector2(0.3, 0.28),
      new THREE.Vector2(0.15, 0.35)
    ];
    const torso = new THREE.Mesh(
      new THREE.LatheGeometry(jaianTorsoPts, 32),
      orangeJerseyMat
    );
    torso.scale.set(1.08, 1.0, 0.84);
    torso.position.set(0, 1.02, 0);
    torso.castShadow = true;
    interactableMeshes.push(torso);
    bodyGroup.add(torso);

    // 3D Sculpted Black Chevron Zigzag Band across Chest for extra relief depth
    const chevronBand = new THREE.Mesh(
      new THREE.CylinderGeometry(0.285, 0.275, 0.14, 28),
      darkHairMat
    );
    chevronBand.scale.set(1.09, 1, 0.85);
    chevronBand.position.set(0, 1.04, 0);
    bodyGroup.add(chevronBand);

    // Muscular Arms + Rolled Sleeves + Forearm Wristbands + Marketing Megaphone
    leftArm.position.set(-0.33, 1.3, 0);
    rightArm.position.set(0.33, 1.3, 0);
    [leftArm, rightArm].forEach((armGrp, idx) => {
      const isRight = idx === 1;
      const shoulder = new THREE.Mesh(
        new THREE.SphereGeometry(0.098, 16, 14),
        orangeJerseyMat
      );
      const sleeve = new THREE.Mesh(
        new THREE.CylinderGeometry(0.092, 0.084, 0.22, 16),
        orangeJerseyMat
      );
      sleeve.position.y = -0.11;

      const forearm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.068, 0.26, 16),
        skinMat
      );
      forearm.position.set(0, -0.34, isRight ? 0.05 : 0.02);
      forearm.rotation.x = isRight ? -0.45 : -0.18;

      const wristband = new THREE.Mesh(
        new THREE.CylinderGeometry(0.072, 0.072, 0.045, 16),
        darkHairMat
      );
      wristband.position.set(0, -0.45, isRight ? 0.09 : 0.035);

      const hand = createSculptedHand(skinMat, isRight);
      hand.position.set(0, -0.51, isRight ? 0.115 : 0.045);

      armGrp.add(shoulder, sleeve, forearm, wristband, hand);
    });

    // Marketing Megaphone / Bullhorn in Chaian's right hand
    const megaphone = new THREE.Group();
    megaphone.position.set(0.04, -0.48, 0.2);
    megaphone.rotation.set(Math.PI * 0.38, 0, 0);
    const cone = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.035, 0.22, 18),
      redAccentMat
    );
    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(0.11, 0.015, 10, 20),
      pureWhiteMat
    );
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.11;
    megaphone.add(cone, rim);
    rightArm.add(megaphone);
    bodyGroup.add(leftArm, rightArm);

    // Sculpted Broad Head + Expressive Eyes + Bold Eyebrows + Crew Cut & Front Tuft
    headGroup.position.set(0, 1.6, 0);
    const contouredHead = createContouredAnimeHead(
      skinMat,
      blushMat,
      smileMouthMat,
      0.25
    );
    contouredHead.scale.set(1.06, 0.98, 1.0);
    interactableMeshes.push(contouredHead);
    headGroup.add(contouredHead);

    [-0.088, 0.088].forEach((xEye, idx) => {
      const eye = createSculptedAnimeEye(0x1c1917, 1.02, false);
      eye.position.set(xEye, 0.03, 0.225);
      eyeGroups.push(eye);
      headGroup.add(eye);

      // Iconic Thick Bold Eyebrows
      const brow = new THREE.Mesh(
        new THREE.BoxGeometry(0.088, 0.024, 0.022),
        darkHairMat
      );
      brow.position.set(xEye, 0.095, 0.23);
      brow.rotation.z = idx === 0 ? -0.22 : 0.22;
      headGroup.add(brow);
    });

    const hairCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.256, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.42),
      darkHairMat
    );
    hairCap.scale.set(1.05, 1, 0.92);
    hairCap.rotation.x = -0.38;
    hairCap.position.set(0, 0.05, -0.025);
    headGroup.add(hairCap);

    // Jaian's front hair spikes above forehead
    [-0.07, 0, 0.07].forEach((xT) => {
      const tuft = createHairStrand(
        [
          new THREE.Vector3(xT, 0.24, 0.1),
          new THREE.Vector3(xT * 1.1, 0.19, 0.19),
          new THREE.Vector3(xT * 1.15, 0.14, 0.215)
        ],
        0.028,
        darkHairMat
      );
      headGroup.add(tuft);
    });

    bodyGroup.add(headGroup);
  } else if (agent.characterKey === 'dorami') {
    // =========================================================================
    // 6. DORAMI (ĐÔ-RÊ-MI) — TRƯỞNG PHÒNG NHÂN SỰ & QUẢN TRỊ LAO ĐỘNG
    // Yellow Cat-Robot, Iconic Red Bow Ears, Plaid Pocket & Daisy Tail
    // =========================================================================
    bodyGroup.scale.set(0.95, 0.95, 0.95);
    const doramiYellowTex = createFabricTexture('#facc15', '#eab308', 'glossy_dora');
    const doramiYellowMat = new THREE.MeshPhysicalMaterial({
      map: doramiYellowTex,
      color: 0xfacc15,
      roughness: 0.22,
      metalness: 0.08,
      clearcoat: 0.7,
      clearcoatRoughness: 0.15
    });

    leftLeg.position.set(-0.16, 0.42, 0);
    rightLeg.position.set(0.16, 0.42, 0);
    [leftLeg, rightLeg].forEach((legGrp) => {
      const hip = new THREE.Mesh(new THREE.SphereGeometry(0.115, 14, 12), doramiYellowMat);
      const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.105, 0.24, 16), doramiYellowMat);
      cyl.position.y = -0.12;
      const paw = new THREE.Mesh(new THREE.SphereGeometry(0.145, 18, 14), pureWhiteMat);
      paw.scale.set(1.05, 0.6, 1.35);
      paw.position.set(0, -0.28, 0.04);
      paw.castShadow = true;
      legGrp.add(hip, cyl, paw);
    });
    bodyGroup.add(leftLeg, rightLeg);

    const doramiTorsoPts = [
      new THREE.Vector2(0.01, -0.36),
      new THREE.Vector2(0.26, -0.32),
      new THREE.Vector2(0.33, -0.1),
      new THREE.Vector2(0.32, 0.18),
      new THREE.Vector2(0.14, 0.35)
    ];
    const torso = new THREE.Mesh(new THREE.LatheGeometry(doramiTorsoPts, 28), doramiYellowMat);
    torso.scale.set(1.05, 1.0, 0.92);
    torso.position.set(0, 0.9, 0);
    torso.castShadow = true;
    interactableMeshes.push(torso);
    bodyGroup.add(torso);

    const belly = new THREE.Mesh(new THREE.SphereGeometry(0.22, 18, 16), pureWhiteMat);
    belly.scale.set(0.92, 0.98, 0.36);
    belly.position.set(0, 0.88, 0.23);
    bodyGroup.add(belly);

    const plaidPocketMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
    const pocket = new THREE.Mesh(
      new THREE.CylinderGeometry(0.13, 0.13, 0.02, 20, 1, false, 0, Math.PI),
      plaidPocketMat
    );
    pocket.rotation.x = Math.PI / 2;
    pocket.rotation.z = Math.PI;
    pocket.position.set(0, 0.84, 0.31);
    bodyGroup.add(pocket);

    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.025, 12, 24), redAccentMat);
    collar.rotation.x = Math.PI / 2 + 0.05;
    collar.position.set(0, 1.25, 0.02);
    bodyGroup.add(collar);

    const bell = new THREE.Mesh(new THREE.SphereGeometry(0.045, 14, 12), goldMat);
    bell.position.set(0, 1.19, 0.185);
    bodyGroup.add(bell);

    tailGroup = new THREE.Group();
    tailGroup.position.set(0, 0.65, -0.32);
    const tailStem = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.08, 8), doramiYellowMat);
    tailStem.rotation.x = Math.PI / 3;
    const flowerCenter = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 10), goldMat);
    flowerCenter.position.set(0, 0.03, -0.05);
    tailGroup.add(tailStem, flowerCenter);
    bodyGroup.add(tailGroup);

    leftArm.position.set(-0.31, 1.15, 0);
    rightArm.position.set(0.31, 1.15, 0);
    [leftArm, rightArm].forEach((armGrp, idx) => {
      const isRight = idx === 1;
      const sh = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 10), doramiYellowMat);
      const armCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.065, 0.22, 14), doramiYellowMat);
      armCyl.position.y = -0.11;
      const paw = new THREE.Mesh(new THREE.SphereGeometry(0.082, 16, 12), pureWhiteMat);
      paw.position.set(0, -0.25, isRight ? 0.03 : 0);
      armGrp.add(sh, armCyl, paw);
    });
    bodyGroup.add(leftArm, rightArm);

    headGroup.position.set(0, 1.58, 0);
    const headSphere = new THREE.Mesh(new THREE.SphereGeometry(0.36, 26, 22), doramiYellowMat);
    headSphere.scale.set(1.06, 0.96, 0.95);
    headSphere.castShadow = true;
    headGroup.add(headSphere);

    const faceMask = new THREE.Mesh(new THREE.SphereGeometry(0.29, 24, 20), pureWhiteMat);
    faceMask.scale.set(1.0, 0.88, 0.52);
    faceMask.position.set(0, -0.06, 0.21);
    headGroup.add(faceMask);

    [-0.085, 0.085].forEach((xEye) => {
      const eye = createSculptedAnimeEye(0x0284c7, 1.1, true);
      eye.position.set(xEye, 0.03, 0.35);
      eyeGroups.push(eye);
      headGroup.add(eye);
    });

    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.032, 14, 12), redAccentMat);
    nose.position.set(0, -0.015, 0.385);
    headGroup.add(nose);

    const smile = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.006, 8, 18, Math.PI * 0.8), smileMouthMat);
    smile.rotation.z = Math.PI * 1.1;
    smile.position.set(0, -0.09, 0.37);
    headGroup.add(smile);

    const bowCenter = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.06, 12), redAccentMat);
    bowCenter.rotation.x = Math.PI / 2;
    bowCenter.position.set(0, 0.34, -0.04);
    headGroup.add(bowCenter);

    [-1, 1].forEach((side) => {
      const bowLoop = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.04, 10, 20, Math.PI * 1.4), redAccentMat);
      bowLoop.rotation.y = side * 0.25;
      bowLoop.rotation.z = side * 0.65;
      bowLoop.position.set(side * 0.15, 0.38, -0.04);
      headGroup.add(bowLoop);
    });

    bodyGroup.add(headGroup);
  } else if (agent.characterKey === 'minidora_red' || agent.characterKey === 'minidora_yellow') {
    // =========================================================================
    // MINI-DORA (RED / YELLOW) — TRỢ LÝ R&D VÀ KIỂM KÊ KHO TÍ HON
    // Petite Cat-Robot (0.72x), Rotating Bamboo-Copter, Whiskers & Gold Bell
    // =========================================================================
    bodyGroup.scale.setScalar(0.72);
    const isRed = agent.characterKey === 'minidora_red';
    const miniColor = isRed ? 0xef4444 : 0xfacc15;
    const miniMat = new THREE.MeshPhysicalMaterial({
      color: miniColor,
      roughness: 0.24,
      metalness: 0.08,
      clearcoat: 0.6
    });

    leftLeg.position.set(-0.14, 0.38, 0);
    rightLeg.position.set(0.14, 0.38, 0);
    [leftLeg, rightLeg].forEach((legGrp) => {
      const hip = new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 12), miniMat);
      const paw = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 12), pureWhiteMat);
      paw.scale.set(1.05, 0.6, 1.35);
      paw.position.set(0, -0.22, 0.04);
      legGrp.add(hip, paw);
    });
    bodyGroup.add(leftLeg, rightLeg);

    const torso = new THREE.Mesh(new THREE.SphereGeometry(0.28, 22, 18), miniMat);
    torso.position.set(0, 0.72, 0);
    interactableMeshes.push(torso);
    bodyGroup.add(torso);

    const belly = new THREE.Mesh(new THREE.SphereGeometry(0.19, 18, 14), pureWhiteMat);
    belly.scale.set(0.9, 0.9, 0.35);
    belly.position.set(0, 0.71, 0.18);
    bodyGroup.add(belly);

    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.02, 10, 20), isRed ? pureWhiteMat : redAccentMat);
    collar.rotation.x = Math.PI / 2;
    collar.position.set(0, 0.98, 0.02);
    bodyGroup.add(collar);

    const bell = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 10), goldMat);
    bell.position.set(0, 0.94, 0.16);
    bodyGroup.add(bell);

    leftArm.position.set(-0.25, 0.88, 0);
    rightArm.position.set(0.25, 0.88, 0);
    [leftArm, rightArm].forEach((armGrp) => {
      const armCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.18, 12), miniMat);
      armCyl.position.y = -0.09;
      const paw = new THREE.Mesh(new THREE.SphereGeometry(0.07, 14, 10), pureWhiteMat);
      paw.position.set(0, -0.2, 0);
      armGrp.add(armCyl, paw);
    });
    bodyGroup.add(leftArm, rightArm);

    headGroup.position.set(0, 1.28, 0);
    const headSphere = new THREE.Mesh(new THREE.SphereGeometry(0.3, 24, 20), miniMat);
    headSphere.scale.set(1.05, 0.95, 0.95);
    headGroup.add(headSphere);

    const faceMask = new THREE.Mesh(new THREE.SphereGeometry(0.24, 20, 16), pureWhiteMat);
    faceMask.scale.set(1.0, 0.88, 0.5);
    faceMask.position.set(0, -0.04, 0.17);
    headGroup.add(faceMask);

    [-0.07, 0.07].forEach((xEye) => {
      const eye = createSculptedAnimeEye(0x18181b, 0.9, false);
      eye.position.set(xEye, 0.03, 0.28);
      eyeGroups.push(eye);
      headGroup.add(eye);
    });

    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.028, 12, 10), redAccentMat);
    nose.position.set(0, -0.01, 0.31);
    headGroup.add(nose);

    propellerGroup = new THREE.Group();
    propellerGroup.position.set(0, 0.3, 0);
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.1, 8), goldMat);
    shaft.position.y = 0.05;
    const blades = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.01, 0.04), goldMat);
    blades.position.y = 0.1;
    propellerGroup.add(shaft, blades);
    headGroup.add(propellerGroup);

    bodyGroup.add(headGroup);
  } else if (agent.characterKey === 'dekisugi') {
    // =========================================================================
    // 7. DEKISUGI (ĐÊ-KHI) — TRƯỞNG PHÒNG KINH DOANH B2B & QUẢN TRỊ DỰ ÁN
    // Pastel Blue Shirt, Navy Tie, Tailored Slacks & Leather Portfolio
    // =========================================================================
    const shirtBlueMat = new THREE.MeshPhysicalMaterial({ color: 0x93c5fd, roughness: 0.38, sheen: 0.4 });
    const slacksMat = new THREE.MeshPhysicalMaterial({ color: 0x334155, roughness: 0.52 });
    const tieMat = new THREE.MeshPhysicalMaterial({ color: 0x1e3a8a, roughness: 0.28 });
    const darkHairMat = new THREE.MeshPhysicalMaterial({ color: 0x1e293b, roughness: 0.32, clearcoat: 0.5 });
    const briefcaseMat = new THREE.MeshPhysicalMaterial({ color: 0x78350f, roughness: 0.25, metalness: 0.2 });

    leftLeg.position.set(-0.11, 0.64, 0);
    rightLeg.position.set(0.11, 0.64, 0);
    [leftLeg, rightLeg].forEach((legGrp) => {
      const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.078, 0.32, 16), slacksMat);
      thigh.position.y = -0.16;
      const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.076, 0.068, 0.3, 16), slacksMat);
      shin.position.y = -0.45;
      const shoe = createSculptedShoe(darkMetalMat, pureWhiteMat, goldMat, 'oxford');
      shoe.position.set(0, -0.63, 0);
      legGrp.add(thigh, shin, shoe);
    });
    bodyGroup.add(leftLeg, rightLeg);

    const torsoPts = [
      new THREE.Vector2(0.16, -0.28),
      new THREE.Vector2(0.155, -0.08),
      new THREE.Vector2(0.19, 0.12),
      new THREE.Vector2(0.185, 0.26),
      new THREE.Vector2(0.1, 0.32)
    ];
    const torso = new THREE.Mesh(new THREE.LatheGeometry(torsoPts, 28), shirtBlueMat);
    torso.scale.set(1.04, 1.0, 0.8);
    torso.position.set(0, 1.0, 0);
    torso.castShadow = true;
    bodyGroup.add(torso);

    const pelvis = new THREE.Mesh(new THREE.CylinderGeometry(0.165, 0.17, 0.15, 20), slacksMat);
    pelvis.scale.set(1.04, 1, 0.8);
    pelvis.position.set(0, 0.68, 0);
    bodyGroup.add(pelvis);

    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.02, 8, 20), pureWhiteMat);
    collar.rotation.x = Math.PI / 2;
    collar.position.set(0, 1.3, 0.02);
    bodyGroup.add(collar);

    const tie = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.28, 0.015), tieMat);
    tie.position.set(0, 1.15, 0.17);
    bodyGroup.add(tie);

    leftArm.position.set(-0.25, 1.25, 0);
    rightArm.position.set(0.25, 1.25, 0);
    [leftArm, rightArm].forEach((armGrp, idx) => {
      const isRight = idx === 1;
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.055, 0.44, 14), shirtBlueMat);
      arm.position.y = -0.22;
      const hand = createSculptedHand(skinMat, isRight);
      hand.position.set(0, -0.48, 0);
      armGrp.add(arm, hand);
    });

    const briefcase = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.22, 0.28), briefcaseMat);
    briefcase.position.set(0.06, -0.46, 0.08);
    rightArm.add(briefcase);
    bodyGroup.add(leftArm, rightArm);

    headGroup.position.set(0, 1.56, 0);
    const head = createContouredAnimeHead(skinMat, blushMat, smileMouthMat, 0.22);
    headGroup.add(head);

    [-0.07, 0.07].forEach((xEye) => {
      const eye = createSculptedAnimeEye(0x1e3a8a, 0.95, false);
      eye.position.set(xEye, 0.025, 0.195);
      eyeGroups.push(eye);
      headGroup.add(eye);
    });

    const hairDome = new THREE.Mesh(
      new THREE.SphereGeometry(0.225, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.46),
      darkHairMat
    );
    hairDome.rotation.x = -0.35;
    hairDome.position.set(0, 0.035, -0.02);
    headGroup.add(hairDome);

    const partLock = createHairStrand(
      [
        new THREE.Vector3(-0.06, 0.2, 0.08),
        new THREE.Vector3(0.04, 0.16, 0.18),
        new THREE.Vector3(0.12, 0.11, 0.19)
      ],
      0.025,
      darkHairMat
    );
    headGroup.add(partLock);
    bodyGroup.add(headGroup);
  } else if (agent.characterKey === 'kaminari') {
    // =========================================================================
    // 8. BÁC KAMINARI (BÁC SẤM SÉT) — TRƯỞNG PHÒNG QUẢN LÝ KHO & MUA HÀNG
    // Japanese Samue Work Coat, Gray Mustache, Bald Crown & Warehouse Clipboard
    // =========================================================================
    const samueMat = new THREE.MeshPhysicalMaterial({ color: 0x475569, roughness: 0.6 });
    const sashMat = new THREE.MeshPhysicalMaterial({ color: 0x1e293b, roughness: 0.4 });
    const grayHairMat = new THREE.MeshPhysicalMaterial({ color: 0x94a3b8, roughness: 0.45 });
    const boardMat = new THREE.MeshPhysicalMaterial({ color: 0xb45309, roughness: 0.35 });

    leftLeg.position.set(-0.13, 0.62, 0);
    rightLeg.position.set(0.13, 0.62, 0);
    [leftLeg, rightLeg].forEach((legGrp) => {
      const legCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.085, 0.46, 16), samueMat);
      legCyl.position.y = -0.23;
      const foot = createSculptedShoe(darkMetalMat, pureWhiteMat, grayHairMat, 'boot');
      foot.position.set(0, -0.58, 0);
      legGrp.add(legCyl, foot);
    });
    bodyGroup.add(leftLeg, rightLeg);

    const torsoPts = [
      new THREE.Vector2(0.2, -0.32),
      new THREE.Vector2(0.21, -0.1),
      new THREE.Vector2(0.24, 0.12),
      new THREE.Vector2(0.23, 0.28),
      new THREE.Vector2(0.13, 0.34)
    ];
    const torso = new THREE.Mesh(new THREE.LatheGeometry(torsoPts, 28), samueMat);
    torso.scale.set(1.08, 1, 0.88);
    torso.position.set(0, 0.98, 0);
    torso.castShadow = true;
    bodyGroup.add(torso);

    const sash = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.12, 24), sashMat);
    sash.scale.set(1.09, 1, 0.89);
    sash.position.set(0, 0.88, 0);
    bodyGroup.add(sash);

    leftArm.position.set(-0.29, 1.25, 0);
    rightArm.position.set(0.29, 1.25, 0);
    [leftArm, rightArm].forEach((armGrp, idx) => {
      const isRight = idx === 1;
      const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.08, 0.38, 14), samueMat);
      sleeve.position.y = -0.19;
      const hand = createSculptedHand(skinMat, isRight);
      hand.position.set(0, -0.45, 0);
      armGrp.add(sleeve, hand);
    });

    const clipboard = new THREE.Group();
    clipboard.position.set(0.05, -0.42, 0.12);
    const board = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.24, 0.18), boardMat);
    const paper = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.21, 0.15), pureWhiteMat);
    paper.position.x = 0.012;
    clipboard.add(board, paper);
    rightArm.add(clipboard);
    bodyGroup.add(leftArm, rightArm);

    headGroup.position.set(0, 1.58, 0);
    const head = createContouredAnimeHead(skinMat, blushMat, smileMouthMat, 0.24);
    headGroup.add(head);

    [-0.075, 0.075].forEach((xEye) => {
      const eye = createSculptedAnimeEye(0x1c1917, 0.92, false);
      eye.position.set(xEye, 0.02, 0.21);
      eyeGroups.push(eye);
      headGroup.add(eye);
    });

    const mustache = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.035, 0.035), grayHairMat);
    mustache.position.set(0, -0.045, 0.23);
    headGroup.add(mustache);

    [-1, 1].forEach((side) => {
      const tuft = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 10), grayHairMat);
      tuft.scale.set(0.5, 1.2, 0.8);
      tuft.position.set(side * 0.22, 0.04, -0.02);
      headGroup.add(tuft);
    });
    bodyGroup.add(headGroup);
  } else if (agent.characterKey === 'sensei') {
    // =========================================================================
    // 9. THẦY GIÁO CHỦ NHIỆM (SENSEI) — TRƯỞNG PHÒNG HÀNH CHÍNH & AN TOÀN EHS
    // Charcoal Suit, Teacher Glasses, Red Directive Register Folder
    // =========================================================================
    const suitMat = new THREE.MeshPhysicalMaterial({ color: 0x475569, roughness: 0.42 });
    const redBookMat = new THREE.MeshPhysicalMaterial({ color: 0xb91c1c, roughness: 0.3 });

    leftLeg.position.set(-0.11, 0.64, 0);
    rightLeg.position.set(0.11, 0.64, 0);
    [leftLeg, rightLeg].forEach((legGrp) => {
      const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.48, 16), suitMat);
      cyl.position.y = -0.24;
      const shoe = createSculptedShoe(darkMetalMat, pureWhiteMat, goldMat, 'oxford');
      shoe.position.set(0, -0.62, 0);
      legGrp.add(cyl, shoe);
    });
    bodyGroup.add(leftLeg, rightLeg);

    const torsoPts = [
      new THREE.Vector2(0.17, -0.3),
      new THREE.Vector2(0.165, -0.1),
      new THREE.Vector2(0.2, 0.12),
      new THREE.Vector2(0.19, 0.28),
      new THREE.Vector2(0.11, 0.34)
    ];
    const torso = new THREE.Mesh(new THREE.LatheGeometry(torsoPts, 28), suitMat);
    torso.scale.set(1.05, 1, 0.82);
    torso.position.set(0, 1.0, 0);
    bodyGroup.add(torso);

    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.02, 8, 20), pureWhiteMat);
    collar.rotation.x = Math.PI / 2;
    collar.position.set(0, 1.3, 0.02);
    bodyGroup.add(collar);

    const tie = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.26, 0.015), redAccentMat);
    tie.position.set(0, 1.15, 0.17);
    bodyGroup.add(tie);

    leftArm.position.set(-0.27, 1.25, 0);
    rightArm.position.set(0.27, 1.25, 0);
    [leftArm, rightArm].forEach((armGrp, idx) => {
      const isRight = idx === 1;
      const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.42, 14), suitMat);
      sleeve.position.y = -0.21;
      const hand = createSculptedHand(skinMat, isRight);
      hand.position.set(0, -0.47, 0);
      armGrp.add(sleeve, hand);
    });

    const redBook = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.24, 0.18), redBookMat);
    redBook.position.set(0.05, -0.44, 0.08);
    rightArm.add(redBook);
    bodyGroup.add(leftArm, rightArm);

    headGroup.position.set(0, 1.58, 0);
    const head = createContouredAnimeHead(skinMat, blushMat, smileMouthMat, 0.23);
    headGroup.add(head);

    [-0.075, 0.075].forEach((xEye) => {
      const eye = createSculptedAnimeEye(0x18181b, 0.92, false);
      eye.position.set(xEye, 0.02, 0.2);
      eyeGroups.push(eye);
      headGroup.add(eye);
    });

    const glasses = new THREE.Mesh(new THREE.BoxGeometry(0.23, 0.055, 0.02), darkMetalMat);
    glasses.position.set(0, 0.02, 0.22);
    headGroup.add(glasses);

    const hairCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.235, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.44),
      darkMetalMat
    );
    hairCap.rotation.x = -0.35;
    hairCap.position.set(0, 0.04, -0.02);
    headGroup.add(hairCap);
    bodyGroup.add(headGroup);
  } else if (agent.characterKey === 'jaiko') {
    // =========================================================================
    // 10. JAIKO (CHAIKO) — CHUYÊN VIÊN SÁNG TẠO NỘI DUNG & PROFILE NHÀ MÁY
    // Iconic Red Beret, Knitted Red Sweater, Dark Skirt & Storyboard Sketchbook
    // =========================================================================
    const redSweaterMat = new THREE.MeshPhysicalMaterial({ color: 0xdc2626, roughness: 0.45, sheen: 0.5 });
    const skirtMat = new THREE.MeshPhysicalMaterial({ color: 0x0f766e, roughness: 0.5 });
    const darkHairMat = new THREE.MeshPhysicalMaterial({ color: 0x18181b, roughness: 0.35 });

    leftLeg.position.set(-0.11, 0.6, 0);
    rightLeg.position.set(0.11, 0.6, 0);
    [leftLeg, rightLeg].forEach((legGrp) => {
      const shoe = createSculptedShoe(redSweaterMat, pureWhiteMat, goldMat, 'mary_jane');
      shoe.position.set(0, -0.56, 0);
      legGrp.add(shoe);
    });
    bodyGroup.add(leftLeg, rightLeg);

    const skirt = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.26, 0.28, 20), skirtMat);
    skirt.position.set(0, 0.64, 0);
    bodyGroup.add(skirt);

    const torsoPts = [
      new THREE.Vector2(0.16, -0.22),
      new THREE.Vector2(0.18, 0.06),
      new THREE.Vector2(0.17, 0.24),
      new THREE.Vector2(0.1, 0.3)
    ];
    const torso = new THREE.Mesh(new THREE.LatheGeometry(torsoPts, 24), redSweaterMat);
    torso.position.set(0, 0.94, 0);
    bodyGroup.add(torso);

    leftArm.position.set(-0.26, 1.15, 0);
    rightArm.position.set(0.26, 1.15, 0);
    [leftArm, rightArm].forEach((armGrp, idx) => {
      const isRight = idx === 1;
      const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.058, 0.36, 14), redSweaterMat);
      sleeve.position.y = -0.18;
      const hand = createSculptedHand(skinMat, isRight);
      hand.position.set(0, -0.42, 0);
      armGrp.add(sleeve, hand);
    });

    const sketchbook = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.22, 0.16), pureWhiteMat);
    sketchbook.position.set(0.04, -0.4, 0.08);
    rightArm.add(sketchbook);
    bodyGroup.add(leftArm, rightArm);

    headGroup.position.set(0, 1.48, 0);
    const head = createContouredAnimeHead(skinMat, blushMat, smileMouthMat, 0.23);
    headGroup.add(head);

    [-0.075, 0.075].forEach((xEye) => {
      const eye = createSculptedAnimeEye(0x18181b, 0.95, true);
      eye.position.set(xEye, 0.02, 0.2);
      eyeGroups.push(eye);
      headGroup.add(eye);
    });

    const bob = new THREE.Mesh(new THREE.SphereGeometry(0.24, 20, 16), darkHairMat);
    bob.scale.set(1.04, 0.9, 0.92);
    bob.position.set(0, 0.02, -0.02);
    headGroup.add(bob);

    const beret = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.06, 20), redSweaterMat);
    beret.rotation.z = 0.2;
    beret.position.set(0.04, 0.22, 0);
    const beretStalk = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.03, 6), redSweaterMat);
    beretStalk.position.set(0.04, 0.26, 0);
    headGroup.add(beret, beretStalk);
    bodyGroup.add(headGroup);
  } else if (agent.characterKey === 'tamako') {
    // =========================================================================
    // 11. BÀ NOBI (TAMAKO NOBI - MẸ NOBITA) — KẾ TOÁN VIÊN KIỂM SOÁT CHI PHÍ
    // Round Glasses, Lavender Blouse, Apron & Cost Ledger
    // =========================================================================
    const blouseMat = new THREE.MeshPhysicalMaterial({ color: 0xf472b6, roughness: 0.4 });
    const apronMat = new THREE.MeshPhysicalMaterial({ color: 0x10b981, roughness: 0.5 });
    const darkHairMat = new THREE.MeshPhysicalMaterial({ color: 0x18181b, roughness: 0.35 });

    leftLeg.position.set(-0.1, 0.6, 0);
    rightLeg.position.set(0.1, 0.6, 0);
    [leftLeg, rightLeg].forEach((legGrp) => {
      const shoe = createSculptedShoe(darkMetalMat, pureWhiteMat, goldMat, 'mary_jane');
      shoe.position.set(0, -0.58, 0);
      legGrp.add(shoe);
    });
    bodyGroup.add(leftLeg, rightLeg);

    const apron = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.24, 0.3, 20), apronMat);
    apron.position.set(0, 0.62, 0);
    bodyGroup.add(apron);

    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.17, 0.32, 20), blouseMat);
    torso.position.set(0, 0.95, 0);
    bodyGroup.add(torso);

    leftArm.position.set(-0.24, 1.2, 0);
    rightArm.position.set(0.24, 1.2, 0);
    [leftArm, rightArm].forEach((armGrp, idx) => {
      const isRight = idx === 1;
      const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.4, 14), blouseMat);
      sleeve.position.y = -0.2;
      const hand = createSculptedHand(skinMat, isRight);
      hand.position.set(0, -0.45, 0);
      armGrp.add(sleeve, hand);
    });
    bodyGroup.add(leftArm, rightArm);

    headGroup.position.set(0, 1.54, 0);
    const head = createContouredAnimeHead(skinMat, blushMat, smileMouthMat, 0.22);
    headGroup.add(head);

    [-0.07, 0.07].forEach((xEye) => {
      const eye = createSculptedAnimeEye(0x18181b, 0.9, false);
      eye.position.set(xEye, 0.02, 0.195);
      eyeGroups.push(eye);
      headGroup.add(eye);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.038, 0.006, 8, 20), darkMetalMat);
      ring.position.set(xEye, 0.02, 0.215);
      headGroup.add(ring);
    });

    const bun = new THREE.Mesh(new THREE.SphereGeometry(0.09, 14, 12), darkHairMat);
    bun.position.set(0, -0.05, -0.22);
    headGroup.add(bun);
    bodyGroup.add(headGroup);
  } else if (agent.characterKey === 'nobisuke') {
    // =========================================================================
    // 12. ÔNG NOBI (NOBISUKE NOBI - BỐ NOBITA) — CHUYÊN VIÊN KINH DOANH ĐỐI NGOẠI
    // Classic Salaryman Navy Suit, Red Striped Tie & Business Briefcase
    // =========================================================================
    bodyGroup.scale.set(1.06, 1.0, 1.04);
    const navySuitMat = new THREE.MeshPhysicalMaterial({ color: 0x1e3a8a, roughness: 0.4 });
    const darkHairMat = new THREE.MeshPhysicalMaterial({ color: 0x18181b, roughness: 0.35 });

    leftLeg.position.set(-0.12, 0.64, 0);
    rightLeg.position.set(0.12, 0.64, 0);
    [leftLeg, rightLeg].forEach((legGrp) => {
      const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.075, 0.48, 16), navySuitMat);
      cyl.position.y = -0.24;
      const shoe = createSculptedShoe(darkMetalMat, pureWhiteMat, goldMat, 'oxford');
      shoe.position.set(0, -0.62, 0);
      legGrp.add(cyl, shoe);
    });
    bodyGroup.add(leftLeg, rightLeg);

    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.21, 0.38, 20), navySuitMat);
    torso.position.set(0, 0.98, 0);
    bodyGroup.add(torso);

    const tie = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.28, 0.015), redAccentMat);
    tie.position.set(0, 1.15, 0.18);
    bodyGroup.add(tie);

    leftArm.position.set(-0.28, 1.25, 0);
    rightArm.position.set(0.28, 1.25, 0);
    [leftArm, rightArm].forEach((armGrp, idx) => {
      const isRight = idx === 1;
      const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.065, 0.42, 14), navySuitMat);
      sleeve.position.y = -0.21;
      const hand = createSculptedHand(skinMat, isRight);
      hand.position.set(0, -0.47, 0);
      armGrp.add(sleeve, hand);
    });
    bodyGroup.add(leftArm, rightArm);

    headGroup.position.set(0, 1.56, 0);
    const head = createContouredAnimeHead(skinMat, blushMat, smileMouthMat, 0.23);
    headGroup.add(head);

    [-0.075, 0.075].forEach((xEye) => {
      const eye = createSculptedAnimeEye(0x18181b, 0.9, false);
      eye.position.set(xEye, 0.02, 0.2);
      eyeGroups.push(eye);
      headGroup.add(eye);
    });

    const hairCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.235, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.45),
      darkHairMat
    );
    hairCap.rotation.x = -0.35;
    hairCap.position.set(0, 0.04, -0.02);
    headGroup.add(hairCap);
    bodyGroup.add(headGroup);
  } else if (agent.characterKey === 'sewashi') {
    // =========================================================================
    // 13. SEWASHI (NÔ-BI-TÔ) — KỸ SƯ CÔNG NGHỆ 22ND CENTURY & TỰ ĐỘNG HÓA
    // Cyber Neon Visor, High-Tech Orange/White Zip Hoodie
    // =========================================================================
    const cyberOrangeMat = new THREE.MeshPhysicalMaterial({ color: 0xf97316, roughness: 0.35 });
    const cyanVisorMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });

    leftLeg.position.set(-0.1, 0.62, 0);
    rightLeg.position.set(0.1, 0.62, 0);
    [leftLeg, rightLeg].forEach((legGrp) => {
      const shoe = createSculptedShoe(darkMetalMat, cyanVisorMat, cyberOrangeMat, 'sneaker');
      shoe.position.set(0, -0.6, 0);
      legGrp.add(shoe);
    });
    bodyGroup.add(leftLeg, rightLeg);

    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.17, 0.36, 20), cyberOrangeMat);
    torso.position.set(0, 0.96, 0);
    bodyGroup.add(torso);

    leftArm.position.set(-0.25, 1.2, 0);
    rightArm.position.set(0.25, 1.2, 0);
    [leftArm, rightArm].forEach((armGrp, idx) => {
      const isRight = idx === 1;
      const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.055, 0.4, 14), pureWhiteMat);
      sleeve.position.y = -0.2;
      const hand = createSculptedHand(skinMat, isRight);
      hand.position.set(0, -0.45, 0);
      armGrp.add(sleeve, hand);
    });
    bodyGroup.add(leftArm, rightArm);

    headGroup.position.set(0, 1.54, 0);
    const head = createContouredAnimeHead(skinMat, blushMat, smileMouthMat, 0.22);
    headGroup.add(head);

    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.045, 0.06), cyanVisorMat);
    visor.position.set(0, 0.025, 0.2);
    headGroup.add(visor);
    bodyGroup.add(headGroup);
  } else if (agent.characterKey === 'sunetsugu') {
    // =========================================================================
    // 14. SUNETSUGU — CHUYÊN VIÊN PHÁP CHẾ HỢP ĐỒNG & CÔNG NỢ
    // Angular Suneo-Style Bangs, Prep Navy Blazer & Yellow Bowtie
    // =========================================================================
    const blazerMat = new THREE.MeshPhysicalMaterial({ color: 0x1e3a8a, roughness: 0.4 });
    const bowtieMat = new THREE.MeshPhysicalMaterial({ color: 0xfacc15, roughness: 0.3 });
    const darkHairMat = new THREE.MeshPhysicalMaterial({ color: 0x0f172a, roughness: 0.3 });

    leftLeg.position.set(-0.1, 0.62, 0);
    rightLeg.position.set(0.1, 0.62, 0);
    [leftLeg, rightLeg].forEach((legGrp) => {
      const shoe = createSculptedShoe(darkMetalMat, pureWhiteMat, goldMat, 'oxford');
      shoe.position.set(0, -0.6, 0);
      legGrp.add(shoe);
    });
    bodyGroup.add(leftLeg, rightLeg);

    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.16, 0.34, 20), blazerMat);
    torso.position.set(0, 0.96, 0);
    bodyGroup.add(torso);

    const bowtie = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 0.02), bowtieMat);
    bowtie.position.set(0, 1.18, 0.16);
    bodyGroup.add(bowtie);

    leftArm.position.set(-0.25, 1.2, 0);
    rightArm.position.set(0.25, 1.2, 0);
    [leftArm, rightArm].forEach((armGrp, idx) => {
      const isRight = idx === 1;
      const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.4, 14), blazerMat);
      sleeve.position.y = -0.2;
      const hand = createSculptedHand(skinMat, isRight);
      hand.position.set(0, -0.45, 0);
      armGrp.add(sleeve, hand);
    });
    bodyGroup.add(leftArm, rightArm);

    headGroup.position.set(0, 1.54, 0);
    const head = createContouredAnimeHead(skinMat, blushMat, smileMouthMat, 0.22);
    headGroup.add(head);

    [-0.065, 0.065].forEach((xEye) => {
      const eye = createSculptedAnimeEye(0x0f172a, 0.9, false);
      eye.position.set(xEye, 0.025, 0.19);
      eyeGroups.push(eye);
      headGroup.add(eye);
    });

    const spike = createHairStrand(
      [new THREE.Vector3(0, 0.22, 0.05), new THREE.Vector3(0.08, 0.18, 0.2), new THREE.Vector3(0.14, 0.12, 0.24)],
      0.03,
      darkHairMat
    );
    headGroup.add(spike);
    bodyGroup.add(headGroup);
  } else if (agent.characterKey === 'goda_mom') {
    // =========================================================================
    // 15. MẸ CHAIAN (BÀ CHỦ TIỆM TẠP HÓA GODA) — GIÁM SÁT HẬU CẦN 5S & BHLĐ
    // Robust Commanding Presence, Turquoise Shopkeeper Apron & Topknot Bun
    // =========================================================================
    bodyGroup.scale.set(1.16, 1.1, 1.14);
    const apronMat = new THREE.MeshPhysicalMaterial({ color: 0x0d9488, roughness: 0.5 });
    const darkHairMat = new THREE.MeshPhysicalMaterial({ color: 0x18181b, roughness: 0.4 });

    leftLeg.position.set(-0.13, 0.62, 0);
    rightLeg.position.set(0.13, 0.62, 0);
    [leftLeg, rightLeg].forEach((legGrp) => {
      const shoe = createSculptedShoe(darkMetalMat, pureWhiteMat, darkHairMat, 'boot');
      shoe.position.set(0, -0.6, 0);
      legGrp.add(shoe);
    });
    bodyGroup.add(leftLeg, rightLeg);

    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.38, 20), apronMat);
    torso.position.set(0, 0.98, 0);
    bodyGroup.add(torso);

    leftArm.position.set(-0.31, 1.25, 0);
    rightArm.position.set(0.31, 1.25, 0);
    [leftArm, rightArm].forEach((armGrp, idx) => {
      const isRight = idx === 1;
      const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.38, 14), apronMat);
      sleeve.position.y = -0.19;
      const hand = createSculptedHand(skinMat, isRight);
      hand.position.set(0, -0.44, 0);
      armGrp.add(sleeve, hand);
    });
    bodyGroup.add(leftArm, rightArm);

    headGroup.position.set(0, 1.58, 0);
    const head = createContouredAnimeHead(skinMat, blushMat, smileMouthMat, 0.24);
    headGroup.add(head);

    [-0.08, 0.08].forEach((xEye) => {
      const eye = createSculptedAnimeEye(0x18181b, 0.95, false);
      eye.position.set(xEye, 0.02, 0.21);
      eyeGroups.push(eye);
      headGroup.add(eye);
    });

    const topknot = new THREE.Mesh(new THREE.SphereGeometry(0.1, 14, 12), darkHairMat);
    topknot.position.set(0, 0.3, -0.04);
    headGroup.add(topknot);
    bodyGroup.add(headGroup);
  } else {
    bodyGroup.scale.setScalar(1.0);
    leftLeg.position.set(-0.12, 0.6, 0);
    rightLeg.position.set(0.12, 0.6, 0);
    bodyGroup.add(leftLeg, rightLeg);
    headGroup.position.set(0, 1.5, 0);
    const head = createContouredAnimeHead(skinMat, blushMat, smileMouthMat, 0.22);
    headGroup.add(head);
    bodyGroup.add(headGroup);
  }

  return {
    leftLeg,
    rightLeg,
    leftArm,
    rightArm,
    headGroup,
    tailGroup,
    propellerGroup,
    eyeGroups,
    interactableMeshes
  };
}

/**
 * Builds a lifelike, sculpted 3D human character for the 12 Agency Staff NPCs
 * (replaces primitive cylinders with LatheGeometry contoured blazer/blouse/skirt,
 * articulated limbs, sculpted hands, shoes, facial features, hair strands, and props).
 */
export function buildDetailedAgencyStaffCharacter(
  config: {
    id: string;
    suitColor: number;
    pantsColor: number;
    hairColor: number;
    isFemale: boolean;
    mode: 'seated_work' | 'seated_cafe' | 'seated_game' | 'walker';
    staffIndex?: number;
    characterKey?: DoraemonCharacterKey;
  },
  bodyGroup: THREE.Group
): {
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  head: THREE.Group;
} {
  const isSeated = config.mode !== 'walker';
  const idx = config.staffIndex ?? 0;

  if (config.characterKey) {
    const fakeAgent: any = {
      id: config.id,
      characterKey: config.characterKey,
      name: config.id,
      roleTitle: '',
      departmentId: 'sales_quoting',
      departmentLabel: '',
      zoneId: 'lobby',
      accentHex: '#f59e0b',
      suitColorHex: config.suitColor,
      hairColorHex: config.hairColor,
      accessoryType: 'clipboard',
      primaryMission: '',
      strictBoundary: '',
      personalityTraits: [],
      spatialBehavior: '',
      allowedKeywords: [],
      homePosition: { x: 0, y: 0, z: 0 },
      workstationLookAt: { x: 0, y: 0, z: 1 },
      collaborationPoint: { x: 0, y: 0, z: 0 },
      sampleTasks: []
    };
    const parts = buildDetailedDoraemonCharacter(fakeAgent, bodyGroup);
    if (isSeated) {
      parts.leftLeg.rotation.x = -Math.PI / 2;
      parts.rightLeg.rotation.x = -Math.PI / 2;
      parts.leftLeg.position.z = 0.12;
      parts.rightLeg.position.z = 0.12;
      bodyGroup.position.y = -0.16;
    }
    return {
      leftLeg: parts.leftLeg as THREE.Group,
      rightLeg: parts.rightLeg as THREE.Group,
      leftArm: parts.leftArm as THREE.Group,
      rightArm: parts.rightArm as THREE.Group,
      head: parts.headGroup
    };
  }

  const skinMat = new THREE.MeshPhysicalMaterial({
    color: 0xffdfc4,
    roughness: 0.46,
    metalness: 0.02,
    sheen: 0.25,
    sheenColor: new THREE.Color(0xffb4a2)
  });

  const blushMat = new THREE.MeshBasicMaterial({
    color: 0xfb7185,
    transparent: true,
    opacity: 0.36
  });

  const mouthMat = new THREE.MeshStandardMaterial({
    color: 0xe11d48,
    roughness: 0.35
  });

  const topMat = new THREE.MeshPhysicalMaterial({
    color: config.suitColor,
    roughness: 0.4,
    metalness: 0.08,
    sheen: 0.45
  });

  const bottomMat = new THREE.MeshPhysicalMaterial({
    color: config.pantsColor,
    roughness: 0.52,
    metalness: 0.08
  });

  const hairMat = new THREE.MeshPhysicalMaterial({
    color: config.hairColor,
    roughness: 0.34,
    metalness: 0.12,
    clearcoat: 0.45
  });

  const whiteShirtMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.32,
    clearcoat: 0.2
  });

  const darkShoeMat = new THREE.MeshPhysicalMaterial({
    color: 0x1e293b,
    roughness: 0.28,
    metalness: 0.4
  });

  const accentBadgeMat = new THREE.MeshPhysicalMaterial({
    color: 0xf59e0b,
    roughness: 0.25,
    metalness: 0.7
  });

  // 1. Articulated Legs + Knee Joints + Sculpted Shoes
  const leftLeg = new THREE.Group();
  const rightLeg = new THREE.Group();
  leftLeg.position.set(-0.105, 0.62, 0);
  rightLeg.position.set(0.105, 0.62, 0);

  [leftLeg, rightLeg].forEach((legGrp) => {
    const thigh = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.064, 0.2, 8, 14),
      bottomMat
    );
    const knee = new THREE.Mesh(
      new THREE.SphereGeometry(0.058, 12, 10),
      config.isFemale ? skinMat : bottomMat
    );
    const calf = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.052, 0.2, 8, 14),
      config.isFemale ? skinMat : bottomMat
    );
    const shoe = createSculptedShoe(
      config.isFemale ? topMat : darkShoeMat,
      whiteShirtMat,
      accentBadgeMat,
      config.isFemale ? 'mary_jane' : 'oxford'
    );
    shoe.scale.setScalar(0.84);

    if (isSeated) {
      thigh.rotation.x = -Math.PI / 2;
      thigh.position.set(0, -0.04, 0.14);
      knee.position.set(0, -0.04, 0.26);
      calf.position.set(0, -0.19, 0.27);
      shoe.position.set(0, -0.35, 0.29);
    } else {
      thigh.position.y = -0.14;
      knee.position.y = -0.28;
      calf.position.y = -0.43;
      shoe.position.set(0, -0.61, 0);
    }

    legGrp.add(thigh, knee, calf, shoe);
  });
  bodyGroup.add(leftLeg, rightLeg);

  // 2. Sculpted Contoured Torso (LatheGeometry) + Shirt Collar + Lanyard ID Badge
  const torsoY = isSeated ? 0.78 : 0.92;
  if (config.isFemale) {
    // Contoured A-line skirt + feminine fitted blazer/blouse
    const skirt = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.23, 0.28, 20),
      bottomMat
    );
    skirt.position.set(0, isSeated ? 0.6 : 0.68, isSeated ? 0.06 : 0);
    bodyGroup.add(skirt);
  } else {
    const pelvis = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.165, 0.14, 18),
      bottomMat
    );
    pelvis.scale.set(1.04, 1, 0.78);
    pelvis.position.set(0, isSeated ? 0.56 : 0.64, 0);
    bodyGroup.add(pelvis);
  }

  const torsoPts = config.isFemale
    ? [
        new THREE.Vector2(0.14, -0.22),
        new THREE.Vector2(0.13, -0.06),
        new THREE.Vector2(0.175, 0.08),
        new THREE.Vector2(0.165, 0.2),
        new THREE.Vector2(0.09, 0.24)
      ]
    : [
        new THREE.Vector2(0.16, -0.24),
        new THREE.Vector2(0.155, -0.08),
        new THREE.Vector2(0.195, 0.1),
        new THREE.Vector2(0.2, 0.22),
        new THREE.Vector2(0.1, 0.26)
      ];
  const torsoMesh = new THREE.Mesh(
    new THREE.LatheGeometry(torsoPts, 22),
    topMat
  );
  torsoMesh.scale.set(1.05, 1.0, 0.78);
  torsoMesh.position.set(0, torsoY, 0);
  torsoMesh.castShadow = true;
  bodyGroup.add(torsoMesh);

  // Inner White Dress Shirt V-Neck + Collar + PrintAd ID Card Lanyard
  const vNeck = new THREE.Mesh(
    new THREE.ConeGeometry(0.085, 0.22, 4),
    whiteShirtMat
  );
  vNeck.rotation.z = Math.PI;
  vNeck.scale.set(1, 1, 0.35);
  vNeck.position.set(0, torsoY + 0.12, 0.125);
  bodyGroup.add(vNeck);

  const idCard = new THREE.Mesh(
    new THREE.BoxGeometry(0.048, 0.065, 0.012),
    accentBadgeMat
  );
  idCard.position.set(0.055, torsoY + 0.04, 0.142);
  bodyGroup.add(idCard);

  // 3. Articulated Shoulders, Upper Arms, Forearms & Sculpted Hands + Activity Props
  const shoulderY = isSeated ? 0.98 : 1.12;
  const leftArm = new THREE.Group();
  const rightArm = new THREE.Group();
  leftArm.position.set(config.isFemale ? -0.2 : -0.22, shoulderY, 0);
  rightArm.position.set(config.isFemale ? 0.2 : 0.22, shoulderY, 0);

  [leftArm, rightArm].forEach((armGrp, aIdx) => {
    const isRight = aIdx === 1;
    const shoulder = new THREE.Mesh(
      new THREE.SphereGeometry(0.062, 12, 10),
      topMat
    );
    const upper = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.048, 0.18, 8, 12),
      topMat
    );
    upper.position.y = -0.11;

    const forearm = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.04, 0.17, 8, 12),
      config.isFemale ? skinMat : topMat
    );
    if (isSeated) {
      forearm.position.set(0, -0.25, 0.09);
      forearm.rotation.x = -0.68;
    } else {
      forearm.position.set(0, -0.28, 0.04);
      forearm.rotation.x = -0.25;
    }

    const hand = createSculptedHand(skinMat, isRight);
    hand.scale.setScalar(0.82);
    hand.position.set(0, isSeated ? -0.32 : -0.39, isSeated ? 0.17 : 0.08);

    armGrp.add(shoulder, upper, forearm, hand);
  });

  // Add realistic role props in hand based on activity
  if (config.mode === 'seated_cafe') {
    const cup = new THREE.Mesh(
      new THREE.CylinderGeometry(0.038, 0.03, 0.075, 12),
      whiteShirtMat
    );
    cup.position.set(0, -0.3, 0.21);
    rightArm.add(cup);
  } else if (config.mode === 'seated_game') {
    const gamepad = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.045, 0.065),
      darkShoeMat
    );
    gamepad.position.set(-0.04, -0.3, 0.2);
    rightArm.add(gamepad);
  }
  bodyGroup.add(leftArm, rightArm);

  // 4. Sculpted Neck + Contoured Human Head + Eyes + Varied 3D Hairstyles
  const head = new THREE.Group();
  head.position.set(0, isSeated ? 1.2 : 1.34, 0);

  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.052, 0.058, 0.1, 12),
    skinMat
  );
  neck.position.y = -0.16;
  head.add(neck);

  const contouredFace = createContouredAnimeHead(
    skinMat,
    blushMat,
    mouthMat,
    0.165
  );
  head.add(contouredFace);

  [-0.056, 0.056].forEach((xEye, eIdx) => {
    const eye = createSculptedAnimeEye(0x1e293b, 0.72, config.isFemale);
    eye.position.set(xEye, 0.018, 0.148);
    eye.rotation.y = (eIdx === 0 ? -1 : 1) * 0.12;
    head.add(eye);

    const brow = new THREE.Mesh(
      new THREE.BoxGeometry(0.048, 0.01, 0.01),
      hairMat
    );
    brow.position.set(xEye, 0.062, 0.152);
    head.add(brow);
  });

  // Hair Crown + Sculpted Front Bangs + Distinct Male/Female Hairstyles
  const hairCrown = new THREE.Mesh(
    new THREE.SphereGeometry(0.174, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.46),
    hairMat
  );
  hairCrown.rotation.x = -0.36;
  hairCrown.position.set(0, 0.032, -0.018);
  head.add(hairCrown);

  // Parted front bangs
  [-0.09, -0.03, 0.03, 0.09].forEach((xB) => {
    const bang = createHairStrand(
      [
        new THREE.Vector3(xB * 0.5, 0.17, 0.03),
        new THREE.Vector3(xB * 0.95, 0.13, 0.12),
        new THREE.Vector3(xB * 1.1, 0.085, 0.148)
      ],
      0.022,
      hairMat
    );
    head.add(bang);
  });

  if (config.isFemale) {
    if (idx % 2 === 0) {
      // Stylish High Ponytail
      const ponytail = createHairStrand(
        [
          new THREE.Vector3(0, 0.08, -0.15),
          new THREE.Vector3(0, 0.02, -0.24),
          new THREE.Vector3(0, -0.14, -0.26),
          new THREE.Vector3(0, -0.26, -0.22)
        ],
        0.046,
        hairMat
      );
      head.add(ponytail);
    } else {
      // Wavy Shoulder-Length Bob Locks
      [-1, 1].forEach((side) => {
        const bobLock = createHairStrand(
          [
            new THREE.Vector3(side * 0.15, 0.04, -0.02),
            new THREE.Vector3(side * 0.18, -0.08, 0.02),
            new THREE.Vector3(side * 0.16, -0.2, 0.05)
          ],
          0.042,
          hairMat
        );
        head.add(bobLock);
      });
    }
  } else if (idx % 3 === 0) {
    // Stylish Optical Glasses for Tech / Copywriter / Content Staff
    [-0.058, 0.058].forEach((xG) => {
      const rim = new THREE.Mesh(
        new THREE.TorusGeometry(0.048, 0.007, 8, 20),
        darkShoeMat
      );
      rim.position.set(xG, 0.018, 0.168);
      head.add(rim);
    });
  }

  bodyGroup.add(head);

  return {
    leftLeg,
    rightLeg,
    leftArm,
    rightArm,
    head
  };
}

