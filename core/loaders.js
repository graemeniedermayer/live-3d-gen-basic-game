const getBase64StringFromDataURL = (dataURL) =>
    dataURL.replace(/^data:image\/(png|jpg);base64,/, "")
    // dataURL.replace('data:', '').replace(/^.+,/, '');

function getBase64Image(img) {
	var canvas = document.createElement("canvas");
	canvas.width = img.width;
	canvas.height = img.height;
	var ctx = canvas.getContext("2d");
	ctx.drawImage(img, 0, 0);
	var dataURL = canvas.toDataURL("image/png");
	return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
  }

function loadImage(src) {
    return new Promise(resolve => {
        const image = document.createElement("img");
        image.setAttribute("async", "");
        image.onload = resolve;
        image.setAttribute("src", src);
        // return image
        // document.head.appendChild(script);
    });
}
// based on  https://github.com/shivamsngh/cropbase64image/blob/master/crop.js
// TODO crop starting point  can be dynamic 
function cropImageUrltoBase64(imgUri, width = 1024, height = 1024, xstart=8, ystart=8) {
    let resize_canvas = document.createElement('canvas');
    let orig_src = new Image();
    orig_src.src = imgUri;

    return new Promise(resolve => {
        orig_src.addEventListener('load', () => {
            resize_canvas.width = width;
            resize_canvas.height = height;
            let cnv = resize_canvas.getContext('2d');
            cnv.drawImage(orig_src, xstart, ystart, width, height, 0, 0, width, height);
            let newimgBase64 = getBase64StringFromDataURL(resize_canvas.toDataURL("image/png").toString())
            resolve(newimgBase64);
        })
    });
}


function loadImageString(src){
    return loadImage(src).then(image_event=>{
        let image = image_event.target
        return getBase64Image(image)
    })
}

function meshToImageUrl(mesh){
    return mesh.material.map.source.toJSON().url
    // return 
}

function extract_image(){
    
}

export {loadImageString, meshToImageUrl, getBase64StringFromDataURL, cropImageUrltoBase64}