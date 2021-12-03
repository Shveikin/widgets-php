

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
		this.childs = child
		this.renderChilds()
	}
	
	renderChilds(){
		this.element.innerHTML = '';
		let _chils = this.childs

		switch(WidgetConvertor.getType(this.childs)){
			case "String":
				this.element.innerHTML = _chils;
			break;
			case "Element":
			case "Widget":
			case "State":
			case "Function":
			case "Array":
				_chils = WidgetConvertor.toHTML(this.childs)
			default:

				this.element.appendChild(_chils)
			break;
		}
		
	}

    assignProp(prop, value){ // prop = value
		if (prop=='child' && this.props.element in widget.singleElement){
			const setChildToProp = widget.singleElement[this.props.element]
			if (setChildToProp){
				this.__link(setChildToProp, value)
			}
		} else 
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

	/**
	 * Установка свойства
	 * @param {*} prop 
	 * @param {*} value 
	 * 
	 * Свойство может быть следующих типо
	 * String
	 * State
	 * Array - анимация
	 * WidgetTools - проверить на widgettools
	 */
	__link(prop, value){
		if (!Array.isArray(prop)){
			if (WidgetConvertor.getType(value)=='WidgetTools'){
				value = WidgetTools.create(value)
			}

			const type = WidgetConvertor.getType(value)

			switch(type){
				case 'String':
				case 'Int':
					this.element[prop] = value
				break;
				case 'WidgetTools':
					value = WidgetConvertor.toState(value)
				case 'State':
					WidgetState.inspector(value, [this.props._name, prop])
				break;
				case 'Function':
					if (prop.substr(0,2)=='on'){
						this.element[prop] = value
					} else {
						this.element[prop] = value()
					}
				break;
				default:
					console.info('Не применено', prop, value, type)
				break;
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
		element = WidgetConvertor.toHTML(element, state)
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
