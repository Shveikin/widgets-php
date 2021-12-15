<?php

namespace Widget;

class state {
    static $names = [];
    static $props = [];

    static $name = 'global';
    static $default = [];
    static $alias = false;



    
    private $data = [];
    private $_name = 'global';
    public function __construct($name, $defaultArray = []) {
        $this->_name = $name;
        $this->data = $defaultArray;
    }

    /** 
     * Инициализация стейта
    */
    static function init(){
        if (!isset(self::$names[static::$name])){
            state::create(static::$name, static::$default);
            
            $props = [];
            if (static::$alias){
                $props['alias'] = static::$alias;
            }

            if (!empty($props)){
                state::$props[static::$name] = $props;
            }
        }
    }






    public static function name(string $stateName) {
        return self::$names[$stateName];
    }
    
    public static function getName(){
        return static::$name;
    }

    public static function create($stateName, $defaultArray = []) {
        self::$names[$stateName] = new state($stateName, $defaultArray);
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
            view: function () use ($watch) {
                return $this->data[$watch];
            },
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
        
        $js = '';
        foreach (self::$names as $stateName => $state) {
            $props = ['name' => $stateName];
            if (isset(state::$props[$stateName])){
                $props = array_merge($props, state::$props[$stateName]);
            }
            $js .= " widgetstate.use(". json_encode($state->data).','. json_encode($props) . "); \n";
        }
        

        return $js;
    } 

    public function __toString() {
        return "widgetstate.name('{$this->_name}')";
    }

    public function checkTurn($props) {
        return c::js_function($this . ".checkTurn('$props')");
    }


    static function state(){
        if (!isset(self::$names[static::$name])){
            static::init();
        }
        return self::$names[static::$name];
    }

}
