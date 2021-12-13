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

        $this->createGlobalState('sredaList', [
            '_list' => $this->loadList(0, 20),
        ]);

        $this->createState('sredaControllerProps', [
            'isOpen' => false,
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
                    child: $propertyState->check('isOpen', true,
                        c::div(
                            style: 'border: 1px solid #ccc; 
                                    padding: 5px; 
                                    height: 200px; 
                                    margin-top: -1px;
                                    overflow: auto;
                            ',
                            // child: c::div([
                            //     'test',
                            //     'test2',
                            //     'test3',
                            //     c::div('Hello',
                            //         onclick: c::js_function('alert(111)')
                            //     )
                            // ])
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
                $this->state('sredaControllerProps')->check('isOpen', true, '▲', '▼')
            ]
        );

        // return $title;
        // return $this->state('sreda')->watch('sreda_title');
        return $title;
    }

    function drawList(){
        return $this->state('sredaList')->map('_list', function($itm){
                return c::div(
                    style: state::name('sreda')->check('sreda_id', $itm->id, 'color: #f00', 'color: #222'),
                    innerHTML: $itm->environment,
                    onclick: state::updateGroup([
                        state::name('sreda')->update(
                            sreda_id: $itm->id,
                            sreda_title: $itm->environment,
                        ),
                        $this->state('sredaControllerProps')->update(
                            isOpen: false
                        ),
                        $this->select
                    ])


                    // state::name('sreda')->update(
                    //     sreda_id: $itm->id,
                    //     sreda_title: $itm->environment,
                    // )


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
