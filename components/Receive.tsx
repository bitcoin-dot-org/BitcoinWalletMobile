import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, TextInput, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import Screen from './Screen';
import QRCode from 'react-native-qrcode-svg';
import LinearGradient from 'react-native-linear-gradient';
import { wallet } from './../wallet/wallet'
import { WalletState } from '../store/WalletStateStore';
import { useSelector } from 'react-redux';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Clipboard from '@react-native-community/clipboard';
import Header from './Header';
import { getTranslated } from '../lang/helper';

const Receive: React.FC = () => {


    const externalIndexSelector = (state: WalletState) => state.externalIndex
    const externalIndex = useSelector(externalIndexSelector)

    const externalAddressesSelector = (state: WalletState) => state.externalAddresses
    const externalAddresses = useSelector(externalAddressesSelector)

    const languageSelector = (state: WalletState) => state.language
    const language = useSelector(languageSelector)

    const [address, setAddress] = useState("Address")

    const getExternalAddress = () => {
        for (var i = 0; i < externalAddresses.length; i++) {
            if (externalAddresses[i].index == externalIndex) {
                setAddress(externalAddresses[i].address)
            }
        }
    }

    const copyAddressToClipboard = () => {
        Clipboard.setString(address);
    }

    useEffect(() => {
        getExternalAddress()
    }, [externalIndex])

    return (
        <View style={styles.container}>
            <Header screen={getTranslated(language).receive} />
            <Screen>
                <View>
                    <Text style={styles.subHeadingText}>{getTranslated(language).receive_only + " " + getTranslated(language).address_below}</Text>
                    <View style={styles.textArea}>
                        <Text style={styles.textAreaText}>{address}</Text>
                    </View>
                    <TouchableOpacity onPress={copyAddressToClipboard}>
                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: 20, }}>
                            <Image source={require('../assets/images/copy.png')} style={styles.icon} />
                            <Text style={styles.copyText}>{getTranslated(language).copy_button}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={styles.qrContainer}>
                    <LinearGradient style={{ flex: 1 }} useAngle={true} angle={180} angleCenter={{ x: 0.5, y: 0.5 }} colors={['#1f232e', '#13161f']}>
                        <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 15 }}>
                            <QRCode backgroundColor="#1F232E" color="#fff" size={160} value={address} />
                        </View>
                    </LinearGradient>
                </View>
            </Screen>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headingText: {
        fontSize: 30,
        color: '#fff',
        textAlign: 'center',
        fontFamily: 'TitilliumWeb-Regular',
    },
    subHeadingText: {
        color: '#ACB2BB',
        fontFamily: 'TitilliumWeb-Regular',
        fontWeight: '400',
        fontSize: 14,
        lineHeight: 20,
        marginHorizontal: 20,
        marginTop: 16,
    },
    elementsContainer: {
        flex: 1,
        alignItems: 'center'
    },
    textArea: {
        alignItems: 'center',
        flexDirection: 'row',
        borderWidth: 1,
        borderRadius: 2,
        borderColor: '#2B2F3A',
        backgroundColor: '#090C14',
        padding: 20,
        paddingTop: 20,
        marginTop: 20,
        marginHorizontal: 20,
    },
    textAreaText: {
        color: '#fff',
        fontFamily: 'TitilliumWeb-Regular',
        fontSize: 15,
        fontWeight: '400',
        lineHeight: 20,
    },
    copyText: {
        color: '#ACB2BB',
        fontFamily: 'TitilliumWeb-Regular',
        fontSize: 16,
        lineHeight: 22,
        textTransform: 'uppercase'
    },
    icon: {
        width: 24,
        height: 24,
        marginRight: 10,
    },
    qrContainer: {
        borderWidth: 1,
        borderColor: '#2B2F3A',
        borderRadius: 2,
        marginTop: 20,
        width: 200,
        height: 200,
        alignSelf: 'center'
    }
});

export default Receive