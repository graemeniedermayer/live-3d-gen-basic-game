
import { Clock, Vector3, Group, Raycaster, Vector2 } from 'three'
import { reversePainterSortStable} from '@pmndrs/uikit'
// import { camera, scene, canvas, renderer } from 'threeObjs'
import {intersect_objects, static_path} from './globals.js'
import {signal} from "@preact/signals-core"
// import {inventory_template, character_template, item_template} from './templates.js'
import {Inventory_Panel, Tab_Panel, Build_Character_Panel, Build_Equipment_Panel, equipment_panel, Stats_Panel} from './ui_components/ui_components.js'
import {char_list} from './examples/char_list.js'
import {inventory_list} from './examples/inventory_list.js'
import {item_list} from './examples/item_list.js'


class ui_class{
  constructor(character){

    this.clock = new Clock()

    origin = new Vector3(0,0,-1.4)
    this.origin = origin
    // inventory
    // active inventory with models

    // UI signals
    
    character.setupEquipSignals()
    this.character = character 
    globalThis.global_signals = {}
    global_signals['inventory'] = signal('none')
    // global_signals["left_hand_equip"] = character.left_hand_equip
    global_signals["hand_equip"] = character.hand_equip
    global_signals["paused"] = new signal(false)
    global_signals["ui_signal"] = new signal("open_inventory")
    global_signals["item_editor_type"] = signal("sword")
    global_signals['load_char_item'] = signal('none')
    global_signals['load_char_char'] = signal('none')
    global_signals['load_image_item'] = signal('none')
    global_signals['load_image_char'] = signal('none')


    scene = globalThis.scene
    camera = globalThis.camera
    renderer = globalThis.renderer
    
    let stats_panel_ui  = new Stats_Panel(camera, renderer, origin, char_list[0])
    stats_panel_ui.setup_signal(global_signals['ui_signal'])
    scene.add(stats_panel_ui.panel)
    
    // TODO temp
    inventory_list[0].all_items = inventory_list[0].all_items.map(x=> x!==0 ? item_list[x-1] : 0)
    let inventory_panel_ui = new Inventory_Panel(camera, renderer, origin, inventory_list[0])
    inventory_panel_ui.setup_signal(global_signals['ui_signal'])
    scene.add(inventory_panel_ui.panel)
    
    let edit_char_panel_ui = new Build_Character_Panel(camera, renderer, origin)
    edit_char_panel_ui.setup_signal(global_signals['ui_signal'])
    scene.add(edit_char_panel_ui.panel)
    
    let edit_item_panel_ui = new Build_Equipment_Panel(camera, renderer, origin)
    edit_item_panel_ui.setup_signal(global_signals['ui_signal'])
    scene.add(edit_item_panel_ui.panel)
    
    let tab_panel_ui  = new Tab_Panel(camera, renderer, origin, global_signals['ui_signal'], character)
    tab_panel_ui.setup_signal()
    scene.add(tab_panel_ui.panel)

    this.stats_panel_ui = stats_panel_ui
    this.inventory_panel_ui = inventory_panel_ui
    this.edit_item_panel_ui = edit_item_panel_ui
    this.edit_char_panel_ui = edit_char_panel_ui
    this.tab_panel_ui = tab_panel_ui
    
    this.prev = null
    // UI specific?
    const raycaster = new Raycaster();
    globalThis.raycaster = raycaster
    const pointer = new Vector2();
    const intersect_active_items = []
    
    this.controller1 = null
    this.controller2 = null
    this.intersectObjects = ()=>{}
    
    let ray_element = document.getElementById('raycasting_element')
    document.body.addEventListener('focusin', (e) => {
        if (e.target === ray_element) {
            console.log('stop')
          e.relatedTarget ? e.relatedTarget.focus() : e.target.blur();
        }
      });
      
    function updateSize() {
      globalThis.renderer.setSize(window.innerWidth, window.innerHeight)
      globalThis.renderer.setPixelRatio(window.devicePixelRatio)
      globalThis.camera.aspect = window.innerWidth / window.innerHeight
      globalThis.camera.updateProjectionMatrix()
    }
    
    updateSize()
    window.addEventListener('resize', updateSize)
    
    if( !navigator.userAgent.includes('Quest 3') ){
        function onPointerDown( event ) {
          // calculate pointer position in normalized device coordinates
          // (-1 to +1) for both components
            updateSize()
          pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
          pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
           // update the picking ray with the camera and pointer position
           raycaster.setFromCamera( pointer, camera );
           // calculate objects intersecting the picking ray
           const intersects = raycaster.intersectObjects( intersect_objects );
           for ( let i = 0; i < intersects.length; i ++ ) {
                try{
                    intersects[i].object.parent.dispatchEvent({ type: 'pointerover', target: intersects[i].object.parent , pointerId: 1 })
                    intersects[i].object.parent.dispatchEvent({ type: 'click', target: intersects[i].object.parent , pointerId: 1 })
                    // clone into a 
                    // add item to holder push to interact_active_item
                }catch(e){
                }
            }         
        }
    
        function onPointerMove( event ){
          const floor_intersect = raycaster.intersectObjects( [globalThis.floor_plane] );
           for ( let i = 0; i < intersects.length; i ++ ) {
            
            try{
                intersects[0].object.parent.dispatchEvent({ type: 'pointerover', target: intersects[i].object.parent , pointerId: 1 })
                intersects[0].object.parent.dispatchEvent({ type: 'click', target: intersects[i].object.parent , pointerId: 1 })

                // clone into a 
                // add item to holder push to interact_active_item
            }catch(e){
            }
        }
            // 
        }
        function onPointerUp( event ){
            // 
        }
    
        window.addEventListener( 'mousedown', onPointerDown );
        window.addEventListener( 'mouseup', onPointerUp );
        // window.addEventListener( 'touchstart', onPointerDown );
        // window.addEventListener( 'touchmove', onPointMove)
        // window.addEventListener( 'touchend', onPointerUp );
    }
    
  }

  xr_start(){
    try{
      //TODO hacky this is for file uploads
      document.getElementById('root').remove()
    }catch(e){}
    if( navigator.userAgent.includes('Quest 3') ){
        import('./quest_controllers.js')
        .then( (mod)=>{
            this.controller1 = mod.controller1
            this.controller2 = mod.controller2

            this.intersectObjects = mod.intersectObjects
        })
      
    }
  }

  update(time, this_) {
    let prev = this_.prev
    const delta = prev == null ? 0 : time - prev
    prev = time
    origin = this_.origin
    camera = globalThis.camera
    scene = globalThis.scene
    renderer = globalThis.renderer

    // if (this_.character.mixer && !global_signals["paused"].value) {
    //   this_.character.mixer.update(this_.clock.getDelta());
    // }
    let pos_angle = Math.PI/2 + Math.atan2(origin.z - camera.position.z, origin.x - camera.position.x) 
    
    this_.stats_panel_ui.animate(delta, time, pos_angle)
    this_.inventory_panel_ui.animate(delta, time, pos_angle)
    this_.edit_item_panel_ui.animate(delta, time, pos_angle)
    this_.edit_char_panel_ui.animate(delta, time, pos_angle)
    this_.tab_panel_ui.animate(delta, time, pos_angle)
  
    if(this_.controller1){
      this_.intersectObjects( this_.controller1 );
    }
    if(this_.controller2){
      this_.intersectObjects( this_.controller2 );
    }
  
  }
}

export {ui_class}