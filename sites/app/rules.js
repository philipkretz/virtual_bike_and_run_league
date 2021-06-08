
const Rules = Vue.component('Rules', {
  template: `
          <main id="content-container" role="main" class="container">
            <div class="jumbotron">
              <h1>{{ $t('rules') }}</h1>
              <p class="lead">{{ $t('rulesTxt') }}</p>
            </div>
          </main>
        `
});


export default Rules;
