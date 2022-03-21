<?php

namespace Widget;

use DataGet;
use Error;
use ErrorException;
use Exception;
use Widget\tool\dialog\widgetdialog;

abstract class WidgetsConponent extends widget__static {

    /** 
     * Привязанные данные к request
    */
    public $bind = false;




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












    /**
     * Собственный стейт
     */
    public function mainState() {

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