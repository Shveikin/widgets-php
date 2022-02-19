<?php

// autoload_static.php @generated by Composer

namespace Composer\Autoload;

class ComposerStaticInit0a48ee250bdfee5ff7d4251c1cb6030e
{
    public static $prefixLengthsPsr4 = array (
        'W' => 
        array (
            'Widget\\tool\\dialog\\' => 19,
            'Widget\\tool\\' => 12,
            'Widget\\' => 7,
        ),
    );

    public static $prefixDirsPsr4 = array (
        'Widget\\tool\\dialog\\' => 
        array (
            0 => __DIR__ . '/../..' . '/src/tool/dialog',
        ),
        'Widget\\tool\\' => 
        array (
            0 => __DIR__ . '/../..' . '/src/tool',
        ),
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
            $loader->prefixLengthsPsr4 = ComposerStaticInit0a48ee250bdfee5ff7d4251c1cb6030e::$prefixLengthsPsr4;
            $loader->prefixDirsPsr4 = ComposerStaticInit0a48ee250bdfee5ff7d4251c1cb6030e::$prefixDirsPsr4;
            $loader->classMap = ComposerStaticInit0a48ee250bdfee5ff7d4251c1cb6030e::$classMap;

        }, null, ClassLoader::class);
    }
}
