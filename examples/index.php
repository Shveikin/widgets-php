<?php
require_once __DIR__ . '/../vendor/autoload.php';
use Widget\c;


$textarea = c::textarea(
    value: 'Hello', style: ['padding' => '10px']
);

$textarea->value = '12323';

c::app(
    $textarea
);