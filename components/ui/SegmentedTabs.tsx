import React from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Colors } from '../../constants/Colors';
import { Typo } from './Typography';

type TabItem<T extends string> = {
  id: T;
  label: string;
  icon: React.ElementType;
};

interface SegmentedTabsProps<T extends string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onTabChange: (tab: T) => void;
  backgroundColor?: string;
  activeColor?: string;
  textColor?: string;
}

export function SegmentedTabs<T extends string>({
  tabs,
  activeTab,
  onTabChange,
  backgroundColor = Colors.slate,
  activeColor = Colors.france.blue,
  textColor = Colors.textSecondary,
}: SegmentedTabsProps<T>) {
  const { width } = Dimensions.get('window');
  const tabWidth = (width - 48) / tabs.length;
  const activeIndex = tabs.findIndex((t) => t.id === activeTab);
  const indicatorX = useSharedValue(activeIndex);

  React.useEffect(() => {
    indicatorX.value = withTiming(activeIndex, { duration: 220 });
  }, [activeIndex, indicatorX]);

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value * tabWidth }],
    width: tabWidth - 8,
  }));

  return (
    <View style={[styles.wrapper, { backgroundColor }]}>
      <Animated.View style={[styles.indicator, { backgroundColor: activeColor }, animatedIndicatorStyle]} />
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        const Icon = tab.icon;
        return (
          <TouchableOpacity key={tab.id} style={styles.tabBtn} onPress={() => onTabChange(tab.id)} activeOpacity={0.7}>
            <Icon size={16} color={isActive ? Colors.white : textColor} style={{ opacity: isActive ? 1 : 0.6 }} />
            <Typo variant="caption" weight="bold" color={isActive ? Colors.white : textColor} style={{ opacity: isActive ? 1 : 0.6 }}>
              {tab.label}
            </Typo>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 4,
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    height: '100%',
    borderRadius: 12,
    top: 4,
    left: 4,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    zIndex: 1,
  },
});
