<script src="/js/widgets-js/src/widgets.js"></script>

<?php
require_once __DIR__ . '/../vendor/autoload.php';
use Widget\c;
use Widget\state;



state::init(
    name: 'Василий',
    showInput: true,
);

state::set('filterOpen.connect', true);
state::set('filterOpen.material', true);


$element = c::div('Фильтр');

foreach(['material', 'connect', 'dn'] as $key){
    $element->child = c::div(
        style: 'border-top: 1px solid #ccc; padding: 10px;',
        child: [
            $key,
            c::button(
                child: 'click',
                onclick: c::js_function(state::name().".filterOpen.$key = false")
            ),
            state::check("filterOpen.$key", 
                c::div('Содержимое', style: 'padding: 10px; color: #f00')
            )
        ]
    );
}


echo $element->html(true);
echo "<hr>";
$element->print_r();