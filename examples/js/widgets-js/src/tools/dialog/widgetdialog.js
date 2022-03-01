
class widgetdialog {

    
    static props = {
        __message: 'message',
        title: 'title',
        __buttons: 'buttons', 

        hidetitle: 'hidetitle',
        width: 'width',
        height: 'height',
        
        _linkactive: 'linkactive',
    }
    static templates = []

    static __init__(){
        const $state = widgetstate.name('dialogstate')
        const window = c.div({
            child: c.div({
                child: [
                    $state.check('hidetitle', false,
                        c.div({
                            child: [
                                '',
                                c.div({
                                    child: $state.watch('title'),
                                    className: 'dialogTitle_h12nbsx9dk23m32ui4948382'
                                }),
                                c.button({
                                    child: '✖',
                                    onclick(){
                                        $state.__message = false
                                    }
                                })
                            ],
                            className: 'close_panel_h12nbsx9dk23m32ui4948382'
                        }),
                        false
                    ),
                    c.div({
                        child: c.form({
                            child: c.fieldset({
                                child: $state.watch('__message')
                            }),
                            className: '_form_h12nbsx9dk23m32ui4948382',
                            style: $state.watch(height => `min-height: ${height?height:'120px'};`)
                        }),
                        className: 'form_panel_h12nbsx9dk23m32ui4948382',
                    }),
                    c.div({
                        child: ['', $state.watch('__buttons')],
                        className: 'buttons_panel_h12nbsx9dk23m32ui4948382'
                    })
                ],
                className: 'window_h12nbsx9dk23m32ui4948382',
                style: $state.watch('__position')
            }),
            className: 'black_h12nbsx9dk23m32ui4948382',
            style: $state.watch('__style')
        })

        $state.watch('__message')
            .is(false, 'opacity: 0; visibility: hidden;', '')
            .link(style => { 
                widgetdom.querySelector('body').then(body => {
                    if (style)
                        body.style.overflow = 'auto'
                    else
                        body.style.overflow = 'hidden'
                })

                $state.__style = style 
            }
        )

        $state.watch(['width', 'height', '_linkactive'])
        .link((width, height, linkactive) => {
            let window_style = ''

            if (width) window_style += `width: ${width};`
            if (height) window_style += `height: ${height};`
            // if (linkactive) {
                console.log('linkactive', linkactive)
                console.log('window_style', window_style)

            // }

            $state.__position = window_style
        })


        c.render('body', window, 'append')
    }


    static setup(template_name, props){
        widgetdialog.templates[template_name] = props
    }

    static template(template_name){
        if (template_name in widgetdialog.templates){

            const template = widgetdialog.templates[template_name];

            for (const [statekey, objectkey] of Object.entries(widgetdialog.props)){
                if (objectkey in template){
                    widgetdialog.setPorp(statekey, template[objectkey])
                } else {
                    widgetdialog.setPorp(statekey, false)
                }
            }
        }

        return widgetdialog
    }

    static show(props = true, title = false){
        const proptype = widgetconvertor.getType(props)
        const state = widgetstate.name('dialogstate')




        switch (proptype) {
            case 'String':
                state.__message = props
                if (title)
                    state.title = title
            break;
            case 'Object':

                for (const [statekey, propkey] of Object.entries(widgetdialog.props)) {
                    if (propkey in props){
                        widgetdialog.setPorp(statekey, props[propkey])
                    }
                }

            break;
            case 'Bool':
                if (!props)
                    state.__message = false
            break;
        }
    }

    static setPorp(prop, value){
        const state = widgetstate.name('dialogstate')
        if (prop=='__buttons' && typeof value == 'object'){
            const buttons = [];
            for (const [buttontitle, func] of Object.entries(value)){
                buttons.push(
                    c.button({
                        child: buttontitle,
                        className: 'btn btnx',
                        onclick: () => {
                            widgetconvertor.toFunction(func).apply(this)
                        } 
                    })
                )
            }

            state[prop] = buttons
        } else {
            state[prop] = value
        }
    }
}

widgetdialog.__init__();

function showDialog(props, title = false){
    widgetdialog.show(props, title)
}

