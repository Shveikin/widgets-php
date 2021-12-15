<style>
    .sliderPoint {
        border: 2px solid rgb(0, 150, 187);
        border-radius: 50%;
        height: 12px;
        width: 12px;
        cursor: pointer;
        position: absolute;
        margin-top: 9px;
        background: #fff;
    }

    .sliderInput {
        padding: 5px;
        border: 1px solid #ddd;
        border-radius: 5px;
    }

    .sliderLine {
        padding: 2px;
        background: #ddd;
        border-radius: 5px;
        position: absolute;
        width: 100%;
        box-sizing: border-box;
        left: 0;
        top: 16px;
    }

    #dragElement {
        padding: 10px;
        background: #f00;
    }
</style>
<?php

use Widget\c;

require_once __DIR__ . '/../vendor/autoload.php';
require_once 'states/SredaState.php';
require_once 'components/SredaController.php';


// if (!$_SERVER['DOCUMENT_ROOT'])
    $_SERVER['DOCUMENT_ROOT'] = "C:/xampp2/htdocs/revo";

require_once $_SERVER['DOCUMENT_ROOT'] . '/env.php';

imprt([
    'function_list',
    'sqli_connect',
    'rashodstate',
    // 'rashod',
    // 'config',
    // // 'ModxClearMashine',
    // // 'FilterViewController',
    // 'switch',
    // 'ParserSettingController',
    // // 'console',
    // 'HashMaster',
    // 'FilterController',
    // // 'timer',
    // 'DataGet',
    // 'SiteController',
    // 'types',
    // 'datahub',
    // 'RequestController',
    // 'SliderController',
    // 'RequestExecutor',
    // 'ModxController',
]);


$mysqli = getConnect();
$mysqli_JINO = getConnect(JINO);



echo '<script src="/js/widgets-js/build/widgets.js"></script>';
echo '<script src="/js/components/slider.js"></script>';



// $first = SredaController::element();

// echo c::div([
//     SredaController::element(),
// ])->html(true);


// echo c::div('Hello');

RashodState::state();

echo c::slider(
    state: 'rashod',
    title: 'Расход',
    range: ['min' =>  0, 'max' => 200],
    sliderWidth: 500,
    type: 'int'
)->html(true);

// echo $first->html(true);

// echo $first->print_r();

?>