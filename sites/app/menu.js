
import LanguageSwitcher from './language-switcher.js';

const AppMenu = Vue.component('Menu', {
  components: {
    LanguageSwitcher
  },
  data: function() {

    return {
      activeComponent: '',
      loggedIn: isAuthenticated(),
      userId: isAuthenticated() ? window.userData['user_id'] : 0,
      avatarName: isAuthenticated() ? window.userData['first_name'].substring(0,1)+window.userData['last_name'].substring(0,1) : '',
      avatar: isAuthenticated() ? window.userData['avatar'] : '',
    }
  },
  template: `
  <b-navbar toggleable="lg" type="light" class="navbar navbar-light bg-light">
    <b-navbar-brand>
      <img src="./assets/images/running_small.png" v-bind:title="$t('headline')" v-bind:alt="$t('headline')">
    </b-navbar-brand>
      <b-navbar-toggle class="navbar-toggler" type="button" target="navbarCollapse" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </b-navbar-toggle>
    <b-collapse class="collapse navbar-collapse" id="navbarCollapse" is-nav>
      <b-navbar-nav class="mr-auto">
        <b-nav-item v-bind:class="{ active: (activeComponent=='news') }" to="/">
          {{ $t('news') }} <span class="sr-only" v-if="activeComponent=='news'">(aktuell)</span>
        </b-nav-item>
        <b-nav-item v-bind:class="{ active: (activeComponent=='events') }" to="/events">
          {{ $t('events') }} <span class="sr-only" v-if="activeComponent=='events'">(aktuell)</span>
        </b-nav-item>
        <b-nav-item v-bind:class="{ active: (activeComponent=='ranking') }" to="/ranking">
          {{ $t('ranking') }} <span class="sr-only" v-if="activeComponent=='ranking'">(aktuell)</span>
        </b-nav-item>
        <b-nav-item v-bind:class="{ active: (activeComponent=='upload') }" v-if="loggedIn" to="/upload">
          {{ $t('upload') }} <span class="sr-only" v-if="activeComponent=='upload'">(aktuell)</span>
        </b-nav-item>
        <b-nav-item v-bind:class="{ active: (activeComponent=='rules') }" to="/rules">
          {{ $t('rules') }} <span class="sr-only" v-if="activeComponent=='rules'">(aktuell)</span>
        </b-nav-item>
      </b-navbar-nav>
      <b-navbar-nav class="ml-auto" right>
        <LanguageSwitcher></LanguageSwitcher>
        <section v-if="loggedIn">
          <b-nav-item v-bind:to="'/profile/'+userId" class="btn btn-lg button-menu" role="button" v-bind:title="$t('profile')">
            <b-avatar variant="info" size="sm" v-bind:src="avatar" v-if="avatar"></b-avatar>
            <b-avatar variant="primary" size="sm" v-bind:text="avatarName" v-else></b-avatar>
          </b-nav-item>
          <!--<b-nav-item v-bind:to="'/settings/'+userId" class="btn btn-lg button-menu" role="button" v-bind:title="$t('settings')">
            <svg class="bi bi-gear-fill" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 01-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 01.872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 012.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 012.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 01.872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 01-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 01-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 100-5.86 2.929 2.929 0 000 5.858z" clip-rule="evenodd"/>
            </svg>
          </b-nav-item>-->
        </section>
        <!--<b-nav-item href="#">
        <router-link to="/faq" class="btn btn-lg button-menu" role="button" v-bind:title="$t('faq')">
        <svg class="bi bi-info-circle-fill" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" d="M8 16A8 8 0 108 0a8 8 0 000 16zm.93-9.412l-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM8 5.5a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/>
        </svg>
        </router-link>
        </b-nav-item>-->
        <b-nav-item to="/logout" class="btn btn-lg button-menu" role="button" v-bind:title="$t('logout')" v-if="loggedIn">
          <svg class="bi bi-power" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" d="M5.578 4.437a5 5 0 104.922.044l.5-.866a6 6 0 11-5.908-.053l.486.875z" clip-rule="evenodd"/>
            <path fill-rule="evenodd" d="M7.5 8V1h1v7h-1z" clip-rule="evenodd"/>
          </svg>
        </b-nav-item>
        <b-nav-item to="/login" class="btn btn-lg button-menu" role="button" v-bind:title="$t('login')" v-if="!loggedIn">
          <svg class="bi bi-people-circle" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.468 12.37C12.758 11.226 11.195 10 8 10s-4.757 1.225-5.468 2.37A6.987 6.987 0 008 15a6.987 6.987 0 005.468-2.63z"/>
            <path fill-rule="evenodd" d="M8 9a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/>
            <path fill-rule="evenodd" d="M8 1a7 7 0 100 14A7 7 0 008 1zM0 8a8 8 0 1116 0A8 8 0 010 8z" clip-rule="evenodd"/>
          </svg>
          Login
        </b-nav-item>
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>
  `
});

export default AppMenu;
