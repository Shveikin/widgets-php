<?php

use Widget\WidgetsConponent;

class TestComponent extends WidgetsConponent {

    function mainState(){
        $this->createState('next', [
            'say' => 'Hola'
        ]);
    }

    function draw($layout) {
        $layout->innerHTML = $this->state('next')->watch('say');
    }
}