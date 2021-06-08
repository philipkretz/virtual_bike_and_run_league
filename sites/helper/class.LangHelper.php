<?php

namespace helper;

class LangHelper
{

    const KNOWN_LANGS = ['en','de'];
    const DEFAULT_LANG = 'en';

    public static function getUserLang() {
        $userLang = self::DEFAULT_LANG;
        $knownLangs = self::KNOWN_LANGS;
        $userPrefLangs = explode(',', $_SERVER['HTTP_ACCEPT_LANGUAGE']);
        foreach ($userPrefLangs as $idx => $lang) {
            $lang = substr($lang, 0, 2);
            if (in_array($lang, $knownLangs)) {
                $userLang = $lang;
                break;
            }
        }
        return $userLang;
    }

}