import { WEBGL } from 'three/examples/jsm/WebGL'
import * as THREE from 'three'
import { DragControls } from 'three/examples/jsm/controls/DragControls'
import { ArcballControls } from 'three/examples/jsm/controls/ArcballControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

//TODO: allow changing of target div for rendering
let viewRenderer = (()=>{
  const scene = new THREE.Scene();
  if ( WEBGL.isWebGLAvailable() ) {
  const dragPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  let mouse = new THREE.Vector2();
  let raycaster = new THREE.Raycaster();
  let intersects = new THREE.Vector3();
  const renderer = new THREE.WebGLRenderer();

  renderer.setSize( window.innerWidth, window.innerHeight );
  let viewport = document.getElementById("viewport")
  viewport.appendChild( renderer.domElement );
  viewport.addEventListener('mousemove', onMouseMove)

  const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 500 );
  camera.position.set( 0, 0, 175 );

  var dragableObjects = {
    dragObjects: [],
    mapping: {}
  }
  scene.addDragable = function (viewObj){
    dragableObjects.dragObjects.push(viewObj.mesh)
    dragableObjects.mapping[viewObj.mesh.id] = viewObj
  }
  const drag = new DragControls( dragableObjects.dragObjects , camera, renderer.domElement );

  const controls = new ArcballControls( camera, renderer.domElement, scene );
  controls.radiusFactor = 0.25
  controls.update()

  const light = new THREE.AmbientLight( 0xa0a0a0 ); // soft white light
  scene.add( light );
  const loader = new GLTFLoader();

  scene.metaUrl = import.meta.url
  let url = new URL ( "../img/veldje.glb", import.meta.url)
  loader.load( url.href, function ( gltf ) {
    scene.add( gltf.scene );
    //console.log(gltf)
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
    raycaster.setFromCamera(mouse, camera)
    raycaster.ray.intersectPlane(dragPlane, intersects)
    event.object.position.set(intersects.x, intersects.y, intersects.z)
    if (dragableObjects.mapping.hasOwnProperty(event.object.id)){
      dragableObjects.mapping[event.object.id].setPositionFromScene(intersects.x, intersects.y)
    } else {
      console.error("Dragable object missing position method.",event.object, dragableObjects.mapping)
    }
  })
  drag.addEventListener( 'dragend', function ( event ) {
    controls.setGizmosVisible(true)
    controls.enabled=true
  } );
} else {
  const warning = WEBGL.getWebGLErrorMessage();
  document.getElementById( 'container' ).appendChild( warning );
}
return {
  scene: scene
}
})()

module.exports=viewRenderer
