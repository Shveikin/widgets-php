class widgetconvertor {

	static singleElement = {
		area: false,
		base: false,
		br: false,
		col: false,
		embed: false,
		hr: false,
		img: 'src',
		input: 'value',
		textarea: 'innerHTML',
		link: 'href',
		menuitem: false,
		meta: false,
		param: false,
		source: false,
		track: false,
		wbr: false,
	}

	static distribution(type, source = {}){
		let props = {}
		let childs = []
		
		const childElements = ['child', 'childs', 'element']

		const sourceType = widgetconvertor.getType(source)
		switch (sourceType) {
			case 'String':
			case 'Int':
				let property = 'innerHTML';
				if (type in widgetconvertor.singleElement){
					property = widgetconvertor.singleElement[type]
				}
				props[property] = source
			break;
			case 'WidgetTools':
				childs = source
			break;
			case 'Array':
				childs = widgetconvertor.toArrayOfWidgets(source)
			break;
			case 'Element':
				type = source.element
			case 'Object':
				// if ('type' in source){
				// 	type = source['type']
				// }
				Object.keys(source).forEach(prop => {
					if (childElements.includes(prop)){
						if (prop!='element'){

							if (type in widgetconvertor.singleElement){
								const property = widgetconvertor.singleElement[type]
								props[property] = source[prop]
							} else {
								childs = widgetconvertor.toArrayOfWidgets(source[prop])
							}

						}
					} else {
						props[prop] = source[prop]
					}
				})
			break;
			case 'Widget':
			case 'WidgetTools':
			case 'State':
				childs = [source]
			break;
		}

		return [type, props, childs]
	}



    static convert(element, from, to, state = false){
		if (from == to){
			return element
		}
        const func = `${from}To${to}`
		
        if (func in widgetconvertor){
			const result = widgetconvertor[func](element, state)
			const newType = widgetconvertor.getType(result)
			if (newType==to){
				return result;
			} else {
				return widgetconvertor.convert(result, newType, to)
			}
        } else {
            throw new Error(`${func} отсутствует!`);
        }
    }


	static toArrayOfWidgets(element){
		if (!Array.isArray(element))
			element = [element]

		const result = []
		element.forEach(source => {
			const sourceType = widgetconvertor.getType(source)
			switch (sourceType) {
				case 'Widget':
					result.push(source)
				break;
				default:
					result.push(c.div(source))
				break;
			}
		})

		return result
	}


    static getType(element){
		let type = 'Unknown'
        if (Array.isArray(element))
			type = 'Array'
		else
        if (typeof element == 'object'){
			type = 'Object'
			
			if ('type' in element && 'props' in element && 'childs' in element)
				type = 'Widget'
			else
			if ('link' in element)
				type = 'State'
			else
			if ('element' in element)
				type = 'Element'
				if (typeof widgettools[element.element] === 'function'){
					type = 'WidgetTools'
				}
		} else
		if (typeof element=='string')
			type = 'String'
		else
		if (typeof element=='number')
			type = 'Int'
		else
		if (element instanceof HTMLElement || element instanceof Text)
			type = 'HTML'
		else
		if (typeof element == 'function')
			type = 'Function'
		
		return type;
	}


    static checkState(widget, prop){

        let value = prop!='childs'?widget.props[prop]:widget.childs
		if (prop=='childs' && (!('rootElement' in widget))){
			widget.rootElement = document.createElement(widget.type)
		}

		let change = false;
		if (widgetconvertor.getType(value)=='WidgetTools'){
			value = widgettools.create(value)
			change = true
		}

		if (widgetconvertor.getType(value)=='State'){
			value = widgetstate.inspector(value, widget, prop)
			change = true
			// return [true, false]
		}

		return [change, value]
	}






	static toFunction(element){
		return widgetconvertor.convert(element, widgetconvertor.getType(element), 'Function')
	}

	static WidgetToolsToFunction(WidgetTool){
		return widgettools.create(WidgetTool)
	}

	static StateToFunction(State){
		return State.link
	}
}