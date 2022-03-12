<?php

use Widget\c;

require_once __DIR__ . '/../vendor/autoload.php';



// if (!$_SERVER['DOCUMENT_ROOT'])
    // $_SERVER['DOCUMENT_ROOT'] = "C:/xampp/htdocs/revo";
require_once $_SERVER['DOCUMENT_ROOT'] . '/states/MapState.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/components/Table.php';


// imprt([
//     'function_list',
//     'sqli_connect',
//     // 'rashodstate',
//     // 'rashod',
//     // 'config',
//     // // 'ModxClearMashine',
//     // // 'FilterViewController',
//     // 'switch',
//     // 'ParserSettingController',
//     // // 'console',
//     // 'HashMaster',
//     // 'FilterController',
//     // // 'timer',
//     // 'DataGet',
//     // 'SiteController',
//     // 'types',
//     // 'datahub',
//     // 'RequestController',
//     // 'SliderController',
//     // 'RequestExecutor',
//     // 'ModxController',
// ]);


// $mysqli = getConnect();
// $mysqli_JINO = getConnect(JINO);



echo '<script src="/js/widgets-js/build/widgets.js"></script>';
echo '<script src="/js/components/widgets.js"></script>';

// echo '<script src="/js/components/slider.js"></script>';
echo Table::widget()->html(true);



?>
<style>

    .filterInput_f2 {
        padding: 5px;
        border: 1px solid #f4f4f4;
        background-color: #f4f4f4;
        width: 150px !important;
        margin: 0 !important;
    }

    input[type=number], input[type=password], input[type=text], textarea {
        -webkit-appearance: none;
    }

    input[type='number'] {
        width: 250px;
        margin: 5px;
        text-align: center;
    }

    button, input, optgroup, select, textarea {
        margin: 0;
        color: inherit;
        font-size: inherit;
        font-family: inherit;
        line-height: inherit;
    }

    input {
        box-sizing: border-box;
    }

    input, select, textarea, option {
        outline: none;
    }

    body {
        margin: 0;
        padding: 20px;
        font-family: "OpenSans", sans-serif;
        font-size: 12px;
    }




    .inputWrapper {
        position: relative;
        display: inline-block;
        overflow: hidden;
    }

    .inputWrapper:hover .inputUnit,
    .filterInput_f2:focus ~ .inputUnit{
        top: 30px;
        opacity: 0;
        visibility: hidden;
        transition: none;
    }

    .inputUnit {
        position: absolute;
        top: 0;
        padding: 5px 10px;
        right: 2px;
        transition: all .3s .2s;
    }

    .inputWrapper .filterInput_f2 {
        text-align: left;
        -moz-appearance: textfield !important;
        -webkit-appearance: none !important;
    }

    .filterInput_f2:focus,
    .filterInput_f2:hover {
        border: 1px solid #ddd;
    }

</style>
