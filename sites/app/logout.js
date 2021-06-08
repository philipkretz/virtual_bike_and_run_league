
const Logout = Vue.component('Logout', {
  components: {
  },
  created: function() {
    let csrfToken = document.getElementById('token').getAttribute('content');
    let currentObj = this;
    axios.post('./api/logout.php', {
      token: csrfToken,
    })
    .then(function (response) {
      currentObj.output = response.data;
      document.getElementById('token').setAttribute('content', response.data.token);
      window.userData = null;
      setTimeout(function() {
        self.location.reload();
      }, 1000);
    })
    .catch(function (error) {
      currentObj.output = error;
    });
  },
  data: function() {
    return {
  }},
  template: `
          <main id="content-container" role="main" class="container">
            <div class="jumbotron">
              <h1>{{ $t('logout') }}</h1>
              <p class="lead">{{ $t('logoutTxt') }}</p>
            </div>
          </main>
        `
});


export default Logout;
