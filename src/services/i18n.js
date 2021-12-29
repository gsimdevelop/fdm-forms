import {
  addMessages,
  locale,
  _,
  init,
  getLocaleFromNavigator,
  dictionary
} from 'svelte-i18n'

import en from '../../locales/en.json'
import es from '../../locales/es.json'

const getLang = () =>
  localStorage.getItem('lang')
  ?? getLocaleFromNavigator().split('-')[0]
  ?? 'es'

const setLang = lang => {
  locale.set(lang)
  localStorage.setItem('lang', lang)
}

function setupI18n() {
  addMessages('en', en)
  addMessages('es', es)
  
  init({
    initialLocale: getLang(),
    fallbackLocale: 'es',
  })
}

export {
  _,
  setLang,
  setupI18n,
  dictionary as allLangs,
  locale
}