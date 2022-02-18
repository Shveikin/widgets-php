<?php

namespace Widget\tool;

use Widget\state;

class dialogstate extends state {
    static $default = [
        '__widget' => false
    ];
}

class widgetdialog {
    static $style = [];
    static function show(...$props){
        dialogstate::state()->__widget = $props['message'];
    }
}