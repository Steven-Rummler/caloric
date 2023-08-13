import styled from 'styled-components/native';

export const ActionButton = styled.Pressable`
  flex: 1;
  align-items: center;
  justify-content: center;
  background-color: #b9e2f5;
  border-radius: 16px;
`;

export const DisabledActionButton = styled(ActionButton)`
  background-color: #edf7fc;
`;