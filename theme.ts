export interface Theme {
  // Background colors
  background: string;
  modalBackground: string;
  modalSurface: string;

  // Text colors
  text: string;
  textSecondary: string;

  // Interactive colors
  primary: string;
  primaryUnselected: string;
  primaryText: string;
  secondary: string;
  secondaryText: string;
  error: string;

  // Chart colors
  chart: {
    net: string;
    measured: string;
    estimated: string;
  };

  // Input colors
  inputBorder: string;
  inputSelection: string;
}

export const lightTheme: Theme = {
  // Background colors
  background: 'white',
  modalBackground: 'rgba(0, 0, 0, 0.5)',
  modalSurface: 'white',

  // Text colors
  text: '#333333',
  textSecondary: '#666666',

  // Interactive colors
  primary: '#b9e2f5',
  primaryUnselected: '#edf7fc',
  primaryText: '#333333',
  secondary: '#f0f0f0',
  secondaryText: '#333333',
  error: '#ff4444',

  // Chart colors
  chart: {
    net: 'green',
    measured: 'red',
    estimated: 'blue',
  },

  // Input colors
  inputBorder: '#b9e2f5',
  inputSelection: '#b9e2f5',
};

export const darkTheme: Theme = {
  // Background colors
  background: '#121212',
  modalBackground: 'rgba(0, 0, 0, 0.7)',
  modalSurface: '#2d2d2d',

  // Text colors
  text: '#ffffff',
  textSecondary: '#ffffff',

  // Interactive colors
  primary: '#0E7490',
  primaryUnselected: '#1E293B',
  primaryText: '#ffffff',
  secondary: '#3a3a3a',
  secondaryText: '#ffffff',
  error: '#ff6b6b',

  // Chart colors
  chart: {
    net: '#16A34A',
    measured: '#ff4040',
    estimated: '#00aaff',
  },

  // Input colors
  inputBorder: '#4da3ff',
  inputSelection: '#4da3ff',
};