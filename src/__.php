<?php

namespace Widget;

class __
{
    static function __callStatic($name, $arguments)
    {
        return c::{"div__$name"}(...$arguments);
    }
}