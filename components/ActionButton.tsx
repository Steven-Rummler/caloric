import { Pressable, PressableProps } from 'react-native';
import { useTheme } from '../ThemeProvider';

export function ActionButton({ style, ...props }: PressableProps) {
  const theme = useTheme();
  return (
    <Pressable
      style={(state) => [
        {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.primary,
          borderRadius: 16,
        },
        typeof style === 'function' ? style(state) : style
      ]}
      {...props}
    />
  );
}

export function DisabledActionButton({ style, ...props }: PressableProps) {
  const theme = useTheme();
  return (
    <Pressable
      style={(state) => [
        {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.primaryUnselected,
          borderRadius: 16,
        },
        typeof style === 'function' ? style(state) : style
      ]}
      {...props}
    />
  );
}