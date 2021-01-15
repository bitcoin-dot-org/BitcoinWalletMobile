/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import './shim';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import React, { useEffect } from 'react';
import { Provider } from 'react-redux'
import {store, persistor } from './store/WalletStateStore'
import { PersistGate } from 'redux-persist/integration/react'
import RootView from './views/RootView'
import CreateStepOne from './views/Create/CreateStepOne'
import CreateStepTwo from './views/Create/CreateStepTwo'
import Restore from './views/Restore/Restore'
import PickerView from './components/Settings/PickerView'
import ScanQRCode from './components/ScanQRCode'
import Send from './components/Send'
import { StatusBar, View } from 'react-native';
import SplashScreen from 'react-native-splash-screen'

const Stack = createStackNavigator<RootNavigationParamList>();


const App = () => {

  useEffect(() => {
    SplashScreen.hide()
  }, [])

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SafeAreaProvider>
          <NavigationContainer>
            <View style={{flex:1, backgroundColor:'#1A1E29'}}>
            <StatusBar backgroundColor="#090C14" barStyle="light-content"/>
                <Stack.Navigator mode="card" screenOptions={{...TransitionPresets.SlideFromRightIOS}} initialRouteName="Root" headerMode="none" >
                  <Stack.Screen name="Root" component={RootView} />
                  <Stack.Screen name="CreateStepOne" component={CreateStepOne} />
                  <Stack.Screen name="CreateStepTwo" component={CreateStepTwo} />
                  <Stack.Screen name="Restore" component={Restore} />
                  <Stack.Screen name="PickerView" component={PickerView} />
                  <Stack.Screen name="ScanQRCode" component={ScanQRCode} />
                  <Stack.Screen name="Send" component={Send} />
                </Stack.Navigator>
                </View>
              </NavigationContainer>
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
};


export default App;
