import { Container, Text, Image } from '@pmndrs/uikit'
import { row_container } from './extras.js'
// not self contained
function button_container(panel, text, func, checked_button = false){
    let text_box = new Text(text, { fontSize: 20, flexShrink: 0, margin:10 })
    // get a new

    let checked = new Container(
        panel,
        {
            flexDirection: 'row',
            flexGrow: 0,
            width:30,
            height:30,
            borderRadius:30,
            borderColor: '#777777',
            alignItems: 'center',
            backgroundColor: "#333333",
            backgroundOpacity:0.8,
            },
        {}
    )
    let button = new Container(
        panel,
        {
            flexDirection: 'row',
            flexGrow: 0,
            padding:10,
            margin:10,
            width:50,
            borderRadius:50,
            height:50,
            border:2,
            backgroundOpacity:0.8,
            borderColor: '#777777',
            backgroundColor: "#eeeeee",
        },
        {}
    )
    checked.userData.first = true
    button.add(checked)
    
    let container = row_container(panel, button, text_box)
    container.checked = checked_button
    let click = (ele, parent)=>{
        // let ele = e.target.childrenContainer.children[0].childrenContainer.children[0]
        if ( parent.checked ){
            // good?
            panel.userData.state[text.toLowerCase().replace(' ',"_")] = false
            parent.checked = false
            ele.propertiesSignal.value.backgroundOpacity = 0.0
        }else{
            panel.userData.state[text.toLowerCase().replace(' ',"_")] = true
            parent.checked = true
            ele.propertiesSignal.value.backgroundOpacity = 1.0
        }
        // ele1.update()
        // apparently lazy function or something causese issues on first call?
        if (ele.userData.first){
            ele.userData.first = false
            ele.propertiesSignal.value.backgroundOpacity = 1.0
            ele.propertiesSignal.value = JSON.parse(JSON.stringify(ele.propertiesSignal.value))
            setTimeout(() => {
                ele.propertiesSignal.value.backgroundOpacity = 0.0
                ele.propertiesSignal.value = JSON.parse(JSON.stringify(ele.propertiesSignal.value))
                setTimeout(() => {
                    ele.propertiesSignal.value.backgroundOpacity = 1.0
                    ele.propertiesSignal.value = JSON.parse(JSON.stringify(ele.propertiesSignal.value))

                }, 20);
            }, 20);
        }
        ele.propertiesSignal.value = JSON.parse(JSON.stringify(ele.propertiesSignal.value))
        // ele.update()
        func()
    }
    container.checked = false
    container.base_click = click
    container.click = click
    // click({target:{childrenContainer:{children:[{childrenContainer:{children:[button] }}] }}})
    container.addEventListener('click', e=>{
        let ele = e.target.childrenContainer.children[0].childrenContainer.children[0]
        container.click(ele, e.target)
    } )
    intersect_objects.push(container)
    return container
}
export {button_container}