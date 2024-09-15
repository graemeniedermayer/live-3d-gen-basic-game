import { reversePainterSortStable, Container, Text, Fullscreen } from '@pmndrs/uikit'

class Viewport_Panel{
    constructor(camera, renderer, signal){
        let panel = new Fullscreen(camera, renderer,  {
            alignItems: 'center',
        })

        let sign_in = new Container(
            panel,
            {
                flexDirection: 'column',
                flexGrow: 1,
                width: 200,
                height: 300,
                padding:2,
                margin:2,
                alignItems: 'center',
                borderRadius:3,
                backgroundOpacity: 0.7,
                backgroundColor: "#eeeeee",
                visible: false
            },
            defaultProperties
        )


        let notification = new Text(
            'notification',
            {
                flexDirection: 'column',
                flexGrow: 1,
                width: 200,
                height: 30,
                padding:4,
                margin:4,
                borderRadius:5,
                backgroundOpacity: 0.8,
                backgroundColor: "#eeeeee",
                visible: false
            },
            defaultProperties
        )

        panel.add(sign_in)
        panel.add(notification)

        

        this.signal = signal
        // global_signals.viewport_alert
    }

    setup_signal(){

    }

}

export { Viewport_Panel }