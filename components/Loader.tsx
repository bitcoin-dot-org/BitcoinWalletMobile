import React from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'
import Screen from './Screen';

interface LoaderProps {
    title: string
    subTitle: string
}

const Loader: React.FC<LoaderProps> = (props) => {

    return (
        <View style={styles.container}>
            <Screen>
                <View style={styles.content}>
                    <Image style={styles.bar} source={require('../assets/images/loader.gif')} />
                    <Text style={styles.titleText}>{props.title}</Text>
                    <Text style={styles.subText}>{props.subTitle}</Text>
                </View>
            </Screen>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    content: {
        marginTop: '45%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    bar: {
        width: 100,
        height: 4
    },
    titleText: {
        fontFamily: 'TitilliumWeb-Regular',
        fontSize: 22,
        fontWeight: '400',
        lineHeight: 32,
        color: '#F7931A',
        marginTop: 50,
        marginBottom: 20,

    },
    subText: {
        fontFamily: 'TitilliumWeb-Regular',
        fontSize: 16,
        fontWeight: '400',
        lineHeight: 22,
        color: '#ACB2BB'
    }
});

export default Loader