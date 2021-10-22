<?php

// autoload_static.php @generated by Composer

namespace Composer\Autoload;

class ComposerStaticInit78d94404547838ae9b0c6bcbffe8d534
{
    public static $prefixLengthsPsr4 = array (
        'W' => 
        array (
            'Widget\\' => 7,
        ),
    );

    public static $prefixDirsPsr4 = array (
        'Widget\\' => 
        array (
            0 => __DIR__ . '/../..' . '/src',
        ),
    );

    public static $classMap = array (
        'Composer\\InstalledVersions' => __DIR__ . '/..' . '/composer/InstalledVersions.php',
    );

    public static function getInitializer(ClassLoader $loader)
    {
        return \Closure::bind(function () use ($loader) {
            $loader->prefixLengthsPsr4 = ComposerStaticInit78d94404547838ae9b0c6bcbffe8d534::$prefixLengthsPsr4;
            $loader->prefixDirsPsr4 = ComposerStaticInit78d94404547838ae9b0c6bcbffe8d534::$prefixDirsPsr4;
            $loader->classMap = ComposerStaticInit78d94404547838ae9b0c6bcbffe8d534::$classMap;

        }, null, ClassLoader::class);
    }
}
