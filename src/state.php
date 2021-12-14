<?php

namespace Widget;

class state {
    static $names = [];
    static $name = 'global';
    static $default = [];

    public static function name(string $stateName) {
        return self::$names[$stateName];
    }

    public static function create($stateName, $defaultArray = []) {
        self::$names[$stateName] = new state($stateName, $defaultArray);
    }


    private $data = [];
    private $_name = 'global';
    public function __construct($name, $defaultArray = []) {
        $this->_name = $name;
        $this->data = $defaultArray;
    }

    public function __set($prop, $value) {
        $this->data[$prop] = $value;
    }

    public function __get($prop) {
        if (!isset($this->data[$prop])) {
            $this->data[$prop] = 0;
        }

        return $this->data[$prop];
    }

    public function watch($watch, $callback = false) {
        return c::state_watcher(
            state: $this->_name,
            watch:$watch,
            callback:$callback,
            view:function () use ($watch) {
                return $this->data[$watch];
            }
            ,
        );
    }

    public function model($prop) {
        return c::state_model(
            state:self::$name,
            prop:$prop,
            view:self::get($prop),
        );
    }

    public function check($prop, $value, $true, $false = false) {
        return c::state_check(
            state: $this->_name,
            prop: $prop,
            value: $value,
            _true: $true,
            _false: $false,
            view: function () use ($prop, $true, $false) {
                return $this->{$prop}
                    ?$true
                    :$false;
            },
        );
    }

    public function map($prop, $callback){
        $imprint = new Imprint();
        $refernce = $callback($imprint);

        $state_map = c::state_map(
            state: $this->_name,
            prop: $prop,
            refernce: $refernce->toArray(),
            useColls: $imprint->getColls(),
            view: '***',
        );

        return $state_map;
    }

    public function update(...$prop){

        $state_update = c::state_update(
            state: $this->_name,
            stateProps: $prop,
        );
        
        return $state_update;
    }

    public static function toJs(){
        $stateArray = state::toArray();
        $js = '';
        foreach ($stateArray as $state) {
            $js .= " widgetstate.use(". json_encode($state) ."); ";
        }

        return $js;
    } 

    public static function toArray() {
        $result = [];
        foreach (self::$names as $state) {
            array_push($result, array_merge($state->data, ['_name' => $state->_name]));
        }

        return $result;
    }

    public function __toString() {
        return "widgetstate.name('{$this->_name}')";
    }

    public function checkTurn($props) {
        return c::js_function($this . ".checkTurn('$props')");
    }

    static function init(){
        if (!isset(self::$names[static::$name])){
            state::create(static::$name, static::$default);
        }
    }

    static function state(){
        return self::$names[static::$name];
    }

}
