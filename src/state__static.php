<?php

namespace Widget;

abstract class state__static {
    static $names = [];

    static $name = 'global'; // используется только для определения имени в классе
    static $default = false;
    static $alias = false; // только для определения get параметров
    static $modifiers = false; // только для определения get параметров
    static $emptyValue = false;
    static $defaultTypes = false;

    const typeDefault = false;
    const typeArray = 'array';
    const typeIntArray = 'intArray';
    const typeFloatArray = 'floatArray';

    const typeWidget = 'widget';
    
    static function state($name = false){
        $er = explode('#', new \ErrorException('test', 0, 56, __FILE__, __LINE__))[1];
        return state::name($name?$name:static::$name, static::class);
    }

    static function keyIsArray(&$key){
        if (!str_starts_with($key, '_'))
            $key = '_' . $key;
    }

    static function keyIsWidget(&$key){
        if (!str_starts_with($key, '__'))
            $key = '__' . $key;
    }
    
    static function name(string $stateName, string $parent = '') {
        $er = explode('#', new \ErrorException('test', 0, 56, __FILE__, __LINE__));
        
        if (isset(self::$names[$stateName]) && self::$names[$stateName]->isActive()){
            return self::$names[$stateName];
        } else {
            if ($parent==''){
                $parent = static::class;
            }

            if ($parent!=''){
                $parent::create($stateName);
                $currentState = self::$names[$stateName];

                $currentState->stateInitPath = $er;

                return $currentState;
            }
            die("Стейт не определен - $stateName [$parent]<br>$er");
            return false;
        }
    }

    static function all(){
        $data = [];
        foreach(self::$names as $name => $state){
            $data[$name] = $state->_data;
        }

        return $data;
    }

    static $sendetToPage = [];
    static function toJs($states){
        $js = '';
        foreach (self::$names as $state) {
            if (!in_array($state->_name, self::$sendetToPage) || in_array($state->_name, $states)) {
                $js .= $state->stateJsContructor() . "\n";
                self::$sendetToPage[] = $state->_name;
            }
        }

        return $js;
    }



    static function default($state){
        return false;
    }








    static function val($key, $stateName = false){
        $_stateName = $stateName?$stateName:static::$name; 
        return state::name($_stateName, static::class)->{$key};
    }

    static function set($key, $stateName = false, $value = false){
        $_stateName = $stateName?$stateName:static::$name; 
        state::name($_stateName, static::class)->{$key} = $value;
    }

    static function isDefault($key, $stateName = false){
        $_stateName = $stateName?$stateName:static::$name; 
        return state::name($_stateName, static::class)->is_default($key);
    }












    static function modifiers($state){
        return static::$modifiers;
    }

    
    static function alias($state){
        return [];
    }

    static function onchange(){
        return false;
    }


    /** 
     * Группировка update
    */
    static function group($element) {
        $elementtype = widgetconvertor::getType($element);

        if ($elementtype=='Group'){
            $element = $element['list'];
        } else 
        if ($elementtype!='Array'){
            $element = [$element];
        }


        $temp = [];
        foreach ($element as $key => $value) {
            if ($value instanceof widget){
                $temp[$key] = $value->toArray();
            } else 
            if ($value instanceof BindElement) {
                $temp[$key] = $value->appy();
            } else {
                $temp[$key] = $value;
            }
        }

        $result = [
            'element' => 'state_update_group',
            'list' => $temp,
        ];
        return $result;
    }



    static function toArray(){
        $result = [];
        foreach (state::$names as $stateName => $state) {
            $result[$stateName] = [];
            $result[$stateName]['data'] = $state->_data;
            if ($state->runOnFrontend){
                $result[$stateName]['runOnFrontend'] = $state->runOnFrontend;
            }
        }
        return $result;
    }

    static function create($stateName, $data = false) {
        $er = explode('#', new \ErrorException('test', 0, 56, __FILE__, __LINE__))[1];

        $state = new static($stateName);
        if ($data)
            $state->setData($data, 'create');
    }
    
    static $dataHash = [];
    static function getData() {
        $result = [];
        $states = state::$names;
        foreach ($states as $stateName => $state) {
            

            if (method_exists($state, 'data')){
                if (!isset(self::$dataHash[$stateName])) {
                    self::$dataHash[$stateName] = $state->data();
                }

                $data = self::$dataHash[$stateName];
                if (!empty($data)){
                    foreach ($data as $key => $value) {
                        // list($key, $value) = $array;
                        $result[$key] = $value;
                    }
                }
            } else {
                foreach ($state->_data as $key => $value) {
                    $result[$state->_name . '_' . $key] = $value;
                }
            }

        }
        return $result;
    }

    static function setRequest(){
        return [];
    }

}