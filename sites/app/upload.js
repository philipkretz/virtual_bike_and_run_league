
const Upload = Vue.component('Upload', {
  methods: {
    addEvents(events) {
      this.events = [];
      let userEvents = [];
      if (isAuthenticated()) {
        userEvents =  window.userData['events'].split(',');
      }

      for (var i=0; i<events.length; i++) {
        if (userEvents.includes(events[i]['event_id'])) {
          this.events.push(events[i]);
        }
      }
    },

    onSync(evt) {
      evt.preventDefault();
      let currentObj = this;
      if (currentObj.formConnect.connectedPortal == 'strava') {
        if (window.userData['strava_token'] == '') {
          window.location.replace(window.location.protocol+'//'+window.location.hostname+'/api/strava_auth.php?t='+(new Date()).valueOf());
        }
        else {
          axios
              .get('./api/strava_sync.php?code='+window.userData['strava_token']+'&t='+(new Date()).valueOf())
              .then(response => (this.activities=response.data.activities, window.userData['strava_token'] = response.data['refresh_token']))
              .catch(error => console.log(error));
        }
      } else if (currentObj.formConnect.connectedPortal == 'garmin') {
         if (window.userData['garmin_token'] == '') {
           window.location.replace(window.location.protocol+'//'+window.location.hostname+'/api/garmin_auth.php?t='+(new Date()).valueOf());
         }
         else {
           axios
               .get('./api/garmin_sync.php?oauth_token='+window.userData['garmin_token']+'&oauth_verifier='+window.userData['garmin_verifier']+'&t='+(new Date()).valueOf())
               .then(response => (this.activities=response.data.activities))
               .catch(error => console.log(error));
         }
       }
    },

    onUpload(evt) {
      evt.preventDefault();

      let currentObj = this;
      currentObj.saved = false;
      currentObj.error = false;

      let csrfToken = document.getElementById('token').getAttribute('content');
      axios.post('./api/upload.php', {
        activities: this.formActivities.activitiesSelected,
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

    getSavedPortal() {
      if (!isAuthenticated()) {
        return false;
      }
      if (window.userData['strava_token'] != '') {
        return 'strava';
      }
      if (window.userData['garmin_token'] != '') {
        return 'garmin';
      }
      if (window.userData['polar_token'] != '') {
        return 'polar';
      }
      return 'strava';
    },

    getSavedToken() {
      if (!isAuthenticated()) {
        return false;
      }
      if (window.userData['strava_token'] != '') {
        return window.userData['strava_token'];
      }
      if (window.userData['garmin_token'] != '') {
        return window.userData['garmin_token'];
      }
      if (window.userData['polar_token'] != '') {
        return window.userData['polar_token'];
      }
    },

    handleOAuthRedirect() {
      if (typeof this.$route.query.api !== 'undefined') {
        this.formConnect.connectedPortal = this.$route.query.api;
        if (this.$route.query.api == 'garmin') {
          const token = this.$route.query.oauth_token;
          this.formConnect.token = token;
          window.userData['garmin_token'] = token;
          window.userData['garmin_verifier'] = this.$route.query.oauth_verifier;

          axios
              .get('./api/garmin_sync.php?oauth_token='+window.userData['garmin_token']+'&oauth_verifier='+window.userData['garmin_verifier']+'&t='+(new Date()).valueOf())
              .then(response => (this.activities=response.data.activities))
              .catch(error => console.log(error));
        }
        else if (this.$route.query.api == 'strava') {
          const token = this.$route.query.code;
          this.formConnect.token = token;
          window.userData['strava_token'] = token;

          axios
              .get('./api/strava_sync.php?code=' + window.userData['strava_token'] + '&t=' + (new Date()).valueOf())
              .then(response => (this.activities = response.data.activities, window.userData['garmin_token'] = response.data['refresh_token']))
              .catch(error => console.log(error));
        }
      }
    },
  },
  data: function() {
    return {
      loggedIn: isAuthenticated(),
      error: false,
      errorConnect: false,
      saved: false,
      errorActivity: false,
      errorUploadAgain: false,
      formConnect: {
        connectedPortal: this.getSavedPortal(),
        token : this.getSavedToken(),
      },
      formActivities: {
        activitiesSelected: [],
      },
      events: [],
      activities: [],
    }},
  mounted: function() {
    this.handleOAuthRedirect();
    axios
        .get('./api/events.php?use=upload&t='+(new Date()).valueOf())
        .then(response => this.addEvents(response.data.events))
        .catch(error => console.log(error))
  },
  template: `
          <main id="content-container" role="main" class="container">
            <div class="jumbotron">
              <h1>{{ $t('upload') }}</h1>
              <p class="lead">{{ $t('uploadTxt') }}</p>
              <hr class="mb-3">
              <b-form id="form-connect" @submit="onSync" method="post">
                <b-form-group class="mb-3" v-bind:label="$t('event')" label-cols-sm="3">
                 <b-form-input v-for="event in events" v-bind:value="$t(event.title)" disabled></b-form-input>
                </b-form-group>
                <b-form-group class="mb-3" v-bind:label="$t('portal')" label-cols-sm="3">
                    <b-list-group horizontal="md">
                     <b-list-group-item @click="formConnect.connectedPortal='strava'" href="#" class="mb-sm-2" data-value="strava" v-bind:active="formConnect.connectedPortal=='strava'">
                        <b-img src="./assets/images/strava.jpg" fluid alt="Strava"></b-img>
                        Strava
                     </b-list-group-item>
                     <b-list-group-item @click="formConnect.connectedPortal='garmin'" href="#" class="mb-sm-2" data-value="garmin" v-bind:active="formConnect.connectedPortal=='garmin'">
                        <b-img src="./assets/images/garmin_connect.png" fluid alt="Garmin Connect"></b-img>
                        Garmin Connect
                     </b-list-group-item>
                     <!--<b-list-group-item @click="formConnect.connectedPortal='polar'" href="#" class="mb-sm-2" data-value="polar" v-bind:active="formConnect.connectedPortal=='polar'">
                        <b-img src="./assets/images/polar_flow.png" fluid alt="Polar Flow"></b-img>
                        Polar Flow
                     </b-list-group-item>-->
                    </b-list-group>
                </b-form-group>
                
                <b-form-group label="" label-cols-sm="3">
                    <b-button variant="primary" type="submit">{{ formConnect.token != '' ? $t('sync') : $t('connect') }}</b-button>
                </b-form-group>
                <b-form-group class="mb-3" label="" label-cols-sm="3">
                  <b-alert variant="danger" show v-if="errorConnect">
                    <strong>{{ $t('uploadFormErrorConnect') }}</strong>
                  </b-alert>
                </b-form-group>                
              </b-form>

              <hr class="mb-3">
              
              <h5 v-if="activities.length==0">{{ $t('stillNoActivities') }}</h5>
              
              <b-form id="form-upload" @submit="onUpload" method="post" v-if="activities.length>0">
                <b-form-group class="mb-3" v-bind:label="$t('activities')" label-cols-sm="3">
                    <b-form-checkbox-group v-model="formActivities.activitiesSelected" name="activities-selected" class="mb-3">
                      <b-form-checkbox v-for="activity in activities" v-bind:value="activity.activity_id" class="mb-2" 
                      style="display: block;">
                        {{ activity.name }}
                      </b-form-checkbox>
                    </b-form-checkbox-group>
                </b-form-group>
                <b-form-group label="" label-cols-sm="3">
                    <b-button variant="primary" type="submit">{{ $t('upload') }}</b-button>
                </b-form-group>
                <b-form-group class="mb-3" label="" label-cols-sm="3">
                  <b-alert variant="success" show v-if="saved">
                    <strong>{{ $t('uploadFormSuccess') }}</strong>
                    <hr class="mb-2">
                    <b-button to="/ranking" variant="primary">{{ $t('ranking') }}</b-button>
                  </b-alert>
                  <b-alert variant="danger" show v-if="error">
                    <strong>{{ $t('uploadFormError') }}</strong>
                  </b-alert>
                  <b-alert variant="danger" show v-if="errorActivity">
                    <strong>{{ $t('uploadFormErrorActivity') }}</strong>
                  </b-alert>
                  <b-alert variant="danger" show v-if="errorUploadAgain">
                    <strong>{{ $t('uploadFormErrorUploadAgain') }}</strong>
                    <hr class="mb-2">
                    <b-button to="/ranking" variant="primary">{{ $t('ranking') }}</b-button>
                  </b-alert>
                </b-form-group>  
              </b-form>
            </div>
          </main>
        `
});

export default Upload;
