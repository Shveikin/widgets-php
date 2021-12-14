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

// $first = SredaController::element();

echo c::div([
    SredaController::element(),
])->html(true);

// echo $first->html(true);

// echo $first->print_r();

?>