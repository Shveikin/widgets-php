<?php

namespace Widget;


class widget
{
    private $props = [];
    private $childs = [];
    public static $globals = [];
    static private $names_length = 0;

    function __construct($tag, $props = [])
    {
        self::$names_length++;
        $this->element = $tag;
        $this->_name = "element_" . self::$names_length;
        $this->setProps($props);
    }

    public function __call($tag, $props)
    {
        $layout = new widget($tag, $props);
        array_push($this->childs, $layout);
        return $layout;
    }

    public function set(...$props)
    {
        $this->setProps($props);
    }

    public function setProps(array $props)
    {
        if (isset($props[0]) && count($props)==1){
            $this->child = $props[0];
        } else {
            foreach ($props as $prop => $value) {
                $this->{$prop} = $value;
            }
        }
    }

    public function __set($prop, $value)
    {
        if ($prop == 'child') {
            array_push($this->childs, $value);
        } else {
            $this->props[$prop] = $value;
        }
    }

    private static function childsToArray(&$array, $childs)
    {
        if (gettype($childs) == 'array') {
            foreach ($childs as $child) {
                self::childsToArray($array, $child);
            }
        } else if ($childs instanceof widget) {
            array_push($array, $childs->toArray());
        } else {
            array_push($array, $childs);
        }
    }

    private static function propsToArray(&$array, array $props)
    {
        foreach ($props as $key => $prop) {
            $newProp = [];
            if (gettype($prop) == 'array') {
                self::propsToArray($newProps, $prop);
            } if ($prop instanceof widget) {
                self::childsToArray($newProp, $prop);
            } else {
                $newProp = $prop;
            }

            $array[$key] = $newProp;
        }
    }

    public function toArray()
    {
        $childs = [];
        self::childsToArray($childs, $this->childs);

        $element = [];
        self::propsToArray($element, $this->props);

        if (!empty($childs)) {
            $element['child'] = $childs;
        }

        return $element;
    }

    public function name($name)
    {
        $this->props['_name'] = $name;
        self::$globals[$name] = $this;
        return $this;
    }

    public function indexName($index, $name)
    {
        $newName = "{$name}_{$index}";
        $this->name($newName);

        return $this;
    }

    public static function g($name)
    {
        return self::$globals[$name];
    }

    public static function indexg(int $index, $name)
    {
        return self::$globals["{$name}_{$index}"];
    }

    public function child($id)
    {
        return $this->childs[$id];
    }

    static function childToString($childs){
        $str = '';
        if (is_array($childs)){
            foreach ($childs as $itm) {
                $str .= widget::childToString($itm);
            }
        } else if ($childs instanceof widget) {
            $str .= $childs->html();
        } else if (gettype($childs)=='string') {
            $str .= $childs;
        }
        return $str;
    }

    function html()
    {
        $tag = $this->props['element'];
        $html = "<$tag ";
        foreach ($this->props as $key => $value) {
            if (!in_array($key,['element', 'child'])) {
                if (!is_array($value)){
                    $html .= " $key = '$value' ";
                }
            }
        }
        $html .= '>';
        $html .= widget::childToString($this->childs);
        $html .= "</$tag>";

        return $html;
    }

    function __toString()
    {
        return $this->html();
    }
}

class c
{
    static $globalState = false;

    public static function app($runder, $state = [])
    {
        $globalState = new state($state);
        $layout = c::div();
        if (is_callable($runder)) {
            $runder($layout, $globalState);
        } else {
            $layout->child = $runder;
        }

        self::body($layout->toArray(), $globalState->toArray());
    }

    public static function __callStatic($tag, $props = false)
    {
        $element = new widget($tag, $props);
        return $element;
    }

    public static function body($childs, $state = false)
    {
        $sdialog = '';//file_get_contents('https://raw.githubusercontent.com/Shveikin/widgets-js/main/src/widgets.js');
        $jsonData = json_encode($childs);
        $useState = '';
        if ($state){
            $useState = "WidgetState.use(" . json_encode($state) . ')';
        }
        echo <<<HTML

        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document</title>
            <script>
                {$sdialog}
                {$useState}
                c.body(
                    {$jsonData}
                )
            </script>
        </head>
        <body></body>
        </html>
        HTML;
    }

    public static function name($name)
    {
        return widget::g($name);
    }

    public static function indexName($index, $name)
    {
        return widget::indexg($index, $name);
    }

    static function js_function($function_body){
        return [
            'element' => 'function', 
            'function' => $function_body
        ];
    }
}


class state
{
    private $data = [];
    private $update = [];
    private $name = 'global';

    function __construct($data, $name = 'global')
    {
        $this->name = $name;
        $this->data = $data;

        $this->data['_name'] = $name;
    }

    function watch($watch, $callback = false){
        return [
            'element' => 'watcher',
            'state' => $this->name, 
            'watch' => $watch,
            'callback' => $callback,
        ];
    }

    function set($key, $value){
        return c::js_function("{$this}.{$key} = {$value};");
    }
    
    function get($key){
        return c::js_function("return {$this}.{$key}");
    }

    function toArray(){
        return $this->data;
    }

    function __toString()
    {
        return "WidgetState.name('{$this->name}')";
    }

}