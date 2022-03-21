<?php

namespace Widget;


abstract class widget__static {
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
     * id корневого элемента
    */
    static $rootId = 0;

    private static $element;
    private static $widgetApps = [];

    
    public static function main() {
        if (!isset(static::$widgetApps[static::class])) {
            $er = explode('#', new \ErrorException('test', 0, 56, __FILE__, __LINE__))[1];

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
            $er = explode('#', new \ErrorException('test', 0, 56, __FILE__, __LINE__))[1];
            $className = static::class;
            die("$er <br> $className не содержит метод $name! ($method_name) ");
        }
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

    
    public static function runFetchRequest($data) {

        $er = explode('#', new \ErrorException('test', 0, 56, __FILE__, __LINE__))[1];

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

    public static function init() {
        $er = explode('#', new \ErrorException('test', 0, 56, __FILE__, __LINE__))[1];

        $data = file_get_contents('php://input');
        if ($data) {
            $data = json_decode($data, true);
            if (isset($data['request_id'])) {
                self::runFetchRequest($data);
            }
        }
    }
}