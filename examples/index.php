<?php
require_once __DIR__ . '/../vendor/autoload.php';
use Widget\c;
use Widget\widget;

c::app(
    function ($layout, $state) {
        $layout->child = [
            c::div(innerHTML: $state->watch('count')),
            c::button(
                child: 'click', 
                onclick: $state->set('count', "{$state}['count'] + 1")
            )
        ];

        // echo "<pre>";
        // print_r($layout->toArray());
        // echo "</pre>";

    }, 
    [
        'count' => 1
    ]
);
