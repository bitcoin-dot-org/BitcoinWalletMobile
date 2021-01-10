import React from 'react'
import { View, Text, StyleSheet, Image, Animated, Easing, TextInput } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler';


interface Props {
    words: string[]
    screen: "CreateStepTwo" | "RecoveryModal"
}

const RecoveryWords: React.FC<Props> = (props) => {

    return (
        <View style={[styles.container, { flex: props.screen == "CreateStepTwo" ? 1 : 0 }]}>
            { props.words.map((word, index) => {
                return (
                    <View key={index} style={{ flexDirection: 'row', alignItems: 'center', width: '50%', marginTop: 10, }}>
                        <Text style={styles.numberedLabel}>{index + 1}.</Text>
                        <TextInput
                            editable={false}
                            style={styles.recoveryField}
                            returnKeyType="next"
                            keyboardType="ascii-capable"
                            autoCapitalize="characters"
                            autoCorrect={false}
                            value={word.toUpperCase()}
                        />
                    </View>
                )
            })

            }
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: 10,
        alignItems: 'flex-start'
    },
    wordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '50%',
        marginTop: 10,
    },
    numberedLabel: {
        fontFamily: 'TitilliumWeb-Regular',
        fontSize: 11,
        lineHeight: 22,
        fontWeight: '400',
        color: '#ACB2BB',
        width: 20,
    },
    recoveryField: {
        width: 145,
        height: 40,
        backgroundColor: '#090C14',
        borderWidth: 1,
        borderColor: '#2B2F3A',
        color: '#FFF',
        fontFamily: 'TitilliumWeb-SemiBold',
        fontWeight: '600',
        fontSize: 16,
        lineHeight: 24,
        paddingHorizontal: 10,
        textAlign: 'center'
    },
});

export default RecoveryWords