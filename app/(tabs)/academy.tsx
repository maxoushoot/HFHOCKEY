import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { LiquidContainer } from '../../components/ui/LiquidContainer';
import { Typo } from '../../components/ui/Typography';
import { Colors, CardStyles } from '../../constants/Colors';
import { Search, BookOpen, Flag, Settings2, BarChart3 } from 'lucide-react-native';
import { useTeamTheme } from '../../hooks/useTeamTheme';
import { supabase } from '../../lib/supabase';

const CATEGORIES = [
    { id: 'Tout', icon: BookOpen },
    { id: 'Règles', icon: Flag },
    { id: 'Tactique', icon: Settings2 },
    { id: 'Statistiques', icon: BarChart3 },
];

/**
 * Écran Académie (AcademyScreen) - Thème France.
 */
export default function AcademyScreen() {
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('Tout');
    const [terms, setTerms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { primary, accentLight } = useTeamTheme();

    useEffect(() => {
        fetchTerms();
    }, []);

    const fetchTerms = async () => {
        console.log('Fetching glossary terms...');
        const { data, error } = await supabase
            .from('glossary_terms')
            .select('*')
            .order('term');

        console.log('Glossary fetch result:', data?.length, 'terms, error:', error);

        if (!error && data) {
            setTerms(data);
        } else if (error) {
            console.error('Glossary fetch error:', error);
        }
        setLoading(false);
    };

    const filteredTerms = terms.filter(item => {
        const matchesSearch = item.term.toLowerCase().includes(search.toLowerCase()) || item.definition.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = activeCategory === 'Tout' || item.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <LiquidContainer >
            {/* Header */}
            <View style={styles.header}>
                <View style={[styles.titleBadge, { backgroundColor: accentLight }]}>
                    <BookOpen size={16} color={primary} />
                    <Typo variant="caption" weight="bold" color={primary}>APPRENDRE</Typo>
                </View>
                <Typo variant="h1" weight="black" color={Colors.night}>L'ACADÉMIE</Typo>
                <Typo variant="body" color={Colors.textSecondary}>
                    Le lexique complet pour maîtriser le hockey sur glace
                </Typo>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={[styles.searchBar, { borderColor: accentLight }]}>
                    <Search size={20} color={primary} />
                    <TextInput
                        style={styles.input}
                        placeholder="Rechercher un terme..."
                        placeholderTextColor={Colors.textSecondary}
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>
            </View>

            {/* Categories */}
            <View style={styles.categoriesContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categories}
                >
                    {CATEGORIES.map(cat => {
                        const isActive = activeCategory === cat.id;
                        const Icon = cat.icon;
                        return (
                            <TouchableOpacity
                                key={cat.id}
                                style={[
                                    styles.catPill,
                                    isActive && { backgroundColor: primary, shadowColor: primary, elevation: 4 }
                                ]}
                                onPress={() => setActiveCategory(cat.id)}
                                activeOpacity={0.7}
                            >
                                <Icon size={16} color={isActive ? Colors.white : Colors.textSecondary} />
                                <Typo
                                    variant="caption"
                                    weight="bold"
                                    color={isActive ? Colors.white : Colors.textSecondary}
                                >
                                    {cat.id.toUpperCase()}
                                </Typo>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {/* Term Cards */}
            <ScrollView
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
            >
                {/* Loading State - Skeleton Cards */}
                {loading && (
                    <>
                        {[1, 2, 3, 4].map((i) => (
                            <View key={i} style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <View style={{ width: 120, height: 24, backgroundColor: '#E1E9EE', borderRadius: 8 }} />
                                    <View style={{ width: 60, height: 20, backgroundColor: '#E1E9EE', borderRadius: 8 }} />
                                </View>
                                <View style={{ width: '100%', height: 16, backgroundColor: '#E1E9EE', borderRadius: 4, marginTop: 8 }} />
                                <View style={{ width: '80%', height: 16, backgroundColor: '#E1E9EE', borderRadius: 4, marginTop: 4 }} />
                            </View>
                        ))}
                    </>
                )}

                {/* Empty State */}
                {!loading && filteredTerms.length === 0 && (
                    <View style={styles.emptyState}>
                        <BookOpen size={48} color={Colors.textSecondary} />
                        <Typo variant="h3" weight="bold" color={Colors.night} style={{ marginTop: 16 }}>
                            Aucun terme trouvé
                        </Typo>
                        <Typo variant="body" color={Colors.textSecondary} style={{ textAlign: 'center', marginTop: 8 }}>
                            {search ? `Aucun résultat pour "${search}"` : 'Les termes du glossaire apparaîtront ici'}
                        </Typo>
                    </View>
                )}

                {/* Term Cards */}
                {!loading && filteredTerms.map((item, index) => (
                    <View key={index} style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={styles.termContainer}>
                                <Typo variant="h3" weight="black" color={Colors.night}>{item.term}</Typo>
                                <View style={[styles.categoryDot, { backgroundColor: primary }]} />
                            </View>
                            <View style={[styles.badge, { backgroundColor: accentLight + '40' }]}>
                                <Typo variant="caption" weight="bold" color={primary} style={{ fontSize: 10 }}>
                                    {item.category.toUpperCase()}
                                </Typo>
                            </View>
                        </View>
                        <Typo variant="body" color={Colors.textSecondary} style={{ lineHeight: 22 }}>
                            {item.definition}
                        </Typo>
                    </View>
                ))}
                <View style={{ height: 140 }} />
            </ScrollView>
        </LiquidContainer>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 20,
        gap: 6,
    },
    titleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        marginBottom: 4,
    },
    searchContainer: {
        paddingHorizontal: 24,
        marginBottom: 8,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        height: 52,
        borderWidth: 1,
        borderRadius: 16,
        backgroundColor: Colors.white,
    },
    input: {
        flex: 1,
        marginLeft: 12,
        color: Colors.night,
        fontFamily: 'Inter_500Medium',
        fontSize: 16,
    },
    categoriesContainer: {
        marginBottom: 16,
    },
    categories: {
        paddingHorizontal: 24,
        gap: 12,
        paddingBottom: 10,
    },
    catPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    list: {
        paddingHorizontal: 24,
        gap: 16,
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    termContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    categoryDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        opacity: 0.5,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 24,
    }
});

