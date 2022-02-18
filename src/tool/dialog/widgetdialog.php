<?php

namespace Widget\tool\dialog;

use Widget\WidgetsConponent;

class widgetdialog extends WidgetsConponent{
    static $style = [];
    static function show(...$props){

        if (isset($props['message']))
            dialogstate::state()->__message = $props['message'];


    }


    function draw($layout, $props){
        $layout->child = dialogstate::state()->watch('__message');
    }
}