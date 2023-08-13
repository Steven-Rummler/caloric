import { Dimensions } from 'react-native';
import styled from 'styled-components/native';

export const OptionButton = styled.Pressable`
  flex: 1;
  align-items: center;
  justify-content: center;
  background-color: #b9e2f5;
  border-radius: 16px;
  margin: 10px;
`;

export const UnselectedOptionButton = styled(OptionButton)`
background-color: #edf7fc;
`;

export const OutlineOptionButton = styled(OptionButton)`
  border: 2px solid #b9e2f5;
  background-color: white;
`;

export const OptionText = styled.Text`
  height: ${Dimensions.get('window').height * 0.15}px;
  text-align: center;
`;
