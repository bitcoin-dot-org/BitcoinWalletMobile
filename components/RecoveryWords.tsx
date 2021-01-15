import React from 'react'
import { View, Text, StyleSheet} from 'react-native'


interface Props {
    words: string[]
    screen: "CreateStepTwo" | "RecoveryModal"
}

const RecoveryWords: React.FC<Props> = (props) => {

    return (
        <View style={[styles.container, { flex: props.screen == "CreateStepTwo" ? 1 : 0 }]}>
            { props.words.map((word, index) => {
                return (
                    <View key={index} style={styles.wordContainer}>
                        <View style={styles.recoveryField}>
                            <Text style={styles.numberedLabel}>{ index +1 }.</Text>
                            <Text style={styles.recoveryFieldText}>{ word }</Text>
                        </View>
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
        alignItems: 'flex-start',
        marginHorizontal: '5%'
    },
    wordContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
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
        flexWrap: 'wrap',
        width: 145,
        height: 40,
        backgroundColor: '#090C14',
        borderWidth: 1,
        borderColor: '#2B2F3A',
        paddingHorizontal: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    recoveryFieldText: {
        color: '#FFF',
        fontFamily: 'TitilliumWeb-SemiBold',
        fontWeight: '600',
        fontSize: 20,
        lineHeight: 24,
    }
});

export default RecoveryWords