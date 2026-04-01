import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Alert, Modal, ScrollView, Image, TouchableOpacity } from 'react-native';
import { LiquidContainer } from '../../components/ui/LiquidContainer';
import { Typo } from '../../components/ui/Typography';
import { Colors } from '../../constants/Colors';
import { NewsCard } from '../../components/news/NewsCard';
import { supabase } from '../../lib/supabase';
import { Stack, useRouter } from 'expo-router';
import { X, Share2, ArrowLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function NewsFeed() {
    const [news, setNews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedNews, setSelectedNews] = useState<any>(null);
    const insets = useSafeAreaInsets();
    const router = useRouter();

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('news')
            .select('id, title, image_url, published_at, content, url')
            .order('published_at', { ascending: false });

        if (error) console.error(error);
        else setNews(data || []);
        setLoading(false);
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <Typo variant="h1" weight="black" color={Colors.white}>ACTUALITÉS</Typo>
        </View>
    );

    return (
        <LiquidContainer>
            <Stack.Screen options={{ headerShown: false }} />

            <View style={[styles.navBar, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft color={Colors.white} size={24} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={news}
                renderItem={({ item, index }) => (
                    // First item is big, others are compact? Let's keep all big for now for "Feed" feel
                    <NewsCard item={item} onPress={() => setSelectedNews(item)} />
                )}
                keyExtractor={item => item.id}
                contentContainerStyle={[styles.list, { paddingTop: 60 }]}
                ListHeaderComponent={renderHeader}
                refreshing={loading}
                onRefresh={fetchNews}
            />

            {/* Reading Modal */}
            <Modal visible={!!selectedNews} animationType="slide" presentationStyle="pageSheet">
                <View style={styles.modalContainer}>
                    <ScrollView bounces={false}>
                        {selectedNews?.image_url && (
                            <Image
                                source={{ uri: selectedNews.image_url }}
                                style={styles.modalImage}
                            />
                        )}
                        <View style={styles.modalContent}>
                            <Typo variant="h2" weight="black" color={Colors.night} style={{ marginBottom: 12 }}>
                                {selectedNews?.title}
                            </Typo>

                            <View style={styles.metaRow}>
                                <Typo variant="caption" color={Colors.textSecondary}>
                                    Publié le {selectedNews && new Date(selectedNews.published_at).toLocaleDateString()}
                                </Typo>
                                <Share2 size={20} color={Colors.primary} />
                            </View>

                            <Typo variant="body" color={Colors.night} style={{ lineHeight: 24, marginTop: 20 }}>
                                {selectedNews?.content}
                            </Typo>
                        </View>
                    </ScrollView>

                    {/* Close Button */}
                    <TouchableOpacity
                        style={[styles.closeBtn, { top: 20, right: 20 }]}
                        onPress={() => setSelectedNews(null)}
                    >
                        <X size={24} color={Colors.night} />
                    </TouchableOpacity>
                </View>
            </Modal>
        </LiquidContainer>
    );
}

const styles = StyleSheet.create({
    navBar: {
        position: 'absolute',
        left: 0,
        right: 0,
        zIndex: 10,
        paddingHorizontal: 20,
    },
    backBtn: {
        width: 40,
        height: 40,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        padding: 20,
        gap: 16,
    },
    header: {
        marginBottom: 20,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    modalImage: {
        width: '100%',
        height: 300,
        resizeMode: 'cover',
    },
    modalContent: {
        padding: 24,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: Colors.slate,
        paddingBottom: 16,
    },
    closeBtn: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    }
});
