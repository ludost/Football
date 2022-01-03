import { WEBGL } from 'three/examples/jsm/WebGL'
import * as THREE from 'three'
import { ViewDragControls } from './viewDragControls'
import { ArcballControls } from 'three/examples/jsm/controls/ArcballControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

function addInfra (url, loader, scene) {
   loader.load(url.href, function (gltf) {
    scene.add(gltf.scene)
    //console.log(gltf)
  }, undefined, function (error) {
    console.error(error)
  })
}

//TODO: allow changing of target div for rendering
let viewRenderer = (() => {
  const scene = new THREE.Scene()
  let controls = undefined
  if (WEBGL.isWebGLAvailable()) {
    let mouse = new THREE.Vector2()
    const renderer = new THREE.WebGLRenderer()

    renderer.setSize(window.innerWidth, window.innerHeight)
    let viewport = document.getElementById('viewport')
    viewport.appendChild(renderer.domElement)
    viewport.addEventListener('mousemove', onMouseMove)

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 10, 500)
    scene.add(camera)
    camera.position.set(0, 0, 175)

    /*
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial( { color: 0x0040ff } );
    const cube = new THREE.Mesh( geometry, material );
    camera.add(cube)
    cube.position.set(20,0, -50)
    console.log(cube,camera)
    */

    const draggableObjects = []
    scene.addDraggable = function (viewObj) {
      draggableObjects.push(viewObj)
    }
    const drag = new ViewDragControls(draggableObjects, camera, renderer.domElement)

    controls = new ArcballControls(camera, renderer.domElement, scene)
    controls.radiusFactor = 0.25
    controls.update()

    const light = new THREE.AmbientLight(0xe0e0e0, 2) // soft white light
    scene.add(light)
    renderer.gammaOutput = true
    renderer.gammaFactor = 2.4
    renderer.physicallyCorrectLights = true
    const loader = new GLTFLoader()

    scene.metaUrl = import.meta.url

    addInfra(new URL('../img/veldje.glb', import.meta.url), loader, scene)
    addInfra(new URL('../img/doelen.glb', import.meta.url), loader, scene)
    addInfra(new URL('../img/vlaggen.glb', import.meta.url), loader, scene)

    function animate () {
      requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }

    animate()

    drag.addEventListener('dragstart', function (event) {
      controls.enabled = false
      controls.setGizmosVisible(false)
    })

    function onMouseMove (event) {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
    }

    drag.addEventListener('drag', function (event) {
      event.object.setPositionFromScene(event.object.mesh.position.x, event.object.mesh.position.y)
      event.object.setHeadingFromScene(event.object.mesh.rotation.z)
    })
    drag.addEventListener('dragend', function (event) {
      controls.setGizmosVisible(true)
      controls.enabled = true
    })
  } else {
    const warning = WEBGL.getWebGLErrorMessage()
    document.getElementById('container').appendChild(warning)
  }
  return {
    scene: scene,
    controls: controls
  }
})()

module.exports = viewRenderer
