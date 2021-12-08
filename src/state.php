<?php

namespace Widget;

class state
{
    static $names = [];

    public static function name(string $stateName)
    {
        return self::$names[$stateName];
    }

    public static function create($stateName, $defaultArray = [])
    {
        self::$names[$stateName] = new state($stateName, $defaultArray);
    }

    private $name = '';
    private $data = [];
    public function __construct($name, $defaultArray = [])
    {
        $this->name = $name;
        $this->data = $defaultArray;
    }

    public function __set($prop, $value)
    {
        $this->data[$prop] = $value;
    }

    public function __get($prop)
    {
        if (!isset($this->data[$prop])) {
            $this->data[$prop] = 0;
        }

        return $this->data[$prop];
    }

    public function watch($watch, $callback = false)
    {
        return c::state_watcher(
            state: $this->name,
            watch: $watch,
            callback: $callback,
            view: function() use($watch){
                return $this->data[$watch];
            }
            ,
        );
    }

    public function model($prop)
    {
        return c::state_model(
            state:self::$name,
            prop:$prop,
            view:self::get($prop),
        );
    }

    public function check($prop, $true, $false = false)
    {
        return c::state_check(
            state:self::$name,
            prop:$prop,
            _true:$true,
            _false:$false,
            view:self::get($prop)
            ? $true
            : $false,
        );
    }

    // function get($key){
    //     $key = explode('.', $key);
    //     $val = self::$data;
    //     foreach ($key as $_key){
    //         if (isset($val[$_key]))
    //             $val = $val[$_key];
    //         else
    //             return false;
    //     }
    //     return $val;
    // }

    // static function setPath(&$prop, array $path, $value){
    //     $key = array_shift($path);
    //     if (!empty($path)){
    //         if (!isset($prop[$key])){
    //             $prop[$key] = [];
    //         }
    //         self::setPath($prop[$key], $path, $value);
    //     } else {
    //         $prop[$key] = $value;
    //     }
    // }

    // static function set($key, $value){
    //     self::setPath(self::$data, explode('.', $key), $value);
    //     // return c::js_function(self::$name.".$key = " . state::name().".filterOpen.$key")
    // }

    // static function init(...$state){
    //     self::$data = $state;
    // }

    // static function initArray(array $state){
    //     self::$data = $state;
    // }

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

    public static function toArray()
    {
        $result = [];
        foreach (self::$names as $state) {
            array_push($result, array_merge($state->data, ['_name' => $state->name]));
        }

        return $result;
    }

    public function __toString()
    {
        return "WidgetState.name('{$this->name}')";
    }

    // static function name(){
    //     return "WidgetState.name('" . self::$name . "')";
    // }

    // static function appy($props, $value){

    // }

    public function checkTurn($props)
    {
        return c::js_function($this . ".checkTurn('$props')");
    }

}
