<?php

use ntext\Filter;

require_once __DIR__ . '/../vendor/autoload.php';
require_once 'components/SredaController.php';
// use Widget\RequestController;
// use Widget\c;
// use Widget\state;

// RequestController::init();

echo '<script src="/js/widgets-js/build/widgets.js"></script>';




echo SredaController::html();
// echo SredaController::element()->print_r();


// echo Filter::element();
// echo Filter::print_r();


// state::set('counter', 1);


// $app = c::div(
//     [
//         c::input(state::watch('counter')),
//         c::button(
//             '+',
//             onclick: function(){
//                 $state = state::global();
//                 $state->counter++;
//             }
//         ),
//         c::button(
//             '-',
//             onclick: function(){
//                 $state = state::global();
//                 $state->counter--;
//             }
//         ),
//     ]
// );


// // echo $app->html(false);
// echo c::textarea($app->print_r(), style: 'width: 900px; height: 300px;');
// echo "<hr>";
// echo $app->html(true);




?>