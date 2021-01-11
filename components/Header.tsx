import { platform } from 'process';
import React from 'react'
import { TouchableOpacity } from 'react-native';
import { View, StyleSheet, Text, Image, Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { getTranslated } from '../lang/helper';
import { WalletState } from '../store/WalletStateStore';

interface Props {
    screen: string
    action?: () => void
    currentLanguage?: string
}

const Header: React.FC<Props> = (props) => {

    const insets = useSafeAreaInsets()
    const languageSelector = (state: WalletState) => state.language
    const language = useSelector(languageSelector)

    return (
        <View style={styles.container}>
            <View style={{ marginTop: insets.top, height: 56 }}>
                {props.screen == getTranslated(language).getting_started &&
                    <TouchableOpacity onPress={props.action}>
                        <View style={styles.changeLanguageView}>
                            <Text style={styles.changeLanguageText}>{getTranslated(language).change_language}:</Text>
                            <View style={styles.currentLanguageView}><Text style={styles.currentLanguageText}>{props.currentLanguage}</Text></View>
                        </View>
                    </TouchableOpacity>
                }
                {props.screen != getTranslated(language).getting_started &&
                    <View style={styles.contentView}>
                        <TouchableOpacity disabled={Platform.OS == 'android'} onPress={props.action}>
                            <View style={styles.textContain}>
                                {Platform.OS == 'ios' && props.screen != getTranslated(language).receive && props.screen != getTranslated(language).settings &&
                                    <Image style={styles.arrow} source={require('../assets/images/arrow.png')} />
                                }
                                <Text style={styles.headingText}>{props.screen}</Text>
                            </View>
                        </TouchableOpacity>
                        {(props.screen == getTranslated(language).create_new || props.screen == getTranslated(language).seed_phrase) &&
                            <View style={styles.stepContain}>
                                <Text style={styles.stepText}>Step </Text>
                                <Text style={styles.stepHightlight}>{props.screen == getTranslated(language).seed_phrase ? "2" : "1"}</Text><Text style={styles.stepText}>/2</Text>
                            </View>
                        }
                    </View>
                }
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#090C14',
        borderBottomColor: '#1F232E',
        borderBottomWidth: 1,
    },
    changeLanguageView: {
        flexDirection: 'row',
        marginTop: 10,
        marginHorizontal: 10,
        alignItems: 'center',
        justifyContent: 'flex-end'
    },
    changeLanguageText: {
        fontFamily: 'TitilliumWeb-Regular',
        color: '#ACB2BB',
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 20,
    },
    currentLanguageView: {
        backgroundColor: '#F7931A',
        borderRadius: 2,
        paddingVertical: 1,
        paddingHorizontal: 8,
        marginLeft: 5,
    },
    currentLanguageText: {
        fontFamily: 'TitilliumWeb-SemiBold',
        color: '#FFF',
        fontSize: 12,
        lineHeight: 22,
        fontWeight: '600',
        textTransform: 'uppercase'
    },
    arrow: {
        width: 16,
        height: 16,
        marginRight: 5,
    },
    contentView: {
        flexDirection: 'row',
        marginHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    textContain: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    stepContain: {
        flexDirection: 'row'
    },
    headingText: {
        fontFamily: 'TitilliumWeb-Regular',
        color: '#FFF',
        fontWeight: '400',
        lineHeight: 38,
        fontSize: 26,
    },
    stepText: {
        color: '#FFF',
        fontSize: 14,
        fontFamily: 'TitilliumWeb-Regular',
        fontWeight: '400',
        lineHeight: 20,
    },
    stepHightlight: {
        color: '#F7931A',
        fontSize: 14,
        fontFamily: 'TitilliumWeb-Regular',
        fontWeight: '400',
        lineHeight: 20,
    }
});

export default Header