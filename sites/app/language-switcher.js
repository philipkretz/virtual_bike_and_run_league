
const LanguageSwitcher = Vue.component('LanguageSwitcher', {
  components: {
  },
  data: function() {
    return {
      languages: {
          de: 'langDE',
          en: 'langEN',
      },
  }},
  computed: {
    supportedLanguages () {
      return {};
    },
    currentLanguage () {
      return this.$i18n.locale;
    }
  },
  methods: {
    changeLanguage (e) {
      const lang = e.target.getAttribute('data-id');
      const to = this.$router.resolve({ params: { lang } })
      this.$i18n.locale = lang;
    },
    isCurrentLanguage (lang) {
      return lang === this.currentLanguage
    }
  },
  template: `
            <b-nav-item-dropdown id="dd-lang-switcher" v-bind:text="$t('lang')">
              <b-dropdown-item
                v-for="(lang, idx) in languages"
                @click="changeLanguage"
                v-bind:class="{ active: isCurrentLanguage(lang) }"
                v-bind:data-id="idx"
                href="#"
                aria-haspopup="true"
                aria-expanded="false">
                {{ $t(lang) }}
              </b-dropdown-item>
            </b-nav-item-dropdown>
        `
});

export default LanguageSwitcher;
