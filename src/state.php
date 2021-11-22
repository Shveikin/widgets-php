<?php

namespace Widget;


class state
{
    static private $data = [];
    private $update = [];
    static $name = 'global';

    static function watch($watch, $callback = false){
        return c::state_watcher(
            state: self::$name,
            watch: $watch,
            callback: $callback,
            view: self::val($watch),
        );
    }

    static function model($prop){
        return c::state_model(
            state:self::$name,
            prop:$prop,
            view: self::val($prop),
        );
    }

    static function check($prop, $true, $false = false){
        return c::state_check(
            state: self::$name,
            prop: $prop,
            _true: $true,
            _false: $false,
            view: self::val($prop)
                    ?$true
                    :$false,
        );
    }

    static function val($key){
        $key = explode('.', $key);
        $val = self::$data;
        foreach ($key as $_key){
            if (isset($val[$_key]))
                $val = $val[$_key];
            else
                return false;
        }
        return $val;
    }

    static function setPath(&$prop, array $path, $value){
        $key = array_shift($path);
        if (!empty($path)){
            if (!isset($prop[$key])){
                $prop[$key] = [];
            }
            self::setPath($prop[$key], $path, $value);
        } else {
            $prop[$key] = $value;
        }
    }

    static function set($key, $value){
        self::setPath(self::$data, explode('.', $key), $value);
        // return c::js_function(self::$name.".$key = " . state::name().".filterOpen.$key")
    }

    static function init(...$state){
        self::$data = $state;
    }

    // public function set($key, $value)
    // {
    //     return c::js_function("{$this}.{$key} = {$value};");
    // }

    // public function get($key)
    // {
    //     return c::js_function("return {$this}.{$key}");
    // }

    // public function toArray()
    // {
    //     return $this->data;
    // }

    // static function dataToArray($data){
    //     $result = [];
    //     foreach($data as $key => $value){
    //         if (gettype($value) == 'array') {
    //             $result[$key] = self::dataToArray($value);
    //         } else if ($value instanceof widget) {
    //             $result[$key] = $value->toArray();
    //         } else {
    //             $result[$key] = $value;
    //         }
    //     }

    //     return $result;
    // }

    static function toArray(){
        $data = self::$data;
        $data['_name'] = self::$name;
        return $data;
    }

    public function __toString()
    {
        return "WidgetState.name('{$this->name}')";
    }

    static function name(){
        return "WidgetState.name('" . self::$name . "')";
    }
    
    // static function appy($props, $value){

    // }

    static function checkTurn($props){
        return c::js_function(self::name().".$props = !" . self::name() . ".$props");
    }

}
