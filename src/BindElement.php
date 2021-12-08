<?php

namespace Widget;

class BindElement {
    private $props;
    function __construct(...$props) {
        $this->props = $props;
    }

    function get($prop) {
        return isset($this->props[$prop]) ? $this->props[$prop] : '';
    }

    function appy(...$props) {
        // return c::widget_request(
        //     function: $this->get('function'),
        //     props: [$props],
        //     url: $this->get('url'),
        //     class: $this->get('class'),
        //     useState: $this->get('useState'),
        //     view: '',
        // );

        return [
            'element' => 'widget_request',
            'function' => $this->get('function'),
            'props' => $props,
            'url' => $this->get('url'),
            'class' => $this->get('class'),
            'useState' => $this->get('useState'),
            'view' => '',
        ];
    }
}