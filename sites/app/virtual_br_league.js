
import AppMenu from './menu.js';
import AppFooter from './footer.js';
import News from './news.js';
import NotFound from './not-found.js';
import Events from './events.js';
import EventBooking from './event-booking.js';
import Ranking from './ranking.js';
import Upload from './upload.js';
import Rules from './rules.js';
import Profile from './profile.js';
import Settings from './settings.js';
import FAQ from './faq.js';
import Logout from './logout.js';
import Login from './login.js';
import Register from './register.js';
import LegalNotice from './legal-notice.js';
import Privacy from './privacy.js';
import Translations from './trans.js';

const messagesEN=Translations.messagesEN;
const messagesDE=Translations.messagesDE;

const routes = [
  { path: '/', component: News, meta: { requiresAuth: false, }},
  { path: '/news', component: News, meta: { requiresAuth: false, }},
  { path: '/events', component: Events, meta: { requiresAuth: false, }},
  { path: '/book-event/:eventId', component: EventBooking, meta: { requiresAuth: false, }},
  { path: '/upload', component: Upload, meta: { requiresAuth: true, }},
  { path: '/ranking', component: Ranking, meta: { requiresAuth: false, }},
  { path: '/rules', component: Rules, meta: { requiresAuth: false, }},
  { path: '/profile/:userId', component: Profile, meta: { requiresAuth: true, }},
  { path: '/settings/:userId', component: Settings, meta: { requiresAuth: true, }},
  { path: '/faq', component: FAQ, meta: { requiresAuth: false, }},
  { path: '/logout', component: Logout, meta: { requiresAuth: true, }},
  { path: '/login', component: Login, meta: { requiresAuth: false, }},
  { path: '/register', component: Register, meta: { requiresAuth: false, }},
  { path: '/legal-notice', component: LegalNotice, meta: { requiresAuth: false, }},
  { path: '/privacy', component: Privacy, meta: { requiresAuth: false, }},
  { path: '/*', component: NotFound, meta: { requiresAuth: false, }},
];

const router = new VueRouter({
  routes // short for `routes: routes`
});

window.isAuthenticated = function() {
  if (typeof window.userData != 'undefined') {
    return window.userData['logged_in'];
  }
  return false;
};

router.beforeEach((to, from, next) => {
  if (document.location.pathname == '/exchange_token') {
    window.location.replace(document.location.protocol+'//'+document.location.hostname+'/#/upload'+document.location.search+"&api=strava");
  }

  if (document.location.pathname == '/callback_garmin') {
    window.location.replace(document.location.protocol+'//'+document.location.hostname+'/#/upload'+document.location.search+"&api=garmin");
  }

  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (isAuthenticated()) {
      next();
      return;
    }
    next('/login');
  }
  next();
});

let browserLang = 'en';
if (navigator.language == 'de') {
  browserLang = 'de';
}

const i18n = new VueI18n({
  locale: browserLang,
  fallbackLocale: 'en',
  messages: {
    en: messagesEN,
    de: messagesDE,
  },
});

new Vue({
router,
i18n,
components: {
  AppMenu, AppFooter
},
}).$mount('#app');
