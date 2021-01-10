import React from 'react'
import { View, StyleSheet, StatusBar } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import LinearGradient from 'react-native-linear-gradient'

const Screen: React.FC = (props) => {
    return (
        <View style={styles.container}>
            <LinearGradient style={styles.container} colors={['#1A1E29', '#090C14']}>
                <StatusBar barStyle="light-content" />
                {props.children}
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default Screen


