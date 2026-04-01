import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton } from '../ui/Skeleton';
import { Colors } from '../../constants/Colors';

export function MatchListSkeleton() {
    return (
        <View style={styles.container}>
            {[1, 2, 3, 4, 5].map((key) => (
                <View key={key} style={styles.card}>
                    {/* Date/Time Placeholder */}
                    <View style={styles.header}>
                        <Skeleton width={80} height={14} borderRadius={4} />
                        <Skeleton width={60} height={14} borderRadius={4} />
                    </View>

                    {/* Teams Placeholder */}
                    <View style={styles.teams}>
                        <View style={styles.team}>
                            <Skeleton width={40} height={40} borderRadius={20} />
                            <Skeleton width={60} height={16} borderRadius={4} style={{ marginTop: 8 }} />
                        </View>
                        <Skeleton width={40} height={24} borderRadius={8} />
                        <View style={styles.team}>
                            <Skeleton width={40} height={40} borderRadius={20} />
                            <Skeleton width={60} height={16} borderRadius={4} style={{ marginTop: 8 }} />
                        </View>
                    </View>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 16,
        paddingHorizontal: 16,
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 16,
        height: 120,
        justifyContent: 'space-between',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    teams: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 12,
    },
    team: {
        alignItems: 'center',
    }
});
