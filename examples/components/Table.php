<?php

require_once __DIR__ . '/../../vendor/autoload.php';


use Widget\c;
use Widget\state;
use Widget\tool\dialog\widgetdialog;
use Widget\WidgetsConponent;

function stateElement(){
    return [
        'element' => 'StateElement',
        'props' => func_get_args()
    ];
}

class Table extends WidgetsConponent
{

    static $url = '/request.php';

    static $useState = [MapState::class];

    function draw($layout, $props){

        $layout->child = c::unitInput(value: 'min', unitState: 'state');

        $layout->child = c::button(
            'click',
            onclick: $this->buttonclick
        );

    }

    function buttonclick(){
        widgetdialog::show(message: 'Hello');
    }
}