
import * as bootstrap from 'bootstrap'
import { inbox, websocket } from './websocket'
import * as webGLRenderer from './viewRenderer'
import { Marker } from './viewMarker'

inbox.addEventListener("websocket", (event) => {
    if (event.detail.open) {
        console.log("websocket opened.")
        websocket.sendEvent('viewer', { type: 'register', name: 'Ludo' })
        websocket.sendEvent('viewer', { type: 'getList' })
    }
})

let lineup = {
  //contains objects with link to lineup?

}

let marker = new Marker()
marker.remote.color="DarkTurquoise"
marker.remote.border="dodgerBlue"
marker.local.addToScene(webGLRenderer.scene)
marker.local.setPosition(-5,5)

let marker2 = new Marker()
marker2.remote.color="darkseagreen"
marker2.remote.border="green"
marker2.local.addToScene(webGLRenderer.scene)
marker2.local.setPosition(5,5)
marker2.local.setHeading(Math.PI/3)

let marker3 = new Marker()
marker3.remote.color="IndianRed"
marker3.remote.border="FireBrick"
marker3.local.setHeading(Math.PI)
marker3.local.addToScene(webGLRenderer.scene)
marker3.local.setPosition(0,5)


let marker4 = new Marker()
marker4.local.addToScene(webGLRenderer.scene)


window.mainExports = {
  renderer: webGLRenderer,
  markers: [ marker, marker2]
}
