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
        if ($prop == 'child' || $prop == 0) {
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
            $wgt = $childs->toArray();
            array_push($array, $wgt);
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
            } else if ($prop instanceof widget) {
                $newProp = $prop->toArray();
                // self::childsToArray($newProp, $prop);
            } else if (is_callable($prop)){
                $newProp = c::js_function('alert("11")');
            } else {
                $newProp = $prop;
            }

            $array[$key] = $newProp;
        }
    }

    public function print_r(){
        echo "<pre>";
        print_r($this->toArray());
        echo "</pre>";
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
                $str .= '<div>'. widget::childToString($itm) . '</div>';
            }
        } else if ($childs instanceof widget) {
            $str .= $childs->html();
        } else if (gettype($childs)=='string') {
            $str .= $childs;
        }
        return $str;
    }

    

    static private $childsTarget = [
        "area" => false,  
        "base" => false, 
        "br" => false, 
        "col" => false,  
        "embed" => false,  
        "hr" => false,  
        "img" => 'src',  
        "input" => 'value',  
        "link" => 'href',  
        "menuitem" => false,  
        "meta" => false,  
        "param" => false,  
        "source" => false, 
        "track" => false,  
        "wbr" => false,
        "function" => false,
    ];

    static function view($element) {
        if (gettype($element)=='string'){
            return $element;
        } else 
        if (gettype($element)=='array'){
            $html = '<div>';
            foreach($element as $el){
                $html .= self::view($el);
            }
            $html .= '</div>';
            return $html;
        } else
        if ($element instanceof widget){
            if (isset($element->props['view'])) {
                return self::view($element->props['view']);
            }



            $tag = $element->props['element'];
            $html = "<$tag ";
            foreach ($element->props as $key => $value) {
                    if ($key!='_name')
                    if (!in_array($key,['element', 'child'])) {
                    if (!is_array($value) && !is_callable($value)){
                        $html .= "$key='$value' ";
                    }
                }
            }
            
            if (isset(self::$childsTarget[$tag])){
                if (!empty($element->childs) && self::$childsTarget[$tag])
                $html .= self::$childsTarget[$tag] ."='".widget::childToString($element->childs)."' ";

                $html .= '>';
            } else {
                $html .= '>';
                $html .= widget::childToString($element->childs);
                $html .= "</$tag>";
            }

            return self::view($html);
        } else {
            return '';
        }
    }

    function html($activate = false)
    {
        $result = self::view($this);


        if ($activate){
            $result = "
<div id='app'>{$result}</div>
<script>
    c.app(
        ".json_encode($this->toArray()).",
        ".json_encode(state::toArray())."
    )
</script>";
        }

        return $result;
    }

    function __toString()
    {
        $result = $this->html();
        return $result;
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
            </>
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
        return c::{'function'}(
            function: $function_body,
            view: str_replace("'","`", $function_body)
        );

        //     'element' => 'function', 
        //     'function' => 
        // ];
    }
}




