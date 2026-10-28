import { Text } from 'react-native';

export const tabIcon = (emoji: string) =>
  function Icon({ focused }: { focused: boolean }) {
    return <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.55 }}>{emoji}</Text>;
  };
