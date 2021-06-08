<?php
    require './config/autoloader.php';

    use helper\LangHelper;
    use helper\CsrfHelper;
    use helper\UserHelper;

    session_start();
    CsrfHelper::generateToken();

?>
<!DOCTYPE html>
<html lang="<?php echo LangHelper::getUserLang(); ?>">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta id="token" name="token" content="<?php echo CsrfHelper::getToken(); ?>">
    <title>Virtual Bike and Run League</title>
    <link href="./assets/css/quicksand.css" rel="stylesheet">
    <link type="text/css" rel="stylesheet" href="//unpkg.com/bootstrap/dist/css/bootstrap.min.css" />
    <link type="text/css" rel="stylesheet" href="//unpkg.com/bootstrap-vue@latest/dist/bootstrap-vue.min.css" />
    <link rel="stylesheet" href="./assets/css/styles.css">
  </head>
  <body>
    <section id="app">
      <app-menu></app-menu>
        <transition name="fade" mode="out-in">
            <router-view></router-view>
        </transition>
      <app-footer></app-footer>
    </section>

    <script src="//cdn.jsdelivr.net/npm/vue@2.5.1"></script>
    <script src="//unpkg.com/vue-router@3.0.1/dist/vue-router.js"></script>
    <script src="//unpkg.com/vue-i18n/dist/vue-i18n.js"></script>
    <script src="//cdnjs.cloudflare.com/ajax/libs/axios/0.19.2/axios.js"></script>
    <script src="//unpkg.com/bootstrap-vue@latest/dist/bootstrap-vue.min.js"></script>
    <script src="//unpkg.com/bootstrap-vue@latest/dist/bootstrap-vue-icons.min.js"></script>
    <script>
        <?php if (UserHelper::checkLogin()) { ?>
        window.userData = <?php echo json_encode(UserHelper::getUserData()); ?>
        <?php } ?>
    </script>
    <script type="text/javascript">
    window.cookieconsent_options = {"message":"Diese Webseite nutzt Cookies, um Ihnen die bestmögliche Funktionalität bieten zu können.","dismiss":"Zustimmen","theme":"dark-bottom"};
    </script>
    <script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/cookieconsent2/1.0.9/cookieconsent.min.js"></script>

    <script src="./app/virtual_br_league.js" type="module"></script>
  </body>
</html>
