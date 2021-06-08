
const Register = Vue.component('Register', {
  components: {
  },
  methods: {
      onSubmit(evt) {
        evt.preventDefault();

        let maxDate = new Date(new Date().getTime() - 365 * 12 * 24 * 3600 * 1000);
        let minDate = new Date(new Date().getTime() - 365 * 100 * 24 * 3600 * 1000);
        maxDate = maxDate.getFullYear() + '-' + (maxDate.getMonth()+1) + '-' + maxDate.getDate();
        minDate = minDate.getFullYear() + '-' + (minDate.getMonth()+1) + '-' + minDate.getDate();

        this.showBirthdayError = false;
        if (this.form.birthday < minDate || this.form.birthday > maxDate) {
          this.showBirthdayError = true;
        }
        else if (this.form.password1 != this.form.password2) {
          this.showPasswordError1 = true;
          this.showPasswordError2 = false;
        }
        else if (this.form.password1.length < 6) {
          this.showPasswordError1 = false;
          this.showPasswordError2 = true;
        }
        else {
          this.showPasswordError1 = false;
          this.showPasswordError2 = false;
          //alert(JSON.stringify(this.form));
          let currentObj = this;
          let csrfToken = document.getElementById('token').getAttribute('content');
          axios.post('./api/register.php', {
            salutation: this.form.salutation,
            firstName: this.form.firstName,
            lastName: this.form.lastName,
            birthday: this.form.birthday,
            email: this.form.email,
            password: this.form.password1,
            lang: this.$i18n.locale,
            token: csrfToken,
          })
          .then(function (response) {
              currentObj.output = response.data;
              document.getElementById('token').setAttribute('content', response.data.token);
              if (response.data.success) {
                currentObj.show = false;
                currentObj.success = true;
              }
              else {
                currentObj.show = true;
                currentObj.success = false;
              }
          })
          .catch(function (error) {
              currentObj.output = error;
              currentObj.show = true;
              currentObj.success = false;
          });
        }
      },
  },
  data: function() {
    return {
      form: {
        salutation: null,
        firstName: '',
        lastName: '',
        birthday: '',
        email: '',
        password1: '',
        password2: '',
      },
      salutations: [{ text: this.$t('salutation'), value: null }, { text: this.$t('mrs'), value: 'mrs' }, { text: this.$t('mr'), value: 'mr' }],
      show: true,
      success: true,
      showPasswordError1: false,
      showPasswordError2: false,
      showBirthdayError: false,
      acceptTerms: 'not_accepted',
      acceptWarrantyExclusion: 'not_accepted',
  }},
  template: `
          <main id="content-container" role="main" class="container">
            <b-container fluid>
              <b-form-group class="col-md-8">
                <b-form @submit="onSubmit" v-if="show" action="register.php" method="post">
                  <h1 class="mb-3">{{ $t('register') }}</h1>
                  <b-form-group class="mb-3" v-bind:label="$t('salutation')" label-cols-sm="3">
                    <b-form-select v-model="form.salutation" :options="salutations" required></b-form-select>
                  </b-form-group>
                  <b-form-group class="mb-3" v-bind:label="$t('firstName')" label-cols-sm="3">
                    <b-form-input v-model="form.firstName" v-bind:placeholder="$t('firstName')" required></b-form-input>
                  </b-form-group>
                  <b-form-group class="mb-3" v-bind:label="$t('lastName')" label-cols-sm="3">
                    <b-form-input v-model="form.lastName" v-bind:placeholder="$t('lastName')" required></b-form-input>
                  </b-form-group>
                  <b-form-group class="mb-3" v-bind:label="$t('birthday')" label-cols-sm="3">
                    <b-input-group>
                      <b-form-input
                        id="birthday"
                        v-model="form.birthday"
                        type="date"
                        required>
                        </b-form-input>
                    </b-input-group>
                  </b-form-group>
                  <b-form-group class="mb-3" v-bind:label="$t('email')" label-cols-sm="3">
                    <b-form-input type="email" v-model="form.email" v-bind:placeholder="$t('email')" required></b-form-input>
                  </b-form-group>
                  <b-form-group class="mb-3" v-bind:label="$t('password')" label-cols-sm="3">
                    <b-form-input type="password" v-model="form.password1" v-bind:placeholder="$t('password')" required></b-form-input>
                  </b-form-group>
                  <b-form-group class="mb-3" v-bind:label="$t('passwordConfirm')" label-cols-sm="3">
                    <b-form-input type="password" v-model="form.password2" v-bind:placeholder="$t('passwordConfirm')" required></b-form-input>
                  </b-form-group>
                  <b-form-group class="mb-3" label="" label-cols-sm="3">
                    <b-form-checkbox
                      v-model="acceptTerms"
                      name="checkbox-1"
                      value="accepted"
                      unchecked-value="not_accepted"
                      required>
                      {{ $t('acceptTermsAndUse') }}
                    </b-form-checkbox>
                  </b-form-group>
                  <b-form-group class="mb-3" label="" label-cols-sm="3">
                    <b-form-checkbox
                      v-model="acceptWarrantyExclusion"
                      name="checkbox-2"
                      value="accepted"
                      unchecked-value="not_accepted"
                      required>
                      {{ $t('warrantyExclusion') }}
                    </b-form-checkbox>
                  </b-form-group>
                  <b-form-group class="mb-3" label="" label-cols-sm="3">
                    <b-button type="submit" variant="primary">{{ $t('save') }}</b-button>
                  </b-form-group>
                  <b-form-group class="mb-3" label="" label-cols-sm="3">
                    <b-alert variant="danger" show v-if="showPasswordError1">
                      <strong>{{ $t('formError') }}:</strong> {{ $t('passwordError1') }}
                    </b-alert>
                    <b-alert variant="danger" show v-if="showPasswordError2">
                      <strong>{{ $t('formError') }}:</strong> {{ $t('passwordError2') }}
                    </b-alert>
                    <b-alert variant="danger" show v-if="showBirthdayError">
                      <strong>{{ $t('formError') }}:</strong> {{ $t('birthdayError') }}
                    </b-alert>
                    <b-alert variant="danger" show class="mb-3" v-if="!success">
                      <h2>{{ $t('registrationFailure') }}</h2>
                      <p>{{ $t('registrationFailureTxt') }}</p>
                    </b-alert>
                  </b-form-group>
                </b-form>
                <b-form-group class="mb-3" label="" label-cols-sm="3" v-else>
                  <b-alert variant="success" show v-if="success">
                    <h2>{{ $t('registrationSuccessful') }}</h2>
                    <p>{{ $t('registrationSuccessfulTxt') }}</p>
                    <b-button type="submit" variant="primary" to="/login">{{ $t('login') }}</b-button>
                  </b-alert>
                </b-form-group>
              </div>
            </b-container>
          </main>
        `
});


export default Register;
