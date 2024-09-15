
import { Container, Text, Image } from '@pmndrs/uikit'
import {button_container} from './button.js'
// not self contained
function radio_container(panel, button_texts, container, funcs){
    
    let buttons = []
    for(let i=0; i < button_texts.length; i++){
        let button_text = button_texts[i]
        buttons.push(button_container(panel, button_text, ()=>{}) )
        container.add(buttons[i])
    }

    for(let i=0; i < buttons.length; i++){
        let click = (ele)=>{
            // console.log()
            for(let j=0; j < buttons.length; j++){
                if(i!==j && buttons[j].checked){
                    // TODO This is not good.
                    buttons[j].base_click(buttons[j].childrenContainer.children[0].childrenContainer.children[0], buttons[j])
                }
            }
            buttons[i].base_click(ele, buttons[i])
            funcs[i]()
        }
        buttons[i].click =  click
    }
    setTimeout( ()=>{
        buttons[0].click(buttons[0].childrenContainer.children[0].childrenContainer.children[0], buttons[0])
    }, 200)
    return container
}
export {radio_container}