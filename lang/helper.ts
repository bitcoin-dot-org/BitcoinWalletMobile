import ca from '../lang/ca'
import en from '../lang/en'
import es from '../lang/es'
import fr from '../lang/fr'
import it from '../lang/it'
import ja from '../lang/ja'
import pt_br from '../lang/pt_br'

import Language from './langInterface'

export const getLanguageShortCode = (name : string) => {
    switch(name) {
        case "English":
            return "en"
        case "Français":
            return "fr"
        case "日本語":
            return "ja"
        case "Italiano":
            return "it"
        case "Catalan":
            return "ca"
        case "Português Brasil":
            return "pt-br"
        case "Español":
            return "es"
        default:
            return "en"
    }
}

export const getTranslated = (lang : string) : Language  => {
    switch(lang) {
        case "ca":
            return ca
        case "en":
            return en
        case "es":
            return es
        case "fr":
            return fr
        case "it":
            return it
        case "ja":
            return ja
        case "pt-br":
            return pt_br
        default:
            return en
    }
}

export const getLanguageBigName = (name : string) => {
    switch(name) {
        case "en":
            return "English"
        case "fr":
            return "Français"
        case "it":
            return "Italiano"
        case "ja":
            return "日本語"
        case "ca":
            return "Catalan"
        case "es":
            return "Español"
        case "pt-br":
            return "Português Brasil"
        default:
            return "English"
    }
}
