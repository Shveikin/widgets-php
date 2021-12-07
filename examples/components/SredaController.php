<?php

use Widget\state;
use Widget\WidgetsConponent;

class SredaController extends WidgetsConponent
{
    
    function selfState(){
        state::create('sreda', 
            [
                'sreda_id' => 14,
                'weight' => 1000,
                'sreda_title' => 'Вода'
            ]
        );
    }

    function draw($layout){
        $stateSreda = state::name('sreda');

        $layout->div(
            
        );
    }
}