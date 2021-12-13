<?php

use Widget\c;
use Widget\WidgetsConponent;

class Filter extends WidgetsConponent
{
    static $url = '/components/Filter.php';
    static $useState = ['global'];

    function draw($layout){
        $layout->child = [
            c::input('111',
                oninput: c::js_function('console.log(this.value)')
            ),
            c::button('click',
                onclick: $this->say
            ),
        ];
    }

    function say(){
        echo print_r($this->element);
    }

}