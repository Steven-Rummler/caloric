import styled from 'styled-components/native';

// border-radius:
//   Math.round(
//     Dimensions.get('window').width + Dimensions.get('window').height
//   ) / 2,
// width: Dimensions.get('window').width * 0.6,
//    height: Dimensions.get('window').width * 0.6,

const ActionButton = styled.Pressable`
  background-color: lightblue;
  justify-content: center;
  align-items: center;
`;

export { ActionButton };
