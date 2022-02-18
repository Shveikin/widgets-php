<?php

namespace Widget\tool\dialog;

use Widget\state;

class dialogstate extends state {
    static $name = 'dialogstate';
    static $default = [
        '__message' => false,
        'title' => 'dialog',
    ];
}