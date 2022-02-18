<?php

namespace Widget\tool\dialog;

use Widget\state;

class widgetdialog {
    static $style = [];
    static $renderDialogElementToHtml = false;

    static $props = [
        '__message' => 'message',
        'title' => 'title',
    ];

    static function show(...$props){
        $rules = [];

        foreach (self::$props as $key => $value) {
            if (isset($props[$value])){
                $rules[] = dialogstate::state()->applyTo($key, $props[$value]);
            }
        }

        return state::group($rules);
    }

}