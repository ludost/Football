import { viewObj, conv } from './viewObject'

let Marker = function(exportObj){
  if (typeof exportObj == "undefined"){
    exportObj = viewObj()
  }
  exportObj.remote.type = "marker"
  exportObj.local.glTF = new URL ( "../img/marker.glb", import.meta.url)
  exportObj.local.draggable = true
  return exportObj
}
conv.add("marker", Marker)
module.exports = { Marker: Marker}
