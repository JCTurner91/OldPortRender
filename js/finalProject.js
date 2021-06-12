/***********************************************************************************

    Welcome to the Old Port
    Author: Joshua C. Turner
    Decemeber 15, 2019

    This is three dimensional (partial) rendition of a scene from the corner of Wharf and
    Moulton St (with some artist liberties taken).

    Program is written using the current threejs library, more infomation can be found at:
    threejs.org

    One or more textures bundled with this project have been created with images from
    Textures.com. These images may not be redistributed by default. Please visit
    www.textures.com for more information.

***********************************************************************************/

const scene = new THREE.Scene();
const textureLoader = new THREE.TextureLoader();
const clock = new THREE.Clock();
let aspect = window.innerWidth/window.innerHeight;
let panning = false;
let prevMouse = new THREE.Vector2(0, 0);
let delta = 0;
let xMovement = { active: false, direction: 0 };
let zMovement = { active: false, direction: 0 };
const oldPort = new THREE.Object3D();
const snow = [];
let cubeMap = null;

const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 50);
camera.position.set(5, 0.75, 1);
camera.lookAt(0, 0, -5);
scene.add(camera);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

scene.fog = new THREE.Fog(0x000000, 7, 10);

// Snow
function letItSnow() {
    let spriteMap = textureLoader.load("textures/snowflake.png");
    let spriteMaterial = new THREE.SpriteMaterial({
        map: spriteMap,
        color: 0xffffff
    });
    for (let i = 0; i < 1000; i++) {
        let snowflake = {
            mesh: new THREE.Sprite(spriteMaterial),
            velocity: new THREE.Vector3(Math.random() - 0.5, Math.random(),  Math.random() - 0.5)
        };
        snowflake.mesh.scale.x = snowflake.mesh.scale.y = 0.025;
        snowflake.mesh.position.set(Math.random() * 15 - 7.5, Math.random() * 5, Math.random() * 7 - 3.5);
        snowflake.mesh.fog = true;
        scene.add(snowflake.mesh);
        snow.push(snowflake);
    }
}
// Light pollution
scene.add(new THREE.AmbientLight(0x00028f, 0.25));
//scene.add(new THREE.HemisphereLight(0xc2c2c2, 0xe0de84, 0.25))

// Street
function buildCobbleStone() {
    let planeGeometry = new THREE.PlaneBufferGeometry(3.5, 15, 1024, 1024);
    //let planeGeometry = new THREE.PlaneBufferGeometry(3.5, 15);
    let cobblestoneTexture = textureLoader.load("textures/cobblestoneTexture.jpg");
    cobblestoneTexture.wrapS = cobblestoneTexture.wrapT = THREE.RepeatWrapping;
    cobblestoneTexture.repeat.set(1.5, 10);0
    let cobblestoneNormal = textureLoader.load("textures/cobblestoneNormal.jpg");
    cobblestoneNormal.wrapS = cobblestoneNormal.wrapT = THREE.RepeatWrapping;
    cobblestoneNormal.repeat.set(1.5, 10);
    let cobblestoneHeight = textureLoader.load("textures/cobblestoneHeight.jpg");
    cobblestoneHeight.wrapS = cobblestoneHeight.wrapT = THREE.RepeatWrapping;
    cobblestoneHeight.repeat.set(1.5, 10);
    let cobblestoneRoughness = textureLoader.load("textures/cobblestoneRoughness.jpg");
    cobblestoneRoughness.wrapS = cobblestoneRoughness.wrapT = THREE.RepeatWrapping;
    cobblestoneRoughness.repeat.set(1.5, 10);
    var planeMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        side: THREE.FrontSide,
        map: cobblestoneTexture,
        displacementMap: cobblestoneHeight,
        displacementScale: 0.2,
        normalMap: cobblestoneNormal,
        normalScale: new THREE.Vector2(2, 2),
        roughnessMap: cobblestoneRoughness,
        roughness: 0.75
    });
    const street = new THREE.Mesh(planeGeometry, planeMaterial);
    street.rotateX(-Math.PI/2);
    street.receiveShadow = true;
    street.position.y -= 0.075;
    oldPort.add(street);

    planeGeometry.dispose();
    planeMaterial.dispose();
    cobblestoneNormal.dispose();
    cobblestoneHeight.dispose();
    cobblestoneTexture.dispose();
    cobblestoneRoughness.dispose();
}

// granite slabs
function buildSidewalk() {
    let boxGeometry = new THREE.BoxBufferGeometry(1.25, .125, .125);
    let graniteTexture = textureLoader.load("textures/graniteTexture.jpg");
    graniteTexture.wrapS = graniteTexture.wrapT = THREE.RepeatWrapping;
    graniteTexture.repeat.set(3, 1);
    let graniteNormal = textureLoader.load("textures/graniteNormal.jpg");
    graniteNormal.wrapS = graniteNormal.wrapT = THREE.RepeatWrapping;
    graniteNormal.repeat.set(3, 1);
    let graniteRoughness = textureLoader.load("textures/graniteRoughness.jpg");
    graniteRoughness.wrapS = graniteRoughness.wrapT = THREE.RepeatWrapping;
    graniteRoughness.repeat.set(3, 1);
    let boxMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        side: THREE.FrontSide,
        shadowSide: THREE.DoubleSide,
        map: graniteTexture,
        normalMap: graniteNormal,
        normalScale: new THREE.Vector2(5, 5),
        roughnessMap: graniteRoughness,
        roughness : 0.75
    });
    const graniteSlab = new THREE.Mesh(boxGeometry, boxMaterial);
    graniteSlab.castShadow = graniteSlab.receiveShadow = true;
    const sidewalk = new THREE.Object3D();
    sidewalk.add(graniteSlab);
    for (let i = 1; i < 6; i++)
    {
        let slab = graniteSlab.clone();
        let rand = Math.random();
        slab.position.set(-i*1.25, -Math.random()/200, 0);
        slab.rotateX(Math.PI*rand/20);
        slab.rotateZ(rand < 0.5 ? Math.PI*rand/100 : -Math.PI*rand/200);
        sidewalk.add(slab);

        let slab2 = graniteSlab.clone();
        slab2.position.set(i*1.25, -Math.random()/200, 0);
        slab2.rotateX(Math.PI*rand/20);
        slab2.rotateZ(rand < 0.5 ? Math.PI*rand/100 : -Math.PI*rand/200);
        sidewalk.add(slab2);
    }
    buildBrickPavement(sidewalk);

    boxGeometry.dispose();
    boxMaterial.dispose();
    graniteNormal.dispose();
    graniteTexture.dispose();
    graniteRoughness.dispose();
}

// brick sidewalk
function buildBrickPavement(sidewalk) {
    let planeGeometry = new THREE.PlaneBufferGeometry(2, 15, 1024, 1024);
    //let planeGeometry = new THREE.PlaneBufferGeometry(2, 15);
    let brickPavementTexture = textureLoader.load("textures/brickPavementTexture.jpg");
    brickPavementTexture.wrapS = brickPavementTexture.wrapT = THREE.RepeatWrapping;
    brickPavementTexture.repeat.set(2, 12);
    let brickPavementNormal = textureLoader.load("textures/brickPavementNormal.jpg");
    brickPavementNormal.wrapS = brickPavementNormal.wrapT = THREE.RepeatWrapping;
    brickPavementNormal.repeat.set(2, 12);
    let brickPavementRoughness = textureLoader.load("textures/brickPavementRoughness.jpg");
    brickPavementRoughness.wrapS = brickPavementRoughness.wrapT = THREE.RepeatWrapping;
    brickPavementRoughness.repeat.set(2, 12);
    let brickPavementHeight = textureLoader.load("textures/brickPavementHeight.jpg");
    brickPavementHeight.wrapS = brickPavementHeight.wrapT = THREE.RepeatWrapping;
    brickPavementHeight.repeat.set(2, 12);
    let planeMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        side: THREE.FrontSide,
        map: brickPavementTexture,
        normalMap: brickPavementNormal,
        normalScale: new THREE.Vector2(5, 5),
        displacementMap: brickPavementHeight,
        displacementScale: 0.2,
        roughnessMap: brickPavementRoughness,
        roughness: 0.75

    });
    const brickPavement = new THREE.Mesh(planeGeometry, planeMaterial);
    brickPavement.receiveShadow = true;
    brickPavement.rotateY(Math.PI/2);
    brickPavement.rotateX(-Math.PI/2);
    brickPavement.position.set(0, -0.075, -1.0625);
    //brickPavement.position.set(0, 0.025, -1.0625);
    sidewalk.add(brickPavement);

    oldPort.add(sidewalk);
    sidewalk.rotateY(-Math.PI/2);
    sidewalk.position.set(1.8125, 0, 0);

    planeGeometry.dispose();
    planeMaterial.dispose();
    brickPavementNormal.dispose();
    brickPavementHeight.dispose();
    brickPavementTexture.dispose();
    brickPavementRoughness.dispose();
}

// Beals building
const beals = new THREE.Object3D();
beals.castShadow = beals.receiveShadow = true;

// granite stones
function buildStones() {
    let boxGeometry = new THREE.BoxBufferGeometry(0.4, 1.5, 0.4);
    let stoneTexture = textureLoader.load("textures/graniteTexture.jpg");
    stoneTexture.wrapS = stoneTexture.wrapT = THREE.RepeatWrapping;
    stoneTexture.repeat.set(1, 3);
    let stoneNormal = textureLoader.load("textures/graniteNormal.jpg");
    stoneNormal.wrapS = stoneNormal.wrapT = THREE.RepeatWrapping;
    stoneNormal.repeat.set(1, 3);
    let stoneRoughness = textureLoader.load("textures/graniteRoughness.jpg");
    stoneRoughness.wrapS = stoneRoughness.wrapT = THREE.RepeatWrapping;
    stoneRoughness.repeat.set(1, 3);
    let boxMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        side: THREE.FrontSide,
        map: stoneTexture,
        normalMap: stoneNormal,
        normalScale: new THREE.Vector2(10, 10),
        roughnessMap: stoneRoughness,
        roughness: 1,
        shadowSide: THREE.DoubleSide
    });
    let graniteStone = new THREE.Mesh(boxGeometry, boxMaterial);
    graniteStone.castShadow = graniteStone.receiveShadow = true;
    for (let i = 0; i < 8; i++) {
        graniteStone = graniteStone.clone();
        graniteStone.position.set(-0.75, -1.25, (i * -1.25) + 3.05);
        beals.add(graniteStone);
    }

    boxGeometry = new THREE.BoxBufferGeometry(0.4, 1.25, 0.3);
    graniteStone = new THREE.Mesh(boxGeometry, boxMaterial);
    graniteStone.castShadow = graniteStone.receiveShadow = true;
    graniteStone.rotateX(Math.PI/2);
    for (let i = 0; i < 7; i++)
    {
        graniteStone = graniteStone.clone();
        graniteStone.position.set(-0.8, -0.35, (i * -1.26) + 2.425);
        beals.add(graniteStone);
    }
    

    boxGeometry = new THREE.BoxBufferGeometry(0.4, 0.83, 0.1);
    graniteStone = new THREE.Mesh(boxGeometry, boxMaterial);
    graniteStone.castShadow = graniteStone.receiveShadow = true;
    graniteStone.rotateX(Math.PI/2);
    for (let i = 0; i < 7; i++)
    {
        graniteStone = graniteStone.clone();
        graniteStone.position.set(-0.75, -1.45, (i * -1.25) + 2.425);
        if (i != 2 && i != 4 && i != 5) {
            beals.add(graniteStone);
        }
    }
    boxGeometry = new THREE.BoxBufferGeometry(0.4, 0.3, 0.25);
    let endStone = new THREE.Mesh(boxGeometry, boxMaterial);
    endStone.castShadow = endStone.receiveShadow = true;
    endStone.position.set(-0.8, -0.35, 3.185);
    beals.add(endStone);
    endStone = endStone.clone();
    endStone.scale.z = 0.7
    endStone.position.set(-0.8, -0.35, -5.855);
    beals.add(endStone);

    boxGeometry.dispose();
    boxMaterial.dispose();
    stoneNormal.dispose();
    stoneTexture.dispose();
    stoneRoughness.dispose();
}

// xmas lights
function addXmasLights() {
    let bulbGeometry = new THREE.SphereBufferGeometry(0.01);
    for (let i = 0; i < 31; i++) {
        let color = (i % 6 == 0) ? 0xff0000 : (i % 5 == 0) ? 0x00ff00 : (i % 4 == 0) ? 0x0000ff : (i % 3 == 0) ? 0xff00ff : (i % 2 == 0) ? 0xffff00 : 0x00ffff;
        let x = i + 3;
        let color2 = (x % 6 == 0) ? 0xff0000 : (x % 5 == 0) ? 0x00ff00 : (x % 4 == 0) ? 0x0000ff : (x % 3 == 0) ? 0xff00ff : (x % 2 == 0) ? 0xffff00 : 0x00ffff;
        let xmasLight = new THREE.PointLight(color, 1, 0.25, 2);
        let bulbMaterial = new THREE.MeshPhysicalMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 1
        });
        let bulb = new THREE.Mesh(bulbGeometry, bulbMaterial);
        let rand = Math.random();
        let rand2 = Math.random();
        xmasLight.position.set(-1.05, rand/10 - 0.6, (i * -0.3) + 3.25);
        bulb.position.set(-1.05, rand/10 - 0.6, (i * -0.3) + 3.25);
        beals.add(xmasLight);
        beals.add(bulb);
        bulbMaterial.dispose();
        xmasLight = new THREE.PointLight(color2, 1, 0.25, 2);
        xmasLight.position.set(-1.05, rand2/10 - 0.3, (i * -0.3) + 3.25);
        bulbMaterial = new THREE.MeshPhysicalMaterial({
            color: color2,
            emissive: color2,
            emissiveIntensity: 1
        });
        bulb = new THREE.Mesh(bulbGeometry, bulbMaterial);
        bulb.position.set(-1.05, rand2/10 - 0.3, (i * -0.3) + 3.25);
        beals.add(xmasLight);
        beals.add(bulb);
        bulbMaterial.dispose();

        if (!(i >= 9 && i <= 11) && !(i >= 18 && i <= 23) && i != 30) {
            let y = i + 5;
            let color3 = (y % 6 == 0) ? 0xff0000 : (y % 5 == 0) ? 0x00ff00 : (y % 4 == 0) ? 0x0000ff : (y % 3 == 0) ? 0xff00ff : (y % 2 == 0) ? 0xffff00 : 0x00ffff;
            xmasLight = new THREE.PointLight(color3, 1, 0.25, 2);
            xmasLight.position.set(-1, -(rand2/10 + 1.4), (i * -0.3) + 3);
            bulbMaterial = new THREE.MeshPhysicalMaterial({
                color: color3,
                emissive: color3,
                emissiveIntensity: 1
            });
            bulb = new THREE.Mesh(bulbGeometry, bulbMaterial);
            bulb.position.set(-1, -(rand2/10 + 1.4), (i * -0.3) + 3);
            beals.add(xmasLight);
            beals.add(bulb);
        }
    }

    bulbGeometry.dispose();
}

// Window dimensions => 0.85 x 0.9 ////////////////////////////////////
function buildWindows() {
    let baseWindow = new THREE.Object3D();
    baseWindow.castShadow = baseWindow.receiveShadow = true;

    let boxGeometry = new THREE.BoxBufferGeometry(0.85, 0.05, 0.25);
    let woodGrainTexture = textureLoader.load("textures/woodGrainTexture.jpg");
    woodGrainTexture.wrapS = woodGrainTexture.wrapT = THREE.RepeatWrapping;
    woodGrainTexture.repeat.set(0.1,1.5);
    woodGrainTexture.rotation = Math.PI/2;
    let woodGrainNormal = textureLoader.load("textures/woodGrainNormal.jpg");
    woodGrainNormal.wrapS = woodGrainNormal.wrapT = THREE.RepeatWrapping;
    woodGrainNormal.repeat.set(0.1,1.5);
    woodGrainNormal.rotation = Math.PI/2;
    let woodGrainRoughness = textureLoader.load("textures/woodGrainRoughness.jpg");
    woodGrainRoughness.wrapS = woodGrainRoughness.wrapT = THREE.RepeatWrapping;
    woodGrainRoughness.repeat.set(0.1,1.5);
    woodGrainRoughness.rotation = Math.PI/2;
    let boxMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x918866,
        side: THREE.FrontSide,
        map: woodGrainTexture,
        normalMap: woodGrainNormal,
        normalScale: new THREE.Vector2(5,5),
        roughnessMap: woodGrainRoughness,
        roughness: 1
    });
    let bluePane = new THREE.Mesh(boxGeometry, boxMaterial);
    bluePane.castShadow = bluePane.receiveShadow = true;
    bluePane.position.set(0, -0.425, 0);
    baseWindow.add(bluePane);
    bluePane = bluePane.clone();
    bluePane.position.set(0, 0.425, 0);
    baseWindow.add(bluePane);
    boxGeometry = new THREE.BoxBufferGeometry(0.8, 0.05, 0.25);
    bluePane = new THREE.Mesh(boxGeometry, boxMaterial);
    bluePane.rotateZ(Math.PI/2);
    bluePane.position.set(-0.4, 0, 0);
    baseWindow.add(bluePane);
    bluePane = bluePane.clone();
    bluePane.position.set(0.4, 0, 0);
    baseWindow.add(bluePane);
    baseWindow.rotateY(Math.PI/2);

    let logoWindow = baseWindow.clone();
    boxGeometry = new THREE.BoxBufferGeometry(0.8, 0.03, 0.15);
    boxMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x918866,
        side: THREE.FrontSide,
        map: woodGrainTexture,
        normalMap: woodGrainNormal,
        normalScale: new THREE.Vector2(5,5),
        roughnessMap: woodGrainRoughness,
        roughness: 1
    });
    let whitePane = new THREE.Mesh(boxGeometry, boxMaterial);
    whitePane.castShadow = whitePane.receiveShadow = true;
    whitePane.position.set(0, -0.385, 0);
    logoWindow.add(whitePane);
    whitePane = whitePane.clone();
    whitePane.position.set(0, 0.385, 0);
    logoWindow.add(whitePane);
    boxGeometry = new THREE.BoxBufferGeometry(0.85, 0.03, 0.15);
    whitePane = new THREE.Mesh(boxGeometry, boxMaterial);
    whitePane.rotateZ(Math.PI/2);
    whitePane.position.set(-0.36, 0, 0);
    logoWindow.add(whitePane);
    whitePane = whitePane.clone();
    whitePane.position.set(0.36, 0, 0);
    logoWindow.add(whitePane);
    boxGeometry = new THREE.BoxBufferGeometry(0.85, 0.9, 0.01);
    boxMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xc2e7ff,
        side: THREE.FrontSide,
        transparent: true,
        opacity: 0.1,
        envMap: cubeMap,
        envMapIntensity: 1,
        reflectivity: 1
    });
    let glass = new THREE.Mesh(boxGeometry, boxMaterial);
    logoWindow.add(glass);
    logoWindow.position.set(-0.75, -0.95, 2.425);
    beals.add(logoWindow);

    let regWindow = logoWindow.clone();
    boxGeometry = new THREE.BoxBufferGeometry(0.02, 0.9, 0.03);
    boxMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x918866,
        side: THREE.FrontSide,
        map: woodGrainTexture,
        normalMap: woodGrainNormal,
        normalScale: new THREE.Vector2(5,5),
        roughnessMap: woodGrainRoughness,
        roughness: 1
    });
    let panePiece = new THREE.Mesh(boxGeometry, boxMaterial);
    panePiece.castShadow = panePiece.receiveShadow = true;
    for (let i = 1; i < 6; i++) {
        panePiece = panePiece.clone();
        panePiece.position.set(0.365-(i * (73/500)), 0, 0);
        regWindow.add(panePiece);
        if (i != 4 && i != 5) {
            panePiece2 = panePiece.clone();
            panePiece2.scale.set(1, 0.85, 1);
            panePiece2.rotateZ(Math.PI/2);
            panePiece2.position.set(0, 0.39-(i*(39/200)), 0);
            regWindow.add(panePiece2);
        }
    }

    for (let i =0; i < 6; i++) {
        regWindow = regWindow.clone();
        regWindow.position.set(-0.75, -0.95, (i * -1.25) + 1.175)
        if (i != 1 && i != 3 && i != 4) {
            beals.add(regWindow);
        }
    }

    woodGrainNormal.dispose();
    woodGrainTexture.dispose();
    woodGrainRoughness.dispose();

    let doorFrame = new THREE.Object3D();
    woodGrainTexture = textureLoader.load("textures/woodGrainTexture.jpg");
    woodGrainTexture.wrapS = woodGrainTexture.wrapT = THREE.RepeatWrapping;
    woodGrainTexture.repeat.set(1, 4);
    woodGrainNormal = textureLoader.load("textures/woodGrainNormal.jpg");
    woodGrainNormal.wrapS = woodGrainNormal.wrapT = THREE.RepeatWrapping;
    woodGrainNormal.repeat.set(1, 4);
    woodGrainRoughness = textureLoader.load("textures/woodGrainRoughness.jpg");
    woodGrainRoughness.wrapS = woodGrainRoughness.wrapT = THREE.RepeatWrapping;
    woodGrainRoughness.repeat.set(1, 4);

    boxGeometry = new THREE.BoxBufferGeometry(0.25, 1.5, 0.05);
    boxMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x918866,
        side: THREE.FrontSide,
        map: woodGrainTexture,
        normalMap: woodGrainNormal,
        normalScale: new THREE.Vector2(5,5),
        roughnessMap: woodGrainRoughness,
        roughness: 1
    });
    let doorPane = new THREE.Mesh(boxGeometry, boxMaterial);
    doorPane.castShadow = doorPane.receiveShadow = true;
    doorPane.position.set(0, 0, 0.4);
    doorFrame.add(doorPane);
    doorPane = doorPane.clone();
    doorPane.position.set(0, 0, -0.4);
    doorFrame.add(doorPane);
    boxGeometry = new THREE.BoxBufferGeometry(0.25, 0.05, 0.8);
    doorPane = new THREE.Mesh(boxGeometry, boxMaterial);
    doorPane.castShadow = doorPane.receiveShadow = true;
    doorPane.position.set(0, 0.725, 0);
    doorFrame.add(doorPane);

    let door = new THREE.Object3D();
    door.add(doorFrame);
    boxGeometry = new THREE.BoxBufferGeometry(0.05, 1.45, 0.1);
    doorPane = new THREE.Mesh(boxGeometry, boxMaterial);
    doorPane.castShadow = doorPane.receiveShadow = true;
    doorPane.position.set(0, -0.025, 0.325);
    doorFrame.add(doorPane);
    doorPane = doorPane.clone();
    doorPane.position.set(0, -0.025, -0.325);
    doorFrame.add(doorPane);
    boxGeometry = new THREE.BoxBufferGeometry(0.05, 0.15, 0.6);
    doorPane = new THREE.Mesh(boxGeometry, boxMaterial);
    doorPane.castShadow = doorPane.receiveShadow = true;
    doorPane.position.set(0, 0.625, 0);
    doorFrame.add(doorPane);
    doorPane = doorPane.clone();
    doorPane.position.set(0, -0.675, 0);
    doorFrame.add(doorPane);

    let cylinderGeometry = new THREE.CylinderBufferGeometry(0.025, 0.025, 0.1, 32);
    let metalMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x6b6b6b,
        side: THREE.FrontSide,
        metalness: 0.25
    });
    let lock = new THREE.Mesh(cylinderGeometry, metalMaterial);
    lock.position.set(0, 0.1, 0.325);
    lock.rotateZ(Math.PI/2);
    doorFrame.add(lock);

    cylinderGeometry = new THREE.CylinderBufferGeometry(0.01, 0.01, 0.1, 32);
    let handle = new THREE.Mesh(cylinderGeometry, metalMaterial);
    handle.position.set(0, -0.05, 0.325);
    handle.rotateZ(Math.PI/2);
    doorFrame.add(handle);

    boxGeometry = new THREE.BoxBufferGeometry(0.75, 1.25, 0.01);
    let glassMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xc2e7ff,
        side: THREE.FrontSide,
        transparent: true,
        opacity: 0.1,
        reflectivity: 1
    });
    glass = new THREE.Mesh(boxGeometry, glassMaterial);
    glass.rotateY(Math.PI/2);
    let glassDoor = door.clone();
    glassDoor.add(glass);
    glassDoor.position.set(-0.75, -1.25, -0.075);
    boxGeometry = new THREE.BoxBufferGeometry(0.01, 0.02, 0.1);
    handle = new THREE.Mesh(boxGeometry, metalMaterial);
    handle.position.set(0.05, -0.05, 0.2875);
    glassDoor.add(handle);
    handle = handle.clone();
    handle.position.set(-0.05, -0.05, 0.2875);
    glassDoor.add(handle);
    beals.add(glassDoor);
    glassDoor = glassDoor.clone();
    glassDoor.position.set(-0.75, -1.25, -3.825);
    beals.add(glassDoor);

    door.scale.set(1.25, 1, 1);
    boxGeometry = new THREE.BoxBufferGeometry(0.75, 1.25, 0.01);
    doorPane = new THREE.Mesh(boxGeometry, boxMaterial);
    doorPane.castShadow = doorPane.receiveShadow = true;
    doorPane.rotateY(Math.PI/2);
    door.add(doorPane);
    boxGeometry = new THREE.BoxBufferGeometry(0.05, 1.25, 0.1);
    doorPane = new THREE.Mesh(boxGeometry, boxMaterial);
    doorPane.castShadow = doorPane.receiveShadow = true;
    doorPane.position.set(0, -0.075, 0)
    door.add(doorPane);
    boxGeometry = new THREE.BoxBufferGeometry(0.05, 0.15, 0.6);
    doorPane = new THREE.Mesh(boxGeometry, boxMaterial);
    doorPane.castShadow = doorPane.receiveShadow = true;
    door.add(doorPane);
    let sphereGeometry = new THREE.SphereBufferGeometry(0.03, 16, 16);
    let knob = new THREE.Mesh(sphereGeometry, metalMaterial);
    knob.position.set(-0.05, -0.05, 0.325);
    door.add(knob);

    door.position.set(-0.75, -1.25, -2.575);
    beals.add(door);

    boxGeometry.dispose();
    cylinderGeometry.dispose();
    sphereGeometry.dispose();
    boxMaterial.dispose();
    metalMaterial.dispose();
    woodGrainNormal.dispose();
    woodGrainTexture.dispose();
    woodGrainRoughness.dispose();
}

// Brick walls
function buildBrickWalls() {
    //let planeGeometry = new THREE.BoxBufferGeometry(0.87, .5, 0.1, 1024, 1024, 32);
    let planeGeometry = new THREE.BoxBufferGeometry(0.87, .5, 0.1);
    let brickWallTexture = textureLoader.load("textures/brickWallTexture.jpg");
    brickWallTexture.wrapS = brickWallTexture.wrapT = THREE.RepeatWrapping;
    brickWallTexture.repeat.set(0.5, 0.3);
    let brickWallNormal = textureLoader.load("textures/brickWallNormal.jpg");
    brickWallNormal.wrapS = brickWallNormal.wrapT = THREE.RepeatWrapping;
    brickWallNormal.repeat.set(0.5, 0.3);
    let brickWallRoughness = textureLoader.load("textures/brickWallRoughness.jpg");
    brickWallRoughness.wrapS = brickWallRoughness.wrapT = THREE.RepeatWrapping;
    brickWallRoughness.repeat.set(0.5, 0.3);
    let brickWallHeight = textureLoader.load("textures/brickWallHeight.jpg");
    brickWallHeight.wrapS = brickWallHeight.wrapT = THREE.RepeatWrapping;
    brickWallHeight.repeat.set(0.5, 0.3);
    let planeMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        side: THREE.FrontSide,
        map: brickWallTexture,
        normalMap: brickWallNormal,
        normalScale: new THREE.Vector2(10, 10),
        //displacementMap: brickWallHeight,
        //displacementScale: 0.2,
        //displacementBias: -0.02,
        roughnessMap: brickWallRoughness,
        roughness: 1,
        shadowSide: THREE.DoubleSide
    });
    let brickWall = new THREE.Mesh(planeGeometry, planeMaterial);
    brickWall.castShadow = brickWall.receiveShadow = true;
    brickWall.rotateY(-Math.PI/2);
    for (let i = 0; i < 7; i++) {
        brickWall = brickWall.clone();
        //brickWall.position.set(-.775, -1.75, (i * -1.25) + 2.435);
        brickWall.position.set(-0.85, -1.75, (i * -1.25) + 2.435);
        if (i != 2 && i != 4 && i != 5)
        {
            beals.add(brickWall);
        }
    }

    boxGeometry = new THREE.BoxBufferGeometry(9.15, 0.75, 0.1);
    brickWallTexture = textureLoader.load("textures/brickWallTexture.jpg");
    brickWallTexture.wrapS = brickWallTexture.wrapT = THREE.RepeatWrapping;
    brickWallTexture.repeat.set(5, 0.4);
    brickWallNormal = textureLoader.load("textures/brickWallNormal.jpg");
    brickWallNormal.wrapS = brickWallNormal.wrapT = THREE.RepeatWrapping;
    brickWallNormal.repeat.set(5, 0.4);
    brickWallRoughness = textureLoader.load("textures/brickWallRoughness.jpg");
    brickWallRoughness.wrapS = brickWallRoughness.wrapT = THREE.RepeatWrapping;
    brickWallRoughness.repeat.set(5, 0.4);
    brickWallHeight = textureLoader.load("textures/brickWallHeight.jpg");
    brickWallHeight.wrapS = brickWallHeight.wrapT = THREE.RepeatWrapping;
    brickWallHeight.repeat.set(5, 0.4);
    planeMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        side: THREE.FrontSide,
        map: brickWallTexture,
        normalMap: brickWallNormal,
        normalScale: new THREE.Vector2(10, 10),
        //displacementMap: brickWallHeight,
        //displacementScale: 0.2,
        //displacementBias: -0.1,
        roughnessMap: brickWallRoughness,
        roughness: 1,
        shadowSide: THREE.DoubleSide
    });
    let upperWallLong = new THREE.Mesh(boxGeometry, planeMaterial);
    upperWallLong.position.set(-0.85, 0.2, -1.325);
    upperWallLong.rotateY(Math.PI/2);
    upperWallLong.castShadow = upperWallLong.receiveShadow = true;
    beals.add(upperWallLong);
    upperWallLong = upperWallLong.clone();
    upperWallLong.position.set(-0.85, 2.45, -1.325);
    beals.add(upperWallLong);

    planeGeometry.dispose();
    planeMaterial.dispose();
    brickWallNormal.dispose();
    brickWallHeight.dispose();
    brickWallTexture.dispose();
    brickWallRoughness.dispose();

    planeGeometry = new THREE.BoxBufferGeometry(0.1, 1.5, 0.6);
    brickWallTexture = textureLoader.load("textures/brickWallTexture.jpg");
    brickWallTexture.wrapS = brickWallTexture.wrapT = THREE.RepeatWrapping;
    brickWallTexture.repeat.set(0.35, 0.75);
    brickWallNormal = textureLoader.load("textures/brickWallNormal.jpg");
    brickWallNormal.wrapS = brickWallNormal.wrapT = THREE.RepeatWrapping;
    brickWallNormal.repeat.set(0.35, 0.75);
    brickWallRoughness = textureLoader.load("textures/brickWallRoughness.jpg");
    brickWallRoughness.wrapS = brickWallRoughness.wrapT = THREE.RepeatWrapping;
    brickWallRoughness.repeat.set(0.35, 0.75);
    brickWallHeight = textureLoader.load("textures/brickWallHeight.jpg");
    brickWallHeight.wrapS = brickWallHeight.wrapT = THREE.RepeatWrapping;
    brickWallHeight.repeat.set(0.35, 0.75);
    planeMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        side: THREE.FrontSide,
        map: brickWallTexture,
        normalMap: brickWallNormal,
        normalScale: new THREE.Vector2(10, 10),
        //displacementMap: brickWallHeight,
        //displacementScale: 0.2,
        //displacementBias: -0.1,
        roughnessMap: brickWallRoughness,
        roughness: 1,
        shadowSide: THREE.DoubleSide
    });
    let upperWallPiece = new THREE.Mesh(planeGeometry, planeMaterial);
    //upperWallPiece.position.set(-0.85, 1.325, 2.95);

    for (let i = 0; i < 8; i ++) {
        upperWallPiece = upperWallPiece.clone();
        upperWallPiece.position.set(-0.85, 1.325, 2.95 - (i * 1.2215));
        beals.add(upperWallPiece);
    }

    planeGeometry.dispose();
    planeMaterial.dispose();
    brickWallNormal.dispose();
    brickWallHeight.dispose();
    brickWallTexture.dispose();
    brickWallRoughness.dispose();

    buildUpperWindows();
}

function buildUpperWindows() {
    let upperWindow = new THREE.Object3D();
    let boxGeometry = new THREE.BoxBufferGeometry(0.1, 0.05, 0.6215);
    let boxMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x0a0a0a,
        side: THREE.FrontSide,
        shadowSide: THREE.DoubleSide
    });
    let pane = new THREE.Mesh(boxGeometry, boxMaterial);
    pane.position.set(0, -0.725, 0);
    upperWindow.add(pane);
    pane = pane.clone();
    pane.position.set(0, 0.725, 0);
    upperWindow.add(pane);
    pane = pane.clone();
    pane.position.set(0, 0, 0);
    upperWindow.add(pane);
    boxGeometry = new THREE.BoxBufferGeometry(0.1, 1.4, 0.05);
    pane = new THREE.Mesh(boxGeometry, boxMaterial);
    pane.position.set(0, 0, -0.28575);
    upperWindow.add(pane);
    pane = pane.clone();
    pane.position.set(0, 0, 0.28575);
    upperWindow.add(pane);
    boxGeometry = new THREE.BoxBufferGeometry(0.02, 1.4, 0.02);
    pane = new THREE.Mesh(boxGeometry, boxMaterial);
    pane.position.set(0, 0, 0.28575 - 0.5715/3);
    upperWindow.add(pane);
    pane = pane.clone();
    pane.position.z -= 0.5715/3;
    upperWindow.add(pane);
    boxGeometry = new THREE.BoxBufferGeometry(0.02, 0.02, 0.6215);
    pane = new THREE.Mesh(boxGeometry, boxMaterial);
    pane.position.set(0, -0.3625, 0);
    upperWindow.add(pane);
    pane = pane.clone();
    pane.position.set(0, 0.3625, 0);
    upperWindow.add(pane);
    boxGeometry = new THREE.BoxBufferGeometry(0.01, 1.4, 0.6215);
    boxMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xc2e7ff,
        side: THREE.FrontSide,
        transparent: true,
        opacity: 0.1,
        reflectivity: 1
    });
    let glass = new THREE.Mesh(boxGeometry, boxMaterial);
    upperWindow.add(glass);

    for (let i = 0; i < 7; i++) {
        upperWindow = upperWindow.clone();
        upperWindow.position.set(-0.85, 1.325, 2.33925 - (i * 1.2215));
        beals.add(upperWindow);
    }

    boxGeometry.dispose();
    boxMaterial.dispose();
}

function addIndoorLights() {
    let indoorLight = new THREE.SpotLight(0xe6e5c3, 0.5);
    indoorLight.position.set(3, 0.75, 0);
    beals.add( indoorLight );

    let spotLightHelper = new THREE.SpotLightHelper( indoorLight );
    //scene.add( spotLightHelper );
    //indoorLight.angle = Math.PI/10;
    indoorLight.castShadow = true;
    indoorLight.shadow.mapSize.width = 1024;
    indoorLight.shadow.mapSize.height = 1024;
    indoorLight.shadow.camera.near = 0.1;
    indoorLight.shadow.camera.far = 10000;
    indoorLight.shadow.camera.fov = 90;
    indoorLight.shadow.bias = -0.0004;
    indoorLight.target.position.set(1.5, 0, 0);

    scene.add(indoorLight.target);
    
}

beals.position.set(4.3, 2.025, 1.75);
oldPort.add(beals);

// Street Lamp ///////////////////////////////////////
function buildStreetLamps() {
    let streetLamp = new THREE.Object3D();
    let cylinderGeometry = new THREE.CylinderBufferGeometry(0.05, 0.05, 0.05, 32);
    let metalNormal = textureLoader.load("textures/metalNormal.jpg");
    metalNormal.wrapS = metalNormal. wrapT = THREE.RepeatWrapping;
    metalNormal.repeat.set(1, 3);
    let metalRoughness = textureLoader.load("textures/metalRoughness.jpg");
    metalRoughness.wrapS = metalRoughness. wrapT = THREE.RepeatWrapping;
    metalRoughness.repeat.set(1, 3);
    let cylinderMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x1a1a1a,
        side: THREE.FrontSide,
        shadowSide: THREE.DoubleSide,
        normalMap: metalNormal,
        normalScale: new THREE.Vector2(2, 2),
        roughnessMap: metalRoughness,
        roughness: 0.25
    });
    let lampBase = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    streetLamp.add(lampBase);
    cylinderGeometry = new THREE.CylinderBufferGeometry(0.04, 0.05, 0.01, 8);
    let bottomTrim = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    bottomTrim.position.set(0, 0.03, 0);
    streetLamp.add(bottomTrim);
    cylinderGeometry = new THREE.CylinderBufferGeometry(0.04, 0.04, 0.25, 8);
    let bottomPole = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    bottomPole.position.set(0, 0.155, 0);
    streetLamp.add(bottomPole);
    let torusGeometry = new THREE.TorusBufferGeometry(0.0405, 0.0025, 20, 32);
    let trim = new THREE.Mesh(torusGeometry, cylinderMaterial);
    trim.rotateX(Math.PI/2);
    trim.position.set(0, 0.28, 0);
    streetLamp.add(trim);
    torusGeometry = new THREE.TorusBufferGeometry(0.041, 0.0075, 5, 8);
    trim = new THREE.Mesh(torusGeometry, cylinderMaterial);
    trim.rotateX(Math.PI/2);
    trim.position.set(0, 0.2875, 0);
    streetLamp.add(trim);
    cylinderGeometry = new THREE.CylinderBufferGeometry(0.025, 0.04, 0.025, 32);
    let pole = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    pole.position.set(0, 0.3, 0);
    streetLamp.add(pole);
    cylinderGeometry = new THREE.CylinderBufferGeometry(0.015, 0.025, 0.5, 32);
    pole = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    pole.position.set(0, 0.5625, 0);
    streetLamp.add(pole);
    boxGeometry = new THREE.BoxBufferGeometry(0.0575, 0.005, 0.0575);
    trim = new THREE.Mesh(boxGeometry, cylinderMaterial);
    trim.position.set(0, 0.813, 0);
    streetLamp.add(trim);
    cylinderGeometry = new THREE.CylinderBufferGeometry(0.065, 0.04, 0.1, 4);
    let lampMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xe0de84,
        emissive: 0xe0de84,
        emissiveIntensity: 0.75
    });
    let lamp = new THREE.Mesh(cylinderGeometry, lampMaterial);
    lamp.rotateY(Math.PI/4);
    lamp.position.set(0, 0.863, 0);
    streetLamp.add(lamp);

    let streetLight = new THREE.PointLight(0xe0de84, 1, 9, 2);
    streetLight.castShadow = true;
    streetLight.shadow.mapSize.width = 1024;
    streetLight.shadow.mapSize.height = 1024;
    streetLight.shadow.camera.near = 0.1;
    streetLight.shadow.camera.far = 10000;
    streetLight.shadow.camera.fov = 90;
    streetLight.shadow.bias = -0.0004;
    streetLight.position.set(4.5, 1.2645, -2.5);
    scene.add(streetLight);

    boxGeometry = new THREE.BoxBufferGeometry(0.11, 0.015, 0.11);
    trim = new THREE.Mesh(boxGeometry, cylinderMaterial);
    trim.position.set(0, 0.9205, 0);
    streetLamp.add(trim);
    cylinderGeometry = new THREE.CylinderBufferGeometry(0.035, 0.065, 0.075, 4);
    let lampTop = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    lampTop.rotateY(Math.PI/4);
    lampTop.position.set(0, 0.958, 0);
    streetLamp.add(lampTop);
    cylinderGeometry = new THREE.CylinderBufferGeometry(0.01, 0.02, 0.025, 32);
    lampTop = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    lampTop.position.set(0, 1.008, 0);
    streetLamp.add(lampTop);
    streetLamp.castShadow = streetLamp.receiveShadow = true;

    streetLamp.position.set(4.5, 0.05, -2.5);
    streetLamp.scale.set(1.5,1.5,1.5);
    scene.add(streetLamp);

    streetLight = streetLight.clone();
    streetLight.position.set(-1.5, 1.2645, -2.5);
    scene.add(streetLight);

    streetLamp = streetLamp.clone();
    streetLamp.position.set(-1.5, 0.05, -2.5);
    scene.add(streetLamp);

    cylinderGeometry.dispose();
    cylinderMaterial.dispose();
    torusGeometry.dispose();
    metalNormal.dispose();
    metalRoughness.dispose();
}
//////////////////////////////////////////////////////

// build the Old Port
buildCobbleStone();
buildSidewalk();
buildStreetLamps();
buildStones();
buildBrickWalls();
buildWindows();
addIndoorLights();
letItSnow();
addXmasLights();

scene.add(oldPort);
oldPort.rotateY(Math.PI/2);


// FOR TESTING ONLY /////////////////////////////////
/*window.addEventListener("mousedown", e => {
    panning = true;
    prevMouse = new THREE.Vector2(e.x, e.y);
});
window.addEventListener("mouseup", e => {
    panning = false;
});
window.addEventListener("mousemove", e => {
    if (panning) {
        let euler = new THREE.Euler( 0, 0, 0, 'YXZ' );
        euler.setFromQuaternion( camera.quaternion );

        euler.y -= e.movementX * 0.001;
        euler.x -= e.movementY * 0.001;

        euler.x = Math.max( - Math.PI/2, Math.min( Math.PI/2, euler.x ) );
        camera.quaternion.setFromEuler( euler );
    }
});
window.addEventListener("keydown", e => {
    switch(e.keyCode) {
        case 65:
            xMovement.active = true;
            xMovement.direction = -1;
            break;
        case 68:
            xMovement.active = true;
            xMovement.direction = 1;
            break;
        case 83:
            zMovement.active = true;
            zMovement.direction = 1;
            break;
        case 87:
            zMovement.active = true;
            zMovement.direction = -1;
            break;
    }
});
window.addEventListener("keyup", e => {
    switch(e.keyCode) {
        case 65:
            xMovement.active = false;
            break;
        case 68:
            xMovement.active = false;
            break;
        case 83:
            zMovement.active = false;
            break;
        case 87:
            zMovement.active = false;
            break;
    }
});*/
///////////////////////////////////////////////////////

function animate() {
    requestAnimationFrame(animate);
    delta = clock.getDelta();
    for (let i = 0; i < snow.length; i++) {
        let mesh = snow[i].mesh;
        if (snow[i].velocity.y < 0.4)
            snow[i].velocity.y = Math.random;
        if (mesh.position.y < 0) {
            mesh.position.set(Math.random() * 15 - 7.5, 5, Math.random() * 7 - 3.5);
        } else {
            mesh.position.y -= delta * snow[i].velocity.y;
        }
        if (Math.abs(mesh.position.x) > 5) {
            mesh.position.x - 10;
        } else {
            mesh.position.x += delta * snow[i].velocity.x;
        }
        if (Math.abs(mesh.position.z) > 5) {
            mesh.position.z - 10;
        } else {
            mesh.position.z += delta * snow[i].velocity.z;
        }
    }
    /*if (xMovement.active) {
        camera.translateX(xMovement.direction * delta * 1.5);
    }
    if (zMovement.active) {
        camera.translateZ(zMovement.direction * delta * 1.5);
    }
    camera.position.y = 0.75;
    camera.up = new THREE.Vector3(0, 1, 0);*/

    renderer.render(scene, camera);
}
animate();