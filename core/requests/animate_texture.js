// Do a request for a video that replaces the original textures.

// import { loadImageString, cropImageUrltoBase64, meshToImageUrl} from '../loaders.js'
import { VideoTexture, SRGBColorSpace, ColorManagement } from 'three'

function videoUrlToElement(videoUri) {
    let video_ele = document.createElement('video');
    let source = document.createElement('source');
    video_ele.crossOrigin = 'anonymous'
    video_ele.append(source)
    video_ele.muted = true
    video_ele.loop = true
    video_ele.width = 1024
    video_ele.height = 1024
    video_ele.autoplay = true
    // video_ele.playsinline = true
    video_ele.style = "width:1024px; height:1024px;z-index:-10; position:absolute; visibility:hidden;top:100000px;"
    source.type='video/mp4'
    // source.crossOrigin = 'anonymous' // if loading from src
    source.src = videoUri;
    document.body.append(video_ele)

    return new Promise(resolve => {
        video_ele.addEventListener('loadeddata', () => {
            resolve(video_ele);
        })
    });
}

let animate_texture = (model, texture_path) => {
    videoUrlToElement(texture_path).then(
        (ele)=>{ColorManagement.enabled = true
            model.material.map = new VideoTexture(ele)
            model.material.map.colorSpace = SRGBColorSpace;
            model.material.map.flipY = false
            model.material.map.needUpdate = true
            // renderer doesn't update colorspace unless it changes?
            setTimeout(()=>{
                renderer.toneMapping = 1
                setTimeout(()=>{
                renderer.toneMapping = 0
                },50)
            }, 50)
            ele.play()
        })
}

export {animate_texture}