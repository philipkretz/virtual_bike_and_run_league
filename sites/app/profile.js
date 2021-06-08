import countries from './countries.js';

const maxFileSize = 500000;

const Profile = Vue.component('Profile', {
  methods: {
    onChangeAvatar(filename, files) {
      this.showFileError = false;
      if (files != null && files.length>0) {
        if (files[0].size > maxFileSize) {
          this.showFileError = true;
          return;
        }

        this.avatarFile = files[0];
        let reader = new FileReader();
        reader.readAsDataURL(this.avatarFile);
        reader.onload = () => this.setAvatar(reader.result);
        reader.onerror = error => this.rejectAvatar(error);
      }
    },

    setAvatar(result) {
      this.formAthleteDetails.avatar = result;
    },

    rejectAvatar(error) {
      this.showFileError = true;
      console.error(error);
    },

    onSubmitAthleteDetails(evt) {
      evt.preventDefault();

      let currentObj = this;
      currentObj.saved = false;
      currentObj.error = false;

      let csrfToken = document.getElementById('token').getAttribute('content');
      axios.post('./api/profile.php', {
        avatarSrc: this.formAthleteDetails.avatar,
        motto: this.formAthleteDetails.motto,
        displayName: this.formAthleteDetails.displayName,
        weight: this.formAthleteDetails.weight,
        height: this.formAthleteDetails.height,
        weightFormat: this.formAthleteDetails.weightFormat,
        heightFormat: this.formAthleteDetails.heightFormat,
        form: 'athlete_details',
        token: csrfToken,
      }, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      .then(function (response) {
        currentObj.output = response.data;
        document.getElementById('token').setAttribute('content', response.data.token);
        if (response.data.success) {
          window.userData = response.data.user;
          currentObj.saved = true;
          currentObj.error = false;
        }
        else {
          currentObj.saved = false;
          currentObj.error = true;
        }
      })
      .catch(function (error) {
        currentObj.output = error;
        currentObj.saved = false;
        currentObj.error = true;
      });
    },

    onSubmitAddress(evt) {
      evt.preventDefault();

      let currentObj = this;
      currentObj.saved = false;
      currentObj.error = false;
      let csrfToken = document.getElementById('token').getAttribute('content');
      axios.post('./api/profile.php', {
        address1: this.formAddress.address1,
        address2: this.formAddress.address2,
        postcode: this.formAddress.postcode,
        city: this.formAddress.city,
        country: this.formAddress.country,
        form: 'address',
        token: csrfToken,
      })
      .then(function (response) {
        currentObj.output = response.data;
        document.getElementById('token').setAttribute('content', response.data.token);
        if (response.data.success) {
          window.userData = response.data.user;
          currentObj.saved = true;
          currentObj.error = false;
        }
        else {
          currentObj.saved = false;
          currentObj.error = true;
        }
      })
      .catch(function (error) {
        currentObj.output = error;
        currentObj.saved = false;
        currentObj.error = true;
      });
    },

    onSubmitPassword(evt) {
      evt.preventDefault();

      let currentObj = this;
      currentObj.saved = false;
      currentObj.error = false;
      if (this.formPassword.password1 != this.formPassword.password2) {
        currentObj.showPasswordError1 = true;
        currentObj.showPasswordError2 = false;
      }
      else if (this.formPassword.password1.length < 6) {
        currentObj.showPasswordError1 = false;
        currentObj.showPasswordError2 = true;
      }
      else {
        currentObj.showPasswordError1 = false;
        currentObj.showPasswordError2 = false;
        let csrfToken = document.getElementById('token').getAttribute('content');
        axios.post('./api/profile.php', {
          passwordOld: this.formPassword.passwordOld,
          passwordNew: this.formPassword.password1,
          form: 'password',
          token: csrfToken,
        })
        .then(function (response) {
          currentObj.output = response.data;
          document.getElementById('token').setAttribute('content', response.data.token);
          if (response.data.success) {
            window.userData = response.data.user;
            currentObj.saved = true;
            currentObj.error = false;
          } else {
            currentObj.saved = false;
            currentObj.error = true;
          }
        })
        .catch(function (error) {
          currentObj.output = error;
          currentObj.saved = false;
          currentObj.error = true;
        });
      }
    },

    onSubmitPersonnelDetails(evt) {
      evt.preventDefault();

      let currentObj = this;
      currentObj.saved = false;
      currentObj.error = false;
      let maxDate = new Date(new Date().getTime() - 365 * 12 * 24 * 3600 * 1000);
      let minDate = new Date(new Date().getTime() - 365 * 100 * 24 * 3600 * 1000);
      maxDate = maxDate.getFullYear() + '-' + (maxDate.getMonth()+1) + '-' + maxDate.getDate();
      minDate = minDate.getFullYear() + '-' + (minDate.getMonth()+1) + '-' + minDate.getDate();

      currentObj.showBirthdayError = false;
      if (this.formPersonnelDetails.birthday < minDate || this.formPersonnelDetails.birthday > maxDate) {
        currentObj.showBirthdayError = true;
      }
      else {
        let csrfToken = document.getElementById('token').getAttribute('content');
        axios.post('./api/profile.php', {
          salutation: this.formPersonnelDetails.salutation,
          firstName: this.formPersonnelDetails.firstName,
          lastName: this.formPersonnelDetails.lastName,
          birthday: this.formPersonnelDetails.birthday,
          form: 'personnel_details',
          lang: this.$i18n.locale,
          token: csrfToken,
        })
        .then(function (response) {
          currentObj.output = response.data;
          document.getElementById('token').setAttribute('content', response.data.token);
          if (response.data.success) {
            window.userData = response.data.user;
            currentObj.saved = true;
            currentObj.error = false;
          }
          else {
            currentObj.saved = false;
            currentObj.error = true;
          }
        })
        .catch(function (error) {
          currentObj.output = error;
          currentObj.saved = false;
          currentObj.error = true;
        });
      }
    },
  },
  components: {
  },
  data: function() {
    return {
      userName: isAuthenticated() ? window.userData['display_name'] : '',
      formAthleteDetails: {
        avatarName: window.userData['first_name'].substring(0,1)+window.userData['last_name'].substring(0,1),
        avatar: window.userData['avatar'],
        displayName: window.userData['display_name'],
        motto: window.userData['motto'],
        weight: window.userData['weight'],
        weightFormat: window.userData['weight_format'],
        height: window.userData['height'],
        heightFormat: window.userData['height_format'],
        agegroup: window.userData['agegroup'],
      },
      formAddress: {
        address1: window.userData['address1'],
        address2: window.userData['address2'],
        postcode: window.userData['postcode'],
        city: window.userData['city'],
        country: window.userData['country'],
      },
      formPersonnelDetails: {
        salutation: window.userData['agegroup'],
        firstName: window.userData['first_name'],
        lastName: window.userData['last_name'],
        birthday: window.userData['birthday'],
        email: window.userData['email'],
      },
      formPassword: {
        passwordOld: '',
        password1: '',
        password2: '',
      },
      salutations: [{ text: this.$t('salutation'), value: null }, { text: this.$t('mrs'), value: 'mrs' }, { text: this.$t('mr'), value: 'mr' }],
      weightFormats: ['kg','lb'],
      heightFormats: ['cm','in','ft'],
      showFileError: false,
      showPasswordError1: false,
      showPasswordError2: false,
      showBirthdayError: false,
      countries: countries,
      saved: false,
      error: false,
      avatarFile: null,
  }},
  template: `
          <main id="content-container" role="main" class="container">
            <b-container fluid>
              <h1 class="mb-3">{{ $t('profileOf') }} {{ userName }}</h1>
              <b-form-group role="tablist">
                <b-card no-body class="mb-1">
                  <b-card-header header-tag="header" class="p-1" role="tab">
                    <b-button block href="#" v-b-toggle.accordion-1 variant="success">{{ $t('athleteDetails') }}</b-button>
                  </b-card-header>
                  <b-collapse id="accordion-1" visible accordion="my-accordion" role="tabpanel">
                    <b-card-body>
                      <b-form @submit="onSubmitAthleteDetails" action="profile.php" method="post">
                        <b-form-group class="mb-3" v-bind:label="$t('avatar')" label-cols-sm="3">
                          <b-avatar class="profile-avatar" variant="info" size="lg" v-bind:src="formAthleteDetails.avatar" v-if="formAthleteDetails.avatar"></b-avatar>
                          <b-avatar class="profile-avatar" variant="primary" size="lg" v-bind:text="formAthleteDetails.avatarName" v-else></b-avatar>
                          <b-form-file 
                            accept="image/jpg,image/jpeg,image/png,image/gif"
                            v-model="formAthleteDetails.avatarSrc"
                            class="mt-3"
                            @change="onChangeAvatar($event.target.name, $event.target.files)"
                            v-bind:placeholder="$t('avatar')" 
                            plain>
                            </b-form-file>
                          <p class="mt-3"><strong>{{ $t('format') }}:</strong> gif/jpg/jpeg/png ({{ formAthleteDetails.avatarSrc ? formAthleteDetails.avatarSrc.type : '-' }})</p>
                          <p class="mt-3"><strong>{{ $t('sizeMax') }}:</strong> 500 KB ({{ formAthleteDetails.avatarSrc ? Math.ceil(formAthleteDetails.avatarSrc.size/1000) + ' KB' : '-' }})</p>
                          <b-alert variant="danger" show v-if="showFileError">
                            <strong>{{ $t('fileUploadError') }}</strong>
                          </b-alert>
                        </b-form-group>
                        <b-form-group class="mb-3" v-bind:label="$t('displayName')" label-cols-sm="3">
                          <b-form-input v-model="formAthleteDetails.displayName" v-bind:placeholder="$t('displayName')" required></b-form-input>
                        </b-form-group>
                        <b-form-group class="mb-3" v-bind:label="$t('motto')" label-cols-sm="3">
                          <b-form-textarea v-model="formAthleteDetails.motto" v-bind:placeholder="$t('motto')" rows="3" max-rows="3"></b-form-textarea>
                        </b-form-group>
                        <b-form-group class="mb-3" v-bind:label="$t('agegroup')" label-cols-sm="3">
                          <b-form-input v-model="formAthleteDetails.agegroup" v-bind:placeholder="$t('agegroup')" disabled></b-form-input>
                        </b-form-group>
                        <b-form-group class="mb-3" v-bind:label="$t('weight')" label-cols-sm="3">
                          <b-input-group>
                          <b-form-input type="number" v-model="formAthleteDetails.weight" v-bind:placeholder="$t('weight')" required></b-form-input>
                          <b-form-select v-model="formAthleteDetails.weightFormat" :options="weightFormats" required></b-form-select>
                          </b-input-group>
                        </b-form-group>
                        <b-form-group class="mb-3" v-bind:label="$t('height')" label-cols-sm="3">
                          <b-input-group>
                            <b-form-input type="number" v-model="formAthleteDetails.height" v-bind:placeholder="$t('height')" required></b-form-input>
                            <b-form-select v-model="formAthleteDetails.heightFormat" :options="heightFormats" required></b-form-select>
                          </b-input-group>
                        </b-form-group>
                        <b-form-group class="mb-3" label="" label-cols-sm="3">
                          <b-button type="submit" variant="primary">{{ $t('save') }}</b-button>
                        </b-form-group>
                        <b-form-group class="mb-3" label="" label-cols-sm="3">
                          <b-alert variant="success" show v-if="saved">
                            <strong>{{ $t('savedTxt') }}</strong>
                          </b-alert>
                          <b-alert variant="danger" show v-if="error">
                            <strong>{{ $t('profileFormError') }}</strong>
                          </b-alert>
                        </b-form-group>
                      </b-form>
                    </b-card-body>
                  </b-collapse>
                </b-card>
            
                <b-card no-body class="mb-1">
                  <b-card-header header-tag="header" class="p-1" role="tab">
                    <b-button block href="#" v-b-toggle.accordion-2 variant="success">{{ $t('events') }} / {{ $t('badges') }}</b-button>
                  </b-card-header>
                  <b-collapse id="accordion-2" accordion="my-accordion" role="tabpanel">
                    <b-card-body>
                      <b-card-text></b-card-text>
                    </b-card-body>
                  </b-collapse>
                </b-card>
            
                <b-card no-body class="mb-1">
                  <b-card-header header-tag="header" class="p-1" role="tab">
                    <b-button block href="#" v-b-toggle.accordion-3 variant="success">{{ $t('personnelDetails') }}</b-button>
                  </b-card-header>
                  <b-collapse id="accordion-3" accordion="my-accordion" role="tabpanel">
                    <b-card-body>
                      <b-form @submit="onSubmitPersonnelDetails" action="profile.php" method="post">
                        <b-form-group class="mb-3" v-bind:label="$t('email')" label-cols-sm="3">
                          <b-form-input type="email" v-model="formPersonnelDetails.email" v-bind:placeholder="$t('email')" disabled></b-form-input>
                        </b-form-group>
                        <b-form-group class="mb-3" v-bind:label="$t('salutation')" label-cols-sm="3">
                          <b-form-select v-model="formPersonnelDetails.salutation" :options="salutations" required></b-form-select>
                        </b-form-group>
                        <b-form-group class="mb-3" v-bind:label="$t('firstName')" label-cols-sm="3">
                          <b-form-input v-model="formPersonnelDetails.firstName" v-bind:placeholder="$t('firstName')" required></b-form-input>
                        </b-form-group>
                        <b-form-group class="mb-3" v-bind:label="$t('lastName')" label-cols-sm="3">
                          <b-form-input v-model="formPersonnelDetails.lastName" v-bind:placeholder="$t('lastName')" required></b-form-input>
                        </b-form-group>
                        <b-form-group class="mb-3" v-bind:label="$t('birthday')" label-cols-sm="3">
                          <b-input-group>
                            <b-form-input
                              id="birthday"
                              v-model="formPersonnelDetails.birthday"
                              type="date"
                              required>
                              </b-form-input>
                          </b-input-group>
                        </b-form-group>
                        <b-form-group class="mb-3" label="" label-cols-sm="3">
                          <b-button type="submit" variant="primary">{{ $t('save') }}</b-button>
                        </b-form-group>
                        <b-form-group class="mb-3" label="" label-cols-sm="3">
                          <b-alert variant="success" show v-if="saved">
                            <strong>{{ $t('savedTxt') }}</strong>
                          </b-alert>
                          <b-alert variant="danger" show v-if="error">
                            <strong>{{ $t('profileFormError') }}</strong>
                          </b-alert>
                        </b-form-group>
                      </b-form>
                    </b-card-body>
                  </b-collapse>
                </b-card>
                
                <b-card no-body class="mb-1">
                  <b-card-header header-tag="header" class="p-1" role="tab">
                    <b-button block href="#" v-b-toggle.accordion-4 variant="success">{{ $t('address') }}</b-button>
                  </b-card-header>
                  <b-collapse id="accordion-4" accordion="my-accordion" role="tabpanel">
                    <b-card-body>
                      <b-form @submit="onSubmitAddress" action="profile.php" method="post">
                        <b-form-group class="mb-3" v-bind:label="$t('address1')" label-cols-sm="3">
                          <b-form-input v-model="formAddress.address1" v-bind:placeholder="$t('address1')" required></b-form-input>
                        </b-form-group>
                        <b-form-group class="mb-3" v-bind:label="$t('address2')" label-cols-sm="3">
                          <b-form-input v-model="formAddress.address2" v-bind:placeholder="$t('address2')"></b-form-input>
                        </b-form-group>
                        <b-form-group class="mb-3" v-bind:label="$t('postcode')" label-cols-sm="3">
                          <b-form-input v-model="formAddress.postcode" v-bind:placeholder="$t('postcode')" required></b-form-input>
                        </b-form-group>
                        <b-form-group class="mb-3" v-bind:label="$t('city')" label-cols-sm="3">
                          <b-form-input v-model="formAddress.city" v-bind:placeholder="$t('city')" required></b-form-input>
                        </b-form-group>
                        <b-form-group class="mb-3" v-bind:label="$t('country')" label-cols-sm="3">
                          <b-form-select v-model="formAddress.country" :options="countries" required></b-form-select>
                        </b-form-group>
                        <b-form-group class="mb-3" label="" label-cols-sm="3">
                          <b-button type="submit" variant="primary">{{ $t('save') }}</b-button>
                        </b-form-group>
                        <b-form-group class="mb-3" label="" label-cols-sm="3">
                          <b-alert variant="success" show v-if="saved">
                            <strong>{{ $t('savedTxt') }}</strong>
                          </b-alert>
                          <b-alert variant="danger" show v-if="showBirthdayError">
                            <strong>{{ $t('formError') }}:</strong> {{ $t('birthdayError') }}
                          </b-alert>
                          <b-alert variant="danger" show v-if="error">
                            <strong>{{ $t('profileFormError') }}</strong>
                          </b-alert>
                        </b-form-group>
                      </b-form>
                    </b-card-body>
                  </b-collapse>
                </b-card>
                
                <b-card no-body class="mb-1">
                  <b-card-header header-tag="header" class="p-1" role="tab">
                    <b-button block href="#" v-b-toggle.accordion-5 variant="success">{{ $t('password') }}</b-button>
                  </b-card-header>
                  <b-collapse id="accordion-5" accordion="my-accordion" role="tabpanel">
                    <b-card-body>
                      <b-form @submit="onSubmitPassword" action="profile.php" method="post">
                        <b-form-group class="mb-3" v-bind:label="$t('passwordOld')" label-cols-sm="3">
                          <b-form-input type="password" v-model="formPassword.passwordOld" v-bind:placeholder="$t('passwordOld')" required></b-form-input>
                        </b-form-group>
                        <b-form-group class="mb-3" v-bind:label="$t('password')" label-cols-sm="3">
                          <b-form-input type="password" v-model="formPassword.password1" v-bind:placeholder="$t('password')" required></b-form-input>
                        </b-form-group>
                        <b-form-group class="mb-3" v-bind:label="$t('passwordConfirm')" label-cols-sm="3">
                          <b-form-input type="password" v-model="formPassword.password2" v-bind:placeholder="$t('passwordConfirm')" required></b-form-input>
                        </b-form-group>
                        <b-form-group class="mb-3" label="" label-cols-sm="3">
                          <b-button type="submit" variant="primary">{{ $t('save') }}</b-button>
                        </b-form-group>
                        <b-form-group class="mb-3" label="" label-cols-sm="3">
                          <b-alert variant="success" show v-if="saved">
                            <strong>{{ $t('savedTxt') }}</strong>
                          </b-alert>
                          <b-alert variant="danger" show v-if="showPasswordError1">
                            <strong>{{ $t('formError') }}:</strong> {{ $t('passwordError1') }}
                          </b-alert>
                          <b-alert variant="danger" show v-if="showPasswordError2">
                            <strong>{{ $t('formError') }}:</strong> {{ $t('passwordError2') }}
                          </b-alert>
                          <b-alert variant="danger" show v-if="error">
                            <strong>{{ $t('profileFormError') }}</strong>
                          </b-alert>
                        </b-form-group>
                      </b-form>
                    </b-card-body>
                  </b-collapse>
                </b-card>
                
                <b-card no-body class="mb-1">
                  <b-card-header header-tag="header" class="p-1" role="tab">
                    <b-button block href="#" v-b-toggle.accordion-6 variant="success">{{ $t('deleteUser') }}</b-button>
                  </b-card-header>
                  <b-collapse id="accordion-6" accordion="my-accordion" role="tabpanel">
                    <b-card-body>
                      <div class="mb-3">
                        <b-button 
                          size="lg" 
                          variant="primary"
                          v-bind:href="'mailto:support@virtualbikeandrunleague.com?subject='+$t('deleteUser')+' - '+window.userData['display_name']+'&body='+$t('pleaseDeleteMyUser')">
                          {{ $t('requestDeletion') }}
                        </b-button>
                      </div>
                    </b-card-body>
                  </b-collapse>
                </b-card>
              </div>
            </b-container>
          </main>
        `
});

export default Profile;
