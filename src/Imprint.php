<?php

namespace Widget;

class Imprint
{
    private $colls = [];

    function __get($name)
    {
        $this->colls[$name] = true;
        return "**$name**";
    }

    function getColls(){
        return array_keys($this->colls);
    }
}