<?php

require_once __DIR__ . '/../vendor/autoload.php';
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

echo SredaController::html();
echo SredaController::element()->print_r();

?>