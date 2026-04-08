import React from 'react';
import renderer from 'react-test-renderer';
import { Text } from 'react-native';
import { ModalBase } from '../ModalBase';

jest.mock('expo-blur', () => ({
  BlurView: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

describe('ModalBase', () => {
  it('render le contenu lorsque visible', () => {
    const tree = renderer.create(
      <ModalBase visible onClose={() => {}} title="Titre test">
        <Text>Body</Text>
      </ModalBase>,
    );

    expect(tree.toJSON()).toBeTruthy();
  });
});
