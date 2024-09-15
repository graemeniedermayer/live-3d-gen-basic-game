import { reversePainterSortStable, Container, Root, Text, Image } from '@pmndrs/uikit'
import { objectMeshRequest, characterMeshRequest, characterMeshMaskRequest, imageRequest} from "../requests/auto1111.js"
import { loadImageString, cropImageUrltoBase64, meshToImageUrl} from '../loaders.js'
// TODO three shouldn't be here
import { Group } from 'three'
import { effect } from "@preact/signals-core";
import { stats_pair, row_container, item_container, item_pair } from './extras.js'
import { input_container } from "./input.js";
import { button_container } from "./button.js";
import { radio_container } from "./radio.js";
import { static_path } from '../globals.js'
import { remove_children } from '../util.js'
// This file contains the menu UI

const defaultProperties = {
    backgroundOpacity: 0.5,
    transformTranslateZ: -40,
    transformTranslateY: -125,
    transformTranslateX: 25,
}

class Tab_Panel{
    constructor(camera, renderer, origin, signal, character){
        let panel = new Root(camera, renderer,  {
            flexDirection: 'row',
            gap: 10,
            width: 400,
            // flexGrow: 1,
            margin: 2,
            borderRadius:3,
            borderRadius: 4,
            padding: 3,
            alignItems: 'center',
            transformTranslateZ: 20 + 100 * origin.z,
            transformTranslateY: -175,
            transformTranslateX: 0,
            transformRotateX: 0,
            transformScale: 0.2,
          //   backgroundColor: '',
            // overflow: 'scroll',
        })
        
        let inventoryButton =  new Container(
            panel,
            {
                flexDirection: 'row',
                flexGrow: 1,
                width: 60,
                height: 60,
                backgroundColor: "#eeeeff",
                hover: { backgroundOpacity: 0.6 },
            },
            defaultProperties)

        let editCharButton =  new Container(
            panel,
            {
                flexDirection: 'row',
                flexGrow: 1,
                width: 60,
                height: 60,
                backgroundColor: "#eeffee",
                hover: { backgroundOpacity: 0.6 },
            },
            defaultProperties)

        let editItemButton =  new Container(
            panel,
            {
                flexDirection: 'row',
                flexGrow: 1,
                width: 60,
                height: 60,
                backgroundColor: "#ffeeee",
                hover: { backgroundOpacity: 0.6 },
            },
            defaultProperties)

        let closeButton =  new Container(
            panel,
            {
                flexDirection: 'row',
                flexGrow: 1,
                width: 60,
                height: 60,
                backgroundColor: "#eeeeee",
                hover: { backgroundOpacity: 0.6 },
            },
            defaultProperties)

        let pauseButton =  new Container(
            panel,
            {
                flexDirection: 'row',
                flexGrow: 1,
                width: 60,
                height: 60,
                backgroundColor: "#eeeeee",
                hover: { backgroundOpacity: 0.6 },
            },
            defaultProperties)

        this.character = character
        let tab_objects = []
        tab_objects.push(inventoryButton)
        tab_objects.push(editCharButton)
        tab_objects.push(editItemButton)
        tab_objects.push(pauseButton)
        tab_objects.push(closeButton)
        inventoryButton.add( new Text('Inv', { fontSize: 20, flexShrink: 0 }) )
        editCharButton.add( new Text('Char', { fontSize: 20, flexShrink: 0 }) )
        editItemButton.add( new Text('Item', { fontSize: 20, flexShrink: 0 }) )
        pauseButton.add( new Text('Pause', { fontSize: 20, flexShrink: 0 }) )
        closeButton.add( new Text('Close', { fontSize: 20, flexShrink: 0 }) )
        // not the greatest
        let deselect_all =  (exception) => {
            for(let tab of tab_objects){
                if(tab == exception){

                }else{
                    tab.dispatchEvent({ type: 'pointerout', target: tab, pointerId: 1 })
                }
            }
        }
        pauseButton.addEventListener('click', ()=>{
            deselect_all(pauseButton)
            global_signals.paused.value = !global_signals.paused.value
        })
        inventoryButton.addEventListener('click', ()=>{
            signal.value = 'open_inventory'

            deselect_all(inventoryButton)
            if(this.ui_state !== 'open_inventory' ||this.ui_state !== 'open_edit_char' ){
                this.tween_character_in()
                this.tween_item_out()
            }
            this.ui_state = 'open_inventory'
        })
        editCharButton.addEventListener('click', ()=>{
            deselect_all(editCharButton)
            signal.value = 'open_edit_char'
            if(this.ui_state !== 'open_inventory' ||this.ui_state !== 'open_edit_char' ){
                this.tween_character_in()
                this.tween_item_out()
            }
            this.ui_state = 'open_edit_char'
        })
        editItemButton.addEventListener('click', ()=>{
            deselect_all(editItemButton)
            signal.value = 'open_edit_item'
            if(this.ui_state !== 'open_edit_item'){
                this.tween_character_out()
                this.tween_item_in()
            }
            this.ui_state = 'open_edit_item'
        })
        closeButton.addEventListener('click', ()=>{
            deselect_all(closeButton)
            signal.value = 'close'
        })
        panel.add(inventoryButton)
        panel.add(editCharButton)
        panel.add(editItemButton)
        panel.add(pauseButton)
        panel.add(closeButton)
        intersect_objects.push(inventoryButton)
        intersect_objects.push(editCharButton)
        intersect_objects.push(editItemButton)
        intersect_objects.push(pauseButton)
        intersect_objects.push(closeButton)
        this.origin = origin
        this.panel = panel
        this.char1 = null
        this.char2 = null
        this.char3 = null
        this.item1 = null
        this.item2 = null
        this.ui_state = 'open_inventory'
        this.item = new Group()
        this.item.visible = false
        scene.add(this.item)
        this.item.add(this.character.active_item)

        this.item_signal = global_signals.item_editor_type
        this.load_item_signal = global_signals.load_char_item
        this.load_char_signal = global_signals.load_char_char
        this.load_image_item_signal = global_signals.load_image_item
        this.load_image_char_signal = global_signals.load_image_char
        this.item_models = {bow:'bowa1.glb', sword:'sword1.glb', spear:'spear1.glb'}
    }
    setup_signal(){
        effect(()=>{
            let name_model = this.item_models[this.item_signal.value]
            this.character.loadItem( static_path + 'items/models/' + name_model, this.item_signal.value)
        })
        effect(()=>{
            if(this.load_item_signal.value !=='none'){
                this.character.loadItem(this.load_item_signal.value.src, this.item_signal.value.type, false)
            }
        })
        effect(()=>{
            console.log('load character0')
            if(this.load_char_signal.value !=='none'){
                console.log('load character')
                this.character.replace(this.load_char_signal.value)
                this.character.reequip()
            }
        })
        effect(()=>{
            if(this.load_image_item_signal.value !=='none'){
                this.character.retexture('item', this.load_image_item_signal.value)
            }
        })
        effect(()=>{
            if(this.load_image_char_signal.value !=='none'){
                this.character.retexture('char', this.load_image_char_signal.value)
            }
        })
    }
    tween_character_in(){
        this.opening = true
        this.closing = false
        let animation_values = this.character.model.scale
        this.char1 = new TWEEN.Tween(animation_values, false)
		.to({x:1.0, y:1.0, z:1.0}, 400) 
        // .onStart(()=>{
        //     this.panel.visible= true
        // })
		.easing(TWEEN.Easing.Quadratic.Out) 
		.start()

        let animation_values_pos = this.character.model.position
        this.char3 = new TWEEN.Tween(animation_values_pos, false)
		.to({y:0.85}, 400) 
        // .onStart(()=>{
        //     this.panel.visible= true
        // })
		.easing(TWEEN.Easing.Quadratic.Out) 
		.start()
    }
    tween_character_out(){
        this.opening = true
        this.closing = false
        let animation_values = this.character.model.scale
        this.char2 = new TWEEN.Tween(animation_values, false)
		.to({x:0.2, y:0.2, z:0.2}, 400) 
        // .onStart(()=>{
        //     this.panel.visible= true
        // })
		.easing(TWEEN.Easing.Quadratic.Out) 
		.start()

        let animation_values_pos = this.character.model.position
        this.char3 = new TWEEN.Tween(animation_values_pos, false)
		// .to({y:0.18}, 400) 
		.to({y:0.7}, 400) 
        // .onStart(()=>{
        //     this.panel.visible= true
        // })
		.easing(TWEEN.Easing.Quadratic.Out) 
		.start()
    }
    tween_item_in(){
        this.opening = true
        this.closing = false
        let animation_values = this.item.scale
        remove_children(this.item)
        this.item.add(this.character.active_item)
        this.item.visible=true
        this.item1 = new TWEEN.Tween(animation_values, false)
		.to({x:0.3, y:0.3, z:0.3}, 400) 
        // .onStart(()=>{
        //     this.panel.visible= true
        // })
		.easing(TWEEN.Easing.Quadratic.Out) 
		.start()
    }
    tween_item_out(){
        
        this.opening = true
        this.closing = false
        if(this.item.children[0]){
            this.item.remove(this.item.children[0]) 
        }
        let animation_values = this.item.scale
        this.item2 = new TWEEN.Tween(animation_values, false)
		.to({x:0.02, y:0.02, z:0.02}, 400) 
        .onComplete(()=>{
            this.item.visible = false
        })
		.easing(TWEEN.Easing.Quadratic.Out) 
		.start()
    }
    tween_in(){
        this.opening = true
        this.closing = false
    }
    tween_out(){
        this.closing = true
        this.opening = false
    }
    animate(delta, time, pos_angle){
        let inv_pos = [-20, 0]
        this.panel.propertiesSignal.value.transformRotateY = - (pos_angle* 180) / Math.PI
        this.panel.propertiesSignal.value.transformTranslateX = inv_pos[0] * Math.sin( pos_angle ) + inv_pos[1] * Math.cos( pos_angle )
        this.panel.propertiesSignal.value.transformTranslateZ = 100 * origin.z - inv_pos[0] * Math.cos( pos_angle ) + inv_pos[1] * Math.sin( pos_angle )
        this.panel.propertiesSignal.value = JSON.parse(JSON.stringify(this.panel.propertiesSignal.value))

        this.panel.update(delta)
        if(this.item.children[0]){
            this.item.children[0].rotation.y += 0.015
        }
        if(this.char1){
            this.char1.update(time)
        }
        if(this.char2){
            this.char2.update(time)
        }
        if(this.char3){
            this.char3.update(time)
        }
        if(this.item1){
            this.item1.update(time)
        }
        if(this.item2){
            this.item2.update(time)
        }
    }
}

// This needs to be converted into an object for mutability
class Stats_Panel {
    constructor(camera, renderer, origin, char){
        let panel_properties =  {
            flexDirection: 'column',
            gap: 15,
            flexGrow: 1,
            width: 1200,
            margin: 2,
            borderRadius: 10,
            padding: 10,
            borderRadius:3,
            alignItems: 'center',
            backgroundOpacity: 0.6,
          //   backgroundColor: '',
            // overflow: 'scroll',
            transformTranslateZ:  100 * origin.z,
            transformTranslateY: -125,
            transformTranslateX: 25,
            transformRotateY: -30,
            transformScale: 0.2,
        }
        let panel = new Root(camera, renderer, panel_properties)
        
        // accessible?
        // const active_level = new Text(" level " + +char.active_stats.level, { fontSize: 10, color:'#77ff77', flexShrink: 0 })
        // const active_health = new Text(" health " + char.active_stats.current_health, { fontSize: 10, color:'#77ff77', flexShrink: 0 })
        // const active_attack = new Text(" attack " + char.active_stats.attack, { fontSize: 10, color:'#77ff77', flexShrink: 0 })
        // const active_defence = new Text(" defence " + char.active_stats.defence, { fontSize: 10, color:'#77ff77', flexShrink: 0 })
        // active_stats.add(name)
        this.panel = panel
        this.load_stats(char)
        
        this.origin = origin
        this.animation_values = {dx:0, dz:0, dy:0, ds:0}
        this.anim1 = null
        this.anim2 = null
        this.open = true
    }

    load_stats(char){

        let active_stats = new Container(
            panel,
            {
                flexDirection: 'column',
                flexGrow: 1,
                padding:2,
                margin:2,
                borderRadius:3,
                backgroundOpacity: 0.8,
                backgroundColor: "#eeeeff",
                // transformTranslateZ: -20,
            },
            defaultProperties
        )
        const name = new Text(char.name, { 
            fontSize: 20,
            margin: 2,
            width: 200,
            borderRadius: 10,
            padding: 3,
            borderRadius:3,
            backgroundOpacity: 0.8,
            flexShrink: 0,
            backgroundColor: '#eeeeff'
        })
        const title_active_stats = new Text('stats', { fontSize: 14, flexShrink: 0 })
        let panel = this.panel
        try{
            let max_i = panel.childrenContainer.children.length 
            for(let i=0; i<max_i; i++){
                panel.childrenContainer.children[0].destroy()
            }
        }catch(e){
            console.log(e)
        }
        active_stats.add(title_active_stats)
        active_stats.add(new stats_pair(active_stats, 'level',    char.base_stats.level,    char.active_stats.level))
        active_stats.add(new stats_pair(active_stats, 'health',   char.base_stats.max_health,   char.active_stats.max_health) )
        active_stats.add(new stats_pair(active_stats, 'attack',   char.base_stats.attack,   char.active_stats.attack) )
        active_stats.add(new stats_pair(active_stats, 'defence',  char.base_stats.defence,  char.active_stats.defence))

        let skill_panel = new Container(
            panel,
            {
                flexDirection: 'column',
                flexGrow: 1,
                padding:4,
                margin:4,
                backgroundOpacity: 0.7,
                backgroundColor: "#eeeeff",
                borderRadius:3,
                // transformTranslateZ: -20,
            },
            defaultProperties
        )
        for (const [key, value] of Object.entries(char.skills)){
            skill_panel.add(item_pair(panel, key, value))
        }
        panel.add(name)
        panel.add(active_stats)
        panel.add(skill_panel)
    }
    
    setup_signal(signal){
        effect(()=>{
            if( this.open && signal.value !== 'open_inventory' ){
                this.tween_out()
                this.open = false
            }
            if(signal.value == 'open_inventory'){
                this.tween_in()
                this.open = true
            }
        })
    }
    tween_in(){
        this.opening = true
        this.closing = false
        let animation_values = this.animation_values
        this.anim1 = new TWEEN.Tween(animation_values, false)
		.to({dx:0, dz:0}, 500)
        .onStart(()=>{
            this.panel.visible= true
        })
		.easing(TWEEN.Easing.Quadratic.Out) 
		.start()

        this.anim2 = new TWEEN.Tween(animation_values, false)
		.to({dy:0, ds:0}, 500) 
		.easing(TWEEN.Easing.Quadratic.In) 
		.start()
    }
    tween_out(){
        this.closing = true
        this.opening = false
        console.log('tween_out')
        let animation_values = this.animation_values
        this.anim1 = new TWEEN.Tween(animation_values, false)
		.to({dx:-55, dz:60}, 500) 
        .onComplete(()=>{
            this.panel.visible= false
        })
		.easing(TWEEN.Easing.Quadratic.Out) 
		.start()

        this.anim2 = new TWEEN.Tween(animation_values, false)
		.to({dy:-20, ds:-0.19}, 500) 
		.easing(TWEEN.Easing.Quadratic.In) 
		.start()
    }
    animate(delta, time, pos_angle){
        this.panel.propertiesSignal.value.transformRotateY = -25 - (pos_angle* 180) / Math.PI
        // TODO  best way to decompose math?
        let stats_pos = [10 + this.animation_values.dz, 75 + this.animation_values.dx]
        this.panel.propertiesSignal.value.transformTranslateX = stats_pos[0] * Math.sin( pos_angle ) + stats_pos[1] * Math.cos( pos_angle )
        this.panel.propertiesSignal.value.transformTranslateY = -125 + this.animation_values.dy
        this.panel.propertiesSignal.value.transformTranslateZ = 100 * origin.z - stats_pos[0] * Math.cos( pos_angle ) + stats_pos[1] * Math.sin( pos_angle ) 
        this.panel.propertiesSignal.value.transformScale = 0.2 + this.animation_values.ds 
        // This is probably expensive
        this.panel.propertiesSignal.value = JSON.parse(JSON.stringify(this.panel.propertiesSignal.value))
        this.panel.update(delta)
        if(this.anim1){
            this.anim1.update(time)
            this.anim2.update(time)
        }
    }   
}


class Inventory_Panel{
    constructor(camera, renderer, origin, inventory){
        this.camera = camera
        this.renderer = renderer
        let panel = new Root(camera, renderer,  {
            flexDirection: 'column',
            gap: 2,
            width: 800,
            // flexGrow: 1,
            margin: 2,
            borderRadius:3,
            borderRadius: 4,
            padding: 3,
            alignItems: 'center',
            transformTranslateZ: 100 * origin.z,
            transformTranslateY: -125,
            transformTranslateX: -25,
            transformRotateY: 30,
            transformScale: 0.2,
          //   backgroundColor: '',
            // overflow: 'scroll',
        })
        this.inventory = inventory
        this.origin = origin
        this.panel = panel
        this.load_inventory()

        this.animation_values = {dx:0, dz:0, dy:0, ds:0}
        this.anim1 = null
        this.anim2 = null
        this.open = true
        effect(()=>{
            let item = global_signals.inventory.value
            if(item!=='none'){
                let index = this.inventory.all_items.indexOf(0)
                this.inventory.all_items[index] = {
                    name: item.name,
                    model_id: item.model_id,
                    type: item.type,
                    image_icon: item.model_icon,
                    source: item.source

                }
                this.load_inventory()
            }
        })
    }

    load_inventory(inventory_size=[5,5]){
        
        let panel = this.panel
        globalThis.panel_inventory = panel
        try{

            let max_i = panel.childrenContainer.children.length 
            for(let i=0; i<max_i; i++){
                panel.childrenContainer.children[0].destroy()
            }
        }catch(e){
            console.log(e)
        }
        let inventory = this.inventory
        let item_matrixes = []
        for( let i = 0; i < inventory_size[0]; i++ ){
            let row =  new Container(
                panel,
                {
                    flexDirection: 'row',
                    gap: 10,
                    flexGrow: 1,
                    hover: { backgroundOpacity: 0.6 },
                },
                defaultProperties)
            let row_container = []
            for(let j = 0; j < inventory_size[1]; j++){
                let name, image, image_icon, item_model_src, item;
                try{
                    item = inventory.all_items[i*inventory_size[0]+j]
                    name = !item.name ? ' ' : item.name
                    image = ''
                    image_icon = item.image_icon ? item.image_icon : false
                }catch(e){
                    name = ' '
                    image = ' '
                    image_icon = false
                }
                // item_location = []
                let a_item = item_container(panel, name, image, image_icon, item)
                row_container.push(a_item)
                intersect_objects.push(a_item)
            }
            for(let row_i of row_container){
                row.add(row_i)
            }
            item_matrixes.push(row)
        }
        for(let row_j of item_matrixes){
            panel.add(row_j)
        }
    }

    tween_in(){
        this.opening = true
        this.closing = false
        let animation_values = this.animation_values
        this.anim1 = new TWEEN.Tween(animation_values, false)
		.to({dx:0, dz:0}, 500) 
        .onStart(()=>{
            this.panel.visible= true
        })
		.easing(TWEEN.Easing.Quadratic.Out) 
		.start()

        this.anim2 = new TWEEN.Tween(animation_values, false)
		.to({dy:0, ds:0.}, 500) 
		.easing(TWEEN.Easing.Quadratic.In) 
		.start()
    }
    tween_out(){
        this.closing = true
        this.opening = false
        let animation_values = this.animation_values
        this.anim1 = new TWEEN.Tween(animation_values, false)
		.to({dx:55, dz:60}, 500) 
        .onComplete(()=>{
            this.panel.visible= false
        })
		.easing(TWEEN.Easing.Quadratic.Out) 
		.start()

        this.anim2 = new TWEEN.Tween(animation_values, false)
		.to({dy:-20, ds:-0.19}, 500) 
		.easing(TWEEN.Easing.Quadratic.In) 
		.start()
    }

    setup_signal(signal){
        effect(()=>{
            if( this.open && signal.value !== 'open_inventory' ){
                this.tween_out()
                this.open = false
            }
            if(signal.value == 'open_inventory'){
                this.tween_in()
                this.open = true
            }
        })
    }

    animate(delta, time, pos_angle){
        // z,x dumb
        let inv_pos = [10+this.animation_values.dz, -75+this.animation_values.dx]
        this.panel.propertiesSignal.value.transformRotateY = +25 - (pos_angle* 180) / Math.PI
        this.panel.propertiesSignal.value.transformTranslateX = inv_pos[0] * Math.sin( pos_angle ) + inv_pos[1] * Math.cos( pos_angle )
        this.panel.propertiesSignal.value.transformTranslateY = -125 + this.animation_values.dy
        this.panel.propertiesSignal.value.transformTranslateZ = 100 * origin.z - inv_pos[0] * Math.cos( pos_angle ) + inv_pos[1] * Math.sin( pos_angle )
        this.panel.propertiesSignal.value.transformScale = 0.2 + this.animation_values.ds 
        
        this.panel.propertiesSignal.value = JSON.parse(JSON.stringify(this.panel.propertiesSignal.value))

        this.panel.update(delta)
        if(this.anim1){
            this.anim1.update(time)
            this.anim2.update(time)
        }
    }
}


// delete or just have everything built and invisible
class Build_Character_Panel{
    constructor(camera, renderer, origin){
        let panel = new Root(camera, renderer,  {
            flexDirection: 'column',
            gap: 10,
            width: 400,
            // flexGrow: 1,
            margin: 2,
            borderRadius:3,
            borderRadius: 4,
            padding: 3,
            alignItems: 'center',
            transformTranslateZ: 20 + 100 * origin.z,
            transformTranslateY: -175,
            transformTranslateX: 0,
            transformRotateX: 0,
            transformScale: 0.2,
          //   backgroundColor: '',
            // overflow: 'scroll',
        })
        panel.userData.state = {}
        
        let inpaintBrushPanel =  new Container(
            panel,
            {
                flexDirection: 'column',
                flexGrow: 1,
                width: 300,
                height: 150,
                backgroundColor: "#eeffee",
                backgroundOpacity: 0.8,
            },
            defaultProperties)

        let maskingPanel =  new Container(
            panel,
            {
                flexDirection: 'column',
                flexGrow: 1,
                width: 300,
                height: 200,
                backgroundColor: "#eeffee",
                backgroundOpacity: 0.8,
            },
            defaultProperties)

        let generatePanel =  new Container(
            panel,
            {
                flexDirection: 'column',
                flexGrow: 1,
                width: 300,
                height: 250,
                backgroundColor: "#eeffee",
                backgroundOpacity: 0.8,
            },
            defaultProperties)
        
        // inpaintBrushPanel.add( new Text('Brush size (not working)', { fontSize: 20, flexShrink: 0 })) 
        // inpaintBrushPanel.add( new Text('Brush shape (not working)', { fontSize: 20, flexShrink: 0 }))
        
        inpaintBrushPanel.add( new Text('Brush size (not working)', { fontSize: 20, flexShrink: 0 })) 
        inpaintBrushPanel.add( new Text('Brush shape (not working)', { fontSize: 20, flexShrink: 0 }))
        // masking
        this.edit_mask = {
            face:false,
            top:false,
            bottom:false
        }
        let self = this
        maskingPanel.add( button_container(panel, 'Edit Face', ()=>{self.edit_mask.face = !self.edit_mask.face}) ) 
        maskingPanel.add( button_container(panel, 'Edit Top Clothing', ()=>{self.edit_mask.top = !self.edit_mask.top}) )
        maskingPanel.add( button_container(panel, 'Edit Bottom Clothing', ()=>{self.edit_mask.bottom = !self.edit_mask.bottom}) ) 

        let generate_button = new Text('Generate', { 
            fontSize: 20,
            margin: 3,
            padding: 15,
            width: 120,
            height: 40,
            border:4,
            alignItems: 'center',
            borderRadius:10, 
            flexShrink: 0,
            backgroundColor: "#eedddd",
        })
        generate_button.userData.enabled = true
        generate_button.addEventListener('click', (e)=>{
            if(generate_button.userData.enabled){
                // let image_src = static_path + 'characters/images/pastel_knight.png'
                // TODO Request should be added to request
                //  TODO This line is a bad.
                cropImageUrltoBase64(
                    meshToImageUrl(character.model.children[0].children[0])
                ).then(input_image=>{
                    let options = {
                        input_image: [input_image],
                        prompt:this.panel.userData.state.prompt,
                        neg_prompt:this.panel.userData.state.neg_prompt,
                        scale:{
                            width:1024,
                            height:1024
                        },
                        edit_mask: this.edit_mask,
                        denoising: this.panel.userData.state.denoise
                    }   
                    generate_button.userData.enabled = false         
                    generate_button.propertiesSignal.value.backgroundColor = "#ccbbbb"
                    generate_button.propertiesSignal.value = JSON.parse(JSON.stringify(generate_button.propertiesSignal.value))
                    let mask = Object.values(this.edit_mask)
                    if( (mask[0]&&mask[1]&&mask[2]) || (!mask[0]&&!mask[1]&&!mask[2])){
                        characterMeshRequest(options)
                    }else{
                        characterMeshMaskRequest(options)
                    }
                })
                
                setTimeout((e)=>{
                    generate_button.userData.enabled = true
                    generate_button.propertiesSignal.value.backgroundColor = "#eedddd"
                    generate_button.propertiesSignal.value = JSON.parse(JSON.stringify(generate_button.propertiesSignal.value))
                     
                },5000)
                // failure
            }
        
        })
        intersect_objects.push(generate_button)

        generatePanel.add( new input_container(panel, 'Prompt', ()=>{}))
        generatePanel.add( new input_container(panel, 'Neg Prompt', ()=>{}))
        generatePanel.add( new input_container(panel, 'Denoise', ()=>{}, 'number'))
        generatePanel.add( button_container( panel, 'Remake Mesh', ()=>{}) )
        // generatePanel.add( new Text('Recalc Normals', { fontSize: 20, flexShrink: 0 })) 
        generatePanel.add( generate_button )
        panel.add(inpaintBrushPanel)
        panel.add(maskingPanel)
        panel.add(generatePanel)

        this.origin = origin
        this.panel = panel
        this.animation_values = {dx:0, dz:0, dy:0, ds:0}
        this.anim1 = null
        this.anim2 = null
        this.open = true
    }

    
    tween_in(){
        this.opening = true
        this.closing = false
        let animation_values = this.animation_values
        this.anim1 = new TWEEN.Tween(animation_values, false)
		.to({dx:0, dz:0}, 500) 
        .onStart(()=>{
            this.panel.visible= true
        })
		.easing(TWEEN.Easing.Quadratic.Out) 
		.start()

        this.anim2 = new TWEEN.Tween(animation_values, false)
		.to({dy:0, ds:0.}, 500) 
		.easing(TWEEN.Easing.Quadratic.In) 
		.start()
    }
    tween_out(){
        this.closing = true
        this.opening = false
        let animation_values = this.animation_values
        this.anim1 = new TWEEN.Tween(animation_values, false)
		.to({dx:55, dz:60}, 500) 
        .onComplete(()=>{
            this.panel.visible= false
        })
		.easing(TWEEN.Easing.Quadratic.Out) 
		.start()

        this.anim2 = new TWEEN.Tween(animation_values, false)
		.to({dy:-20, ds:-0.19}, 500) 
		.easing(TWEEN.Easing.Quadratic.In) 
		.start()
    }
    setup_signal(signal){
        effect(()=>{
            if( this.open && signal.value !== 'open_edit_char' ){
                this.tween_out()
                this.open = false
            }
            if(signal.value == 'open_edit_char'){
                this.tween_in()
                this.open = true
            }
        })
    }

    animate(delta, time, pos_angle){
        // z,x dumb
        let inv_pos = [10+this.animation_values.dz, -75+this.animation_values.dx]
        this.panel.propertiesSignal.value.transformRotateY = +25 - (pos_angle* 180) / Math.PI
        this.panel.propertiesSignal.value.transformTranslateX = inv_pos[0] * Math.sin( pos_angle ) + inv_pos[1] * Math.cos( pos_angle )
        this.panel.propertiesSignal.value.transformTranslateY = -125 + this.animation_values.dy
        this.panel.propertiesSignal.value.transformTranslateZ = 100 * origin.z - inv_pos[0] * Math.cos( pos_angle ) + inv_pos[1] * Math.sin( pos_angle )
        this.panel.propertiesSignal.value.transformScale = 0.2 + this.animation_values.ds 
        
        this.panel.propertiesSignal.value = JSON.parse(JSON.stringify(this.panel.propertiesSignal.value))

        this.panel.update(delta)
        if(this.anim1){
            this.anim1.update(time)
            this.anim2.update(time)
        }
    }
}


class Build_Equipment_Panel{
    constructor(camera, renderer, origin){
        let panel = new Root(camera, renderer,  {
            flexDirection: 'column',
            gap: 10,
            width: 400,
            // flexGrow: 1,
            margin: 2,
            borderRadius:3,
            borderRadius: 4,
            padding: 3,
            alignItems: 'center',
            transformTranslateZ: 20 + 100 * origin.z,
            transformTranslateY: -175,
            transformTranslateX: 0,
            transformRotateX: 0,
            transformScale: 0.2,
          //   backgroundColor: '',
            // overflow: 'scroll',
        })
        panel.userData.state = {}
        // this.equipment = 
        
        let inpaintBrushPanel =  new Container(
            panel,
            {
                flexDirection: 'column',
                flexGrow: 1,
                width: 300,
                height: 150,
                backgroundColor: "#ffeeee",
                backgroundOpacity: 0.8,
            },
            defaultProperties)

        let maskingPanel =  new Container(
            panel,
            {
                flexDirection: 'column',
                flexGrow: 1,
                width: 300,
                height: 200,
                backgroundColor: "#ffeeee",
                backgroundOpacity: 0.8,
            },
            defaultProperties)

        let generatePanel =  new Container(
            panel,
            {
                flexDirection: 'column',
                flexGrow: 1,
                width: 300,
                height: 250,
                backgroundColor: "#ffeeee",
                backgroundOpacity: 0.8,
            },
            defaultProperties)
            
        
        inpaintBrushPanel.add( new Text('Add Image (optional)', { fontSize: 20, flexShrink: 0 })) 
        inpaintBrushPanel.add( new input_container(panel, 'input_image', ()=>{}, 'file'))
        // radio_container(panel, ['Drawing (not work)', 'Inpaint (not work)'], inpaintBrushPanel)
// 
        // TODO radio button
        radio_container(panel, ['Edit Bow',  'Edit Sword','Edit Spear'], maskingPanel, [
            ()=>{global_signals.item_editor_type.value = "bow"},
            ()=>{global_signals.item_editor_type.value = "sword"},
            ()=>{global_signals.item_editor_type.value = "spear"},
        ])
        
        generatePanel.add( new input_container(panel, 'Prompt', ()=>{}))
        generatePanel.add( new input_container(panel, 'Neg Prompt', ()=>{}))
        generatePanel.add( new input_container(panel, 'Denoise', ()=>{}, 'number')) 
        let remake_mesh = button_container(panel, "Remake Mesh", ()=>{})
        generatePanel.add( remake_mesh )
        // generatePanel.add( new Text('Recalc Normals', { fontSize: 20, flexShrink: 0 })) 
        let generate_button = new Text('Generate', { 
            fontSize: 20,
            margin: 3,
            padding: 15,
            width: 120,
            height: 40,
            border:4,
            alignItems: 'center',
            borderRadius:10, 
            flexShrink: 0,
            backgroundColor: "#eedddd",
        })
        generate_button.userData.enabled = true
        generate_button.addEventListener('click', (e)=>{
            console.log('send_request')
            if(generate_button.userData.enabled){   
                let image_src = static_path + 'items/images/' + this.item_images[global_signals.item_editor_type.value]
                // load image promise
                loadImageString(image_src)
                .then( (input_image)=>{
                    generate_button.userData.enabled = false         
                    generate_button.propertiesSignal.value.backgroundColor = "#ccbbbb"
                    generate_button.propertiesSignal.value = JSON.parse(JSON.stringify(generate_button.propertiesSignal.value))
                    // let state = this.panel.userData.state
                    // templateLoc = templateImages[state.equipment_type]
                    let options = {
                        input_image: [input_image],
                        prompt:this.panel.userData.state.prompt,
                        neg_prompt:this.panel.userData.state.neg_prompt,
                        denoising: this.panel.userData.state.denoise,
                        type: global_signals.item_editor_type.value
                    }
                    // if(this.state.remesh){
                    objectMeshRequest(options)
                    // }else{
                    //     imageRequest(options)
                    // }
                })
                setTimeout((e)=>{
                    generate_button.userData.enabled = true
                    generate_button.propertiesSignal.value.backgroundColor = "#eedddd"
                    generate_button.propertiesSignal.value = JSON.parse(JSON.stringify(generate_button.propertiesSignal.value))
                     
                },5000)
            }
        
        })
        intersect_objects.push(generate_button)

        generatePanel.add( generate_button )

        panel.add(inpaintBrushPanel)
        panel.add(maskingPanel)
        panel.add(generatePanel)

        this.origin = origin
        this.panel = panel
        this.animation_values = {dx:0, dz:0, dy:0, ds:0}
        this.anim1 = null
        this.anim2 = null
        this.open = true
        this.item_images = {bow:'bow.png', sword:'sword.png', spear:'spear.png'}
    }

    swapWeaponType(){
        // this.bow =
        // change animations?
    }
    
    tween_in(){
        this.opening = true
        this.closing = false
        let animation_values = this.animation_values
        this.anim1 = new TWEEN.Tween(animation_values, false)
		.to({dx:0, dz:0}, 500) 
        .onStart(()=>{
            this.panel.visible= true
        })
		.easing(TWEEN.Easing.Quadratic.Out) 
		.start()

        this.anim2 = new TWEEN.Tween(animation_values, false)
		.to({dy:0, ds:0.}, 500) 
		.easing(TWEEN.Easing.Quadratic.In) 
		.start()
    }
    tween_out(){
        this.closing = true
        this.opening = false
        let animation_values = this.animation_values
        this.anim1 = new TWEEN.Tween(animation_values, false)
		.to({dx:55, dz:60}, 500) 
        .onComplete(()=>{
            this.panel.visible= false
        })
		.easing(TWEEN.Easing.Quadratic.Out) 
		.start()

        this.anim2 = new TWEEN.Tween(animation_values, false)
		.to({dy:-20, ds:-0.19}, 500) 
		.easing(TWEEN.Easing.Quadratic.In) 
		.start()
    }
    setup_signal(signal){
        effect(()=>{
            if( this.open && signal.value !== 'open_edit_item' ){
                this.tween_out()
                this.open = false
            }
            if(signal.value == 'open_edit_item'){
                this.tween_in()
                this.open = true
            }
        })
    }

    animate(delta, time, pos_angle){
        // z,x dumb
        let inv_pos = [10+this.animation_values.dz, -75+this.animation_values.dx]
        this.panel.propertiesSignal.value.transformRotateY = +25 - (pos_angle* 180) / Math.PI
        this.panel.propertiesSignal.value.transformTranslateX = inv_pos[0] * Math.sin( pos_angle ) + inv_pos[1] * Math.cos( pos_angle )
        this.panel.propertiesSignal.value.transformTranslateY = -125 + this.animation_values.dy
        this.panel.propertiesSignal.value.transformTranslateZ = 100 * origin.z - inv_pos[0] * Math.cos( pos_angle ) + inv_pos[1] * Math.sin( pos_angle )
        this.panel.propertiesSignal.value.transformScale = 0.2 + this.animation_values.ds 
        
        this.panel.propertiesSignal.value = JSON.parse(JSON.stringify(this.panel.propertiesSignal.value))

        this.panel.update(delta)
        if(this.anim1){
            this.anim1.update(time)
            this.anim2.update(time)
        }
    }
}

// there should only be 1
let extra_info_label = (name, description, location) => {
    const container = new Container(
        root,
        {
            flexGrow: 1,
            backgroundColor: "#cc0000"
        },
        defaultProperties
    )
    const title = new Text('Warrior', { fontSize: 40, flexShrink: 0 })
    const stats_table = new Text('Warrior', { fontSize: 25, flexShrink: 0 })
    return container
}

let equipment_panel = ()=>{}

export {Stats_Panel, Inventory_Panel, Tab_Panel, Build_Character_Panel, Build_Equipment_Panel, extra_info_label, equipment_panel}