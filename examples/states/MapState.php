<?php

use Widget\state;

class MapState extends state
{
    static $name = 'state';
    static $default = [
        'unit' => 'c',
        'min' => 23,
    ];

    static $modifiers = [
        'unit' => 'unitToRu'
    ];
}