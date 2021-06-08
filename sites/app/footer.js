const AppFooter = Vue.component('Footer', {
  template: `
    <!-- footer -->
    <footer class="footer mt-auto py-3">
      <div class="container">
        <span class="text-muted">
          <router-link to="/legal-notice">{{ $t('legalNotice') }}</router-link>
          |
          <router-link to="/privacy">{{ $t('privacy') }}</router-link>
          |
          <a href="mailto:support@virtualbikeandrunleague.com?subject=Virtual Bike And Run League">{{ $t('contact') }}</a>
          | Copyright 2020 by Philip Kretz
        </span>
      </div>
    </footer>
  `
});


export default AppFooter;
