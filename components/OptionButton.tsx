import { Dimensions } from 'react-native';
import styled from 'styled-components/native';

export const OptionButton = styled.Pressable`
  flex: 1;
  align-items: center;
  justify-content: center;
  border: 1px solid lightgrey;
  margin: 10px;
`;

export const OptionText = styled.Text`
  height: ${Dimensions.get('window').height * 0.15}px;
  text-align: center;
`;
