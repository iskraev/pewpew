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



let scene, camera, renderer, cube, controls, ambientLight



var raycaster;

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
// var clock = new THREE.Clock();


let loadingManager = null;
let RESOURCES_LOADED = false;

const models = {
    gun: {
        obj: 'models/Models/pistolSilencer.obj',
        mtl: 'models/Models/pistolSilencer.mtl',
        mesh: null,
        castShadow: false
    }

}

const objects = {};


//main initiazlie function
function init() {

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
        90,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    //camera position
    camera.position.set(10, 10, -5)
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);



    loadingManager = new THREE.LoadingManager();
    loadingManager.onLoad = function () {
        RESOURCES_LOADED = true;

        onResourcesLoaded();
    }



    

    for (var _key in models) {
        (function (key) {

            var mtlLoader = new MTLLoader(loadingManager);
            mtlLoader.load(models[key].mtl, function (materials) {
                materials.preload();

                var objLoader = new OBJLoader(loadingManager);

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

    const geometry = new THREE.BoxGeometry(1, 1, 1);

    const textureFloor = new THREE.TextureLoader().load('./grass.jpg')
    let floor = new THREE.Mesh(
        new THREE.PlaneGeometry(10, 10, 10, 10),
        new THREE.MeshBasicMaterial({
            map: textureFloor,
            wireframe: false
        })
    )



    for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {

            let floorPart = floor.clone();
            floorPart.position.set(i * 10, 0, j * 10)
            floorPart.rotation.x -= Math.PI / 2;
            floorPart.rotation.z -= Math.PI * Math.floor((Math.random() * 4) + 1)
            scene.add(floorPart)


        }

    }



    /////////////////////////








    const texture = new THREE.TextureLoader().load('./back.jpg')




    const material = new THREE.MeshBasicMaterial({
        map: texture
    });
    cube = new THREE.Mesh(geometry, material);
    // scene.add(cube);













    //objects


    ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);



    // camera.position.z = 50;

    controls = new PointerLockControls(camera, renderer.domElement);

    document.addEventListener('click', () => {
        controls.lock();
    })

    controls.addEventListener('lock', function () {

        // instructions.style.display = 'none';
        // blocker.style.display = 'none';

    });

    controls.addEventListener('unlock', function () {

        // blocker.style.display = 'block';
        // instructions.style.display = '';

    });

    scene.add(controls.getObject());

    var onKeyDown = function (event) {

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
                if (canJump === true) velocity.y += 200;
                canJump = false;
                break;

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
    // controls.movementSpeed = 4;
    // controls.lookSpeed = 0.5;
    // controls.lookVertical = true;
    // controls.constrainVertical = false;
    // controls.verticalMin = 1.1;
    // controls.verticalMax = 2.2;

    animate();

}



function onResourcesLoaded() {
    objects['gun'] = models.gun.mesh

    objects['gun'].position.set(3, -3, -6);
    objects['gun'].rotation.set(Math.PI, 0, Math.PI);
    objects['gun'].scale.set(100, 100, 100);
    camera.add(objects['gun'])
}








function animate() {
    // if(RESOURCES_LOADED){
    requestAnimationFrame(animate);

    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;



    if (controls.isLocked === true) {

        raycaster.ray.origin.copy(controls.getObject().position);
        raycaster.ray.origin.y -= 10;

        var intersections = raycaster.intersectObjects(objects);

        var onObject = intersections.length > 0;

        var time = performance.now();
        var delta = (time - prevTime) / 1000;

        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

        velocity.y -= 9.8 * 65.0 * delta; // 100.0 = mass

        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveRight) - Number(moveLeft);
        direction.normalize(); // this ensures consistent movements in all directions

        objects["gun"].position.set(
            objects["gun"].position.x,
            Math.sin(time / 5000 * Math.PI - 1) - 3,
            objects["gun"].position.z
        );

        if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;
        if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;

        if (onObject === true) {

            velocity.y = Math.max(0, velocity.y);
            canJump = true;

        }

        controls.moveRight(-velocity.x * delta);
        controls.moveForward(-velocity.z * delta);

        controls.getObject().position.y += (velocity.y * delta); // new behavior

        if (controls.getObject().position.y < 10) {

            velocity.y = 0;
            controls.getObject().position.y = 10;

            canJump = true;

        }
       
        // objects["gun"].position.set(
        //     camera.position.x - Math.sin(camera.rotation.y + Math.PI / 6) * 10,
        //     camera.position.y,
        //     camera.position.z + Math.cos(camera.rotation.y + Math.PI / 6) * 10
        // );
        

        prevTime = time;

    }


    render();
    // }










}

function render() {

    // controls.update(clock.getDelta());
    renderer.render(scene, camera);

}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight);

    // controls.handleResize();
}


window.addEventListener('resize', onWindowResize, false)

window.onload = init;