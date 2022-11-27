// import { StyleSheet, View } from 'react-native';
import { NativeBaseProvider, StatusBar } from 'native-base';

import { THEME } from './src/styles/theme'
import { useFonts, Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto'
import Loading from './src/components/Loading';
import { Routes } from './src/routes';

import { AuthContextProvider } from './src/contexts/AuthContext';

// Usar o Native Base
export default function App() {
  const [fontsLoaded] = useFonts({ Roboto_400Regular, Roboto_500Medium, Roboto_700Bold })

  return (
    <NativeBaseProvider theme={THEME}>
      <AuthContextProvider>
        <StatusBar barStyle='light-content' backgroundColor='transparent' translucent />

        {/* Enqnto as fontes ñ tiverem carregadas, Loading Component */}
        {fontsLoaded ? <Routes /> : <Loading />}
      </AuthContextProvider>
    </NativeBaseProvider>
    
  );
}

/*
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#FFF',
    fontSize: 24
  }
});
*/
