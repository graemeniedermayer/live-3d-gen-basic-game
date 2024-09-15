import {Vector3, BufferGeometry, Line, Raycaster} from "three"

let geometry = new BufferGeometry().setFromPoints( [ new Vector3( 0, 0, 0 ), new Vector3( 0, 0, - 1 ) ] );
const line = new Line( geometry );
line.name = 'line';
line.scale.z = 5;

let controller1 = renderer.xr.getController( 0 );
controller1.addEventListener( 'selectstart', onSelectStart );
controller1.addEventListener( 'selectend', onSelectEnd );
controller1.addEventListener( 'connected', (e) => {
    console.log(e)
    globalThis.questController1.gamepad = e.data.gamepad
})
controller1.add( line.clone() );
scene.add( controller1 );

let controller2 = renderer.xr.getController( 1 );
controller2.addEventListener( 'selectstart', onSelectStart );
controller2.addEventListener( 'selectend', onSelectEnd );
controller2.addEventListener( 'connected', (e) => {
    globalThis.questController2.gamepad = e.data.gamepad

})
controller2.add( line.clone() );
scene.add( controller2 );

globalThis.questController1 = controller1
globalThis.questController2 = controller2


let quest_raycaster = new Raycaster()
// intersections
function getIntersections( controller ) {
    controller.updateMatrixWorld();
    quest_raycaster.setFromXRController( controller );
    return quest_raycaster.intersectObjects( intersect_objects );
}

function onSelectStart( event ) {
    const controller = event.target;
    const intersects = getIntersections( controller );
    console.log(intersects)
    for ( let i = 0; i < intersects.length; i ++ ) {
        try{
            intersects[i].object.parent.dispatchEvent({ type: 'pointerover', target: intersects[i].object.parent , pointerId: 1 })
            intersects[i].object.parent.dispatchEvent({ type: 'click', target: intersects[i].object.parent , pointerId: 1 })

            // clone into a 
            // add item to holder push to interact_active_item
        }catch(e){
        }
    }
    controller.userData.targetRayMode = event.data.targetRayMode;
}

function onSelectEnd( event ) {
    const controller = event.target;
    // if ( controller.userData.selected !== undefined ) {
    //     controller.userData.selected == undefined
    // }
}

function intersectObjects( controller ) {
    // Do not highlight in mobile-ar
    if ( controller.userData.targetRayMode === 'screen' ) return;
    // Do not highlight when already selected
    // if ( controller.userData.selected !== undefined ) return;
    const line = controller.getObjectByName( 'line' );
    const intersections = getIntersections( controller );
    if ( intersections.length > 0 ) {
        const intersection = intersections[ 0 ];
        const object = intersection.object;
        line.scale.z = intersection.distance;
    } else {
        line.scale.z = 5;
    }
}
console.log('quest i')

export {controller1, controller2, intersectObjects}

