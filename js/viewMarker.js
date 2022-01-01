import { viewObj, conv } from './viewObject'

let Marker = function(exportObj){
  if (typeof exportObj == "undefined"){
    exportObj = viewObj()
  }
  exportObj.remote.type = "marker"
  exportObj.local.glTF = new URL ( "../img/markerRood.glb", import.meta.url)
  exportObj.local.dragable = true
  return exportObj
}
conv.add("marker", Marker)
module.exports = { Marker: Marker}
