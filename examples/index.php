<?php
use Widget\c;
require_once __DIR__ . '/../vendor/autoload.php';



c::app([
    c::div('Phone numver'),
    c::input__phoneNumber([
        'type' => 'text',
        'placeholder' => 'Number'
    ]),
    c::button([
        'child' => 'click',
        'onclick' => c::func('alert("ee")')
    ])
]);