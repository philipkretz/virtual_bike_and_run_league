
const Events = Vue.component('Events', {
  methods: {
    addEvents: function(events) {
      let distances = null, distance = null, str = '';
      for (var i = 0; i < events.length; i++) {
        distances = [];
        for (var d = 0; d < events[i].distances.length; d++) {
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
    }
  },
  data: function() {
    return {
      timezone: 'CET, Berlin+0',
      events: [],
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
            <h1>{{ $t('events') }}</h1>

            <template v-slot:lead>
              {{ $t('eventsTxt') }}
            </template>

            <hr class="my-4">

            <b-card-group>
              <b-card
                v-for="event in events"
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
                </b-card-text>

                <b-button v-bind:to="'/book-event/'+event['event_id']" variant="primary">{{ $t('eventDetails') }}</b-button>
              </b-card>
            </b-card-group>
          </div>
          </main>
        `
});

export default Events;
