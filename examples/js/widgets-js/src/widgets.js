

class widget {
	static defaultTag = 'div'
	static lastDialog = null
	static dialogHeight = {}
	static widgetStore = {}
    static names_length = 0
	
    static names = {}
    static proxys = {}
	static widgets = {}
	static name(name){
		if (name in widget.proxys){
			return widget.proxys[name];
		} else {
			return false;
			// const props = widget.proxys[name];
			// const element = c[props.element](props)
			// widget.proxys[name] = element;
			// return element;
		}
    }






	constructor(tag, props = {}, child = []){
		this.type = tag
		this.name = widget.nextName(props)
		widget.widgets[this.name] = this
        // this.props = props
        this.childs = child
		this.assignProps(props)
		// this.setChild(child)
    }

	bindElement(element = false){
		if (!element){
			if (this.name in widget.names){
				return widget.names[this.name]
			} else {
				return false
			}
		} else {
			widget.names[this.name] = element
		}
	}

	static getWidget(name){
		if (name in widget.widgets){
			return widget.widgets[name]
		} else {
			return false
		}
	}
	

	static createElement(tag = false, props = {}){
		return c[tag](props)
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
		let childElement = new widget(this.type, this.props, child)
		
		const element = this.bindElement()
		if (element){
			widgetDom.update(element, this, childElement)
		}
		this.childs = childElement.childs


		widget.delete(childElement)
		childElement = null
	}
	
	static delete(element){
		element = null
	}

    assignProp(prop, value){ // prop = value
		if (prop=='child' && this.props.element in WidgetConvertor.singleElement){
			const setChildToProp = WidgetConvertor.singleElement[this.props.element]
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
			// case 'style':
				
			// break;
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

			const element = this.bindElement()
			if (element){
				widgetDom.__linkToElement(this.name, element, prop, value)
			} else {
				console.log('Элемент не создан, не обновляю dom')
			}
		} else {
			console.info('__link','Применение массива не поддурживается', props, value);
		}
	}



    static pushChilds(array, childs){
		if (this.tag == '')
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
		if ('value' in element) {
			element.value = widget.name(element._name).value 
		}

		if (this.props.element in WidgetConvertor.singleElement && WidgetConvertor.singleElement[this.props.element]){
			const child = widget.singleElement[this.props.element]
			element[child] = widget.name(element._name).element[child] 
		}

        if (childs.length!=0) {
            element['child'] = childs;
        }

        return element;
    }



	widget(){
		return () => this
	}

	props(){
		return () => this.props
	}

	childs(){
		return () => this.childs
	}

	type(){
		return () => this.type
	}




	name(){
		return this.props._name;
	}

	setMyName(self, name){
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

		console.log('На объект', this, 'Установить свойство ', prop, value, dopvalue);
        // switch(prop){
		// 	case 'indexName':
		// 		this.setMyName(self, dopvalue + '_' + value)
        //         return self
		// 	break;
		// 	case 'setName': 
        //     case 'name': 
        //         this.setMyName(self, value)
        //         return self
        //     case 'toArray':
        //         return this.toArray();
        //     case 'element':
        //         return this.toElement();



			
		// 	default: // add child to self
        //         const child = c[prop](value)
        //         self.child = child
        //         return child
        // }
    }


    static renderTo(querySelector, element){
		element = WidgetConvertor.toHTML(element)
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

    static app(render){
        c.renderTo('#app', render)
    }

    static body(element){
        widget.renderTo('body', element)
    }
}
