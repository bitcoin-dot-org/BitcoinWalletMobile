import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, Image, Animated, Easing } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler';


interface Props {
    refeshing: boolean
    pressed: () => void
}

const RefreshButton : React.FC<Props> = (props) => {

    let rotation = new Animated.Value(0)
    const animation = Animated.loop(Animated.timing(rotation, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })).start()

    const spin = rotation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    })

    return (
    <View>
        <TouchableOpacity onPress={props.pressed} style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Animated.Image style={[styles.icon, {transform: props.refeshing ? [{rotate: spin}] : []}]} source={require('../assets/images/refresh.png')} />
        </TouchableOpacity>
    </View>
    );
}

const styles = StyleSheet.create({
    icon: {
        width: 24,
        height: 24,
    }
});

export default RefreshButton