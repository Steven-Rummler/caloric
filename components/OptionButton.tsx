import { Dimensions, Pressable, Text, StyleSheet, PressableProps, TextProps } from 'react-native';

export function OptionButton({ style, ...props }: PressableProps) {
  return (
    <Pressable 
      style={(state) => [
        styles.optionButton, 
        typeof style === 'function' ? style(state) : style
      ]} 
      {...props} 
    />
  );
}

export function UnselectedOptionButton({ style, ...props }: PressableProps) {
  return (
    <Pressable 
      style={(state) => [
        styles.optionButton, 
        styles.unselected,
        typeof style === 'function' ? style(state) : style
      ]} 
      {...props} 
    />
  );
}

export function OutlineOptionButton({ style, ...props }: PressableProps) {
  return (
    <Pressable 
      style={(state) => [
        styles.optionButton, 
        styles.outline,
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
    backgroundColor: '#b9e2f5',
    borderRadius: 16,
    margin: 10,
  },
  unselected: {
    backgroundColor: '#edf7fc',
  },
  outline: {
    borderWidth: 2,
    borderColor: '#b9e2f5',
    backgroundColor: 'white',
  },
  optionText: {
    height: Dimensions.get('window').height * 0.15,
    textAlign: 'center',
  },
});
