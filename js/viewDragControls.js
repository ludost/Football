import { Euler, EventDispatcher, Plane, Raycaster, Vector2, Vector3 } from 'three'

const _raycaster = new Raycaster()
const _plane = new Plane(new Vector3(0, 0, 1), 0)
const _pointer = new Vector2()
const _unitVector = new Vector3( 0, 1, 0)
const _intersection = new Vector3()

class ViewDragControls extends EventDispatcher {

  constructor (_viewObjects, _camera, _domElement) {

    super()

    function searchMapping (mesh) {
      let found = _viewObjects.find((object) => object.mesh.uuid === mesh.uuid)
      if (typeof found != 'undefined') {
        return found
      }
      if (typeof mesh.parent == 'undefined') {
        return undefined
      }
      return searchMapping(mesh.parent)
    }

    _domElement.style.touchAction = 'none' // disable touch scroll
    let _selected = null, _hovered = null
    const _intersections = []
    const scope = this

    function activate () {
      _domElement.addEventListener('pointermove', onPointerMove)
      _domElement.addEventListener('pointerdown', onPointerDown)
      _domElement.addEventListener('pointerup', onPointerCancel)
      _domElement.addEventListener('pointerleave', onPointerCancel)
    }

    function deactivate () {
      _domElement.removeEventListener('pointermove', onPointerMove)
      _domElement.removeEventListener('pointerdown', onPointerDown)
      _domElement.removeEventListener('pointerup', onPointerCancel)
      _domElement.removeEventListener('pointerleave', onPointerCancel)
      _domElement.style.cursor = ''
    }

    function dispose () {
      deactivate()
    }

    function getObjects () {
      return _viewObjects.map((object) => object.mesh)
    }

    function getRaycaster () {
      return _raycaster
    }

    function onPointerMove (event) {

      if (scope.enabled === false) return

      updatePointer(event)
      _raycaster.setFromCamera(_pointer, _camera)

      if (_selected) {
        let viewObj = searchMapping(_selected)
        if (typeof _selected.material !== "undefined" && _selected.material.name === "Arrow"){
          if (_raycaster.ray.intersectPlane(_plane, _intersection)) {
            let vector = _intersection.sub(viewObj.mesh.position)
            viewObj.mesh.rotation.set(0,0,-Math.atan2(vector.x,vector.y),"XYZ")
          }
        } else {
          if (_raycaster.ray.intersectPlane(_plane, _intersection)) {
            viewObj.mesh.position.copy(_intersection)
          }
        }
        scope.dispatchEvent({ type: 'drag', object: viewObj })
        return
      }

      // hover support
      if (event.pointerType === 'mouse' || event.pointerType === 'pen') {
        _intersections.length = 0
        _raycaster.setFromCamera(_pointer, _camera)
        _raycaster.intersectObjects(_viewObjects.map((object) => object.mesh), true, _intersections)
        if (_intersections.length > 0) {
          const object = _intersections[0].object
          if (_hovered !== object && _hovered !== null) {
            scope.dispatchEvent({ type: 'hoveroff', object: _hovered })
            _domElement.style.cursor = 'auto'
            _hovered = null
          }

          if (_hovered !== object) {
            scope.dispatchEvent({ type: 'hoveron', object: object })
            _domElement.style.cursor = 'pointer'
            _hovered = object
          }
        } else {
          if (_hovered !== null) {
            scope.dispatchEvent({ type: 'hoveroff', object: _hovered })
            _domElement.style.cursor = 'auto'
            _hovered = null
          }
        }
      }
    }

    function onPointerDown (event) {
      if (scope.enabled === false) return
      updatePointer(event)
      _intersections.length = 0
      _raycaster.setFromCamera(_pointer, _camera)
      _raycaster.intersectObjects(_viewObjects.map((object) => object.mesh), true, _intersections)
      if (_intersections.length > 0) {
        _selected = (scope.transformGroup === true) ? _viewObjects.map((object) => object.mesh)[0] : _intersections[0].object
        _domElement.style.cursor = 'move'
        scope.dispatchEvent({ type: 'dragstart', object: _selected })
      }
    }

    function onPointerCancel () {
      if (scope.enabled === false) return
      if (_selected) {
        scope.dispatchEvent({ type: 'dragend', object: _selected })
        _selected = null
      }
      _domElement.style.cursor = _hovered ? 'pointer' : 'auto'
    }

    function updatePointer (event) {
      const rect = _domElement.getBoundingClientRect()
      _pointer.x = (event.clientX - rect.left) / rect.width * 2 - 1
      _pointer.y = -(event.clientY - rect.top) / rect.height * 2 + 1
    }

    activate()

    // API
    this.enabled = true
    this.transformGroup = false

    this.activate = activate
    this.deactivate = deactivate
    this.dispose = dispose
    this.getObjects = getObjects
    this.getRaycaster = getRaycaster
  }
}

export { ViewDragControls }
