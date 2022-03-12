
class widgetdialog {

    
    static props = {
        template: 'template',
        __message: 'message',
        title: 'title',
        __buttons: 'buttons', 

        hidetitle: 'hidetitle',
        width: 'width',
        height: 'height',
        
        _active: 'active',
        active_arrow: 'active_arrow',
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
                            style: $state.watch(height => `min-height: ${height?height:120}px;`)
                        }),
                        className: 'form_panel_h12nbsx9dk23m32ui4948382',
                    }),
                    c.div({
                        child: ['', $state.watch('__buttons')],
                        className: 'buttons_panel_h12nbsx9dk23m32ui4948382'
                    })
                ],
                className: $state.watch(active_arrow => active_arrow
                    ?`window_h12nbsx9dk23m32ui4948382 window_active_arrow_${active_arrow}`
                    :'window_h12nbsx9dk23m32ui4948382'
                ),
                style: $state.watch('__position')
            }),
            className: $state.watch(active_arrow => active_arrow
                ?`black_h12nbsx9dk23m32ui4948382 black_habsolute`
                :'black_h12nbsx9dk23m32ui4948382'
            ),
            
            style: $state.watch('__style'),
            _onclick(){
                $state.__message = false
            }
        })

        $state.watch('__message')
            .is(false, 'opacity: 0; visibility: hidden;', '')
            .link(style => { 
                widgetdom.querySelector('body').then(body => {
                    if ($state.__style)
                        body.style.overflow = 'auto'
                    else
                        body.style.overflow = 'hidden'
                })

                $state.__style = style
            }
        )

        $state.watch(['width', 'height', '_active', 'hidetitle'])
        .link((width, height, active, hidetitle) => {
            let window_style = ''

            if (width) window_style += `width: ${width}px; `
            if (height) window_style += `min-height: ${hidetitle?height:height+39}px; `

            if (active){
                if ('element' in active){
                    widgetdom.querySelector(active.element).then(element => {
                        const rect = element.getBoundingClientRect()
                        window_style += `position: absolute; margin: 0;`


                        window_style += `bottom: calc(100% - ${rect.y-10}px); `
                        window_style += `left: ${rect.x}px; `

                        $state.active_arrow = 'bottom'

                        $state.__position = window_style
                    })
                }
            } else {
                $state.active_arrow = false
            }


            $state.__position = window_style
        })


        c.render('body', window, 'append')
    }


    static setup(template_name, props){
        widgetdialog.templates[template_name] = props
    }

    static template(template_name){
        if (template_name)
        if (template_name in widgetdialog.templates){

            const template = widgetdialog.templates[template_name];

            for (const [statekey, objectkey] of Object.entries(widgetdialog.props)){
                if (objectkey in template){
                    widgetdialog.setPorp(statekey, template[objectkey])
                } else {
                    widgetdialog.setPorp(statekey, false)
                }
            }
        } else {
            if (widgetdom.debug)
                console.info(template_name, ' отсутствует')
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
        switch (prop){
            case '__buttons':
                if (typeof value == 'object'){
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
                }
            break;
            case 'template':
                widgetdialog.template(value)
            break;
            default:
                state[prop] = value
            break;
        }
    }
}

widgetdialog.__init__();

function showDialog(props, title = false){
    widgetdialog.show(props, title)
}

