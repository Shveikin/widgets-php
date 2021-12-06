<?php

namespace ntext;
require_once __DIR__ . '/../vendor/autoload.php';

use Widget\c;


class Filter extends \Widget\WidgetsApp
{
    static $url = 'http://localhost:2000/Filter.php';
    static $useState = ['global'];

    function draw($layout){
        $layout->child = [
            c::input('111',
                onchange: $this->say
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