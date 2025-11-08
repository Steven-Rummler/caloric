import { StyleSheet, ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../ThemeProvider';

export default function Page({ children, style, ...props }: ViewProps) {
  const theme = useTheme();
  return (
    <SafeAreaView style={[styles.page, { backgroundColor: theme.background }, style]} {...props}>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
});
