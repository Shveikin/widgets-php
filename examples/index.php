<?php

require_once __DIR__ . '/../vendor/autoload.php';
use Widget\RequestController;
use Widget\c;
use Widget\state;

RequestController::init();

echo '<script src="/js/widgets-js/src/widgets.js"></script>';

state::set('counter', 1);

$app = c::div(
    [
        c::input(state::watch('counter')),
        c::button(
            '+',
            onclick: function(){
                $state = state::global();
                $state->counter++;
            }
        ),
        c::button(
            '-',
            onclick: function(){
                $state = state::global();
                $state->counter--;
            }
        ),
    ]
);


// echo $app->html(false);

echo $app->html(true);
// echo "<hr>";
// echo $app->print_r();


?>