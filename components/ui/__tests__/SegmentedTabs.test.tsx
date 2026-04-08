import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { SegmentedTabs } from '../SegmentedTabs';

jest.mock('react-native-reanimated', () => {
  const View = require('react-native').View;
  return {
    __esModule: true,
    default: View,
    useSharedValue: (value: number) => ({ value }),
    withTiming: (value: number) => value,
    useAnimatedStyle: (factory: any) => factory(),
  };
});

const tabs = [
  { id: 'calendar' as const, label: 'Calendrier', icon: () => null },
  { id: 'teams' as const, label: 'Équipes', icon: () => null },
];

describe('SegmentedTabs', () => {
  it('render sans crash et déclenche le changement d’onglet', () => {
    const onTabChange = jest.fn();
    const tree = renderer.create(
      <SegmentedTabs tabs={tabs} activeTab="calendar" onTabChange={onTabChange} />,
    );

    const touchables = tree.root.findAll((node) => node.props?.onPress);
    act(() => touchables[1].props.onPress());

    expect(onTabChange).toHaveBeenCalledWith('teams');
  });
});
