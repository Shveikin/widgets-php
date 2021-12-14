<?php

namespace Widget;

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
        $element = new static();
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

    public function __get($function_name) {
        return new BindElement(
            function :$function_name,
            url:static::$url ? static::$url : realpath(__FILE__),
            class :get_class($this),
            useState:static::$useState,
        );
    }

    public function __construct($createDefaultState = true) {
        if ($createDefaultState) {
            foreach (static::$useState as $class) {
                if (class_exists($class)){
                    $class::init();
                }
            };
            $this->mainState();
        }
    }

    public static function runFetchRequest($data) {
        $props = $data['props'];
        $class = $props['class'];
        $function = $props['function'];
        $function_props = $props['props'];

        $_this = $data['this'];

        $instance = new $class();
        $instance->element = c::div(...$_this);
        $instance->{$function}(...$function_props);
    }

    public static function init() {
        $data = file_get_contents('php://input');
        if ($data) {
            $data = json_decode($data, true);
            if (isset($data['props'])) {
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
     * Псевдонимы для стейта
     */
    private $stateAlias = [];

    /**
     * Создать стейт
     * @return stateAlias
     */
    final public function createState(string $stateName, array $stateBody) {
        $stateAlias = static::getStateAlias($stateName);
        $this->stateAlias[$stateName] = $stateAlias;
        state::create($stateAlias, $stateBody);
        return $stateAlias;
    }

    /**
     * Создать глобальный стейт
     * @return stateName
     */
    final public function createGlobalState(string $stateName, array $stateBody) {
        $this->stateAlias[$stateName] = $stateName;
        state::create($stateName, $stateBody);
        return $stateName;
    }

    /**
     * Подучить стейт по псевдониму
     */
    final public function state(string $stateName) {
        $stateAlias = isset($this->stateAlias[$stateName])?$this->stateAlias[$stateName]:$stateName;
        return state::name($stateAlias);
    }
}

register_shutdown_function(function () {
    WidgetsConponent::init();
});
