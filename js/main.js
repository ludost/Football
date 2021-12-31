
import * as bootstrap from 'bootstrap'
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { ArcballControls } from 'three/examples/jsm/controls/ArcballControls';
import { DragControls } from 'three/examples/jsm/controls/DragControls';
import { WEBGL } from 'three/examples/jsm/WebGL.js'
import { inbox, websocket } from './websocket'

inbox.addEventListener("websocket", (event) => {
    if (event.detail.open) {
        console.log("websocket opened.")
        websocket.sendEvent('viewer', { type: 'register', name: 'Ludo' })
        websocket.sendEvent('viewer', { type: 'getList' })
    }
})

if ( WEBGL.isWebGLAvailable() ) {
  const scene = new THREE.Scene();

  const dragPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  let mouse = new THREE.Vector2();
  let raycaster = new THREE.Raycaster();
  var intersects = new THREE.Vector3();
  const renderer = new THREE.WebGLRenderer();

  renderer.setSize( window.innerWidth, window.innerHeight );
  let viewport = document.getElementById("viewport")
  viewport.appendChild( renderer.domElement );
  viewport.addEventListener('mousemove', onMouseMove)

  const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 500 );
  camera.position.set( 0, 0, 175 );

  let dragObjects = []
  const drag = new DragControls( dragObjects, camera, renderer.domElement );

  const controls = new ArcballControls( camera, renderer.domElement, scene );
  controls.radiusFactor = 0.25
  controls.update()

  const light = new THREE.AmbientLight( 0xa0a0a0 ); // soft white light
  scene.add( light );
  const loader = new GLTFLoader();

  let url = new URL ( "../img/veldje.glb", import.meta.url)
  loader.load( url.href, function ( gltf ) {
    scene.add( gltf.scene );
  }, undefined, function ( error ) {
    console.error( error );
  } );

  let url2 = new URL ( "../img/markerRood.glb", import.meta.url)
  loader.load( url2.href, function ( gltf ) {
//    gltf.x = 45
    //   gltf.y = 10
    scene.add( gltf.scene );
    dragObjects.push(gltf.scene)
  }, undefined, function ( error ) {
    console.error( error );
  } );

  function animate() {
    requestAnimationFrame( animate );
    controls.update();
    renderer.render( scene, camera );
  }
  animate();

  drag.addEventListener( 'dragstart', function ( event ) {
    controls.enabled=false
    controls.setGizmosVisible(false)

  } );
  function onMouseMove(event){
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  }
  drag.addEventListener ( 'drag', function( event ){
    raycaster.setFromCamera(mouse, camera);
    raycaster.ray.intersectPlane(dragPlane, intersects);
    event.object.position.set(intersects.x, intersects.y, intersects.z);
  })
  drag.addEventListener( 'dragend', function ( event ) {
    controls.setGizmosVisible(true)
    controls.enabled=true
  } );
} else {
  const warning = WEBGL.getWebGLErrorMessage();
  document.getElementById( 'container' ).appendChild( warning );
}


