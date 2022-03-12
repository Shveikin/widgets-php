<?php

use Widget\state;

class MapState extends state
{
    static $name = 'myState';
    static $default = [
        
    ];
    static $alias = true;

    static $content_type = 'array';

    
    static function onchange(){
        return Table::widget()->hello;
    }
}