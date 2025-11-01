import { View, StyleSheet, ViewProps } from 'react-native';

export default function Page({ children, style, ...props }: ViewProps) {
  return (
    <View style={[styles.page, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 40,
  },
});
