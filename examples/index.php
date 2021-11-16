<?php
require_once __DIR__ . '/../vendor/autoload.php';
use Widget\c;
use Widget\widget;

$filter = [
    [
        'title' => 'Подсоединение',
        'url' => 'connect_in',
        'content' => [
            [
                [
                    'id' => '523',
                    'main' => 'Hy-Lok',
                    'title' => 'Hy-Lok 6mm\r',
                    'img' => '/assets/images/tube_conn.png',
                ],
                [
                    'id' => '523',
                    'main' => 'Hy-Lok',
                    'title' => 'Hy-Lok 6mm\r',
                    'img' => '/assets/images/tube_conn.png',
                ],
            ],
        ],
    ],
    [
        'title' => 'Материал',
        'url' => 'material',
        'content' => [
            [
                [
                    'id' => '523',
                    'title' => 'Сталь',
                ],
                [
                    'id' => '523',
                    'title' => 'Алюминий',
                ],
            ],
        ],
    ],
];

$open = true;

c::app(
    function ($layout, $state) {
        $layout->child = [
            $state->watch('count'),
            c::button(
                child: 'click', 
                onclick: $state->set('count', "{$state}['count'] + 1")
            )
        ];

        echo "<pre>";
        print_r($layout->toArray());
        echo "</pre>";

    }, 
    [
        'count' => 1
    ]
);
