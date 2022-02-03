<?php

use Widget\c;
use Widget\state;
use Widget\WidgetsConponent;

function stateElement(){
    return [
        'element' => 'StateElement',
        'props' => func_get_args()
    ];
}

class Table extends WidgetsConponent
{

    static $useState = [MapState::class];

    function draw($layout, $props){

        $layout->child = c::unitInput(value: 'min', unitState: 'state');

    }
}