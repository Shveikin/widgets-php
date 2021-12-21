<?php

namespace Widget;

use ErrorException;

class state {
    public $_name; // настоящее имя стейта
    public $_data = [];
    public $_alias = false; // [значение в state => значение в URL]
    public $_default = false; // те значения которые совпадют с default в url записываться не будут

    function __construct($name, $defaultArray = false) {
        $this->_name = $name;
        $this->_data = static::default();

        if ($defaultArray!=false){
            $this->_data = $defaultArray;
        }

        $alias = static::alias();
        if ($alias){
            $isMulti = $this->isMultiArray($alias);
            $this->_alias = [];
            foreach ($alias as $key => $val){
                if (!$isMulti) $key = $val;

                if (substr($val, 0, 1)=='_') $val = substr($val, 1);
                $this->_alias[$key] = $val;
            }
        }

        if ($this->_alias)
        foreach ($this->_alias as $key => $value) {
            $this->_default[$key] = $this->_data[$key]; // Установил значения по умолчанию
        }

        
        $this->updateStartingValues();

        state::$names[$this->_name] = $this;
    }

    function stateJsContructor(){
        $props = ['name' => $this->_name];
        if ($this->_alias){
            $props['alias'] = $this->_alias;
        }
        if ($this->_default){
            $props['default'] = $this->_default;
        }
        
        return "widgetstate.use(". json_encode($this->_data).','. json_encode($props) . ");";
    }

    function updateStartingValues(){
        if ($this->_alias)
        foreach ($this->_alias as $stateKey => $urlKey) {
            if (isset($_GET[$urlKey])){
                if (isset($this->_default[$stateKey]) && is_array($this->_data[$stateKey])){
                    $this->_data[$stateKey] = explode(',', $_GET[$urlKey]);
                } else {
                    $this->_data[$stateKey] = $_GET[$urlKey]; // Установил значения по умолчанию
                }
            }
        }
    }

    function isMultiArray($a){ 
		return array_values($a)!==$a;
	}

    function getName(){
        return $this->_name;
    }

    function __set($prop, $value) {
        $this->_data[$prop] = $value;
    }

    function __get($prop) {
        if (!isset($this->_data[$prop])) {
            $this->_data[$prop] = 0;
        }

        return $this->_data[$prop];
    }

    function watch($watch, $callback = false) {
        return c::state_watcher(
            state: $this->_name,
            watch: $watch,
            callback: $callback,
            view: function () use ($watch) {
                return $this->_data[$watch];
            },
        );
    }

    function model($prop) {
        return c::state_model(
            state: $this->_name,
            prop: $prop,
            view: ''
        );
    }

    function modelIn($stateProp, $value, $result = false) {
        return c::state_modelIn(
            state: $this->_name,
            prop: $stateProp,
            value: $value,
            result: $result,
            view: function () use ($stateProp, $value) {
                return is_array($this->_data[$stateProp]) && in_array($value, $this->_data[$stateProp]);
            }
        );
    }


    function check($prop, $value, $true, $false = false) {
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

    function map($prop, $callback = false){
        $imprint = new Imprint($this, $prop);
        $refernce = false;
        if (is_callable($callback)){
            $refernce = $callback($imprint);
            $refernce = gettype($refernce)=='string'?$refernce:$refernce->toArray();
        }

        $state_map = c::state_map(
            state: $this->_name,
            prop: $prop,
            refernce: $refernce,
            useColls: $imprint->getColls(),
            view: '***',
        );

        return $state_map;
    }

    function update(...$prop){
        $state_update = c::state_update(
            state: $this->_name,
            stateProps: $prop,
        );
        
        return $state_update;
    }

    function __toString() {
        return "widgetstate.name('{$this->_name}')";
    }

    function checkTurn($props) {
        return c::js_function($this . ".checkTurn('$props')");
    }



//---------------------------------------------------------

    static $names = [];

    static $name = 'global'; // используется только для определения имени в классе
    static $default = false;
    static $alias = false; // только для определения get параметров

    static function name(string $stateName) {
        $er = explode('#', new ErrorException('test', 0, 56, __FILE__, __LINE__))[1];
        
        return self::$names[$stateName];
    }

    static function toJs(){
        $js = '';
        foreach (self::$names as $state) {
            $js .= $state->stateJsContructor() . "\n";
        }

        return $js;
    } 

    static function state(){
        if (!isset(self::$names[static::$name])){
            new static(static::$name);
        }
        return self::$names[static::$name];
    }

    static function default(){
        $result = [];
        if (static::$default!=false){
            $result = static::$default;
        }
        return $result;
    }

    static function alias(){
        $result = [];
        if (static::$alias!=false){
            $result = static::$alias;
        }
        return $result;
    }

}