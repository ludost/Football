
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
marker.local.addToScene(webGLRenderer.scene)
marker.local.setPosition(-35,-20)

let marker2 = new Marker()
marker2.remote.color="Blue"
marker2.local.addToScene(webGLRenderer.scene)
marker2.local.setPosition(35,20)


