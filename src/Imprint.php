<?php

namespace Widget;

class Imprint
{
    private $colls = [];
    private $state;
    private $prop;

    function __construct($state, $prop)
    {  
        $this->state = $state;
        $this->prop = $prop;
    }

    function __get($name)
    {
        $this->colls[$name] = true;
        return "**$name**";
    }

    function __call($name, $arguments)
    {
        if (method_exists($this->state, $name)){
            return $this->state->{$name}(...$arguments);
        } else {
            die("Метод не определен $name");
        }
    }

    function getColls(){
        return array_keys($this->colls);
    }
}