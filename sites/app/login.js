const Login = Vue.component('Login', {
  components: {
  },
  created: function() {
    if (isAuthenticated()) {
      this.$router.push({ path: '/news' });
    }
  },
  methods: {
    onSubmit(evt) {
      evt.preventDefault();

      let csrfToken = document.getElementById('token').getAttribute('content');
      let currentObj = this;
      axios.post('./api/login.php', {
        email: this.form.email,
        password: this.form.password,
        token: csrfToken,
      })
      .then(function (response) {
          currentObj.output = response.data;
          document.getElementById('token').setAttribute('content', response.data.token);
          if (response.data.success) {
            currentObj.loggedIn = true;
            currentObj.error = false;
            window.userData = response.data.user;
            setTimeout(function() {
              self.location.reload();
            }, 1000);
          }
          else {
            currentObj.loggedIn = false;
            currentObj.error = true;
          }

      })
      .catch(function (error) {
          currentObj.output = error;
          currentObj.loggedIn = false;
          currentObj.error = true;
      });
    },
  },
  data: function() {
    return {
      loggedIn: isAuthenticated(),
      error: false,
      form: {
        email: '',
        password : '',
      }
  }},
  template: `
          <main id="content-container" role="main" class="container">
            <b-container fluid v-if="!loggedIn">
              <div class="col-md-6">
                <h1>{{ $t('login') }}</h1>
                <b-form @submit="onSubmit" v-if="!loggedIn" action="login.php" method="post">
                  <b-form-group class="mb-3" v-bind:label="$t('email')" label-cols-sm="3">
                    <b-form-input type="email" v-model="form.email" v-bind:placeholder="$t('email')" required></b-form-input>
                  </b-form-group>
                  <b-form-group class="mb-3" v-bind:label="$t('password')" label-cols-sm="3">
                    <b-form-input type="password" v-model="form.password" v-bind:placeholder="$t('password')" required></b-form-input>
                  </b-form-group>
                  <b-form-group class="mb-3" label="" label-cols-sm="3">
                    <b-button type="submit" variant="primary">{{ $t('login') }}</b-button>
                    <hr />
                  <router-link to="/register" role="button">{{ $t('register') }}</router-link>
                  </b-form-group>
                  <b-form-group class="mb-3" label="" label-cols-sm="3">
                    <b-alert variant="danger" show v-if="error">
                      <strong>{{ $t('formError') }}:</strong> {{ $t('loginError') }}
                    </b-alert>
                  </b-form-group>
                </b-form>
              </div>
              </b-container>
              <div className="jumbotron" v-else>
                <h1>{{ $t('welcome') }}, {{ userData.first_name }}!</h1>

                <p class="my-4">{{ $t('findCompetitionTxt') }}</p>
              </div>
          </main>
        `
});


export default Login;
