
const Settings = Vue.component('Settings', {
  components: {
  },
  data: function() {
    return {
      message: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.'
  }},
  template: `
          <main id="content-container" role="main" class="container">
            <div class="jumbotron">
              <h1>{{ $t('settings') }}</h1>
              <p class="lead">{{ message }}</p>
            </div>
          </main>
        `
});

export default Settings;
