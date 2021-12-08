<?php

require_once __DIR__ . '/../vendor/autoload.php';
require_once 'components/SredaController.php';
// use Widget\RequestController;
// use Widget\c;
// use Widget\state;

// RequestController::init();

echo '<script src="/js/widgets-js/build/widgets.js"></script>';

echo SredaController::html();
echo SredaController::element()->print_r();

?>