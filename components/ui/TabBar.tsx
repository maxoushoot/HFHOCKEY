import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { Colors } from '../../constants/Colors';
import { Typo } from '../ui/Typography';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Home, Calendar, GraduationCap, Gamepad, User } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const { colorMode } = useTheme();
    const primaryColor = Colors.electricBlue; // Or dynamic based on theme

    const translateX = useSharedValue(0);

    const TAB_WIDTH = (width - 40) / state.routes.length; // 40 = margin/padding

    useEffect(() => {
        translateX.value = withSpring(state.index * TAB_WIDTH, {
            damping: 15,
            stiffness: 150,
        });
    }, [state.index, TAB_WIDTH]);

    const animatedIndicatorStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: translateX.value }],
            width: TAB_WIDTH,
        };
    });

    return (
        <View style={styles.container}>
            <View style={[styles.content, { backgroundColor: colorMode === 'dark' ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)', borderColor: colorMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                {/* Background Blur is tricky inside the view if it has rounded corners and margins,
                     so we use a semi-transparent background color instead for better performance and consistency.
                     If blur is strictly needed, we can wrap content in BlurView.
                  */}

                {/* Active Indicator */}
                <Animated.View style={[styles.indicatorContainer, animatedIndicatorStyle]}>
                    <View style={[styles.indicator, { backgroundColor: primaryColor + '20' }]} />
                </Animated.View>

                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const label =
                        options.tabBarLabel !== undefined
                            ? options.tabBarLabel
                            : options.title !== undefined
                                ? options.title
                                : route.name;

                    const isFocused = state.index === index;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            Haptics.selectionAsync();
                            navigation.navigate(route.name, route.params);
                        }
                    };

                    const onLongPress = () => {
                        navigation.emit({
                            type: 'tabLongPress',
                            target: route.key,
                        });
                    };

                    // Icon mapping based on route name
                    let Icon = Home;
                    if (route.name === 'matches') Icon = Calendar;
                    if (route.name === 'academy') Icon = GraduationCap;
                    if (route.name === 'game') Icon = Gamepad;
                    if (route.name === 'profile') Icon = User;

                    return (
                        <TouchableOpacity
                            key={route.key}
                            accessibilityRole="button"
                            accessibilityState={isFocused ? { selected: true } : {}}
                            accessibilityLabel={options.tabBarAccessibilityLabel}
                            testID={options.title}
                            onPress={onPress}
                            onLongPress={onLongPress}
                            style={styles.tabBtn}
                        >
                            <Animated.View style={[
                                styles.iconContainer,
                                // Scale animation could go here
                            ]}>
                                <Icon
                                    size={24}
                                    color={isFocused ? primaryColor : (colorMode === 'dark' ? '#94A3B8' : '#94A3B8')}
                                    strokeWidth={isFocused ? 2.5 : 2}
                                />
                            </Animated.View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 24,
        left: 20,
        right: 20,
        alignItems: 'center',
    },
    content: {
        flexDirection: 'row',
        height: 64,
        borderRadius: 32,
        // Shadow
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
        overflow: 'hidden',
        borderWidth: 1,
    },
    tabBtn: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainer: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    indicatorContainer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    indicator: {
        width: 48,
        height: 48,
        borderRadius: 24,
    }
});
