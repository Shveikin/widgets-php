<?php

use Widget\c;
use Widget\state;
use Widget\WidgetsConponent;

class SredaController extends WidgetsConponent
{
    static $singleState = true;
    // static $include_script = false;
    static $url = '/index.php';

    function state()
    {
        $this->createState('sreda', [
            'sreda_id' => 14,
            'weight' => 1000,
            'sreda_title' => 'Вода',
        ]);
    }

    function draw($layout)
    {
        $stateSreda = state::name('sreda');

        $layout->div([
            $stateSreda->watch('sreda_title'),
            c::button('Выбрать среду',
                onclick: $this->select
            )
        ]);

        $stateSreda->sreda_title = 'Воздух';
    }

    function select(){
        echo "Hello from select";
    }
}
