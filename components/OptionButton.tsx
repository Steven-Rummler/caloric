import { Dimensions, Pressable, Text, StyleSheet, PressableProps, TextProps } from 'react-native';
import { useTheme } from '../ThemeProvider';

export function OptionButton({ style, ...props }: PressableProps) {
  const theme = useTheme();
  return (
    <Pressable
      style={(state) => [
        styles.optionButton,
        { backgroundColor: theme.primary },
        typeof style === 'function' ? style(state) : style
      ]}
      {...props}
    />
  );
}

export function UnselectedOptionButton({ style, ...props }: PressableProps) {
  const theme = useTheme();
  return (
    <Pressable
      style={(state) => [
        styles.optionButton,
        styles.unselected,
        { backgroundColor: theme.primaryUnselected },
        typeof style === 'function' ? style(state) : style
      ]}
      {...props}
    />
  );
}

export function OutlineOptionButton({ style, ...props }: PressableProps) {
  const theme = useTheme();
  return (
    <Pressable
      style={(state) => [
        styles.optionButton,
        styles.outline,
        { borderColor: theme.primary, backgroundColor: theme.background },
        typeof style === 'function' ? style(state) : style
      ]}
      {...props}
    />
  );
}

export function OptionText({ style, ...props }: TextProps) {
  return <Text style={[styles.optionText, style]} {...props} />;
}

const styles = StyleSheet.create({
  optionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    margin: 4,
    minHeight: 60,
  },
  unselected: {},
  outline: {
    borderWidth: 2,
  },
  optionText: {
    height: Dimensions.get('window').height * 0.15,
    textAlign: 'center',
    justifyContent: 'center',
    textAlignVertical: 'center',
  },
});
