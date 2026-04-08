import React from 'react';
import renderer from 'react-test-renderer';
import { Text } from 'react-native';
import { MatchActionCard } from '../MatchActionCard';

jest.mock('expo-linear-gradient', () => {
  const { View } = require('react-native');
  return {
    LinearGradient: ({ children, ...rest }: any) => <View {...rest}>{children}</View>,
  };
});

describe('MatchActionCard', () => {
  it('appelle onPress quand la carte est pressée', () => {
    const onPress = jest.fn();
    const tree = renderer.create(
      <MatchActionCard
        title="Quiz"
        subtitle="+10 XP"
        icon={<Text>🏒</Text>}
        colors={['#000', '#111']}
        onPress={onPress}
      />,
    );

    const touchable = tree.root.find((node) => node.props?.onPress);
    touchable.props.onPress();

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
