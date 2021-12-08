<?php

use Widget\c;
use Widget\state;
use Widget\WidgetsConponent;

class SredaController extends WidgetsConponent {
    // static $singleState = true;
    static $include_script = true;
    static $url = '/index.php';

    function mainState() {
        $this->createGlobalState('sreda', [
            'sreda_id' => 14,
            'weight' => 1000,
            'sreda_title' => 'Вода',
        ]);

        $this->createState('sredaControllerProps', [
            'isOpen' => false
        ]);
    }

    function draw($layout) {
        $property = $this->state('sredaControllerProps');
        $layout->div([
            $this->state('sreda')->watch('sreda_title'),
            c::div(
                innerHTML: $property->check('isOpen', 
                    c::div('aaa'),
                    c::div('bbbb')
                )
            ),
            c::button('Выбрать среду',
                onclick:$this->select
            ),
        ]);

        $this->state('sreda')->sreda_title = 'Воздух';
        // $property->isOpen = true;
    }

    function select() {
        echo "Hello from select";
    }
}
