
const Ranking = Vue.component('Ranking', {
  methods: {
    onSelectEvent(evt) {
      this.ranking = [];
      if (this.eventSelected !== null) {
        axios
            .get('./api/results.php?event_id=' + this.eventSelected + '&list=' + this.sortOrder + '&t=' + (new Date()).valueOf())
            .then(response => (this.ranking = response.data.ranking))
            .catch(error => console.log(error))
      }
    },
  },
  data: function() {
    return {
      events: [],
      eventSelected: null,
      sortOrder: 'all',
      ranking: [],
      perPage: 3,
      currentPage: 1,
  }},
  mounted: function() {
    axios
        .get('./api/events.php?use=ranking&t='+(new Date()).valueOf())
        .then(response => (this.events = response.data.events))
        .catch(error => console.log(error))
  },
  computed: {
    rows() {
      return this.ranking.length
    }
  },
  template: `
          <main id="content-container" role="main" class="container">
            <div class="jumbotron">
              <h1>{{ $t('ranking') }}</h1>
              <p class="lead">{{ $t('rankingTxt') }}</p>
              <b-form-group class="mb-3" v-bind:label="$t('event')" label-cols-sm="3">
                <b-form-select @change="onSelectEvent" v-model="eventSelected">
                    <b-form-select-option :value="null" disabled>-- {{ $t('selectEvent') }} --</b-form-select-option>
                    <b-form-select-option v-for="event in events" v-bind:value="event.event_id">
                      <strong>{{ new Date(event['start_date']).toLocaleString().substring(0,event['start_date'].length-3) }}</strong> {{ $t(event.title) }}
                    </b-form-select-option>
                </b-form-select>
              </b-form-group>
              <b-form-group class="mb-3" v-bind:label="$t('sortOrder')" label-cols-sm="3" v-bind:disabled="!eventSelected">
                <b-form-select @change="onSelectEvent" v-model="sortOrder">
                    <b-form-select-option value="all">{{ $t('sortOrderNormal') }}</b-form-select-option>
                    <b-form-select-option value="sex">{{ $t('sortOrderSex') }}</b-form-select-option>
                    <b-form-select-option value="agegroups">{{ $t('sortOrderAgegroups') }}</b-form-select-option>
                    <b-form-select-option value="distance">{{ $t('sortOrderDistanceTotal') }}</b-form-select-option>
                </b-form-select>
              </b-form-group>
              <hr class="my-4">
              <p class="lead" v-if="ranking.length == 0">{{ $t('noResultsFound') }}</p>
              
              <div class="overflow-auto" v-if="ranking.length > 0">
                <b-pagination
                  v-model="currentPage"
                  :total-rows="rows"
                  :per-page="perPage"
                  aria-controls="ranking-table"
                ></b-pagination>
            
                <p class="mt-3">Current Page: {{ currentPage }}</p>
            
                <b-table
                  responsive
                  id="ranking-table"
                  :items="ranking"
                  :per-page="perPage"
                  :current-page="currentPage"
                  striped
                  small
                ></b-table>
              </div>
            </div>
          </main>
        `
});


export default Ranking;
