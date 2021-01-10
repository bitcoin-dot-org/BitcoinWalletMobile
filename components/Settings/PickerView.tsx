import { StackScreenProps } from '@react-navigation/stack'
import React from 'react'
import { View, Text, ListRenderItem, FlatList, Image, TouchableOpacity } from 'react-native'
import { getLanguageShortCode, getTranslated } from '../../lang/helper'
import { ScaledSheet } from 'react-native-size-matters'
import { useDispatch, useSelector } from 'react-redux'
import { WalletState } from '../../store/WalletStateStore'
import Screen from '../Screen'
import { setCurrency, setLanguage } from '../../store/WalletStateStore'
import Header from '../Header'

type Props = StackScreenProps<RootNavigationParamList, 'PickerView'>

const PickerView: React.FC<Props> = (props) => {

    const languages = ["English", "Español", "Catalan", "Français", "Italiano", "Português Brasil", "日本語"]
    const currencies = [
        "USD",
        "AUD",
        "BRL",
        "CAD",
        "CHF",
        "CLP",
        "CNY",
        "DKK",
        "EUR",
        "GBP",
        "HKD",
        "INR",
        "ISK",
        "JPY",
        "KRW",
        "NZD",
        "PLN",
        "RUB",
        "SEK",
        "SGD",
        "THB",
        "TRY",
        "TWD",
    ]

    const getCurrentLanguage = (state: WalletState) => state.language
    const getCurrentCurrency = (state: WalletState) => state.currency

    const selectedLanguage = useSelector(getCurrentLanguage)
    const selectedCurrency = useSelector(getCurrentCurrency)

    const dispatch = useDispatch()

    const selectItem = (item: string) => {
        if (props.route.params.type == "Choose Currency") {
            dispatch(setCurrency(item))
        }
        else {
            dispatch(setLanguage(getLanguageShortCode(item)))
        }

        props.navigation.goBack()
    }

    const renderItem: ListRenderItem<string> = ({ item }) => (
        <TouchableOpacity onPress={() => { selectItem(item) }}>
            <View style={(props.route.params.type == "Choose Currency" ? (selectedCurrency == item ? styles.trSelected : styles.tr) : (selectedLanguage == getLanguageShortCode(item) ? styles.trSelected : styles.tr))}>
                <Text style={(props.route.params.type == "Choose Currency" ? (selectedCurrency == item ? styles.selectedRowText : styles.rowText) : (selectedLanguage == getLanguageShortCode(item) ? styles.selectedRowText : styles.rowText))}>{item}</Text>
                {props.route.params.type == "Choose Currency" && selectedCurrency == item &&
                    <Image style={styles.icon} source={require("../../assets/images/tick.png")} />
                }
                {props.route.params.type == "Choose Language" && selectedLanguage == getLanguageShortCode(item) &&
                    <Image style={styles.icon} source={require("../../assets/images/tick.png")} />
                }
            </View>
        </TouchableOpacity>
    )


    return (
        <View style={styles.container}>
            <Header screen={props.route.params.type == "Choose Language" ? getTranslated(selectedLanguage).choose_language : getTranslated(selectedLanguage).currency} action={() => { props.navigation.goBack() }} />
            <Screen>
                <View style={styles.container}>
                    <FlatList
                        data={props.route.params.type == "Choose Language" ? languages : currencies}
                        renderItem={renderItem}
                        showsVerticalScrollIndicator={false}
                        keyExtractor={(item) => item}
                    />
                </View>
            </Screen>
        </View>
    )
}

const styles = ScaledSheet.create({
    container: {
        flex: 1,
    },
    tr: {
        justifyContent: 'space-between',
        flexDirection: 'row',
        backgroundColor: '#090C14',
        padding: 20,
        marginBottom: 1.5
    },
    trSelected: {
        justifyContent: 'space-between',
        flexDirection: 'row',
        backgroundColor: '#1F232E',
        padding: 20,
    },
    rowText: {
        color: '#ACB2BB',
        fontFamily: 'TitilliumWeb-Regular',
        fontSize: 16,
        fontWeight: '400',
        lineHeight: 22
    },
    selectedRowText: {
        color: '#F7931A',
        fontFamily: 'TitilliumWeb-SemiBold',
        fontSize: 16,
        fontWeight: '600',
        lineHeight: 22
    },
    headingText: {
        fontSize: 30,
        color: '#fff',
        textAlign: 'center',
        fontFamily: 'TitilliumWeb-Regular',
        marginBottom: 10,
    },
    icon: {
        width: 14.41,
        height: 11.12,
        marginTop: 5,
    }
})

export default PickerView