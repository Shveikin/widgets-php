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
    static $url = '/';
    static $useState = [MapState::class];

    function draw($layout, $props){

        $layout->child = c::input(
            type: 'checkbox',
            checked: MapState::state()->modelIn('_box', 222),
        );
        $layout->child = c::input(
            type:'checkbox',
            checked: MapState::state()->modelIn('_box', 111),
        );

        $layout->child = c::input(
            type:'checkbox',
            checked: MapState::state()->modelIn('_empty', 555),
        );



    }

    function hello(){
        $data = MapState::state()->val('_box');

        return 'cc';
    }
}
