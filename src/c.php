<?php

namespace Widget;

class c
{
    static $head = '';
    
    static function __callStatic($name, $arguments)
    {

        $name = preg_replace("/_tt*?_/", '$$', $name);
        $name = preg_replace("/_ss*?_/", '$', $name);


        $element = [
            'element' => $name
        ];

        if (isset($arguments[0]))
        switch (gettype($arguments[0])){
            case 'array':
                $element = array_merge($element, $arguments[0]);
            break;
            default:
                $element['child'] = $arguments[0];
            break;
        }

        return $element;
    }

    static function head(string $head){
        self::$head = $head;
    }

    static function app($childs){
        $sdialog = file_get_contents('https://raw.githubusercontent.com/Shveikin/showDialog/master/showDialog.js');
        $jsonData = json_encode($childs);
        $head = self::$head;
        echo <<<HTML
        
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document</title>
            {$head}
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

    static function func($body){
        return [
            'element' => 'function',
            'function' => $body,
        ];
    }
}

function js_function($body){
    return c::func($body);
}
