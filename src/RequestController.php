<?php

namespace Widget;
use Opis\Closure\SerializableClosure;


class RequestController
{
    static $func = [];

    static $requestController = false;
    static function main(){
        if (self::$requestController==false){
            self::$requestController = new RequestController();
        }

        return self::$requestController;
    }

    function __destruct()
    {
        

        file_put_contents('api.json', json_encode(self::$func));
    }


    static function getURL() 
    {
        return (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";
    }



    static function loadFromApi(){
        if (file_exists('api.json')) {
            $apiData = json_decode(file_get_contents('api.json'), true);
            foreach($apiData as $key => $func){
                self::$func[$key] = unserialize($func);
            }
        }
    }

    static function run($key){
        if (isset(self::$func[$key])){
            return self::$func[$key]();
        }
        return false;
    }

    static function init(bool|callable $func = false)
    {
        $request = file_get_contents('php://input');
        if ($request) {
            $request = json_decode($request, true);
            self::loadFromApi();
            state::initArray($request['state']);
            self::run($request['api']);

            die(json_encode(state::toArray()));
        }
    } 



    static function addFunction($prop){
        return RequestController::main()->_addFunction($prop);
    }
    
    function _addFunction($func){
        $hash = $this->hashFunction($func);
        $hashName = sha1($hash);

        self::$func[$hashName] = $hash;

        return $this->js_request($hashName);
    }

    function hashFunction($func){
        $wrapper = new SerializableClosure($func);
        $serialized = serialize($wrapper);
        return $serialized;
    }

    function js_request($hashName){
        // $url = self::getURL();
        // $stateName = state::$name;
        // return c::js_function(<<<JS
        //     fetch('/', 
        //         {
        //             method: 'POST', 
        //             headers: {
        //                 'Accept': 'application/json',
        //                 'Content-Type': 'application/json'
        //             },
        //             body: JSON.stringify({
        //                 api: '{$hashName}',
        //                 state: WidgetState.name('{$stateName}').data()
        //             })
        //         }
        //     ).then(response => response.json()).then(response => {
                
        //         WidgetState.update(response)

        //     })
            

        // JS, '');
    }
}