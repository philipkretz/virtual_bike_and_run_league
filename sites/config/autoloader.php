<?php

class Autoloader
{
    public static function register()
    {
        spl_autoload_register(function ($classPath) {
            $fileArr = explode('\\',$classPath);
            if (!is_array($fileArr) || count($fileArr) == 0) {
                return false;
            }

            $fileArr[count($fileArr)-1] = 'class.'.$fileArr[count($fileArr)-1].'.php';
            $fileName = implode(DIRECTORY_SEPARATOR,$fileArr);

            if (file_exists($fileName)) {
                include $fileName;
                return true;
            }
            return false;
        });
    }
}
Autoloader::register();