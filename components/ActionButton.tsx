import { Pressable, StyleSheet, PressableProps, StyleProp, ViewStyle } from 'react-native';

export function ActionButton({ style, ...props }: PressableProps) {
  return (
    <Pressable 
      style={(state) => [
        styles.actionButton, 
        typeof style === 'function' ? style(state) : style
      ]} 
      {...props} 
    />
  );
}

export function DisabledActionButton({ style, ...props }: PressableProps) {
  return (
    <Pressable 
      style={(state) => [
        styles.actionButton, 
        styles.disabled,
        typeof style === 'function' ? style(state) : style
      ]} 
      {...props} 
    />
  );
}

const styles = StyleSheet.create({
  actionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#b9e2f5',
    borderRadius: 16,
  },
  disabled: {
    backgroundColor: '#edf7fc',
  },
});