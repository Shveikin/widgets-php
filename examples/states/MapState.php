<?php

use Widget\state;

class MapState extends state
{
    static $name = 'mapList';
    static $default = [
        '_list' =>  [
            [
                'text' => 'hello',
                'list' => [1,2,3],
            ],
            [
                'text' => 'world',
                'list' => [5,6,38],
            ],
        ]
    ];
}