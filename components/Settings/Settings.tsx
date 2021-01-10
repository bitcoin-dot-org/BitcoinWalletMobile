import React, { useState } from 'react'
import { View, StyleSheet, ListRenderItem } from 'react-native'
import { clearWallet, store, WalletState } from '../../store/WalletStateStore';
import { getLanguageBigName, getTranslated } from '../../lang/helper'
import Screen from '../Screen';
import SettingsItem from './SettingsItem';
import { FlatList } from 'react-native-gesture-handler';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import RecoveryWordsModal from './RecoveryWordsModal'
import ExitWalletModal from './ExitWalletModal'
import Header from '../Header';

type Props = BottomTabScreenProps<WalletHomeNavigationParamList, 'Settings'>;

const Settings: React.FC<Props> = (props) => {


    const [recoveryWordsModalVisible, setrecoveryWordsModalVisible] = useState(false)
    const [exitModalVisible, setExitModalVisible] = useState(false)

    const languageSelector = (state: WalletState) => state.language
    const language = useSelector(languageSelector)

    const currencySelector = (state: WalletState) => state.currency
    const currency = useSelector(currencySelector)

    const data = [getTranslated(language).currency, getTranslated(language).language, getTranslated(language).seed_phrase, "Support multiple devices", getTranslated(language).exit_wallet]

    const clearAndDelete = async () => {
        setExitModalVisible(false)
        store.dispatch(clearWallet())
    }


    const showRecoveryWordsModal = () => {
        setrecoveryWordsModalVisible(true)
    }

    const hideRecoveryWordsModal = () => {
        setrecoveryWordsModalVisible(false)
    }

    const showExitModal = () => {
        setExitModalVisible(true)
    }

    const hideExitModal = () => {
        setExitModalVisible(false)
    }

    const pushCurrency = () => {
        // @ts-ignore
        props.navigation.navigate('PickerView', { type: "Choose Currency" })
    }

    const pushLanguage = () => {
        // @ts-ignore
        props.navigation.navigate('PickerView', { type: "Choose Language" })
    }

    interface ChildProps {
        item: string
    }

    const conditonalView: React.FC<ChildProps> = ({ item }) => {
        if (item == getTranslated(language).currency) {
            return <View style={{ marginTop: 20 }}><SettingsItem label={getTranslated(language).currency} subLabel={currency} onClick={pushCurrency} /></View>
        }

        if (item == getTranslated(language).seed_phrase) {
            return <View style={{ marginTop: 50 }}><SettingsItem label={getTranslated(language).seed_phrase} subLabel="" onClick={showRecoveryWordsModal} /></View>
        }

        if (item == getTranslated(language).exit_wallet) {
            return <View style={{ marginTop: 50 }}><SettingsItem label={getTranslated(language).exit_wallet} subLabel="" onClick={showExitModal} /></View>
        }

        if (item == "Support multiple devices") {
            return <SettingsItem label="Support multiple devices" subLabel="" onClick={() => { }} />
        }

        else {
            return <SettingsItem label={getTranslated(language).language} subLabel={getLanguageBigName(language)} onClick={pushLanguage} />
        }
    }

    const renderItem: ListRenderItem<string> = ({ item }) => (
        conditonalView({ item: item })
    )

    return (
        <View style={styles.container}>
            <Header screen={getTranslated(language).settings} />
            <Screen>
                <View style={styles.content}>
                    <FlatList data={data}
                        renderItem={renderItem}
                        keyExtractor={item => item} />
                    <RecoveryWordsModal isVisible={recoveryWordsModalVisible} hideModal={hideRecoveryWordsModal} />
                    <ExitWalletModal isVisible={exitModalVisible} hideModal={hideExitModal} deleteCallback={clearAndDelete} />
                </View>
            </Screen>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
    heading: {
        fontSize: 30,
        color: '#fff',
        textAlign: 'center',
        fontFamily: 'TitilliumWeb-Regular',
    }
});

export default Settings