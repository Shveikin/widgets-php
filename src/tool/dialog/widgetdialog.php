<?php

namespace Widget\tool\dialog;

use Widget\state;

class widgetdialog {
    static $style = [];
    static $renderDialogElementToHtml = false;

    static $props = [
        '__message' => 'message',
        'title' => 'title',
        '__buttons' => 'buttons', 
    ];

    static function show(...$props){

        foreach (self::$props as $key => $value) {
            if (isset($props[$value])){
                dialogstate::state()->{$key} = $props[$value];
            }
        }

    }
    
    static function show__fw(...$props){
        $rules = [];

        foreach (self::$props as $key => $value) {
            if (isset($props[$value])){
                $rules[] = dialogstate::state()->applyTo($key, $props[$value]);
            }
        }

        return state::group($rules);
    }

}