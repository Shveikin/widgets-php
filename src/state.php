<?php

namespace Widget;

use ErrorException;
use Widget\tool\dialog\dialogstate;

class state extends state__static {
    public $_name; // настоящее имя стейта
    public $_data = [];
    public $_alias = false; // [значение в state => значение в URL]
    public $_request = false;
    public $_default = false; // те значения которые совпадют с default в url записываться не будут
    public $_modifiers = false; // список js модификаторов
    public $onchange = false;
    public $sourceClass = 'state';
    public $stateInitPath = false;

    public $runOnFrontend = false;


    private $active = false;

    /* Обновить */
    public $refrashDefaultException = [];

    private $outStateValues = [];







    function __construct($name, $defaultArray = false, $aliasArray = false, $onchange = false) {
        $er = explode('#', new ErrorException('test', 0, 56, __FILE__, __LINE__))[1];

        
        $this->sourceClass = static::class;
        $this->_name = $name;
        state::$names[$this->_name] = $this;
        $this->active = true;

        if (static::$default){
            $this->setData(static::$default, 'create default from array');
        }

        $this->__initAliasFromStaticProp($aliasArray);

        if ($default = static::default($this)){
            $this->setData($default, 'create default');
        }
        $this->__initAliasFromStaticProp();
        $this->__initAliasFromFunction();

        if ($onchange!=false){
            $this->onchange = $onchange;
        } else {
            $this->onchange = static::onchange();
        }

        if ($defaultArray!=false){
            $this->setData($defaultArray, 'defaultArray');
        }

        $this->_modifiers = static::modifiers($this);

        $this->refreshDefaults();
        $this->updateStartingValues();
        if ($this->canSetDefaultFromRequest){
            $this->refreshDefaults();
        }

        $this->afterDefault();
    }


    function isActive(){
        return $this->active;
    }

    /** 
     * Присвоить значение по указанному пути
    */
    function assignTo(...$path){
        return function($value) use($path){
            $data = &$this->_data;
            foreach(array_slice($path, 0, count($path)-1) as $current){
                $data = &$data[$current];
            }
            $current = array_slice($path, -1)[0];
            $data[$current] = $value;
        };
    }

    /** 
     * Получить значение по указанному пути
    */
    function getValueFrom(...$path){
        $data = $this->_data;
        foreach($path as $current){
            $data = $data[$current];
        }
        return $data;
    }



    
    function setData($data, $from = false){
        $er = explode('#', new ErrorException('test', 0, 56, __FILE__, __LINE__))[1];
        
        $oldData = $this->_data;

        if ($data)
        foreach ($data as $key => $value) {
            $alias = $key;

            $old = self::$emptyValue;
            if (isset($this->_data[$alias])){
                $old = $this->_data[$alias];
            }


            if ($old!==$value){
                $this->_data[$alias] = $value;
                
                $runRevice = false;
                $aliasLength = strlen($alias);
                for ($i=0; $i < $aliasLength; $i++) { 
                    $method = 'revice_' . substr($alias, 0, $aliasLength-$i);
                    if (method_exists($this, $method)){
                        $this->{$method}($alias, $value, $old);
                        $runRevice = true;
                        break;
                    }
                }

                


                if ($runRevice==false)
                if (method_exists($this, "revice")){
                    $this->{'revice'}($alias, $value, $old);
                }
            }
        }
    }

    function afterDefault(){

    }

    function refreshDefaults(){
        if (is_array($this->_alias))
        foreach ($this->_alias as $key => $value) {
            if (isset($this->_data[$key])){
                if (!in_array($key, $this->refrashDefaultException)){
                    $this->_default[$key] = $this->_data[$key]; // Установил значения по умолчанию
                }
            }
        }
    }

    function stateJsContructor(){
        $props = [
            'name' => $this->_name,
            'sourceClass' => $this->sourceClass,
            'defaultTypes' => static::$defaultTypes,
        ];
        
        if ($this->_alias){
            $props['alias'] = $this->_alias;
        }
        if ($this->_default){
            $props['default'] = $this->_default;
        }
        if ($this->_modifiers){
            $props['modifiers'] = $this->_modifiers;
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


        if ($this->_request==false){
            $this->_request = static::setRequest();
        }

        if (!empty($this->_request)){
            $request = [];
            foreach ($this->_request as $key => $value) {
                if ($value instanceof BindElement){
                    $request[$key] = $value->appy();
                } else {
                    $request[$key] = $value;
                }
            }

            $props['request'] = $request;
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
        $er = explode('#', new ErrorException('test', 0, 56, __FILE__, __LINE__))[1];

        if (is_array($this->_alias))
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
                $this->__readGet($stateKey, $urlKey);
            }
        }
    }


    function __readGet($stateKey, $urlKey){
        $getData = $_GET[$urlKey];
        if (
            (isset($this->_data[$stateKey]) && is_array($this->_data[$stateKey])) ||
            static::$defaultTypes!=state::typeDefault
        ){
            $getData = explode(',', $getData);
            switch (static::$defaultTypes) {
                case state::typeIntArray:

                    $getData = array_map(function($itm){
                        return (int)$itm;
                    }, $getData);
                    self::keyIsArray($stateKey);
                break;
                case state::typeFloatArray:
                    $getData = array_map(function($itm){
                        return (float)$itm;
                    }, $getData);
                    self::keyIsArray($stateKey);
                break;
            }
        }

        $this->setData([$stateKey => $getData], 'from get'); // Установил значения по умолчанию
    }

    

    function isMultiArray($a){ 
		return array_values($a)!==$a;
	}

    function getName(){
        return $this->_name;
    }

    function __set($prop, $value) {
        $er = explode('#', new ErrorException('test', 0, 56, __FILE__, __LINE__))[1];
        // $alias = $this->dataAlias($prop);
        // $this->setData([$alias => $value], "Прямая запись $er");

        $this->setData([$prop => $value], "Прямая запись $er");

        // $this->_data[$prop] = $value;
    }


    function __get($prop) {
        if (!isset($this->_data[$prop])) {
            $undefined = $this->undefined($prop);
            $this->setData([$prop => $undefined], 'empty');
        }

        return $this->_data[$prop];
    }

    function undefined($prop){
        return 0;
    }

    function add_alias($key, $url){
        if (!is_array($this->_alias))
            $this->_alias = [];

            $this->_alias[$key] = $url;
    }

    function watch($watch, $callback = false) {
        return c::state_watcher(
            state: $this->_name,
            watch: $watch,
            callback: $callback,
            view: function () use ($watch) {
                if (!is_array($watch) && isset($this->_data[$watch]))
                    return $this->_data[$watch];
                else 
                    return '';
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

    // function checkIf($prop, $value, $_true, $_false = false) {
    //     return c::state_check_if(
    //         state: $this->_name,
    //         prop: $prop,
    //         value: $value,
    //         _do: $_true,
    //         view: ''
    //     );
    // }



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
        $er = explode('#', new ErrorException('test', 0, 56, __FILE__, __LINE__))[1];
        $this->refrashDefaultException = [];

        $this->setData(static::default($this), 'refresh');
        $this->refreshDefaults();
    }

//---------------------------------------------------------

    static $names = [];

    static $name = 'global'; // используется только для определения имени в классе
    static $default = false;
    static $alias = false; // только для определения get параметров
    static $modifiers = false; // только для определения get параметров
    static $content_type = false;

    public $canSetDefaultFromRequest = false;



    function is_default($key){
        $result = false;
        if (isset($this->_default[$key])){
            $result = $this->_data[$key] == $this->_default[$key];
        } else {
            $alias = $this->dataAlias($key);
            if (isset($this->_default[$alias])){
                $result = $this->_data[$alias] == $this->_default[$alias];
            }
        }

        return $result;
    }

    /** 
     * Создание псевдонимов в стейте
    */
    function __initAliasFromStaticProp($aliasArray = false){
        $alias = [];
        if (static::$alias!=false){
            $alias = static::$alias;
        } else {
            $alias = $aliasArray;
        }
        $this->__initAliasClear($alias);
    }

    /** Проверка добавленных данных */
    function __initAliasFromFunction(){
        $alias = static::alias($this);
        $this->__initAliasClear($alias);
    }

    function __initAliasClear($alias){
        if ($alias && !empty($alias)){
            if ($alias===true){
                $this->_alias = $alias;
            } else {
                $isMulti = $this->isMultiArray($alias);
                $this->_alias = [];
                foreach ($alias as $key => $val){
                    if (!$isMulti) {
                        $key = $val;

                        $this->keyTypeCorrector($key);
                        
                        
                    }

                    if (is_array($val)){
                        
                    } else {
                        // if (substr($val, 0, 1)=='_') $val = substr($val, 1);
                        $this->_alias[$key] = $val;
                    }
                }
            }
        }
    }

    function keyTypeCorrector(&$key){
        switch (static::$defaultTypes) {
            case state::typeArray:
            case state::typeIntArray:
            case state::typeFloatArray:
                self::keyIsArray($key);
            break;
            case state::typeWidget:
                self::keyIsWidget($key);
            break;
        }
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
        if (isset($this->_data[$key])){
            return $this->_data[$key];
        }

        $alias = $this->dataAlias($key);
        $value = $this->_data[$alias];
        return $value;
    }



    function runOnFrontend(){
        if (!$this->runOnFrontend) $this->runOnFrontend = []; 
        foreach (func_get_args() as $func) {
            $this->runOnFrontend[] = $func;
        }
    }

    function __call($name, $arguments){
        foreach($arguments as $key => $arg){
            if ($arg instanceof widget) {
                $arguments[$key] = $arg->toArray();
            }
        }

        $state_element = [
            'element' => "WidgetTools",
            'tool' => $name,
            'state' => $this->_name,
            'prop' => $arguments,
        ];

        return $state_element;
    }
}