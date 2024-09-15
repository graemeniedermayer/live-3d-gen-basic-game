import { loadImageString} from '../loaders.js'
import { static_path } from '../globals.js'
// setup for turbo dreamshapersdxl ()
let checkpoint_values = {
    'steps': 4,
    'sampler_name':'DPM++ SDE Karras',
    "cfg_scale": 2.0,
}


let neg_prompt_addons = 'nudity, nude, bare thighs, nfsw'
// Standard 
// high jack front and back?
// let checkpoint_values = {
//     'steps': 20,
//     'sampler_name':'Euler a',
//     "cfg_scale": 6.0,
// }


let objectMeshRequest = (options) => {
    let sd_url_base = globalThis.sd_url_base
    const weapon_type_traits = {
        'sword':{
            'prompt':'longsword',
            'resize':[32,128],
            'scale':[512,2048],
            'gen_scale': 0.13
        },
        'spear':{
            'prompt':'spear',
            'resize':[32, 256],
            'scale':[256,2048],
            'gen_scale': 0.13
        },
        'bow':{
            'prompt':'longbow',
            'resize':[32, 256],
            'scale':[512,2048],
            'gen_scale': 0.4
        }
    }
    let type_traits = weapon_type_traits[options.type]
    const url_depth = sd_url_base + 'depth/generate'
    const url_sd = sd_url_base + 'sdapi/v1/img2img'
    const url_3d = sd_url_base + 'depthcreation/generate'
    let denoise = parseFloat(options.denoising)
    denoise = denoise ? denoise : 0.75
    const dic_sd = {
        "init_images": options.input_image,
        'denoising_strength': denoise,
        // "denoising_strength": 0.75,
        'prompt': type_traits.prompt + ' ' + options.prompt,
        'negative_prompt': options.neg_prompt + ' ' + neg_prompt_addons,
        'width': type_traits.scale[0],
        'height': type_traits.scale[1], 
        ...checkpoint_values
    }
    fetch(url_sd,
        {
            method: 'POST',
            body: JSON.stringify(dic_sd), 
            headers: {
                'Content-Type': 'application/json'
              },
            mode:'cors',  
        }
    )
    .then((e)=>e.json())
    .then((e)=>{
        const color_image = e['images'][0]
        const dic_depth = {
            "depth_input_images": [ color_image],
            "options":{
              "compute_device": "GPU",
              "model_type": 12,
              "net_width": 512,
              "net_height":512,
              "net_size_match": false,
              "boost": false,
              "invert_depth": false,
              "gen_rembg": true,
              "rembg_model": "isnet-general-use"
            }
        }
    fetch(url_depth,
        {
            method: 'POST',
            body: JSON.stringify(dic_depth), 
            headers: {
                'Content-Type': 'application/json'
              },
            mode:'cors',  
        }
    )
    .then((e)=>e.json())
    .then((e)=>{
        // use index 1 if background is removed
        const depth_image = e['images'][1]

        const dic_3d = {
            'input_images': [color_image],
            'depth_images': [depth_image],
            'generate_options':{
                'calc_normal_map':false,
                'double_sided':true,
                // depthmodel has already been used bad api.
                'depth_model': 'depth_anything2',
                'remove_background': true,
                'net_width': 512,
                'net_height':512,
                'file_type':'glb',
                'pre_scale': type_traits.gen_scale,
                'reduced_size': type_traits.resize,
                'attempt_rigging': false,
                'normalize_depth': true
                // reduced size
            }
        }
        fetch(url_3d,
            {
                method: 'POST',
                body: JSON.stringify(dic_3d), 
                headers: {
                    'Content-Type': 'application/json'
                  },
                mode:'cors',  
            }
        )
        .then((e)=>e.json())
        .then((e)=>{
            const file_path = e['path']
            var image = new Image();
            let id = 'img' + Date.now()
            // TODO maybe? memory issues later
            // image.src = color_image;
            // image.id = id
            // image.style.visibility = 'hidden'
            // document.body.appendChild(image);

            globalThis.global_signals.inventory.value = {
                model_id:'' + sd_url_base+'file=static/'+file_path,
                model_icon: color_image,
                name: (''+options.prompt).substring(0,12),
                type: options.type,
                source: 'auto1111'
            }
            globalThis.global_signals.load_char_item.value = {
               src:'' + sd_url_base+'file=static/'+file_path,
               type: options.type
            }
            return sd_url_base+'file=static/'+file_path
        })
    })
    })

    // return image
}

let imageRequest = (options) =>{
    let sd_url_base = globalThis.sd_url_base
    const url_sd = sd_url_base + 'sdapi/v1/img2img'
    const dic_sd = {
        "init_images": options.input_image,
        'denoising_strength': parseFloat(options.denoising),
        'prompt': options.prompt,
        'negative_prompt': options.neg_prompt + ' ' + neg_prompt_addons,
        'width': option.scale.width,
        'height': option.scale.height, 
        ...checkpoint_values
    }
    fetch(url_sd,
        {
            method: 'POST',
            body: JSON.stringify(dic_sd), 
            headers: {
                'Content-Type': 'application/json'
              },
            mode:'cors',  
        }
    )
    .then((e)=>e.json())
    .then((e)=>{
        let color_image = e['images'][0]
        if(options.type == 'char'){
            globalThis.global_signals.load_image_char.value = color_image
        }else{
            globalThis.global_signals.load_image_item.value = color_image
        }
    })
}

let characterMeshRequest = (options) => {
    let sd_url_base = globalThis.sd_url_base
    const url_depth = sd_url_base + 'depth/generate'
    const url_sd = sd_url_base + 'sdapi/v1/img2img'
    const url_3d = sd_url_base + 'depthcreation/generate'
    const dic_sd = {
        "init_images": options.input_image,
        'denoising_strength': parseFloat(options.denoising),
        'prompt': options.prompt + ' front and back',
        'negative_prompt': options.neg_prompt + neg_prompt_addons,
        // for 1024
        // 'width': 512,
        // 'height': 512, 
        'width': 1024,
        'height': 1024, 
        ...checkpoint_values
    }
    fetch(url_sd,
        {
            method: 'POST',
            body: JSON.stringify(dic_sd), 
            headers: {
                'Content-Type': 'application/json'
              },
            mode:'cors',  
        }
    )
    .then((e)=>e.json())
    .then((e)=>{
        const color_image = e['images'][0]
        const dic_depth = {
            "depth_input_images": [ color_image],
            "options":{
              "compute_device": "GPU",
              "model_type": 12,
              "net_width": 512,
              "net_height":512,
              "net_size_match": false,
              "boost": false,
              "invert_depth": false,
              "gen_rembg": true,
              "face_upsample": true,
              "rembg_model": "isnet-general-use"
            }
        }
    fetch(url_depth,
        {
            method: 'POST',
            body: JSON.stringify(dic_depth), 
            headers: {
                'Content-Type': 'application/json'
              },
            mode:'cors',  
        }
    )
    .then((e)=>e.json())
    .then((e)=>{
        // use index 1 if background is removed
        const depth_image = e['images'][1]

        const dic_3d = {
            'input_images': [color_image],
            'depth_images': [depth_image],
            'generate_options':{
                'calc_normal_map':false,
                'double_sided':false,
                'depth_model': 'depth_anything2',
                'remove_background': true,
                'net_width': 512,
                'net_height':512,
                'file_type':'glb',
                'pre_scale': 0.2,
                'reduced_size': [128,128],
                'attempt_rigging': true,
                'normalize_depth': false
            }
        }
        fetch(url_3d,
            {
                method: 'POST',
                body: JSON.stringify(dic_3d), 
                headers: {
                    'Content-Type': 'application/json'
                  },
                mode:'cors',  
            }
        )
        .then((e)=>e.json())
        .then((e)=>{
            const file_path = e['path']
            let path_string = ''+sd_url_base+'file=static/'+file_path
            console.log(globalThis.global_signals.load_char_char.value)
            console.log(path_string)
            globalThis.global_signals.load_char_char.value =  path_string
            return sd_url_base+'file=static/'+file_path
        })
    })
    })

    // return image
}


let characterMeshMaskRequest = (options) => {
    let sd_url_base = globalThis.sd_url_base
    let mask = options.edit_mask
    let mask_src_path;
    let face_upsample = true
    if(mask.top && !mask.bottom && !mask.face){
        mask_src_path = static_path + 'characters/images/top_mask.png'
        // face_upsample = false
    }else if(!mask.top && mask.bottom && !mask.face){
        mask_src_path = static_path + 'characters/images/bottom_mask.png'
        // face_upsample = false
    }else if(!mask.top && !mask.bottom && mask.face){
        mask_src_path = static_path + 'characters/images/face_mask.png'
    }else if(mask.top && mask.bottom && !mask.face){
        mask_src_path = static_path + 'characters/images/top_bottom_mask.png'
        // face_upsample = false
    }else if(mask.top && !mask.bottom && mask.face){
        mask_src_path = static_path + 'characters/images/face_top_mask.png'
    }else if(!mask.top && mask.bottom && mask.face){
        mask_src_path = static_path + 'characters/images/face_bottom_mask.png'
    }
    const url_depth = sd_url_base + 'depth/generate'
    const url_sd = sd_url_base + 'sdapi/v1/img2img'
    const url_3d = sd_url_base + 'depthcreation/generate'

    // load mask
    loadImageString(mask_src_path)
    .then( (mask_image)=>{

    const dic_sd = {
        "init_images": options.input_image,
        "mask": mask_image,
        "mask_blur": 4,
        "mask_round": true,
        "inpainting_fill": 1,
        "inpaint_full_res": true,
        "inpaint_full_res_padding": 0,
        'denoising_strength': parseFloat(options.denoising),
        'prompt': options.prompt + ' front and back',
        'negative_prompt': options.neg_prompt + ' ' + neg_prompt_addons,
        // for 1024
        // 'width': 512,
        // 'height': 512, 
        'width': 1024,
        'height': 1024, 
        ...checkpoint_values
    }
    fetch(url_sd,
        {
            method: 'POST',
            body: JSON.stringify(dic_sd), 
            headers: {
                'Content-Type': 'application/json'
              },
            mode:'cors',  
        }
    )
    .then((e)=>e.json())
    .then((e)=>{
        const color_image = e['images'][0]
        const dic_depth = {
            "depth_input_images": [ color_image],
            "options":{
              "compute_device": "GPU",
              "model_type": 12,
              "net_width": 512,
              "net_height":512,
              "net_size_match": false,
              "boost": false,
              "invert_depth": false,
              "gen_rembg": true,
              "face_upsample":  face_upsample,
              "rembg_model": "isnet-general-use"
            }
        }
    fetch(url_depth,
        {
            method: 'POST',
            body: JSON.stringify(dic_depth), 
            headers: {
                'Content-Type': 'application/json'
              },
            mode:'cors',  
        }
    )
    .then((e)=>e.json())
    .then((e)=>{
        // use index 1 if background is removed
        const depth_image = e['images'][1]

        const dic_3d = {
            'input_images': [color_image],
            'depth_images': [depth_image],
            'generate_options':{
                'calc_normal_map':false,
                'double_sided':false,
                'depth_model': 'depth_anything2',
                'remove_background': true,
                'net_width': 512,
                'net_height':512,
                'file_type':'glb',
                'pre_scale': 0.2,
                'reduced_size': [128,128],
                'attempt_rigging': true,
                'normalize_depth': false
            }
        }
        fetch(url_3d,
            {
                method: 'POST',
                body: JSON.stringify(dic_3d), 
                headers: {
                    'Content-Type': 'application/json'
                  },
                mode:'cors',  
            }
        )
        .then((e)=>e.json())
        .then((e)=>{
            const file_path = e['path']
            let path_string = ''+sd_url_base+'file=static/'+file_path
            globalThis.global_signals.load_char_char.value =  path_string
            return sd_url_base+'file=static/'+file_path
        })
    })
    })
    })

    // return image
}


export { objectMeshRequest, characterMeshRequest, characterMeshMaskRequest, imageRequest}