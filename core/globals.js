// Does this need to be a signal?
let intersect_objects = []
globalThis.intersect_objects = intersect_objects

// Paths
let static_path= 'static/ArExperiment/charEditor/'
// 
globalThis.sd_url_base = 'https://192.168.0.15:7860/'
// globalThis.sd_username = 'grae'
// globalThis.sd_password = 'password'
document.getElementById('button').addEventListener('click',
    (e)=>{
        if(document.getElementById('ip').value.length>0){
            globalThis.sd_url_base = document.getElementById('ip').value + '/'
            // globalThis.sd_username = document.getElementById('gradiousername').value
            // globalThis.sd_password = document.getElementById('gradiopassword').value
        }
        document.getElementById('ip_form').remove()
    }
)


// server for 
let data_url = ''
// multiplayer path
let multiplayer_path = ''
globalThis.static_path



export {intersect_objects, static_path}