import * as THREE from './build/three.module.js'
import {
    PointerLockControls
} from './examples/jsm/controls/PointerLockControls.js';
import {
    MTLLoader
} from './examples/jsm/loaders/MTLLoader.js';
import {
    OBJLoader
}
from './examples/jsm/loaders/OBJLoader.js';

import {
    Sky
}
from './examples/jsm/objects/Sky.js';
let scene, camera, renderer, cube, controls, ambientLight, floorTop, floorBottom

let smoke
let reload = true;
let pause = false;

let shotAudio = new Audio('sounds/shot.wav')
let reloadAudio = new Audio('sounds/reload.wav')
let empty = new Audio('sounds/empty.wav')
let targetHit = new Audio('sounds/target.wav')
let horn = new Audio('sounds/horn.mp3')
let finish = new Audio('sounds/finish.wav')
let ready = new Audio('sounds/ready.wav')
let go = new Audio('sounds/go.wav')

let timerWaiting = false;

let xyz = document.getElementById('xyz')
let playing = false;
let minutes, seconds, miliseconds;
let printedTime = ''
let readyInterval;
let record = 0;

var raycaster, raycasterGun;
let timer = 0;
let timerInterval;
let collidableMeshListObjects = []
let collidableMeshListWalls = []
let collidableMeshListTargets = []

var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var canJump = false;

var prevTime = performance.now();
var velocity = new THREE.Vector3();
var direction = new THREE.Vector3();
var vertex = new THREE.Vector3();
var color = new THREE.Color();
let meshFloor;
var clock = new THREE.Clock();
let ammo = 7;

let loadingManager = null;
let RESOURCES_LOADED = false;

const models = {
    gun: {
        obj: 'objects/pistolSilencer.obj',
        mtl: 'objects/pistolSilencer.mtl',
        mesh: null,
        castShadow: false
    },
    cart: {
        obj: 'objects/cart.obj',
        mtl: 'objects/cart.mtl',
        mesh: null,
        castShadow: false
    },
    cartHigh: {
        obj: 'objects/cartHigh.obj',
        mtl: 'objects/cartHigh.mtl',
        mesh: null,
        castShadow: false
    },
    fountainRoundDetail: {
        obj: 'objects/fountainRoundDetail.obj',
        mtl: 'objects/fountainRoundDetail.mtl',
        mesh: null,
        castShadow: false
    },
    lantern: {
        obj: 'objects/lantern.obj',
        mtl: 'objects/lantern.mtl',
        mesh: null,
        castShadow: false
    },
    palmLong: {
        obj: 'objects/palm_long.obj',
        mtl: 'objects/palm_long.mtl',
        mesh: null,
        castShadow: false
    },
    palmShort: {
        obj: 'objects/palm_short.obj',
        mtl: 'objects/palm_short.mtl',
        mesh: null,
        castShadow: false
    },
    rockLarge: {
        obj: 'objects/rockLarge.obj',
        mtl: 'objects/rockLarge.mtl',
        mesh: null,
        castShadow: false
    },
    stallGreen: {
        obj: 'objects/stallGreen.obj',
        mtl: 'objects/stallGreen.mtl',
        mesh: null,
        castShadow: false
    },
    tower: {
        obj: 'objects/tower.obj',
        mtl: 'objects/tower.mtl',
        mesh: null,
        castShadow: false
    },
    towerSquareArch: {
        obj: 'objects/towerSquareArch.obj',
        mtl: 'objects/towerSquareArch.mtl',
        mesh: null,
        castShadow: false
    },
    tractorShovel: {
        obj: 'objects/tractorShovel.obj',
        mtl: 'objects/tractorShovel.mtl',
        mesh: null,
        castShadow: false
    },
    tree: {
        obj: 'objects/tree.obj',
        mtl: 'objects/tree.mtl',
        mesh: null,
        castShadow: false
    },
    wallNarrowGate: {
        obj: 'objects/wallNarrowGate.obj',
        mtl: 'objects/wallNarrowGate.mtl',
        mesh: null,
        castShadow: false
    },
    race: {
        obj: 'objects/race.obj',
        mtl: 'objects/race.mtl',
        mesh: null,
        castShadow: false
    },
    portal: {
        obj: 'objects/portal.obj',
        mtl: 'objects/portal.mtl',
        mesh: null,
        castShadow: false
    },
    rocksTallOre: {
        obj: 'objects/rocksTallOre.obj',
        mtl: 'objects/rocksTallOre.mtl',
        mesh: null,
        castShadow: false
    },
    spaceCraft6: {
        obj: 'objects/spaceCraft6.obj',
        mtl: 'objects/spaceCraft6.mtl',
        mesh: null,
        castShadow: false
    },
    satelliteDishLarge: {
        obj: 'objects/satelliteDishLarge.obj',
        mtl: 'objects/satelliteDishLarge.mtl',
        mesh: null,
        castShadow: false
    }
}

const bullets = [];

const objects = {};


let targetsLeft = 5
//main initiazlie function
function init() {




    //set ammo count to the html element
    document.getElementById('ammo').innerHTML = ammo;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
        90,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    //camera position
    camera.position.set(21, 25, 31)
    camera.rotation.set(0, 10, 0)
    // camera.lookAt(new THREE.Vector3(0, 10, 0));
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('play-area').appendChild(renderer.domElement);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap



    loadingManager = new THREE.LoadingManager();

    loadingManager.onProgress = function(e, b){
        document.getElementById('loading-percent').innerHTML = Math.floor((b / 38) * 100) + '%';
    }


    loadingManager.onLoad = function () {
        RESOURCES_LOADED = true;
        document.getElementById('loading-bar').innerHTML = '<h2>Press <span style="color: rgb(0, 255, 0);">ENTER</span> to start</h2>';
        onResourcesLoaded();
        animate();
        // controls.lock()

    }




    //set up sky

    let sky = new Sky();
    sky.scale.setScalar(450000);
    sky.castShadow = true;
    sky.receiveShadow = true;
    scene.add(sky);

    // Add Sun Helper
    let sunSphere = new THREE.Mesh(
        new THREE.SphereBufferGeometry(20000, 16, 8),
        new THREE.MeshBasicMaterial({
            color: 0xffffff
        })
    );
    sunSphere.position.y = -700000;
    sunSphere.visible = false;
    scene.add(sunSphere);

    /// GUI

    var effectController = {
        turbidity: 10,
        rayleigh: 2,
        mieCoefficient: 0.005,
        mieDirectionalG: 0.8,
        luminance: 1,
        inclination: 0.49, // elevation / inclination
        azimuth: 0.25, // Facing front,
        sun: !true
    };

    var distance = 400000;

    var uniforms = sky.material.uniforms;
    uniforms["turbidity"].value = 10;
    uniforms["rayleigh"].value = 2;
    uniforms["mieCoefficient"].value = 0.005;
    uniforms["mieDirectionalG"].value = 0.8;
    uniforms["luminance"].value = 1;
    var theta = Math.PI * (0.1 - 0.5);
    var phi = 2 * Math.PI * (0.25 - 0.5);

    sunSphere.position.x = distance * Math.cos(phi);
    sunSphere.position.y = distance * Math.sin(phi) * Math.sin(theta);
    sunSphere.position.z = distance * Math.sin(phi) * Math.cos(theta);
    uniforms["sunPosition"].value.copy(sunSphere.position);
    sunSphere.visible = effectController.sun;




    var reticle = new THREE.Mesh(
        new THREE.RingBufferGeometry(0.09, 0.14, 32),
        new THREE.MeshBasicMaterial({
            color: 0xffffff,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide
        })
    );
    reticle.position.z = -8;
    reticle.applyQuaternion(camera.quaternion)
    camera.add(reticle);


    for (let _key in models) {
        (function (key) {

            let mtlLoader = new MTLLoader(loadingManager);
            mtlLoader.load(models[key].mtl, function (materials) {
                materials.preload();

                let objLoader = new OBJLoader(loadingManager);

                objLoader.setMaterials(materials);
                objLoader.load(models[key].obj, function (mesh) {

                    mesh.traverse(function (node) {
                        if (node instanceof THREE.Mesh) {
                            if ('castShadow' in models[key])
                                node.castShadow = models[key].castShadow;
                            else
                                node.castShadow = true;

                            if ('receiveShadow' in models[key])
                                node.receiveShadow = models[key].receiveShadow;
                            else
                                node.receiveShadow = true;
                        }
                    });
                    models[key].mesh = mesh;

                });
            });

        })(_key);
    }

    // // const geometry = new THREE.BoxGeometry(10, 10, 10);
    // const geometry = new THREE.SphereGeometry(5, 30, 30);
    // const cubeMesh = new THREE.MeshBasicMaterial({
    //     color: 0x00ff00,
    //     transparent: true,
    //     opacity: 1
    // })

    // cube = new THREE.Mesh(
    //     geometry,
    //     cubeMesh

    // )

    // scene.add(cube)

    
    
    const smokeParticle = new THREE.TextureLoader().load('images/fire_01.png')
    // /smokeParticle.alphaMap(0)
    const smokeMesh = new THREE.MeshBasicMaterial({
        map: smokeParticle,
        wireframe: false,
        transparent: true,
        opacity: 1
    })
    // smokeMesh.alphaMap = "white";
    
    smoke = new THREE.Mesh(
        new THREE.PlaneGeometry(10, 10, 10, 10),
        smokeMesh
    )
    
    
    smoke.scale.x = 2
    smoke.scale.y = 2

       scene.add(new THREE.AmbientLight(0x777777));

       var light = new THREE.DirectionalLight(0xdfebff, 1);
       light.position.set(-50, 200, -100);
       light.position.multiplyScalar(1.3);

       light.castShadow = true;

       light.shadow.mapSize.width = 1024;
       light.shadow.mapSize.height = 1024;

       var d = 300;

       light.shadow.camera.left = -d;
       light.shadow.camera.right = d;
       light.shadow.camera.top = d;
       light.shadow.camera.bottom = -d;

       light.shadow.camera.far = 1000;

       scene.add(light);
    
    
    const textureFloor = new THREE.TextureLoader().load('images/stone.jpg')
    textureFloor.anisotropy = 16;
    textureFloor.wrapS = textureFloor.wrapT = THREE.RepeatWrapping;
    textureFloor.repeat.set(25, 25);
    textureFloor.anisotropy = 16;
    let floor = new THREE.Mesh(
        new THREE.BoxGeometry(10, 10, 10, 10),
        new THREE.MeshLambertMaterial({
            map: textureFloor,
        })
    )
    floor.receiveShadow = true;
    floor.castShadow = true;


    var groundMaterial1 = new THREE.MeshLambertMaterial({
        map: textureFloor,
    });
    var groundMaterial2 = new THREE.MeshLambertMaterial({
        map: textureFloor,
        side: THREE.BackSide
    });

    
     floorTop = new THREE.Mesh(new THREE.PlaneBufferGeometry(300, 300), groundMaterial1);
    floorTop.position.y = 5;
    floorTop.position.x = 150;
    floorTop.position.z = 145;
    floorTop.rotation.x = -Math.PI / 2;
    floorTop.receiveShadow = true;


    floorBottom = new THREE.Mesh(new THREE.PlaneBufferGeometry(300, 300), groundMaterial2);
     floorBottom.position.y = 4;
     floorBottom.position.x = 150;
     floorBottom.position.z = 145;
     floorBottom.rotation.x = -Math.PI / 2;
     floorBottom.receiveShadow = true;


    scene.add(floorTop)
    scene.add(floorBottom)
    // collidableMeshListObjects.push(mesh1)


    controls = new PointerLockControls(camera, renderer.domElement);

    let allowShot = true;
    document.addEventListener('click', () => {
        // controls.lock();
       
        if(controls.isLocked){
            if (ammo > 0 && allowShot) {
                shotAudio.pause();
                shotAudio.currentTime = 0;
                shotAudio.play()
                ammo -= 1;
                let ammoCount = document.getElementById('ammo')
                ammoCount.innerHTML = ammo
                let bullet = new THREE.Mesh(
                    new THREE.SphereGeometry(0.5, 7, 7),
                    new THREE.MeshBasicMaterial({
                        color: '#000000'
                    })
                )
                var time = performance.now();

                bullet.position.set(
                    camera.position.x - Math.sin(camera.rotation.y + Math.PI / 6) * 0.6,
                    camera.position.y,
                    camera.position.z + Math.cos(camera.rotation.y + Math.PI / 6) * 0.6
                    // + Math.cos(camera.rotation.y + Math.PI / 6) * 0.75
                )


                bullet.velocity = new THREE.Vector3(0, 0, -1)
                bullet.velocity.applyQuaternion(camera.quaternion);
                bullet.velocity.set(
                    bullet.velocity.x * 10,
                    bullet.velocity.y * 10,
                    bullet.velocity.z * 10
                )
                smoke.rotation.z -= Math.floor((Math.random() * 10) + 1);
                smoke.position.y = Math.sin(time / 5000 * Math.PI - 1) - 1;

                let recoil = setInterval(() => {
                    objects['gun'].rotation.x += 0.02;
                }, 1)

                setTimeout(() => {
                    objects['gun'].rotation.set(Math.PI, 0, Math.PI);
                    clearInterval(recoil);
                }, 200)

                setTimeout(() => {
                    camera.remove(smoke)
                }, 100)

                setTimeout(() => {
                    allowShot = true
                }, 200)

                bullet.alive = true;
                setTimeout(function () {
                    bullet.alive = false;
                    scene.remove(bullet)
                }, 1000)
                bullets.push(bullet);
                scene.add(bullet)


                smoke.position.set(
                    objects['gun'].position.x,
                    objects['gun'].position.y + 2,
                    objects['gun'].position.z - 5
                )

                camera.add(smoke)
                allowShot = false

            } else {
                if (reload) {
                    empty.pause();
                    empty.currentTime = 0;
                    empty.play()
                }

            }

        }

    })

    controls.addEventListener('lock', function () {
        


        pause= false;

        // instructions.style.display = 'none';
        // blocker.style.display = 'none';

    });

    controls.addEventListener('unlock', function () {
        
        pause = true;
        
        // controls.moveRight(0);
        // controls.moveForward(0);
        

    });

    scene.add(controls.getObject());

    var onKeyDown = function (event) {

        if(event.keyCode === 13){
           
            if(RESOURCES_LOADED){
                controls.lock()
                if (!playing) {
                    document.getElementById('play-area').style.display = "block";
                    document.getElementById('loading').style.display = "none";
                }
                playing = true
            }

        }



        if(controls.isLocked){
            switch (event.keyCode) {

                case 38: // up
                case 87: // w
                    moveForward = true;
                    break;

                case 37: // left
                case 65: // a
                    moveLeft = true;
                    break;

                case 40: // down
                case 83: // s
                    moveBackward = true;
                    break;

                case 39: // right
                case 68: // d
                    moveRight = true;
                    break;

                case 32: // space
                    if (canJump === true) velocity.y += 90;
                    canJump = false;
                    break;
                case 82:
                    if (reload === true) {

                        reload = false;
                        ammo = 7;
                        reloadAudio.play()
                        document.getElementsByClassName('ammo-box')[2].classList.add('active-ammo')
                        document.getElementsByClassName('ammo-box')[0].classList.remove('active-ammo')

                        let reloadingBar = document.getElementById('reloading-bar')
                        let reloadingAnimation = setInterval(() => {
                            allowShot = false;
                            reloadingBar.style.width = `${(reloadAudio.currentTime / reloadAudio.duration) * 100}%`
                        }, 20)
                        reloadAudio.onended = () => {
                            clearInterval(reloadingAnimation)
                            allowShot = true;
                            reload = true;
                            let ammoCount = document.getElementById('ammo')
                            ammoCount.innerHTML = ammo
                            document.getElementsByClassName('ammo-box')[2].classList.remove('active-ammo')
                            document.getElementsByClassName('ammo-box')[0].classList.add('active-ammo')
                            document.getElementsByClassName('ammo-box')[1].classList.remove('active-ammo')
                        }

                    }


                    break;
                    case 84:
                        if (!timerWaiting) {
                            clearTargets()
                            ready.play();


                            setTimeout(() => {
                                clearInterval(readyInterval)
                                setTargets();
                                horn.play()
                                go.play();
                                targetsLeft = 5;
                                document.getElementById('targets-left').innerHTML = targetsLeft;
                                timerInterval = setInterval(() => {
                                    if(!pause){
                                        if(timer > 3600){
                                            timer = 0;
                                            document.getElementById('targets-left').innerHTML = 0;
                                            document.getElementById('time').innerHTML = '00:00.00';
                                            clearTargets()
                                            clearInterval(timerInterval);
                                            finish.play();
                                        }else{
                                            timer += (10 / 1000)
                                            timer.toPrecision(2);
                                            document.getElementById('time').innerHTML = printTime(timer);
                                        }
                                    }
                                }, 10)
                                timerWaiting = false;
                            }, 3000)

                            readyInterval = setInterval(() => {
                                ready.play();
                            }, 1000)
                            timerWaiting = true
                        }
                        

                        

                    break;
              

            }
        }

    };

    var onKeyUp = function (event) {

        switch (event.keyCode) {

            case 38: // up
            case 87: // w
                moveForward = false;
                break;

            case 37: // left
            case 65: // a
                moveLeft = false;
                break;

            case 40: // down
            case 83: // s
                moveBackward = false;
                break;

            case 39: // right
            case 68: // d
                moveRight = false;
                break;

        }

    };

    document.addEventListener('keydown', onKeyDown, false);
    document.addEventListener('keyup', onKeyUp, false);

    raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 10);
    raycasterGun = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 10);
    // animate();

}
function clearTargets(){
    for (let i = 0; i < collidableMeshListTargets.length; i++) {
        scene.remove(collidableMeshListTargets[i])
        
    }
    collidableMeshListTargets = [];
    clearInterval(timerInterval)
    // timer = 0;
}
function printTime(time){
    minutes = Math.floor(time/ 60)
    seconds = Math.floor(time) % 60;
    miliseconds = Math.floor((time - Math.floor(time)) * 100);
    printedTime = ''
    if(minutes < 10){
        printedTime += `0${minutes}:`
    }else{
        printedTime += `${minutes}:`
    }
    if(seconds < 10){
        printedTime += `0${seconds}.`
    }else{
        printedTime += `${seconds}.`
    }
    if (miliseconds < 10) {
        printedTime += `0${miliseconds}`
    }else{
        printedTime += `${miliseconds}`
    }

    return printedTime

}

function onResourcesLoaded() {
    //gun model
    objects['gun'] = models.gun.mesh.clone()
    objects['gun'].position.set(3, -3, -7);
    objects['gun'].rotation.set(Math.PI, 0, Math.PI);
    objects['gun'].scale.set(100, 100, 100);
    camera.add(objects['gun'])

    //fountain 
    objects['fountainRoundDetail'] = models.fountainRoundDetail.mesh.clone()
    objects['fountainRoundDetail'].position.set(150, 5, 145);
    objects['fountainRoundDetail'].rotation.set(Math.PI, 90, Math.PI * 3);
    objects['fountainRoundDetail'].scale.set(30, 30, 30)
    scene.add(objects['fountainRoundDetail'])

    //palm 
    objects['palmShort'] = models.palmShort.mesh.clone()
    objects['palmShort'].position.set(140, 5, 70);
    objects['palmShort'].rotation.set(Math.PI, 34, Math.PI * 3);
    objects['palmShort'].scale.set(2, 2, 2)
    scene.add(objects['palmShort'])

    objects['palmShort1'] = models.palmShort.mesh.clone()
    objects['palmShort1'].position.set(145, 5, 160);
    objects['palmShort1'].rotation.set(Math.PI, 90, Math.PI * 3);
    objects['palmShort1'].scale.set(3, 3, 3)
    objects['palmShort1'].castShadow = true;
    scene.add(objects['palmShort1'])

    objects['palmLong'] = models.palmLong.mesh.clone()
    objects['palmLong'].position.set(130, 5, 180);
    objects['palmLong'].rotation.set(Math.PI, 90, Math.PI * 3);
    objects['palmLong'].scale.set(3, 3, 3)
    scene.add(objects['palmLong'])
    objects['palmLong1'] = models.palmLong.mesh.clone()
    objects['palmLong1'].position.set(80, 5, 91);
    objects['palmLong1'].rotation.set(Math.PI, 90, Math.PI * 3);
    objects['palmLong1'].scale.set(2, 2, 2)
    scene.add(objects['palmLong1'])


    //lantern
    objects['lantern'] = models.lantern.mesh.clone()
    objects['lantern'].position.set(218, 5, 150);
    objects['lantern'].rotation.set(Math.PI, 90, Math.PI * 3);
    objects['lantern'].scale.set(25, 25, 25)
    scene.add(objects['lantern'])


    //stallGreen
    objects['stallGreen'] = models.stallGreen.mesh.clone()
    objects['stallGreen'].position.set(194, 5, 184);
    objects['stallGreen'].rotation.set(Math.PI, 90, Math.PI * 3);
    objects['stallGreen'].scale.set(25, 25, 25)
    scene.add(objects['stallGreen'])


    //tree
    objects['tree'] = models.tree.mesh.clone()
    objects['tree'].position.set(200, 5, 112);
    objects['tree'].rotation.set(Math.PI, 90, Math.PI * 3);
    objects['tree'].scale.set(25, 25, 25)
    scene.add(objects['tree'])


    objects['tree1'] = models.tree.mesh.clone()
    objects['tree1'].position.set(71, 5, 154);
    objects['tree1'].rotation.set(Math.PI, 90, Math.PI * 3);
    objects['tree1'].scale.set(30, 30, 30)
    scene.add(objects['tree1'])


    //cartHigh
    objects['cartHigh'] = models.cartHigh.mesh.clone()
    objects['cartHigh'].position.set(168, 5, 87);
    objects['cartHigh'].rotation.set(Math.PI, 90, Math.PI * 3);
    objects['cartHigh'].scale.set(25, 25, 25)
    scene.add(objects['cartHigh'])


    //tower
    objects['tower'] = models.tower.mesh.clone()
    objects['tower'].position.set(256, 5, 38);
    objects['tower'].rotation.set(Math.PI, 45, Math.PI * 3);
    objects['tower'].scale.set(3, 3, 3)
    scene.add(objects['tower'])
    //gate
    objects['wallNarrowGate'] = models.wallNarrowGate.mesh.clone()
    objects['wallNarrowGate'].position.set(130, 5, 31);
    objects['wallNarrowGate'].rotation.set(Math.PI, 30, Math.PI * 3);
    objects['wallNarrowGate'].scale.set(4, 4, 4)
    scene.add(objects['wallNarrowGate'])
    //tractor
    objects['tractorShovel'] = models.tractorShovel.mesh.clone()
    objects['tractorShovel'].position.set(54, 5, 236);
    objects['tractorShovel'].rotation.set(Math.PI, 5, Math.PI * 3);
    objects['tractorShovel'].scale.set(30, 30, 30)
    scene.add(objects['tractorShovel'])
    // cart
    objects['cart'] = models.cart.mesh.clone()
    objects['cart'].position.set(106, 5, 216);
    objects['cart'].rotation.set(Math.PI, 5, Math.PI * 3);
    objects['cart'].scale.set(30, 30, 30)
    scene.add(objects['cart'])
    //rock
    objects['rockLarge'] = models.rockLarge.mesh.clone()
    objects['rockLarge'].position.set(29, 5, 103);
    objects['rockLarge'].rotation.set(Math.PI, 5, Math.PI * 3);
    objects['rockLarge'].scale.set(30, 30, 30)
    scene.add(objects['rockLarge'])
    //portal
    objects['portal'] = models.portal.mesh.clone()
    objects['portal'].position.set(20, 5, 191);
    objects['portal'].rotation.set(Math.PI, 5, Math.PI * 3);
    objects['portal'].scale.set(4, 4, 4)
    scene.add(objects['portal'])

    //race car
    objects['race'] = models.race.mesh.clone()
    objects['race'].position.set(60, 5, 40);
    objects['race'].rotation.set(Math.PI, 90, Math.PI * 3);
    objects['race'].scale.set(30, 30, 30)
    objects['race'].castShadow = true;
    scene.add(objects['race'])
    //spacecraft
    objects['spaceCraft6'] = models.spaceCraft6.mesh.clone()
    objects['spaceCraft6'].position.set(248, 9, 248);
    objects['spaceCraft6'].rotation.set(Math.PI, 90, Math.PI * 3);
    objects['spaceCraft6'].scale.set(5, 5, 5)
    scene.add(objects['spaceCraft6'])
    //rockStall
    objects['rocksTallOre'] = models.rocksTallOre.mesh.clone()
    objects['rocksTallOre'].position.set(258, 5, 131);
    objects['rocksTallOre'].rotation.set(Math.PI, 90, Math.PI * 3);
    objects['rocksTallOre'].scale.set(5, 5, 5)
    scene.add(objects['rocksTallOre'])

    //satellite
    objects['satelliteDishLarge'] = models.satelliteDishLarge.mesh.clone()
    objects['satelliteDishLarge'].position.set(133, 5, 271);
    objects['satelliteDishLarge'].rotation.set(Math.PI, 3, Math.PI * 3);
    objects['satelliteDishLarge'].scale.set(5, 5, 5)
    scene.add(objects['satelliteDishLarge'])


    // let allObjects = Object.keys(objects)
    // for (let i = 1; i < allObjects.length; i++) {
    //     for (let j = 0; j < objects[allObjects[i]].children.length; j++) {
            
    //         collidableMeshListObjects.push(objects[allObjects[i]].children[j])
            
    //     }
    // }

    // console.log(objects)

    

    scene.traverse(function(element) {
        if (!(element instanceof THREE.AmbientLight)) {
            element.castShadow = true;
            element.receiveShadow = true;
        }
    })
console.log(objects['gun'])





    // scene.add(sphereBody)

}





function animate() {
    // if(RESOURCES_LOADED){
    requestAnimationFrame(animate);
   
    if (controls.isLocked === true) {



        if(camera.position.y < -150){
            camera.position.set(21, 25, 31)
        }

        // updatePhysics();




        raycaster.ray.origin.copy(controls.getObject().position);
        raycaster.ray.origin.y -= 10;


        raycasterGun.ray.origin.copy(controls.getObject().position);
        raycasterGun.ray.origin.z -= 10;
        raycasterGun.ray.origin.x -= 20;
        raycasterGun.ray.origin.y -= 0;





        var intersections = raycaster.intersectObjects([floorTop]);
        var intersectionsGun = raycasterGun.intersectObjects(collidableMeshListWalls);

        var onObject = intersections.length > 0;

        // if (intersectionsGun.length > 0)
        // {
        //     console.log("COLLSION")
        // }







        var time = performance.now();
        var delta = (time - prevTime) / 1000;

        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

        //down acceleration
        velocity.y -= 3; // 100.0 = mass

        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveRight) - Number(moveLeft);
        direction.normalize(); // this ensures consistent movements in all directions

        objects["gun"].position.set(
            objects["gun"].position.x,
            Math.sin(time / 5000 * Math.PI - 1) - 4,
            objects["gun"].position.z
        );


        //reload animation


        if (ammo === 0) {
            document.getElementsByClassName('ammo-box')[0].classList.remove('active-ammo')
            document.getElementsByClassName('ammo-box')[1].classList.add('active-ammo')

        }



        if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;



        if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;

        if (onObject === true) {

            velocity.y = Math.max(0, velocity.y);
            canJump = true;

        }

        controls.moveRight(-velocity.x * delta);
        controls.moveForward(-velocity.z * delta);

        controls.getObject().position.y += (velocity.y * delta); // new behavior

    

        for (let i = 0; i < bullets.length; i += 1) {
            if (bullets[i] === undefined) continue;
            if (bullets[i].alive == false) {
                bullets.splice(i, 1);
                continue;
            }
            collision(bullets[i])
            bullets[i].position.add(bullets[i].velocity);
        }


        prevTime = time;

    }else{
        //  controls.moveRight(0);
        //  controls.moveForward(0);
         moveRight, moveLeft, moveBackward, moveForward = false;
         velocity.x, velocity.y, velocity.z = 0;
    }


    render();
}

function collision(bullet) {
    var originPoint = bullet.position.clone();
    for (var vertexIndex = 0; vertexIndex < bullet.geometry.vertices.length; vertexIndex++) {
        var ray = new THREE.Raycaster(bullet.position, bullet.geometry.vertices[vertexIndex]);
        var collisionResults = ray.intersectObjects(collidableMeshListTargets);
        if (collisionResults.length > 0) {
            
            
            targetsLeft -= 1;
            document.getElementById('targets-left').innerHTML = targetsLeft;

            if(targetsLeft === 0){
                clearInterval(timerInterval)
                finish.play();
                if(record === 0){
                    record = timer
                    document.getElementById('record').innerHTML = printTime(record)
                }else{
                    if(timer < record){
                        record = timer;
                        document.getElementById('record').innerHTML = printTime(record)
                    }
                }
            }

            const index = collidableMeshListTargets.indexOf(collisionResults[0].object);
            if (index > -1) {
                collidableMeshListTargets.splice(index, 1);
            }
            scene.remove(collisionResults[0].object)
            targetHit.pause();
            targetHit.currentTime = 0;
            targetHit.play();
            bullet.alive = false;
            break;
        }


        var collisionResultsNotTargets = ray.intersectObjects(collidableMeshListObjects);
        if (collisionResultsNotTargets.length > 0) {
            bullet.alive = false;
        }
    }
}





function setTargets() {

    const targetImage = new THREE.TextureLoader().load('images/target.png')

    let target = new THREE.Mesh(
        new THREE.BoxGeometry(0.0001, 10, 9, 100),
        new THREE.MeshBasicMaterial({
            map: targetImage,
            wireframe: false,
            transparent: true,
            opacity: 1
        })
    )

    let targets = []
    //target1
    let target1 = target.clone()
    target1.position.set(246, 55, 20);
    target1.rotation.y = 2;
    targets.push(target1)
    //target2
    let target2 = target.clone()
    target2.position.set(128, 35, 42);
    target2.rotation.y = 3;
    targets.push(target2)
    //target3
    let target3 = target.clone()
    target3.position.set(39, 27, 106);
    target3.rotation.y = 2.8;
    targets.push(target3)
    //target4
    let target4 = target.clone()
    target4.position.set(45, 27, 256);
    target4.rotation.y = 7.5;
    targets.push(target4)
    //target5
    let target5 = target.clone()
    target5.position.set(140, 53, 213.5);
    target5.rotation.y = 7.5;
    targets.push(target5)
    //target6
    let target6 = target.clone()
    target6.position.set(216, 33, 151);
    target6.rotation.y = 13;
    targets.push(target6)
    //target7
    let target7 = target.clone()
    target7.position.set(264, 33, 158);
    target7.rotation.y = 6;
    targets.push(target7)
    //target8
    let target8 = target.clone()
    target8.position.set(82, 40, 155);
    target8.rotation.y = 6;
    targets.push(target8)
    //target9
    let target9 = target.clone()
    target9.position.set(284, 60, 67);
    target9.rotation.y = 84;
    targets.push(target9)
    //target10
    let target10 = target.clone()
    target10.position.set(246, 24, 248);
    target10.rotation.y = 84;
    targets.push(target10)


    targets.sort(() => Math.random() - 0.5);
    for (let i = 0; i < 5; i++) {
        scene.add(targets[i])
        collidableMeshListTargets.push(targets[i])
        
    }



}


function render() {
    // xyz.children[0].innerHTML = 'X:' + camera.position.x
    // xyz.children[1].innerHTML = 'Y:' + camera.position.y
    // xyz.children[2].innerHTML = 'Z:' + camera.position.z
    // controls.update(clock.getDelta());
    renderer.render(scene, camera);

}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix()
    
    renderer.setSize(window.innerWidth, window.innerHeight);

    // controls.handleResize();
}


window.addEventListener('resize', onWindowResize, false);

init();







//////