
c.reactTree = () => {
    const html = document.createElement('div')

    ReactDOM.render(React.createElement(React.StrictMode, null, React.createElement(TreeApp.bind({
        checkedKeys: [],
        onSelect: (data) => { 
            console.log('select', data)
            // window.open(`http://fluidline.beget.tech/REVOLUTION/INTERFACE2/parser/${data[0]}/img`, '_blank') 
        },
        checkedKeys: ["26128"],
        onCheck: (check) => {
            console.log('check', check)

            // input.value = check.join(',')
        },
    }), null)), html)

    return html
}