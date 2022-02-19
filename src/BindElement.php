<?php


namespace Widget;

class BindElement {
    private $props;
    private $extra = [];
    function __construct(...$props) {
        $this->props = $props;
    }

    function then($jsFunction){
        $this->extra['then'] = $jsFunction;
        return $this;
    }

    function get($prop) {
        return isset($this->props[$prop]) ? $this->props[$prop] : '';
    }

    function appy(...$props) {
        $request = [
            'element' => 'widget_request',
            'function' => $this->get('function'),
            'props' => $props,
            'url' => $this->get('url'),
            'class' => $this->get('class'),
            'useState' => $this->get('useState'),
            'extra' => $this->extra,
            'view' => '',
            'returnType' => $this->get('returnType'),
        ];

        return state::group($request);
    }

}