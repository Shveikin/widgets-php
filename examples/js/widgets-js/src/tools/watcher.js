
class widgetwatcher {
    constructor(props = false){
        if (props)
            this.set_props(props);
        
        // this._is = false
    }

    arr(val){
        return Array.isArray(val)?val:[val]
    }

    set_props(props){
        Object.keys(props).forEach(itm => {
            if (typeof this[itm] == 'function'){
                const prop = this.arr(props[itm])
                this[itm].apply(this, prop)
            } else {
                this['_'+itm] = props[itm]
            }
        })
    }

    keys(array){
        this._keys = this.arr(array)
    }

    state(stateName){
        this._stateName = stateName
        this._state = widgetstate.name(stateName)
        return this
    }

    _callback = {}
    _callbackautokey = 1
    callback(_callback, callbackkey = false){
        if (!callbackkey) callbackkey = this._callbackautokey++
        this._callback[callbackkey] = _callback
    }

    _current_value = false 
    check_current_value(){
        return Array.isArray(this._current_value)
    }

    get_current_value(){
        return this._current_value[0]
    }

    set_current_value(value){
        this._current_value = [value]
        return value
    }

    
    current_value(callback){
        if (this.check_current_value()){
            return this.set_current_value(
                callback(this.get_current_value())
            );
        } else {
            for (const key of this._keys){
                return this.set_current_value(
                    callback(this._state[key])
                );
            }
        }
    }

    current_value_init(){
        const cvs = []

        for (const key of this._keys){
            cvs.push(this._state[key])
        }

        this.set_current_value(cvs)
        return cvs
    }



    // ------------------------- Модификаторы



    is(etalon, _true, _false = false){

        this.callback(keys => {
            return keys==etalon?_true:_false
        }, `is_${etalon}`)

        return this
    }

    is_default(_true, _false){
        
        this.callback(keys => {
            let _bind = false
            let _all_default = true
            if (this._stateName in widgetstate.props){
                if ('default' in widgetstate.props[this._stateName]){
                    _bind = true
                    for (const key of this._keys) {
                        const currentVal = this._state[key]
                        const defaultval = widgetstate.props[this._stateName]['default'][key]
                        
                        if (typeof currentVal != typeof defaultval){
                            console.log('----default TYPE NORM')
                            _all_default = false;
                            break;
                        } else
                        if (Array.isArray(currentVal)){
                            if (currentVal.join(',')!=defaultval.join(',')) {
                                _all_default = false;
                                break;
                            }
                        } else {
                            if (currentVal!=defaultval){
                                _all_default = false;
                                break;
                            }
                        }
                        
                    }
                }
            }
            
            console.log('IS DEFAULT', this._keys)

            if (_bind){
                return _all_default?_true:_false
            } else {
                return _false
            }
        }, 'is_default_')


        return this
    }

    is_empty(_true, _false){
        this.callback(keys => {
            let _all_empty = true

            for (const key of this._keys){
                const val = this._state[key]
                const type = widgetconvertor.getType(val)
                switch (type) {
                    case 'Array':
                        if (val.length != 0) {
                            _all_empty = false
                            break;
                        }
                    break;
                    case 'Int':
                        if (val != 0) {
                            _all_empty = false
                            break;
                        }
                    break;
                    case 'String':
                        if (val != '') {
                            _all_empty = false
                            break;
                        }
                    break;
                    default:
                        _all_empty = false
                        console.log('Не знаю как проверить на EMPTY', type, '|', val)
                        break;
                    break;
                }
            }

            return _all_empty?_true:_false
        }, 'is_default_')


        return this
    }

    in(arrayProp, _true, _false){
        arrayProp = Array.isArray(arrayProp)?arrayProp:this._state[arrayProp]

        this.callback(currentValue => {
            return arrayProp.includes(currentValue)?_true:_false
        })

        return this
    }

    in_state(state, arrayProp, _true, _false){
        const update = function(currentValue){
            return widgetstate.name(this.state)[this.arrayProp].includes(currentValue)
                ?_true
                :_false
        }.bind({state, arrayProp})

        this.callback(update)

        widgetstate.name(state).watch(arrayProp).link(array => {
            this.refrash()
        })

        return this
    }



    // ------------------------- LINK





    link(widget, widgetProp = false){
        this._widget = widget
        this._widgetProp = widgetProp

        if (!(this._stateName in widgetstate.updates)) 
            widgetstate.updates[this._stateName] = {}
        const ___updates = widgetstate.updates[this._stateName]
        
        this._widgetType = widgetconvertor.getType(widget)
        const id = this._widgetType=='Widget'?widget.id:Math.floor(Math.random() * 6)

        if (!Array.isArray(this._keys)){
            if (widgetdom.debug)
                console.error('this.keys must to be array type: ', this._keys)
        }

        const key = this._keys.join(',')

        for (const stateProp of this._keys){
            if (!(stateProp in ___updates)) ___updates[stateProp] = {}
            if (!(id in ___updates[stateProp])) ___updates[stateProp][id] = {}
            ___updates[stateProp][id][key] = this
        }

        this.refrash()
        return this
    }

    refrash(current_value_init = true){
        let value = false

        if (current_value_init)
            value = this.current_value_init()

        if (this._callback)
        for (const callback of Object.values(this._callback)){
            value = this.current_value(ArrayFromState => {
                if (typeof callback == 'function'){

                    return callback.apply(this, 
                        Array.isArray(ArrayFromState)
                            ?ArrayFromState
                            :[ArrayFromState]
                    )

                } else {
                    return ArrayFromState
                }
            })
        }

        this.applyToWidget(value)
    }

    applyToWidget(value){
        switch (this._widgetType) {
            case 'Widget':
                if (this._widgetProp == 'childs'){
                    const child = c.div(value)
                    widgetdom.update(this._widget, child)
                } else {
                    this._widget.props[this._widgetProp] = value
                    widgetdom.assignProp(this._widget, this._widgetProp)
                }
            break;
            case 'Function':
                this._widget.apply(this, this.arr(value));
            break;
            default:
                console.log('Не знаю как применить изменения ', this._widgetType);
            break;
        }
    }

}