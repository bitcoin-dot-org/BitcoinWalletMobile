import React, { useEffect } from 'react';
import { TouchableOpacity, StyleSheet, Text, View, ViewStyle, Image } from 'react-native';
import { useSelector } from 'react-redux';
import { getTranslated } from '../lang/helper';
import { WalletState } from '../store/WalletStateStore';

interface ButtonPrimaryProps {
    text: string;
    action: () => void;
}

const ButtonPrimary: React.FC<ButtonPrimaryProps> = (props) => {

    const languageSelector = (state: WalletState) => state.language
    const language = useSelector(languageSelector)

    return (
        <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.buttonPrimary} onPress={props.action}>
                {props.text == getTranslated(language).send &&
                    <Image style={styles.icon} source={require('../assets/images/send-button.png')} />
                }
                {props.text == getTranslated(language).receive &&
                    <Image style={styles.icon} source={require('../assets/images/received-button.png')} />
                }
                <Text style={styles.buttonText}>{props.text}</Text>
            </TouchableOpacity>
        </View>
    )

}

const styles = StyleSheet.create({
    buttonContainer: {
        flex: 1,
        marginRight: 16,
    },
    buttonText: {
        fontSize: 17,
        paddingVertical: 5,
        color: "#fff",
        fontFamily: 'TitilliumWeb-SemiBold',
        textTransform: "uppercase",
        fontWeight: '600',
        textAlign: 'center'
    },
    buttonPrimary: {
        backgroundColor: '#F7931A',
        paddingVertical: 8,
        paddingHorizontal: 24,
        borderWidth: 1,
        borderRadius: 3,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    icon: {
        width: 16,
        height: 16,
        marginRight: 10
    }
})

export default ButtonPrimary