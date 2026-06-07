/**
 * Smoke tests for the custom `toBeAccessible` matcher (audit task C-TEST6).
 * Also serves as a worked example of how new component tests should assert
 * accessibility contracts.
 */

import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { render } from '@testing-library/react-native';

import '../../utils/a11yMatcher';

describe('toBeAccessible', () => {
  it('passes for a fully labelled button', () => {
    const { getByRole } = render(
      <Pressable accessibilityRole="button" accessibilityLabel="Start break">
        <Text>Start</Text>
      </Pressable>
    );
    const button = getByRole('button');
    expect(button).toBeAccessible();
  });

  it('fails when the role is missing', () => {
    const { getByText } = render(
      <Pressable accessibilityLabel="Start break">
        <Text>Start</Text>
      </Pressable>
    );
    const target = getByText('Start');
    expect(() => expect(target).toBeAccessible()).toThrow(/missing accessibilityRole/);
  });

  it('fails when the label is missing', () => {
    const { getByText } = render(
      <Pressable accessibilityRole="button">
        <Text>Start</Text>
      </Pressable>
    );
    const target = getByText('Start');
    expect(() => expect(target).toBeAccessible()).toThrow(/missing or empty accessibilityLabel/);
  });

  it('with requireHint also enforces accessibilityHint', () => {
    const { getByLabelText } = render(
      <View accessibilityRole="timer" accessibilityLabel="25 minutes left" testID="timer">
        <Text>25:00</Text>
      </View>
    );
    const timer = getByLabelText('25 minutes left');
    expect(() => expect(timer).toBeAccessible({ requireHint: true })).toThrow(
      /missing or empty accessibilityHint/
    );
  });

  it('with requireHint passes when both label and hint are set', () => {
    const { getByLabelText } = render(
      <View
        accessibilityRole="timer"
        accessibilityLabel="25 minutes left"
        accessibilityHint="Tap to start the focus timer"
        testID="timer"
      >
        <Text>25:00</Text>
      </View>
    );
    const timer = getByLabelText('25 minutes left');
    expect(timer).toBeAccessible({ requireHint: true });
  });

  it('with expectedRole enforces the exact role', () => {
    const { getByRole } = render(
      <Pressable accessibilityRole="button" accessibilityLabel="Skip">
        <Text>Skip</Text>
      </Pressable>
    );
    const button = getByRole('button');
    expect(button).toBeAccessible({ expectedRole: 'button' });
    expect(() => expect(button).toBeAccessible({ expectedRole: 'link' })).toThrow(
      /expected role "link"/
    );
  });
});
