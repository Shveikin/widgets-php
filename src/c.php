<?php

namespace Widget;


class widget
{
    private static $globals = [];
    private $props = [];
    private $childs = [];

    public function __call($tag, $props)
    {
        $layout = new widget();
        $layout->element = $tag;
        call_user_func_array([$layout, 'set'], $props);

        array_push($this->childs, $layout);
        return $layout;
    }

    public function set(...$props)
    {
        $this->setProps($props);
    }

    public function setProps(array $props)
    {
        foreach ($props as $prop => $value) {
            $this->{$prop} = $value;
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

    private static function pushChilds(&$array, $childs)
    {
        if (gettype($childs) == 'array') {
            foreach ($childs as $child) {
                self::pushChilds($array, $child);
            }
        } else if ($childs instanceof widget) {
            array_push($array, $childs->toArray());
        } else {
            array_push($array, $childs);
        }
    }

    public function toArray()
    {
        $childs = [];
        self::pushChilds($childs, $this->childs);

        $element = $this->props;
        if (!empty($childs)) {
            $element['child'] = $childs;
        }

        return $element;
    }

    public function name($name)
    {
        self::$globals[$name] = $this;
        return $this;
    }

    public static function g($name)
    {
        return self::$globals[$name];
    }

    public function child($id)
    {
        return $this->childs[$id];
    }

    function __toString()
    {
        $tag = $this->props['element'];
        $html = "<$tag >";

        foreach($this->childs as $child){
            $html .= $child->__toString();
        }

        $html .= "</$tag>";

        return $html;
    }
}

class c
{
    public static function app($runder, $state = [])
    {
        $layout = c::div();
        if (is_callable($runder)) {
            $runder($layout, $state);
        } else {
            $layout->child = $runder;
        }

        self::body($layout->toArray());
    }

    public static function __callStatic($tag, $props)
    {
        $element = new widget();
        $element->element = $tag;
        if (isset($props[0]) && count($props)==1){
            $element->child = $props[0];
        } else {
            $element->setProps($props);
        }
        return $element;
    }

    public static function body($childs)
    {
        $sdialog = file_get_contents('https://raw.githubusercontent.com/Shveikin/showDialog/master/showDialog.js');
        $jsonData = json_encode($childs);
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
                c.body(
                    {$jsonData}
                )
            </script>
        </head>
        <body></body>
        </html>
        HTML;
    }

    public static function g($name)
    {
        return widget::g($name);
    }
}
