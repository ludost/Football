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

let ViewObject = function(){
  let local = {
    scene: undefined,
    mesh: undefined,
    dragable:false,
    glTF:undefined,
    addToScene: function (scene){
      if (this.glTF !== undefined){
        let me = this
        const loader = new GLTFLoader()
        loader.load( this.glTF.href, function ( gltf ) {
          me.scene = scene
          me.mesh = gltf.scene.children[0]
          me.mesh.position.set(remote.position.x,remote.position.y,0)
          me.mesh.material.color = new THREE.Color(remote.color)
          me.scene.add( gltf.scene )
          console.log(me.mesh)
          if (me.dragable){ me.scene.addDragable(me) }
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
    border:"red",
    color:"red",
    position:{x:0.0,y:0.0},
    heading:0.0,
    speed:0.0
  }
  let publish = function(){
    //send remote data to server, for performance create "subset data"?
    //rate limitexportObj = viewObj()
    console.log(remote.position)
  }
  return { local: local, display: displayStyle, remote: remote}
}
module.exports = { viewObj: ViewObject, conv: converter }
