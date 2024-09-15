import { Container, Text } from '@pmndrs/uikit'

function input_container(panel, text, func, type = 'text'){
    let text_box = new Text(text, { fontSize: 12, flexShrink: 0, margin:1 })
    let input_box
    if('number'== type){
        input_box = new Text('0.74', { backgroundColor: "#cccccc",backgroundOpacity: 0.6, fontSize: 15, width:200, height:15, flexShrink: 0, margin:3 })
    }else{
        input_box = new Text(text, { backgroundColor: "#cccccc",backgroundOpacity: 0.6, fontSize: 15, width:200, height:15, flexShrink: 0, margin:3 })   
    }
    let pair = new Container(
        panel,
        {
            flexDirection: 'column',
            flexGrow: 1,
            height:34
        },
        {}
    )
    pair.add( text_box, input_box)
    // create 
    let input_doc = document.createElement('input')
    document.body.append(input_doc)
    let ele_id = 'text' + document.body.children.length
    input_doc.type = type
    // TODO this is no good.
    if( 'number' == type ){
        input_doc.step = 0.01
        input_doc.max = 1.0
        input_doc.min = 0.0
        input_doc.value = 0.74
    }
    input_doc.id = ele_id
    input_doc.style.opacity= 0
    input_doc.style.opacity= 0
    // visible = 'false'
    input_doc.style.position = 'absolute'
    input_doc.style.bottom = '0%'
    input_doc.style.pointerEvents = 'none'

    document.body.append(input_doc)
    pair.userData.input = input_doc 

    let click = (e)=>{
        let ele = document.getElementById(ele_id)
        // clicks the interface first.
        setTimeout(()=>{
            if(type==='file'){
                ele.click()
            }else{
                ele.focus()
            }
        }, 0)
        func()
    }
    input_doc.addEventListener('input', (e)=>{
        let ele = e.srcElement
        input_box.textSignal.value = ele.value
        panel.userData.state[text.toLowerCase().replace(' ','_')] = ele.value    
    })
    pair.addEventListener('click', click )

    intersect_objects.push(pair)

    return pair
}

export {input_container}