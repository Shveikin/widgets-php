

class WidgetComparator {
    static compare(element1, element2){
        const result = WidgetComparator.object_equals(element1, element2)

        return result
    }

    static object_equals( x, y ) {
        if ( x === y ) return true;
        if ( ! ( x instanceof Object ) || ! ( y instanceof Object ) ) return false;

        if ( x.constructor !== y.constructor ) return false;

        for ( var p in x ) {
            if ( ! x.hasOwnProperty( p ) ) continue;
            if ( ! y.hasOwnProperty( p ) ) return false;
            if ( x[ p ] === y[ p ] ) continue;

            if ( typeof( x[ p ] ) !== "object" ) return false;

            if ( ! WidgetComparator.object_equals( x[ p ],  y[ p ] ) ) return false;
        }
        
        for ( p in y )
            if ( y.hasOwnProperty( p ) && ! x.hasOwnProperty( p ) )
            return false;
        
        return true;
    }
}