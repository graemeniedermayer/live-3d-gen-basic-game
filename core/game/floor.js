import {PlaneGeometry, ShadowMaterial, MeshStandardMaterial, Mesh} from 'three'

const geometry = new PlaneGeometry( 20, 20 );
geometry.rotateX( - Math.PI / 2 );

const material = new ShadowMaterial();
// const material = new MeshStandardMaterial();
material.opacity = 0.4;
// floor
const floor_plane = new  Mesh( geometry, material );
floor_plane.scale.y = 0.1;
floor_plane.scale.x = 6;
floor_plane.scale.z = 6;
floor_plane.position.y = 0.02;
floor_plane.receiveShadow = true;
globalThis.floor_plane = floor_plane
export { floor_plane }