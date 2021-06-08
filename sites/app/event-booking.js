const EventBooking = Vue.component('EventBooking', {
  components: {
  },
  methods: {
      addEvents: function(events) {
          let distances=null,distance=null,str='';
          for (var i=0; i<events.length; i++) {
              distances = [];
              for (var d=0;d<events[i].distances.length;d++) {
                  distance = events[i].distances[d];
                  if (typeof distance.time != 'undefined') {
                      str = (distance.time + '').replace('.', ',') + ' min ' + this.$t(distance.sports);
                  }
                  else {
                      str = (distance.dist + '').replace('.', ',') + ' km ' + this.$t(distance.sports);
                  }
                  if (distance.altitude > 0) {
                      str += ' (' + this.$t('minAltitude') + ': ' + distance.altitude + 'm)';
                  }
                  distances.push(str);
              }
              events[i].distances = distances;
          }
         this.events = events;
      },
    onSignup(evt) {
      evt.preventDefault();

      let eventName = evt.target.getAttribute('data-title');
      let csrfToken = document.getElementById('token').getAttribute('content');
      let currentObj = this;
      axios.post('./api/event_signup.php', {
        user_id: this.userId,
        event_id: this.$route.params.eventId,
        event_name: eventName,
        token: csrfToken,
      })
      .then(function (response) {
          currentObj.output = response.data;
          document.getElementById('token').setAttribute('content', response.data.token);
          if (response.data.success) {
              window.userData = response.data.user;
              currentObj.signedUp = true;
              currentObj.error = false;
          }
          else {
              currentObj.signedUp = false;
              currentObj.error = true;
          }
      })
      .catch(function (error) {
          currentObj.output = error;
          currentObj.signedUp = false;
          currentObj.error = true;
      });
    },
  },
  data: function() {
    let userEvents = [];
    if (isAuthenticated()) {
        userEvents =  window.userData['events'].split(',');
    }
    return {
      loggedIn: isAuthenticated(),
      eventIdSelected: this.$route.params.eventId,
      events: [],
      userId: isAuthenticated() ? window.userData['user_id'] : 0,
      signedUp: userEvents.includes(this.$route.params.eventId),
      timezone: 'CET, Berlin+0',
  }},
    mounted: function() {
        axios
            .get('./api/events.php?t='+(new Date()).valueOf())
            .then(response => this.addEvents(response.data.events))
            .catch(error => console.log(error))
    },
  template: `
          <main id="content-container" role="main" class="container">
          <div class="jumbotron">
            <h1>{{ $t('eventBooking') }}</h1>

            <template v-slot:lead>
              {{ $t('eventBookingTxt') }}
            </template>

            <hr class="my-4">

            <b-card-group>
              <b-card
                v-for="event in events"
                v-if="event['event_id'] == eventIdSelected"
                v-bind:title="$t(event.title)"
                tag="article"
                class="mb-2 event-card">
                <b-card-text>
                  <h4 v-if="event.running"><b-badge variant="danger">{{ $t('currentlyRunning') }}</b-badge></h4>
                  <h4 v-else-if="event.soon"><b-badge variant="warning">{{ $t('soon') }}</b-badge></h4>
                  <h4 v-else><b-badge variant="success">{{ $t('open') }}</b-badge></h4>
                  <p><strong>{{ $t('startDate') }}:</strong> {{ new Date(event['start_date']).toLocaleString() }} {{ timezone }}</p>
                  <p><strong>{{ $t('endDate') }}:</strong> {{ new Date(event['end_date']).toLocaleString() }} {{ timezone }}</p>
                  <p v-if="event['time_total']>0"><strong>{{ $t('cutoffTime') }}:</strong> {{ event['time_total'] }} min</p>
                  
                  <p>
                    <strong>{{ $t('distances') }}:</strong>
                    <b-form-tags size="lg" tag-variant="primary" class="mb-2" v-model="event.distances" v-bind:placeholder="$t('thinkPositive')" disabled>
                    </b-form-tags>
                  </p>
                  
                  <p>{{ $t(event.description) }}</p>

                  <p>
                    <strong>{{ $t('starterFee') }}:</strong> {{ event.fee }} &euro;,
                    <span>{{ $t(event['fee_description']) }}</span>
                  </p>
                  <p>
                    <strong>{{ $t('prizes') }}:</strong>
                    <span>{{ $t(event['price_txt']) }}</span>
                  </p>

                  <p><strong>{{ $t('registeredParticipants') }}:</strong> {{ event.participants }}</p>
                </b-card-text>

                <div class="mt-3 col-xs-12 col-sm-12 col-md-8 col-lg-6">
                    <b-button block v-for="charityAction in event['charity_actions']" v-bind:href="charityAction.url" variant="success" target="_blank">{{ $t('donate') + ' #' + charityAction.name }}</b-button>
                    <b-button block @click="onSignup" v-bind:data-title="$t(event.title)" variant="primary" v-if="!signedUp&&loggedIn">{{ $t('competeAt') }}</b-button>
                </div>
                
                <b-alert class="mt-3" variant="success" v-if="signedUp" show>
                    {{ $t('alreadySignedUp') }}
                </b-alert>
                  
                <div v-if="!loggedIn">
                  <hr class="my-4">
                  {{ $t('notLoggedIn') }}
                  <router-link to="/login" role="button"><strong>{{ $t('login') }}</strong></router-link>
                  &nbsp;|&nbsp;
                  <router-link to="/register" role="button">{{ $t('register') }}</router-link>
                </div>
              </b-card>
            </b-card-group>
          </div>
          </main>
        `
});

export default EventBooking;
