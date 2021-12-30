<?php

namespace Widget;

use DataGet;
use Error;
use ErrorException;
use Exception;

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

    /**
     * Единый стейт для всех копий компонента
     */
    static $singleState = false;

    private static $element;
    private static $widgetsApp = false;
    public static function main() {
        if (static::$widgetsApp == false) {
            static::$widgetsApp = new static();
        }

        return static::$widgetsApp;
    }

    public static function __callStatic($name, $arguments) {
        return static::main()->{"static__{$name}"}(...$arguments);
    }

    public function draw($layout, $props) {
        $layout->child = 'Метод draw не инициализирован!';
    }

    public function static__get($function_name) {
        return static::main()->{$function_name};
    }

    private $layout = false;
    public function layout($props = []) {

        $this->layout = c::div();
        $this->draw($this->layout, $props);

        return $this->layout;
    }


    static function element(...$props){
        $element = new static($props);
        return $element->layout($props);
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

    static $hashMethods = [];
    public function __get($function_name) {
        // Добавить хешироватьние для методов
        if (isset(self::$hashMethods[$function_name])){
            return self::$hashMethods[$function_name];
        }

        $useStates = $this->getUseStateList();

        // Возвращать тулзу!
        return new BindElement(
            function: $function_name,
            url:static::$url ? static::$url : realpath(__FILE__),
            class :get_class($this),
            useState: $useStates,
        );
    }


    function getUseStateList(){
        $result = [];
        foreach (static::$useState as $stateName) {
            if (isset(state::$names[$stateName])){
                array_push($result, $stateName);
            } else if (class_exists($stateName)){
                $stateName = $stateName::state()->getName();
                array_push($result, $stateName);
            } else {
                array_push($result, $stateName);
                // throw new Exception("Не получилось определить стейт $stateName");
            }
        }

        return $result;
    }

    /**
     * Псевдонимы для стейта
     */
    private $stateAlias = [];

    public function __construct($props = []) {
        foreach (static::$useState as $class) {
            $state = $class::state();
            if ($state)
                $this->stateAlias[$state->getName()] = $state->getName();
        };
        $this->mainState($props);
    }

    public static function runFetchRequest($data) {

        /** Инициализация стейта - перенесено внутль стейта*/
        // if (isset($data['state'])){
        //     foreach ($data['state'] as $stateName => $stateProps) {
        //         $state = state::name($stateName, $stateProps['source']);
        //         $state->setData($stateProps['data']);
        //         // $state['source']::create($stateName, $state['data']);
        //     }
        // }

        if (isset($data['executor'])){
            $executor = $data['executor'];

            $class = $executor['class'];
            $function = $executor['function'];
            $function_props = $executor['props'];
                    
            $instance = new $class();
            $functionResult = $instance->{$function}(...$function_props);

            $result = [
                'request_id' => $data['request_id'],
                'result' => $functionResult,
                'state' => state::toArray(),
            ];

            echo json_encode($result);
        }
    }



    public static function init() {
        $data = file_get_contents('php://input');
        if ($data) {
            $data = json_decode($data, true);
            if (isset($data['request_id'])) {
                self::runFetchRequest($data);
            }
        }
    }

    /** 
     * Группировка update
    */
    function group(array $group) {
        $result = [
            'element' => 'state_update_group',
            'list' => $group,
        ];
        return $result;
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
