
const LegalNotice = Vue.component('LegalNotice', {
  template: `
          <main id="content-container" role="main" class="container">
            <div class="jumbotron">
              <h1>{{ $t('legalNotice') }}</h1>
              <p class="lead">{{ $t('legalNoticeTxt') }}</p>
            </div>
          </main>
        `
});


export default LegalNotice;
