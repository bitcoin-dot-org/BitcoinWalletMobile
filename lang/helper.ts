import ca from '../lang/ca'
import en from '../lang/en'
import es from '../lang/es'
import fr from '../lang/fr'
import it from '../lang/it'
import ja from '../lang/ja'
import pt_br from '../lang/pt_br'
import zh from '../lang/zh'

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
        case "简体中文":
            return "zh"
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
        case "zh":
            return zh
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
        case "zh":
            return "简体中文"
        default:
            return "English"
    }
}
