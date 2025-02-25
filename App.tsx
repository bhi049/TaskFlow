import React from 'react';
import { Provider } from 'react-redux';
import { store } from './src/store/store';
import { TaskListScreen } from './src/screens/TaskListScreen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App(): React.JSX.Element {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <TaskListScreen />
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </Provider>
  );
} 