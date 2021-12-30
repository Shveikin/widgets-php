<?php

namespace Widget;

use ErrorException;

class state {
    public $_name; // настоящее имя стейта
    public $_data = [];
    public $_alias = false; // [значение в state => значение в URL]
    public $_default = false; // те значения которые совпадют с default в url записываться не будут
    public $onchange = false;
    public $sourceClass = 'state';

    private $outStateValues = [];

    function outValuesLoad(){

    }

    function __construct($name, $defaultArray = false, $aliasArray = false, $onchange = false) {
        $this->sourceClass = static::class;
        $this->_name = $name;
        state::$names[$this->_name] = $this;



        $this->setData(static::default($this), 'create default');
        
        if ($onchange!=false){
            $this->onchange = $onchange;
        } else {
            $this->onchange = static::onchange();
        }

        if ($defaultArray!=false){
            $this->setData($defaultArray, 'defaultArray');
        }

        if ($aliasArray){
            $alias = $aliasArray;
        } else {
            $alias = static::alias($this);
        }
        
        if ($alias){
            $isMulti = $this->isMultiArray($alias);
            $this->_alias = [];
            foreach ($alias as $key => $val){
                if (!$isMulti) $key = $val;

                if (is_array($val)){
                    
                } else {
                    if (substr($val, 0, 1)=='_') $val = substr($val, 1);
                    $this->_alias[$key] = $val;
                }
            }
        }
        
        $this->refreshDefaults();
        $this->updateStartingValues();

        
        

        
    }

    function setData($data, $from = false){
        $oldData = $this->_data;

        
        foreach ($data as $key => $value) {
            // $alias = $this->dataAlias($key);
            $alias = $key;
            $old = isset($this->_data[$alias])?$this->_data[$alias]:-1;

            if (isset($oldData[$alias]))
            if ($old!=($oldData[$alias])) {
                    $aa = [$oldData[$alias], $old, $value];
                    // cprint_r2('было - сейчас - хотел установить оо остановил', $aa);
                    continue;
                }

            if ($old!=$value){
                $this->_data[$alias] = $value;
                
                if (method_exists($this, "update_$alias")){
                    $this->{"update_$alias"}($value, $old);
                }
            }
        }
    }

    function refreshDefaults(){
        if ($this->_alias)
        foreach ($this->_alias as $key => $value) {
            if (isset($this->_data[$key])){
                $this->_default[$key] = $this->_data[$key]; // Установил значения по умолчанию
            // } else {
            //     $this->_default[$key] = [];
            }
        }
    }

    function stateJsContructor(){
        $props = [
            'name' => $this->_name,
            'sourceClass' => $this->sourceClass,
        ];
        if ($this->_alias){
            $props['alias'] = $this->_alias;
        }
        if ($this->_default){
            $props['default'] = $this->_default;
        }
        if ($this->onchange!=false){
            $change = $this->onchange;
            if ($change instanceof widget) {
                $change = $change->toArray();
            } else if ($change instanceof BindElement) {
                $change = $change->appy();
            }

            $props['onchange'] = $change;
        }
        
        return "widgetstate.use(". json_encode($this->_data).",\n". json_encode($props) . ");\n";
    }


    function initPostData(){
        $data = file_get_contents('php://input');
        if ($data) {
            $data = json_decode($data, true);
            if (isset($data['request_id']) && isset($data['state'])) {
                self::$postData = $data['state'];
            } else {
                self::$postData = [];
            }
        }
    }

    static $postData = false;
    function updateStartingValues(){
        if ($this->_alias)
        foreach ($this->_alias as $stateKey => $urlKey) {
            $this->checkAliasFromGet($stateKey, $urlKey);
        }
        if (self::$postData==false) $this->initPostData();
        if (isset(self::$postData[$this->_name])){
            $state = self::$postData[$this->_name];
            $this->setData($state['data'], 'from post');
        }
    }

    function checkAliasFromGet($stateKey, $urlKey){
        if (is_array($urlKey)){
            foreach ($urlKey as $doubleKey) {

                //FIX
                $this->checkAliasFromGet($stateKey, $doubleKey);
            }
        } else {
            if (isset($_GET[$urlKey])){
                if (isset($this->_default[$stateKey]) && isset($this->_data[$stateKey]) && is_array($this->_data[$stateKey])){
                    $this->setData([$stateKey => explode(',', $_GET[$urlKey])], 'from get');
                } else {
                    $this->setData([$stateKey => $_GET[$urlKey]], 'from get'); // Установил значения по умолчанию
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
        $er = explode('#', new ErrorException('test', 0, 56, __FILE__, __LINE__))[1];
        $alias = $this->dataAlias($prop);
        $this->setData([$alias => $value], "Прямая запись $er");
        // $this->_data[$prop] = $value;
    }

    function __get($prop) {
        if (!isset($this->_data[$prop])) {
            $this->setData([$prop => 0], 'empty');
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
            view: '',
            // function () use ($stateProp, $value) {
            //     return is_array($this->_data[$stateProp]) && in_array($value, $this->_data[$stateProp]);
            // }
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

    function checkIn($prop, $value, $true, $false = false) {
        return c::state_check_in(
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

    function checkIf($prop, $value, $do) {
        return c::state_check_if(
            state: $this->_name,
            prop: $prop,
            value: $value,
            _do: $do,
            view: ''
        );
    }



    function setDefault($prop){
        return c::state_set_default(
            state: $this->_name,
            prop: $prop
        );
    }


    function map($prop, $callback = false){
        $imprint = new Imprint($this, $prop);
        $refernce = false;
        if (is_callable($callback)){
            $refernce = $callback($imprint);
            if ($refernce instanceof widget){
                $refernce = $refernce->toArray();
            }
            $imprint = $imprint->getColls();
        } else {
            $imprint = false;
        }


        $state_map = [
            'element' => 'state_map',
            'state' => $this->_name,
            'prop' => $prop,
            'refernce' => $refernce,
            'useColls' => $imprint,
        ];
        if (true)
        $state_map = c::state_map(
            state: $this->_name,
            prop: $prop,
            refernce: $refernce,
            useColls: $imprint,
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

    function refresh(){
        $this->setData(static::default($this), 'refresh');
        $this->refreshDefaults();
    }

//---------------------------------------------------------

    static $names = [];

    static $name = 'global'; // используется только для определения имени в классе
    static $default = false;
    static $alias = false; // только для определения get параметров

    static function name(string $stateName, string $parent = '') {
        $er = explode('#', new ErrorException('test', 0, 56, __FILE__, __LINE__))[1];
        
        if (isset(self::$names[$stateName])){
            return self::$names[$stateName];
        } else {
            if ($parent!=''){
                $parent::create($stateName);

                return self::$names[$stateName];
            }
            die("Стейт не определен - $stateName [$parent]<br>$er");
            return false;
        }
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

    static function default($state){
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

    static function onchange(){
        return false;
    }


    static function toArray(){
        $result = [];
        foreach (state::$names as $stateName => $state) {
            $result[$stateName] = $state->_data;
        }
        return $result;
    }

    static function create($stateName, $data = false) {
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


    /** 
     * Получить только данные которые отличаются от данных по умолчанию
    */
    function getChangedData(){
        $args = func_get_args();
        $data = $this->_data;
        $default = $this->_default;
        foreach ($args as $value) {
            $keys = c::filterArray(array_keys((array)$data), $value);
            $data2 = [];
            foreach ($keys as $key) {
                $data2[$key] = $data[$key];
                $default2[$key] = $default[$key];
            }
            $data = $data2;
            $default = $default2;
        }

        $result = [];
        if (is_array($data)){
            foreach ($data as $key => $value) {
                if (!isset($default[$key]) || $default[$key]!=$value){
                    $result[$key] = $value;
                }
            }
        } else {
            if ($data!=$default)
                $result = $data;
        }

        return $result;
    }

    function getProps(){
        return array_keys((array)$this->_data);
    }

    function getAlias($key){
        if (isset($this->_alias[$key])){
            return $this->_alias[$key];
        } else {
            return $key;
        }
    }

    private $hashAlias = false;
    function dataAlias($find){
        if (isset($this->_alias[$find])){
            return $this->_alias[$find];
        }
        $hashAlias = [];
        if ($this->_alias)
        foreach ($this->_alias as $key => $value) {
            if ($find==$value) return $key;
        }
        return $find;
    }

    function get($key){
        $alias = $this->dataAlias($key);
        $value = $this->_data[$alias];
        return $value;
    }

    function isDefault($key){
        $alias = $this->dataAlias($key);
        return isset($this->_default[$alias]) && $this->_data[$alias] == $this->_default[$alias];
    }
}