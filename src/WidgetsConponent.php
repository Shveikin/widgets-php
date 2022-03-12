<?php

namespace Widget;

use DataGet;
use Error;
use ErrorException;
use Exception;
use Widget\tool\dialog\widgetdialog;

abstract class WidgetsConponent {
    /**
     * добавить строку подключения в html
     */
    static $include_script = true;

    /**
     * путь до класса (или экземпляра)
     */
    static $url = false;

    /**
     * использовать список дополнительных стейтов
     */
    static $useState = [];
    static function useState(state $state){
        array_push(static::$useState, $state->getName());
    }

    /**
     * Единый стейт для всех копий компонента
     */
    static $singleState = false;

    /** 
     * Привязанные данные к request
    */
    public $bind = false;

    /** 
     * id корневого элемента
    */
    static $rootId = 0;

    private static $element;
    private static $widgetApps = [];


    public static function main() {
        if (!isset(static::$widgetApps[static::class])) {
            $er = explode('#', new ErrorException('test', 0, 56, __FILE__, __LINE__))[1];

            static::$widgetApps[static::class] = new static();
        }

        return static::$widgetApps[static::class];
    }

    public static function __callStatic($name, $arguments) {
        $class = static::main();
        $method_name = "static__{$name}";
        if (method_exists($class, $method_name)){
            return $class->{$method_name}(...$arguments);
        } else {
            $er = explode('#', new ErrorException('test', 0, 56, __FILE__, __LINE__))[1];
            $className = static::class;
            die("$er <br> $className не содержит метод $name! ($method_name) ");
        }
    }

    public function draw($layout, $props) {
        $layout->child = 'Метод draw не инициализирован!';
    }

    public function static__get($function_name) {
        return static::main()->{$function_name};
    }

    public $layout = false;
    public function layout($props = []) {
        $this->layout = c::div();
        $this->draw($this->layout, $props);

        return $this->layout;
    }


    static function element(...$props){
        $element = new static($props);
        return $element->layout($props);
    }


    static function widget(...$props){
        $element = new static($props);
        $element->layout($props);

        return $element;
    }


    function html($activate = false){

        $result = widget::view($this->layout);
        if ($activate) {
            
            $id = WidgetsConponent::$rootId++;
            $stateList = $this->getUseStateList();
            $state = state::toJs($stateList);
            $result = "
<div id='app$id'>***{$result}***</div>
<script>
    $state
    c.render('#app$id',
        " . json_encode($this->layout->toArray()) . "
    )
</script>";
        }
        return $result;
    }

    // public function static__element() {
    //     return $this->layout();
    // }

    public function static__html() {
        return $this->layout()->html(static::$include_script);
    }

    public function __toString() {
        return $this->static__html();
    }

    public function static__print_r() {
        return $this->layout()->print_r();
    }

    // static $hashMethods = [];
    public function __get($function_name) {
        // Добавить хешироватьние для методов
        // if (isset(self::$hashMethods[$function_name])){
        //     return self::$hashMethods[$function_name];
        // }

        $useStates = $this->getUseStateList();
        $url = static::$url ? static::$url : '/';

        // Возвращать тулзу!
        return new BindElement(
            function: $function_name,
            url: $url,
            class: get_class($this),
            useState: $useStates,
        );
    }


    function getUseStateList(){
        $result = [];
        foreach (static::$useState as $state) {
/* 
            $stateClass = is_array($state)?$state[0]:$state;
            $stateName = is_array($state)?$state[1]:false;

            if (isset(state::$names[$stateName])){
                array_push($result, $stateName);
            } else if (class_exists($stateName)){
                $stateName = $stateName::state()->getName();
                array_push($result, $stateName);
            } else {
                array_push($result, $stateName);
                // throw new Exception("Не получилось определить стейт $stateName");
            }
            
*/

            if (is_array($state)){
                array_push($result, $state[1]);
            } else {
                $stateName = $state::state()->getName();
                array_push($result, $stateName);
            }
        }

        return $result;
    }

    /**
     * Псевдонимы для стейта
     */
    private $stateAlias = [];

    public function __construct($props = []) {
        $er = explode('#', new ErrorException('test', 0, 56, __FILE__, __LINE__))[1];

        foreach (static::$useState as $stateName) {
            if (is_array($stateName)){
                $state = $stateName[0]::state(isset($stateName[1])?$stateName[1]:false);
            } else {
                $state = class_exists($stateName)?$stateName::state():state::name($stateName);
            }
            if ($state)
                $this->stateAlias[$state->getName()] = $state->getName();
        };
        $this->mainState($props);
    }

    public static function runFetchRequest($data) {

        $er = explode('#', new ErrorException('test', 0, 56, __FILE__, __LINE__))[1];

        /** Инициализация стейта - перенесено внутль стейта*/
        // if (isset($data['state'])){
        //     foreach ($data['state'] as $stateName => $stateProps) {
        //         $state = state::name($stateName, $stateProps['source']);
        //         $state->setData($stateProps['data']);
        //         // $state['source']::create($stateName, $state['data']);
        //     }
        // }

        if (isset($data['executor'])){
            $ob_length = ob_get_length();
            ob_get_clean();

            $executor = $data['executor'];

            $class = $executor['class'];
            $function = $executor['function'];
            $function_props = $executor['props'];

            $instance = new $class();
            if (isset($executor['bind']))
                $instance->bind = $executor['bind'];
            $functionResult = $instance->{$function}(...$function_props);

            $result = [
                'request_id' => $data['request_id'],
                'result' => $functionResult,
                'state' => state::toArray(),
                'rem' => $ob_length,
            ];

            die(json_encode($result));
        }
    }







    public static function init() {
        $er = explode('#', new ErrorException('test', 0, 56, __FILE__, __LINE__))[1];

        $data = file_get_contents('php://input');
        if ($data) {
            $data = json_decode($data, true);
            if (isset($data['request_id'])) {
                self::runFetchRequest($data);
            }
        }
    }



    /**
     * Собственный стейт
     */
    public function mainState() {

    }

    private static $stateCounter = [];
    public static function getStateAlias($stateName) {
        if (!static::$singleState) {
            if (!isset(static::$stateCounter[$stateName])) {
                static::$stateCounter[$stateName] = 1;
            } else {
                static::$stateCounter[$stateName]++;
            }

            $stateName .= '_' . static::$stateCounter[$stateName];
        }

        return $stateName;
    }


    /**
     * Создать стейт
     * @return stateAlias
     */
    final public function createState(...$props) {

        $stateName = isset($props['name'])?$props['name']:'myNewState';
        $state = isset($props['state'])?$props['state']:[];
        $alias = isset($props['alias'])?$props['alias']:false;


        $stateAlias = static::getStateAlias($stateName);
        $this->stateAlias[$stateName] = $stateAlias;
        new state($stateAlias, $state, $alias);
        return $stateAlias;
    }

    /**
     * Создать глобальный стейт
     * name - название стейта
     * state - массив данных
     * alias - псевдонимы
     * onchange = 
     * 
     * @return stateName
     */
    final public function createGlobalState(...$props) {
        $stateName = isset($props['name'])?$props['name']:'myNewState';
        $state = isset($props['state'])?$props['state']:[];
        $alias = isset($props['alias'])?$props['alias']:false;
        $onchange = isset($props['onchange'])?$props['onchange']:false;


        $this->stateAlias[$stateName] = $stateName;
        new state($stateName, $state, $alias, $onchange);
        return $stateName;
    }

    /**
     * Подучить стейт по псевдониму
     */
    final public function state(string $stateName) {
        $er = explode('#', new ErrorException('test', 0, 56, __FILE__, __LINE__))[1];
        
        $stateAlias = isset($this->stateAlias[$stateName])?$this->stateAlias[$stateName]:$stateName;
        return state::name($stateAlias);
    }
}

register_shutdown_function(function () {
    WidgetsConponent::init();
});