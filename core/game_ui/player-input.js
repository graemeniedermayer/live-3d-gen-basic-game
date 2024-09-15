import {entity} from "../game/entity.js";
import {Vector3} from 'three'

export const player_input = (() => {

  class PlayerInput extends entity.Component {
    constructor(params) {
      super();
      this.params_ = params;
    }
  
    InitEntity() {
      if( !navigator.userAgent.includes('Quest 3') ){
        this.Parent.Attributes.InputCurrent = {
          inputRightForwards: 0.0,
          inputRightRight: 0.0,
          inputLeftForwards: 0.0,
          inputLeftRight: 0.0,
          // forwards and right
          forward: 0.0,
          right: 0.0,
          button1: false,
          button2: false,
          target: new Vector3(0,0,0)
        };
        this.Parent.Attributes.InputPrevious = {
          ...this.Parent.Attributes.InputCurrent};
        // controller = document.getElementById('controller')
        this.touches = []
        this.moving = false
        let movepad = document.getElementById("movepad")
        let raycasting_element = document.getElementById("controller")
        let indicator = document.getElementById("movepad-indicator")
        let rect = movepad.getBoundingClientRect()
        this.default_pos = {
          movepadx : rect.width/2 + rect.left,
          movepady : rect.height/2 + rect.top
        }
        this.Parent.xr_start = ()=>{
          setTimeout(()=>{
            let rect = movepad.getBoundingClientRect()
            this.default_pos = {
              movepadx : rect.width/2 + rect.left,
              movepady : rect.height/2 + rect.top
            }
          },1500)
        }
        let movepad_start = e=>{
          this.moving = true
          let button_height = parseInt(movepad.offsetHeight)/2
          let button_width = parseInt(movepad.offsetWidth)/2
          let y = (this.default_pos.movepady - e.clientY ) / button_height
          let x = (this.default_pos.movepadx - e.clientX ) / button_width
          if (x**2 + y**2 > 1){
            let y1 = y/Math.sqrt(x**2 + y**2 )
            let x1 = x/Math.sqrt(x**2 + y**2 )
            x = x1
            y = y1
          }
          this.Parent.Attributes.InputCurrent.inputRightForward = y;
          this.Parent.Attributes.InputCurrent.inputRightRight = x;
          // TODO CSS transformation is more optimized (no extra paints) 
          indicator.style.transform =  `translate(${-x * button_width}px,${-y * button_height}px)`
        }
        let movepad_move = e =>{
          let button_height = parseInt(movepad.offsetHeight)/2
          let button_width = parseInt(movepad.offsetWidth)/2
          let y = (this.default_pos.movepady - e.clientY ) / button_height
          let x = (this.default_pos.movepadx - e.clientX ) / button_width
          if (x**2 + y**2 > 1){
            let y1 = y/Math.sqrt(x**2 + y**2 )
            let x1 = x/Math.sqrt(x**2 + y**2 )
            x = x1
            y = y1
          }
          this.Parent.Attributes.InputCurrent.inputRightForward = y;
          this.Parent.Attributes.InputCurrent.inputRightRight = x;
          // TODO CSS transformation is more optimized (no extra paints) 
          indicator.style.transform =  `translate(${-x * button_width}px,${-y * button_height}px)`
          
        }
        
        let movepad_end = e =>{
          this.moving = false
          this.Parent.Attributes.InputCurrent.inputRightForward = 0.0;
          this.Parent.Attributes.InputCurrent.inputRightRight = 0.0;
          indicator.style.transform =  `translate(${0}px,${0}px)`
        }
        let visionpad_start = e =>{
          this.vision_moving = true
          let touch = e
          if(touch.target.id !== "movepad" && touch.target.id !== "movepad-indicator"){
            this.direction_touch = {id:touch.identifier, x:touch.clientX, y:touch.clientY}
          }
        }
        let visionpad_move = e => {
          let touch = e;
          let y = (this.direction_touch.y - touch.clientY )
          let x = (this.direction_touch.x - touch.clientX )
          if (x**2 + y**2 > 0){
            let y1 = y/Math.sqrt(x**2 + y**2 )
            let x1 = x/Math.sqrt(x**2 + y**2 )
            x = x1
            y = y1
          }
          this.Parent.Attributes.InputCurrent.inputLeftForward = 5*y;
          this.Parent.Attributes.InputCurrent.inputLeftRight = 5*x;
          
        }
        let visionpad_end = e => {
          this.vision_moving = false
          delete this.direction_touch
          this.Parent.Attributes.InputCurrent.inputLeftForward = 0.0;
          this.Parent.Attributes.InputCurrent.inputLeftRight = 0.0;
        }
        
        document.getElementById("button1").addEventListener('touchstart', e=>{
          this.Parent.Attributes.InputCurrent.button1 = true;
        }, false);
        document.getElementById("button1").addEventListener('touchend', e=>{
          this.Parent.Attributes.InputCurrent.button1 = false;
        }, false);

        
        movepad.addEventListener('touchstart', e=>{
          let touch = e.touches[0]
          movepad_start(touch)
        }, false);
        movepad.addEventListener('mousedown', e=>{
          movepad_start(e)
        }, false);
        
        movepad.addEventListener('touchmove', e=>{
          let touch = e.touches[0]
          movepad_move(touch)
        }, false);
        movepad.addEventListener('mousemove', e=>{
          if(this.moving){
            movepad_move(e)
          }
        }, false);

        movepad.addEventListener('touchend', e=>{
          let touch = e.touches[0]
          movepad_end(touch)
        },false)
        document.body.addEventListener('mouseup', e=>{
          movepad_end(e)
        },false)
        
        raycasting_element.addEventListener('touchstart', e=>{
          let touch = e.touches[0]
          visionpad_start(touch)
        }, false)
        raycasting_element.addEventListener('mousedown', e=>{
          visionpad_start(e)
        }, false)
        raycasting_element.addEventListener('touchmove', e=>{
          let touches = e.touches
          try{
            for(let touch_ of touches){
              if (touch_.identifier == this.direction_touch.id){
                touch = touch_
              }
            }
          }catch(e){}
          try{
            visionpad_move(touch)
          }catch(e){

          }
        })
        raycasting_element.addEventListener('mousemove', e=>{
          if(this.vision_moving){
            visionpad_move(e)
          }
        }, false)
        raycasting_element.addEventListener('touchend', e=>{
          visionpad_end(e.touches)
        }, false);
        raycasting_element.addEventListener('mouseup', e=>{
          visionpad_end(e)
        }, false)

        document.addEventListener('keydown', (e) => this.OnKeyDown_(e), false);
        document.addEventListener('keyup', (e) => this.OnKeyUp_(e), false);
      }else{
        this.Parent.Attributes.InputCurrent = {
          inputForwards: 0.0,
          inputRight: 0.0,
          button1: false,
          button2: false,
          target: new Vector3(0,0,0)
        };
        this.Parent.Attributes.InputPrevious = {
          ...this.Parent.Attributes.InputCurrent};
        // console.log(globalThis.questController1.gamepad)
        // // controller = document.getElementById('controller')
        

        // document.addEventListener('keydown', (e) => this.OnKeyDown_(e), false);
        // document.addEventListener('keyup', (e) => this.OnKeyUp_(e), false);
      }
    }
  
    OnKeyDown_(event) {
      if (event.currentTarget.activeElement != document.body) {
        return;
      }
    }
  
    OnKeyUp_(event) {
      if (event.currentTarget.activeElement != document.body) {
        return;
      }
    }

    Update(_) {
      // does this need to be all the time?
      if(navigator.userAgent.includes('Quest 3')){
        try{
          let rgamepad = globalThis.questController1.gamepad
          this.Parent.Attributes.InputCurrent.inputRightForward = -rgamepad.axes[3];
          this.Parent.Attributes.InputCurrent.inputRightRight = -rgamepad.axes[2];
          
        }catch(e){
          // console.log(e)
        }
        try{
          let lgamepad = globalThis.questController2.gamepad

          this.Parent.Attributes.InputCurrent.inputLeftForward = -lgamepad.axes[3];
          this.Parent.Attributes.InputCurrent.inputLeftRight = -lgamepad.axes[2];

          this.Parent.Attributes.InputCurrent.button1 = lgamepad.buttons[0].pressed;
        }catch(e){
          // console.log(e)
        }
      }
      this.Parent.Attributes.InputPrevious = {
          ...this.Parent.Attributes.InputCurrent};
    }
  };

  return {
    PlayerInput: PlayerInput,
  };

})();