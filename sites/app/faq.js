
const FAQ = Vue.component('FAQ', {
  template: `
          <main id="content-container" role="main" class="container">
            <div class="jumbotron">
              <h1>{{ $t('faq') }}</h1>
              <p class="lead">{{ $t('faqTxt') }}</p>
            </div>
          </main>
        `
});

export default FAQ;
