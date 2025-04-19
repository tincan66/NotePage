import { MOUSE, TOUCH } from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// MapControls performs orbiting, dollying (zooming), and panning.
// Unlike TrackballControls, it maintains the "up" direction object.up (+Y by default).
//
//    Orbit - right mouse, or left mouse + ctrl/meta/shiftKey / touch: two-finger rotate
//    Zoom - middle mouse, or mousewheel / touch: two-finger spread or squish
//    Pan - left mouse, or arrow keys / touch: one-finger move

class CameraControls extends OrbitControls {

	constructor( object, domElement ) {

		super( object, domElement );

		this.screenSpacePanning = true; // pan orthogonal to world-space direction camera.up

		this.mouseButtons = { MIDDLE: MOUSE.PAN};

		this.touches = { ONE: TOUCH.PAN, TWO: TOUCH.DOLLY_ROTATE };

	}

}

export { CameraControls };
