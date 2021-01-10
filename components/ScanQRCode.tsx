import React from 'react'
import { View, StyleSheet, Text, TouchableOpacity, Image } from 'react-native'

import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';
import { StackScreenProps } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import Screen from './Screen';
import LinearGradient from 'react-native-linear-gradient';
import * as bip21 from 'bip21'
import * as bitcoin from 'bitcoinjs-lib';
import Header from './Header';


type Props = StackScreenProps<RootNavigationParamList, 'ScanQRCode'>;

const ScanQRCode: React.FC<Props> = (props) => {

    const barCodeRead = async (data: string) => {


        if (data.startsWith('bitcoin:')) {
            let decoded = bip21.decode(data)
            if (decoded["address"] != undefined) {
                try {
                    await bitcoin.address.toOutputScript(decoded["address"])
                    var amount = null
                    if (decoded["options"]["amount"] != undefined) {
                        amount = decoded["options"]["amount"]
                    }
                    props.navigation.goBack()
                    props.route.params.callBack(decoded["address"], amount)
                }

                catch {
                    //
                }
            }
        }

        else if (data.match('^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}$')) {
            let match = data.match('^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}$')
            props.navigation.goBack()
            if (match != null) {
                props.route.params.callBack(match[0], null)
            }
        }



    }

    const notAuthView = (<View style={styles.container}>
        <LinearGradient useAngle={true} angle={104} angleCenter={{ x: 0.5, y: 0.5 }} colors={['#c9c9c9', '#858585']}>
            <View style={styles.noAuthInner}>
                <View style={styles.noAuthContent}>
                    <Image source={require('../assets/images/camera.png')} style={styles.icon} />
                    <Text style={styles.regularText}>We need access to your camera to scan QR codes.</Text>
                </View>
            </View>
        </LinearGradient>
    </View>
    )


    return (
        <View style={styles.container}>
            <Header screen="Scan QR Code" action={() => { props.navigation.goBack() }} />
            <QRCodeScanner cameraStyle={{ height: '100%' }} vibrate={false} markerStyle={{ borderColor: '#F7931A' }} onRead={(e) => { barCodeRead(e.data) }} showMarker={true} cameraProps={{ flashMode: RNCamera.Constants.FlashMode.off, notAuthorizedView: notAuthView }} notAuthorizedView={notAuthView}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    noAuthInner: {
        padding: 40,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    noAuthContent: {
        width: '70%',
        backgroundColor: 'gray',
        borderRadius: 4,
        padding: 20,
        alignItems: 'center'
    },
    headingText: {
        fontSize: 30,
        color: '#fff',
        textAlign: 'center',
        fontFamily: 'TitilliumWeb-Regular',
    },
    regularText: {
        color: '#fff',
        textAlign: 'center',
        fontFamily: 'TitilliumWeb-Regular',
    },
    icon: {
        width: 24,
        height: 24,
    }
});

export default ScanQRCode