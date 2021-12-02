

class widget {
	static defaultTag = 'div'
	static lastDialog = null
	static dialogHeight = {}
	static widgetStore = {}
    static names = {}
    static names_length = 0
	
    static proxys = {}
	static name(name){
		if ('widget' in widget.proxys[name]){
			return widget.proxys[name];
		} else {
			const props = widget.proxys[name];
			const element = c[props.element](props)
			widget.proxys[name] = element;
			return element;
		}
    }



	static createElement(tag = false, props = false, state = false) {
		return c[tag](props, state)
	}

    static widgetRegister(name, _widget = () => false) {
		if (name in widget.widgetStore){
			throw 'Компонент ' + name + ' - уже зарегистрирован!';
			return false;
		}
		widget.widgetStore[name] = (prps) => {
			return _widget(prps)
		}
		return true;
	}

	static nextName(props){
		let _name = 'element_';
		if (typeof props == 'object' && '_name' in props){
			_name = props._name;
		} else {
			widget.names_length++
			_name += widget.names_length;
		}
		return _name;
	}

	static indexName(index, name){
        return widget.name(name + '_' + index)
    }

	static singleElement = {
		area: false,
		base: false,
		br: false,
		col: false,
		embed: false,
		hr: false,
		img: 'src',
		input: 'value',
		textarea: 'value',
		link: 'href',
		menuitem: false,
		meta: false,
		param: false,
		source: false,
		track: false,
		wbr: false,
	}

    constructor(tag, props = {}, state = false) {
		const _name = widget.nextName(props)

        this.childs = []
        this.props = {
            element: tag,
            _name
        }

		this.element = document.createElement(tag);
		widget.names[_name] = this.element

        if (typeof props == 'function' && state){
            props = props(WidgetState.use(state))
        }

		this.assignProps(props)
    }

	assignProps(props){
		if (Array.isArray(props)){
			// this.assignProp('child', props)
			this.setChild(props)
		} else {
			if (typeof props == 'object' && !('widget' in props)){
				Object.keys(props).map(prop => {
					this.assignProp(prop, props[prop])
				})
			} else {
				// this.assignProp('child', props)
				this.setChild(props)
			}
		}
	}

	setChild(child){
		if (Array.isArray(child)){
			this.childs = child
		} else {
			this.childs = [child]
		}

		this.renderChilds()
	}
	
	renderChilds(){
		this.element.innerHTML = '';
		
		this.childs.map(child => {
			const _child = WidgetConvertor.toHTML(child) 
			// widget.convertor({
			// 	element: child,
			// 	to: ['HTML']
			// })

			this.element.appendChild(_child)
		})
	}

    assignProp(prop, value){ // prop = value
		if (prop=='child' && this.props.element in widget.singleElement){
			const setChildToProp = widget.singleElement[this.props.element]
			if (setChildToProp){
				this.__link(setChildToProp, value)
			}
		}

        if (prop=='child'){
			
			this.setChild(value)

        } else {
			let update = true;
			if (WidgetConvertor.getType(this.props[prop])=='WidgetTools'){
				update = this.props[prop]['view'] != value
				if (update)
					this.props[prop]['view'] = value
			} else {
				update = this.props[prop] != value
				if (update)
					this.props[prop] = value
			}
			if (update){
				this.assignPropToElement(prop, value);
			}
        }
    }

	
	assignPropToElement(prop, value){
		switch (prop) {
			case '_name':
			
			break;
			case 'child':
				this.setChild(value)
			break;
			case 'style':
				
			break;
			default:
				this.__link(prop, value)
			break;
		}
	}

	__link(prop, value){
		value = widget.convertor({
			element: value,
			to: (prop.substr(0,2)!='on' && typeof value != 'function')
				?['State', 'String']
				:['Function']
		})

		// if (prop=='0') prop = 'child'

		if (!Array.isArray(prop)){
			if (WidgetState.canBind(value)) {
				WidgetState.inspector(value, [this.props._name, prop])
			} else {
				this.element[prop] = value
			}
		} else {
			console.info('__link','Применение массива не поддурживается', props, value);
		}
	}

    static pushChilds(array, childs){
        if (Array.isArray(childs)) {
            childs.map(itm => {
                widget.pushChilds(array, itm)
            })
        } else if (typeof childs == 'object' && 'widget' in childs) {
            array.push(childs.toArray())
        } else {
            array.push(childs)
        }
    }

    toArray(){
        const childs = []
        widget.pushChilds(childs, this.childs);

        const element = this.props;
        if (childs.length!=0) {
            element['child'] = childs;
        }

        return element;
    }

    toElement(){
		return this.element
		// const name = this.props._name;
		// if (name in widget.names){
		// 	return widget.names[name]
		// } else {
		// 	// return widget.createElement('__', this.toArray())
		// }
    }

	name(){
		return this.props._name;
	}

	setName(self, name){
		const _last_name = this.props._name
		if (_last_name in widget.names){
			const domElement = widget.names[_last_name]
			delete widget.names[_last_name]
			widget.names[name] = domElement
		}
		this.props._name = name
		widget.proxys[name] = self
	}

    setProp(self, prop, value, dopvalue){ // prop.(val)
        switch(prop){
			case 'indexName':
				this.setName(self, dopvalue + '_' + value)
                return self
			break;
            case 'name': 
                this.setName(self, value)
                return self
            case 'toArray':
                return this.toArray();
            case 'element':
                return this.toElement();
            default: // add child to self
                const child = c[prop](value)
                self.child = child
                return child
        }
    }


    static renderTo(querySelector, element, state = false){
		element = widget.convertor({
			element, 
			state,
			to: ['HTML']
		})
		let toElement = window.document.querySelector(querySelector);
		if (toElement){
			toElement.innerHTML = '';
			toElement.appendChild(element)
		} else {
			window.addEventListener('load', () => {
				toElement = window.document.querySelector(querySelector);
				toElement.innerHTML = '';
				toElement.appendChild(element)
			});
		}
    }

    static app(render, state = {}){
        c.renderTo('#app', render, state)
    }

    static body(element, state){
        widget.renderTo('body', element, state)
    }
}
