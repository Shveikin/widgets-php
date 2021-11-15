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

c::app(function ($layout) use ($filter, $open) {
    $layout->style = 'width: 300px; border-bottom: 1px solid #ccc;';

    foreach ($filter as $key => $element) {
        $layout->div(
            className:"_group table__{$element['url']}",
            style: 'border-top: 1px solid #ccc; border-right: 1px solid #ccc;',
            type: $element['url'],
            child: [
                c::div( // title
                    style: 'display: flex; justify-content: space-between; padding: 10px;',
                    child: [

                        c::div(className:'icon-block eye_open', style:'padding: 10px; background: #f00;'),
                        $element['title'],
                        "[open]",

                    ]
                )->indexName($key, "title"),

                c::div( // body
                    style: ['padding' => '10px', 'display' => $open?'block':'none', ],
                    child: [
                        c::input(
                            type: 'text', 
                            style: 'border: 1px solid #ccc; padding: 7px; width: 100%; box-sizing: border-box;', 
                            placeholder: 'Поиск'
                        ),
                        c::div('')->indexName($key, "content"),
                    ]
                )->indexName($key, "body"),
            ]
        );


        $content = c::indexName($key, "content");
        foreach($element['content'] as $groups){
            $groupList = $content->div(style: 'display: flex;');
            $image = false;
            $checkboxes = c::div();

            foreach($groups as $checkbox){
                if ($image==false && isset($checkbox['img'])) {
                    $image = c::img(
                        href: $checkbox['img']
                    );
                }

                $checkboxes->child = c::div(
                    style: 'display: flex;',
                    child: c::Label(
                        title: $checkbox['title'],
                        input: c::input(type: 'checkbox'),
                        inline: true,
                        inputFirst: true,
                    ),
                );
            }



            $groupList->child = [
                c::div($image),
                $checkboxes
            ];
        }
    }

    echo "<pre>";
    print_r($layout->toArray());
    echo "</pre>";
});
