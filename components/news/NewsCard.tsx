import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Typo } from '../ui/Typography';
import { Colors } from '../../constants/Colors';
import { TactileButton } from '../ui/TactileButton';

interface NewsCardProps {
    item: {
        id: string;
        title: string;
        image_url?: string;
        published_at: string;
        content: string; // Used for potential snippet
    };
    onPress: () => void;
    compact?: boolean;
}

export function NewsCard({ item, onPress, compact = false }: NewsCardProps) {
    return (
        <TactileButton onPress={onPress} style={[styles.card, compact && styles.compactCard]}>
            {item.image_url ? (
                <Image
                    source={{ uri: item.image_url }}
                    style={[styles.image, compact && styles.compactImage]}
                    resizeMode="cover"
                />
            ) : (
                <View style={[styles.image, compact && styles.compactImage, { backgroundColor: Colors.slate }]} />
            )}

            <View style={styles.content}>
                <Typo variant={compact ? "body" : "h3"} weight="bold" color={Colors.night} numberOfLines={2}>
                    {item.title}
                </Typo>
                {!compact && (
                    <Typo variant="caption" color={Colors.textSecondary} numberOfLines={2} style={{ marginTop: 4 }}>
                        {item.content}
                    </Typo>
                )}
                <Typo variant="caption" color={Colors.textSecondary} style={{ marginTop: 8 }}>
                    {new Date(item.published_at).toLocaleDateString()}
                </Typo>
            </View>
        </TactileButton>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    compactCard: {
        flexDirection: 'row',
        height: 100,
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: 180,
    },
    compactImage: {
        width: 100,
        height: '100%',
    },
    content: {
        padding: 16,
        flex: 1,
    }
});
