import CheckBox from '@react-native-community/checkbox'
import React from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { useDispatch, useSelector } from 'react-redux'
import { getTranslated } from '../../lang/helper'
import { WalletState, setMultiDeviceSupport } from '../../store/WalletStateStore'

interface Props {
    label: string
    subLabel: string
    onClick: () => void
}

const SettingsItem: React.FC<Props> = (props) => {


    const multiDeviceSupportSelector = (state: WalletState) => state.multiDeviceSupport
    const multiDeviceSupport = useSelector(multiDeviceSupportSelector)
    const dispatch = useDispatch()

    const languageSelector = (state: WalletState) => state.language
    const language = useSelector(languageSelector)

    var correctImage = require("../../assets/images/forward.png")

    if (props.label == getTranslated(language).currency) {
        correctImage = require("../../assets/images/currency.png")
    }

    if (props.label == getTranslated(language).language) {
        correctImage = require("../../assets/images/language.png")
    }

    if (props.label == getTranslated(language).seed_phrase) {
        correctImage = require("../../assets/images/eye.png")
    }

    if (props.label == getTranslated(language).exit_wallet) {
        correctImage = require("../../assets/images/exit.png")
    }

    if (props.label == "Support multiple devices") {
        correctImage = require("../../assets/images/laptop.png")
    }

    const updateMultiDeviceSupport = (enable: boolean) => {
        dispatch(setMultiDeviceSupport(enable))
    }

    var labelColor = props.label == getTranslated(language).exit_wallet ? styles.redLabelColor : styles.normalLabelColor


    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => { props.label == "Support multiple devices" ? updateMultiDeviceSupport(!multiDeviceSupport) : props.onClick() }} style={{ flex: 1 }}>
                <View style={styles.labelsContainer}>

                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                        <Image style={styles.icon} source={correctImage} />
                        <Text style={[styles.label, labelColor]}>{props.label}</Text>
                    </View>

                    {(props.label == getTranslated(language).language || props.label == getTranslated(language).currency) &&
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={styles.subLabel}>{props.subLabel}</Text>
                            <Image style={styles.arrow} source={require("../../assets/images/forward.png")} />
                        </View>
                    }
                    {props.label == "Support multiple devices" &&
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={styles.subLabel}>{multiDeviceSupport ? "Yes" : 'No'}</Text>
                            {multiDeviceSupport &&
                                <Image style={styles.tick} source={require("../../assets/images/tick.png")} />
                            }
                        </View>
                    }
                </View>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 2,
        flex: 1,
        backgroundColor: '#090C14',
        padding: 15,
    },
    extraMargin: {
        marginTop: 20
    },
    labelsContainer: {
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 20,
        marginTop: 10,
        flexDirection: 'row',
        flex: 1,
    },
    icon: {
        width: 24,
        height: 24
    },
    tick: {
        width: 14.41,
        height: 11.12,
        marginLeft: 10,
    },
    arrow: {
        width: 16,
        height: 22,
        justifyContent: 'center',
        marginBottom: 3
    },
    label: {
        fontFamily: 'TitilliumWeb-Regular',
        fontSize: 16,
        fontWeight: '400',
        lineHeight: 20,
        textTransform: 'uppercase',
        marginLeft: 10,
    },
    normalLabelColor: {
        color: '#ACB2BB',
    },
    redLabelColor: {
        color: '#F85656'
    },
    subLabel: {
        color: '#FFF',
        fontFamily: 'TitilliumWeb-Regular',
        fontWeight: '600',
        fontSize: 16,
        lineHeight: 20,
    },
    checkBox: {
        width: 16,
        height: 16,
        marginHorizontal: 10,
    },
});

export default SettingsItem