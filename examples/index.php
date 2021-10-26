<?php
use Widget\c;
require_once __DIR__ . '/../vendor/autoload.php';



c::head('
    <title>Docucment</title>
');

c::app([
    c::div__testTs('Hello')
]);