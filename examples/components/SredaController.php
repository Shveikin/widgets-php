<?php

use Widget\c;
use Widget\state;
use Widget\WidgetsConponent;

class SredaController extends WidgetsConponent {

    // static $include_script = false;
    static $url = '/index.php';

    function mainState() {
        $this->createGlobalState('sreda', [
            'sreda_id' => 14,
            'weight' => 1000,
            'sreda_title' => 'Вода',
        ]);

        $this->createState('sredaControllerProps', [
            'isOpen' => true,
            '_list' => $this->loadList(0, 10),
        ]);
    }

    function draw($layout) {
        $propertyState = $this->state('sredaControllerProps');
        $layout->div(
            style: 'font-family: "Trebuchet MS"; font-size: 14px;',
            child: [
                c::div(
                    style: 'border: 1px solid #ccc; padding: 5px; cursor: pointer;',
                    child: $this->drawTitle(),
                    onclick: $propertyState->checkTurn('isOpen')
                ),
                c::div(
                    child: $propertyState->check('isOpen', 
                        c::div(
                            style: 'border: 1px solid #ccc; padding: 5px; height: 100px; margin-top: -1px;',
                            child: $this->drawList()
                        ),
                        ''
                    )
                ),
            ]
        );

        $this->state('sreda')->sreda_title = 'Воздух';
        // $property->isOpen = true;
    }

    function drawTitle(){
        $title = c::div(
            style: 'display: flex; justify-content: space-between;',
            child: [
                $this->state('sreda')->watch('sreda_title'),
                $this->state('sredaControllerProps')->check('isOpen', '▲', '▼')
            ]
        );

        return $title;
    }

    function drawList(){
        return $this->state('sredaControllerProps')->map('_list', function($ref){
                return c::div(
                    innerHTML: $ref->environment
                );
            }
        );
    }

    function loadList($offset, $limit, $search = false){
        global $mysqli_JINO;
        $sql = "SELECT id,environment,weight,state FROM `sreda5(2)` LIMIT $offset , $limit";

        $result = [];
        $envResult = $mysqli_JINO->query($sql);
        if ($envResult && $envResult->num_rows){
            $result = $envResult->fetch_all(MYSQLI_ASSOC);
        }

        return $result;
    }


    function select() {
        echo "Hello from select";
    }
}
