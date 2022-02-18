
class widgetdialog {
    static show(props, title = false){
        const proptype = widgetconvertor.getType(props)
        const state = widgetstate.name('dialogstate')

        switch (proptype) {
            case 'String':
                state.__message = props
                if (title)
                    state.title = title
            break;
            case 'Object':
                if ('message' in props)
                    state.__message = props['message']

                if ('title' in props)
                    state.title = props['title']
            break;
            case 'Bool':
                state.__message = false
            break;
        }
        
    }

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
                            className: '_form_h12nbsx9dk23m32ui4948382'
                        }),
                        className: 'form_panel_h12nbsx9dk23m32ui4948382',
                    }),
                    c.div({
                        child: ['', $state.watch('__buttons')],
                        className: 'buttons_panel_h12nbsx9dk23m32ui4948382'
                    })
                ],
                className: 'window_h12nbsx9dk23m32ui4948382'
            }),
            className: 'black_h12nbsx9dk23m32ui4948382',
            style: $state.watch('__style')
        })

        $state.watch('__message')
            .is(false, 'opacity: 0; visibility: hidden;', '')
            .link(style => { 
                $state.__style = style 
            }
        )

        c.render('body', window, 'append')
    }
}

widgetdialog.__init__();

function showDialog(props, title = false){
    widgetdialog.show(props, title)
}