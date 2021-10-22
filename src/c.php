<?php

namespace Widget;

class c
{
    static function __callStatic($name, $arguments)
    {
        echo "[$name]";
    }
}