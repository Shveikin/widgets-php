<?php

namespace Widget;


class widgetconvertor {

    static function convert($element, $from, $to){
		if ($from == $to){
			return $element;
		}
        $func = "{$from}To{$to}";
		
        if (method_exists(__CLASS__, $func)){
			$result = widgetconvertor::{$func}($element);
			$newType = widgetconvertor::getType($result);
			if ($newType==$to){
				return $result;
			} else {
				return widgetconvertor::convert($result, $newType, $to);
			}
        } else {
            throw new \ErrorException("$func отсутствует!");
        }
    }

    static function getType($element){
		$type = 'Unknown';
        if (is_array($element)){
            $type = 'Array';
            if (isset($element['element'])){
                $type = 'Element';

                switch($element['element']){
                    case 'state_update_group':
                        $type = 'Group';
                    break;
                }
            }
        }

        return $type;
    }


}