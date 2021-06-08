
const Privacy = Vue.component('Privacy', {
  template: `
          <main id="content-container" role="main" class="container">
            <div class="jumbotron">
              <h1>{{ $t('privacy') }}</h1>
              <p class="lead">{{ $t('privacyTxt') }}</p>
            </div>
          </main>
        `
});


export default Privacy;
