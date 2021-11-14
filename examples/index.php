<?php
use Widget\c;
require_once __DIR__ . '/../vendor/autoload.php';


$textarea = c::textarea(
    value: 'Hello', style: ['padding' => '10px']
);

$textarea->value = '12323';

c::app(
    $textarea
);