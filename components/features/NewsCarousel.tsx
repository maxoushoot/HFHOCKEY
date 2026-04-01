import React, { useEffect, useState } from 'react';
import { View, ScrollView, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Typo } from '../ui/Typography';
import { Colors, Layout } from '../../constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';


const MOCK_NEWS = [
    {
        id: '1',
        title: 'Résumé: Grenoble écrase Briançon 6-1',
        image_url: 'https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?q=80&w=300',
        published_at: new Date().toISOString(),
        tag: 'RÉSUMÉ'
    },
    {
        id: '2',
        title: 'Interview: "On vise le titre cette année"',
        image_url: 'https://images.unsplash.com/photo-1551829142-d9b8cf2c9232?q=80&w=300',
        published_at: new Date(Date.now() - 86400000).toISOString(),
        tag: 'INTERVIEW'
    },
    {
        id: '3',
        title: 'Transferts: Un nouveau défenseur pour Rouen',
        image_url: 'https://images.unsplash.com/photo-1515703407324-5f753afd8be8?q=80&w=300',
        published_at: new Date(Date.now() - 172800000).toISOString(),
        tag: 'MERCATO'
    }
];

export const NewsCarousel = () => {
    const [news, setNews] = useState<any[]>([]);
    const router = useRouter();

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        const { data, error } = await supabase
            .from('news')
            .select('*')
            .order('published_at', { ascending: false })
            .limit(5);

        if (data && data.length > 0) {
            setNews(data);
        } else {
            console.log('Using mock news data');
            setNews(MOCK_NEWS);
        }
    };

    if (news.length === 0) return null;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Typo variant="h3" weight="bold" color={Colors.night}>L'ACTUALITÉ</Typo>
                <TouchableOpacity style={styles.seeAll} onPress={() => router.push('/news')}>
                    <Typo variant="caption" weight="bold" color={Colors.textSecondary}>Voir tout</Typo>
                </TouchableOpacity>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {news.map((item, index) => (
                    <TouchableOpacity
                        key={item.id || index}
                        style={styles.card}
                        activeOpacity={0.7}
                        onPress={() => router.push('/news')}
                    >
                        <View style={styles.cardHeader}>
                            <View style={[styles.tag, { backgroundColor: Colors.france.blue + '15' }]}>
                                <Typo variant="caption" weight="bold" color={Colors.france.blue}>
                                    {item.tag || 'ACTUALITÉ'}
                                </Typo>
                            </View>
                            <Typo variant="caption" color={Colors.textSecondary}>
                                {new Date(item.published_at).toLocaleDateString()}
                            </Typo>
                        </View>

                        <Typo
                            variant="h4"
                            weight="bold"
                            color={Colors.night}
                            numberOfLines={3}
                            style={styles.title}
                        >
                            {item.title}
                        </Typo>

                        <View style={styles.readMore}>
                            <Typo variant="caption" weight="bold" color={Colors.france.blue}>Lire l'article</Typo>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    seeAll: {
        padding: 4,
    },
    scrollContent: {
        paddingHorizontal: 24,
        gap: 16,
        paddingBottom: 20, // space for shadow
    },
    card: {
        width: 240,
        height: 160,
        padding: 20,
        borderRadius: 24,
        backgroundColor: Colors.white,
        justifyContent: 'space-between',
        // Shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 4,
        borderWidth: 1,
        borderColor: Colors.slate,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    tag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    title: {
        flex: 1,
    },
    readMore: {
        marginTop: 12,
        alignSelf: 'flex-start',
    },
});
