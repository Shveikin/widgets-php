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
                            child: c::div('test')
                            // child: $this->drawList()
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
        return $this->state('sreda')->watch('sreda_title');
    }

    function drawList(){
        return $this->state('sredaList')->map('_list', function($itm){
                return c::div(
                    style: state::name('sreda')->check('sreda_id', $itm->id, 'color: #f00', 'color: #222'),
                    innerHTML: $itm->environment,
                    onclick: state::name('sreda')->update('sreda_title', $itm->environment)
                );
            }
        );
    }


    function loadList($offset, $limit, $search = false){
        return json_decode('[{"id":"1","environment":"\u0410\u0437\u043e\u0442 (N2 Nitrogen)","weight":"1.2506","state":"2"},{"id":"2","environment":"\u0410\u0437\u043e\u0442\u043d\u0430\u044f \u043a\u0438\u0441\u043b\u043e\u0442\u0430 (\u043a\u043e\u043d\u0446\u0435\u043d\u0442\u0440\u0438\u0440\u043e\u0432\u0430\u043d\u043d\u0430\u044f) (Nitric Acid, (concentrated))","weight":"1370","state":"1"},{"id":"3","environment":"\u0410\u043c\u043c\u0438\u0430\u043a (NH\u2083 Ammonia)","weight":"0.86","state":"1"},{"id":"4","environment":"\u0410\u0440\u0433\u043e\u043d (Ar Argon Gas)","weight":"1.784","state":"2"},{"id":"5","environment":"\u0410\u0446\u0435\u0442\u0438\u043b\u0435\u043d (C\u2082H\u2082 Acetylene)","weight":"0","state":"2"},{"id":"6","environment":"\u0410\u0446\u0435\u0442\u043e\u043d (C3H6O Acetone)","weight":"0","state":"1"},{"id":"7","environment":"\u0411\u0435\u043d\u0437\u0438\u043d (Gasoline)","weight":"0","state":"1"},{"id":"8","environment":"\u0411\u0435\u043d\u0437\u043e\u043b (Benzol)","weight":"0","state":"1"},{"id":"9","environment":"\u0411\u0440\u043e\u043c\u0438\u0441\u0442\u044b\u0439 \u0432\u043e\u0434\u043e\u0440\u043e\u0434 (HBr Hydrogen Bromide)","weight":"3.6452","state":"2"},{"id":"10","environment":"\u0411\u0443\u0442\u0430\u043d (C4H10 Butane)","weight":"2080","state":"2"}]', true);

        // global $mysqli_JINO;
        // $sql = "SELECT id,environment,weight,state FROM `sreda5(2)` LIMIT $offset , $limit";

        // $result = [];
        // $envResult = $mysqli_JINO->query($sql);
        // if ($envResult && $envResult->num_rows){
        //     $result = $envResult->fetch_all(MYSQLI_ASSOC);
        // }

        // return $result;
    }


    function select() {
        echo "Hello from select";
    }
}
