import { Container, Text, Image } from '@pmndrs/uikit'
import { static_path } from '../globals.js'

// TODO abstract this more
function item_container(panel, name='name', image='blank', img_src = 'https://picsum.photos/300/300', item_src = ''){
    let item_panel =  new Container(
        panel,
        {
            flexDirection: 'column',
            flexGrow: 1,
            width: 45,
            height: 90,
            padding:2,
            margin:2,
            borderRadius:3,
            hover: { backgroundOpacity: 0.6 },
            backgroundColor: "#eeeeee",
        },
        {}
    )
    if(img_src){
        item_panel.addEventListener('click', ()=>{
            if(item_src.source == 'auto1111'){
                global_signals.hand_equip.value = {
                    src: item_src.model_id,
                    type: item_src.type
                }
            }else{
                global_signals.hand_equip.value = {
                    src: static_path + 'items/models/' + item_src.model_id,
                    type: item_src.type
                }
            }
            pair.backgroundColor='#00cc00'
        })
    }
    let name_panel = new Text(' ' + name, { fontSize: 7, position:'absolute', flexShrink: 0 })

    // TODO if blank image
    let image_panel
    if(!img_src){
        image_panel =  new Container({
            borderRadius: 20,
            alignItems: 'center',
            alignSelf: 'center',
            justifyContent: 'center',
            height: '125%',
            flexShrink: 0,
        })
    }else{
        // TODO condition for base64 approach
        if(img_src.length > 200){
            image_panel = new Image({
                src: img_src,
                borderRadius: 20,
                alignItems: 'center',
                alignSelf: 'center',
                justifyContent: 'center',
                height: '125%',
                flexShrink: 0,
            })
        }else{
            image_panel = new Image({
                src: static_path+'items/images/'+img_src,
                borderRadius: 20,
                alignItems: 'center',
                alignSelf: 'center',
                justifyContent: 'center',
                height: '125%',
                flexShrink: 0,
            })
        }
    }
    item_panel.add(name_panel, image_panel)
    return item_panel
}

function item_pair(panel, str1, str2){
    let pair = new Container(
        panel,
        {
            flexDirection: 'row',
            flexGrow: 0,
            padding:4,
            margin:4,
            borderRadius:3,
            backgroundColor: "#eeeeee",
        },
        {}
    )
    const string1 = new Text(""+str1, { fontSize: 20, flexShrink: 0 })
    const string2 = new Text(" - "+str2, { fontSize: 20, flexShrink: 0 })
    pair.add(string1, string2)
    return pair
}


function row_container(panel, con1, con2){
    let pair = new Container(
        panel,
        {
            flexDirection: 'row',
            flexGrow: 1,
        },
        {}
    )
    pair.add( con1, con2)
    return pair
}


function stats_pair(panel, stat, base, active){
    let pair = new Container(
        panel,
        {
            flexDirection: 'row',
            flexGrow: 1,
            gap: 10,
            padding:4,
            margin:4,
            borderRadius:3,
            backgroundColor: "#eeeeee",
            onClick:(pair)=>{pair.backgroundColor='#00cc00'},
        },
        {}
    )
    const string1 = new Text('' + stat + " "+ base + ' ', { fontSize: 10, flexShrink: 0 })
    // red if negative
    let string2
    if (active-base>=0){
        string2 = new Text(" + "+ (active - base), { fontSize: 10, color: '#00aa00', flexShrink: 0 })
    }else{
        string2 = new Text(" + "+ (active - base), { fontSize: 10, color: '#aa0000', flexShrink: 0 })
    }
    pair.add(string1, string2)
    return pair
}

export { stats_pair, row_container, item_container, item_pair }