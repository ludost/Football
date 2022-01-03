import { v4 as uuid } from 'uuid'
import * as THREE from 'three'
//import { inbox, websocket } from '/websocket'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

let converter = {
  myList:{},
  convert: function (obj){
     let constr = this.myList(obj.type)
     return new constr(obj)
  },
  add: function (type,objConstr){
     this.myList[type]=objConstr
  }
}

function getMaterials(mesh,filter){
   let materials = []
   if (Array.isArray(mesh.children) && mesh.children.length > 0){
      mesh.children.forEach((child)=> {
        materials=materials.concat(getMaterials(child, filter))
      })
   }
   if (typeof mesh.material !== "undefined" ){
      let material = mesh.material
      if (typeof filter == "undefined" || filter.includes(mesh.material.name)){
         materials.push(material)
      }
   }
   return materials
}

let ViewObject = function(){
  let local = {
    scene: undefined,
    mesh: undefined,
    draggable:false,
    glTF:undefined,
    addToScene: function (scene){
      if (this.glTF !== undefined){
        let me = this
        const loader = new GLTFLoader()
        loader.load( this.glTF.href, function ( gltf ) {
          me.scene = scene
          me.mesh = gltf.scene
          me.mesh.position.set(remote.position.x,remote.position.y,0)
          me.mesh.rotation.set(0,0,remote.heading,"XYZ")
          let materials = getMaterials(me.mesh,["Border","Main"])
          materials.forEach((material) => {
              switch (material.name) {
                case "Border":
                  if (remote.border !== "") {
                    material.color = new THREE.Color(remote.border)
                  }
                  break
                case "Main":
                  if (remote.color !== "") {
                    material.color = new THREE.Color(remote.color)
                  }
                  break
              }
          })
          me.scene.add( gltf.scene )
          if (me.draggable){ me.scene.addDraggable(me) }
        }, undefined, function ( error ) {
          console.error( error )
        } );
      }
    },
    setPositionFromScene: function (x,y){
      remote.position = {x: x, y: y}
      publish()
    },
    setPosition: function (x, y){
      remote.position = {x: x, y: y}
      if (typeof this.mesh != "undefined") {
        this.mesh.position.set(x, y, 0)
      }
    },
    setHeadingFromScene: function (a){
      remote.heading = a
      publish()
    },
    setHeading: function (a){
      remote.heading = a
      if (typeof this.mesh != "undefined") {
        this.mesh.rotation.set(0, 0, a, "XYZ")
      }
    }
  }
  let displayStyle = {
    displayMode:"plain", //plain|image|arrow|name
    label:false,
    arrow:false,
    numbered:false
  }
  let remote = {
    objId: uuid(),
    update: 0,
    type:"generic",  //player|ball|marker|arrow|area
    name: "",
    number:0,
    image:undefined,
    border:"",
    color:"",
    position:{x:0.0,y:0.0},
    heading:0.0,
    speed:0.0
  }
  let publish = function(){
    //send remote data to server, for performance create "subset data"?
    //rate limitexportObj = viewObj()
    console.log(remote.position, remote.heading)
  }
  return { local: local, display: displayStyle, remote: remote}
}
module.exports = { viewObj: ViewObject, conv: converter }
