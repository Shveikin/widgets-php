<?php

namespace Widget;

abstract class WidgetsConponent
{
    static $include_script = true;
    static $url = false;
    static $useState = [];

    public $element;

    private static $widgetsApp = false;
    static function main(){
        if (static::$widgetsApp==false){
            static::$widgetsApp = new static();
        }

        return static::$widgetsApp;
    }

    static function __callStatic($name, $arguments)
    {
        return static::main()->{"static__{$name}"}(...$arguments);
    }

    function draw($layout)
    {
        $layout->child = 'Метод draw не инициализирован!';
    }

    function static__get($function_name){
        return static::main()->{$function_name};
    }

    private $layout = false; 
    function layout()
    {
        if ($this->layout==false){
            $this->layout = c::div();
            $this->draw($this->layout);
        }
        return $this->layout;
    }

    function static__element()
    {
        return $this;
    }

    function static__html()
    {
        return $this->layout()->html(static::$include_script);
    }

    function __toString()
    {
        return $this->static__html();
    }

    function static__print_r()
    {
        return $this->layout()->print_r();
    }

    function __get($function_name)
    {
        return new BindElement(
            function: $function_name,
            url: static::$url?static::$url:realpath(__FILE__),
            class: get_class($this),
            useState: static::$useState,
        );
    }

    function __construct($createDefaultState = true)
    {
        if ($createDefaultState){
            $this->selfState();
        }
    }

    static function runFetchRequest($data)
    {
        $props = $data['props'];
        $class = $props['class'];
        $function = $props['function'];
        $function_props = $props['props'];
        
        $_this = $data['this'];
        
        $instance = new $class();
        $instance->element = c::div(...$_this);
        $instance->{$function}(...$function_props);
    }

    static function init()
    {
        $data = file_get_contents('php://input');
        if ($data) {
            $data = json_decode($data, true);
            if (isset($data['props'])){
                self::runFetchRequest($data);
            }
        }
    }

    /** 
     * Собственный стейт
    */
    function selfState(){

    }
}


register_shutdown_function(function(){
    WidgetsConponent::init();
});