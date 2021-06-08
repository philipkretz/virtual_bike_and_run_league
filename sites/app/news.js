const News = Vue.component('News', {
  methods: {
    filterEventData: function(eventData) {
      let max = 5;
      this.events = eventData.slice(0,max);
    },
  },
  data: function() {
    return {
      loggedIn: isAuthenticated(),
      events: [],
  }},
  mounted: function() {
    axios
        .get('./api/events.php?t='+(new Date()).valueOf())
        .then(response => this.filterEventData(response.data.events))
        .catch(error => console.log(error))
  },
  template: `
          <main id="content-container" role="main" class="container">
            <div class="jumbotron">
              <h1>{{ $t('headline') }}</h1>
              <b-card-group deck>
                <b-card no-body>
                  <b-carousel
                    id="carousel-fade"
                    :interval="4000"
                    style="text-shadow: 0px 0px 2px #000"
                    fade
                    indicators
                    img-width="1024"
                    img-height="480"
                  >
                    <b-carousel-slide
                      v-bind:caption="$t('newsSubheadline1')"
                      img-src="./assets/images/BR_IMG_1.jpg"
                    ></b-carousel-slide>
                    <b-carousel-slide
                      v-bind:caption="$t('newsSubheadline2')"
                      img-src="./assets/images/BR_IMG_2.jpg"
                    ></b-carousel-slide>
                    <b-carousel-slide
                      v-bind:caption="$t('newsSubheadline3')"
                      img-src="./assets/images/BR_IMG_4.jpg"
                    ></b-carousel-slide>
                  </b-carousel>
                </b-card>
                <b-card class="news-txt" border-variant="secondary" bg-variant="secondary" text-variant="white">
                  <b-card-text class="mt-3">
                    {{ $t('welcomeTxt') }}
                  </b-card-text>
                  <hr class="my-4">
                    <h3><router-link to="/events">{{ $t('events') }}</router-link></h3>
                    <p v-for="event in events">
                      <router-link v-bind:to="'/book-event/'+event['event_id']">
                        <strong>{{ new Date(event['start_date']).toLocaleString().substring(0,event['start_date'].length-3) }}</strong> {{ $t(event.title) }}
                      </router-link>
                    </p>
                  <hr class="my-4" v-if="!loggedIn">
                  <div v-if="!loggedIn">
                    <router-link to="/login" role="button"><strong>{{ $t('login') }}</strong></router-link>
                    &nbsp;|&nbsp;
                    <router-link to="/register" role="button">{{ $t('registerNow') }}</router-link>
                  </div>
                </b-card>
            </b-card-group>
            
            <div class="mt-3">
                <b-img src="./assets/images/strava.jpg" fluid alt="Strava" class="portal-badge-news"></b-img>
                <b-img src="./assets/images/garmin_connect.png" fluid alt="Garmin Connect" class="portal-badge-news"></b-img>
            </div>
            </div>
          </main>
        `
});


export default News;
