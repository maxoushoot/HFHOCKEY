import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert, ActivityIndicator, AppState } from 'react-native';
import { LiquidContainer } from '../../components/ui/LiquidContainer';
import { Typo } from '../../components/ui/Typography';
import { Colors } from '../../constants/Colors';
import { TactileButton } from '../../components/ui/TactileButton';
import { useStore } from '../../store/useStore';
import {
    RefreshCw, Zap, BarChart3, Calendar, Activity, CheckCircle, XCircle, Clock
} from 'lucide-react-native';

interface SyncResult {
    success: boolean;
    data?: any;
    error?: string;
}

type SyncType = 'full' | 'scores' | 'events' | 'standings' | 'status';

const SYNC_BUTTONS: { type: SyncType; label: string; icon: any; color: string; description: string }[] = [
    { type: 'full', label: 'Sync Complète', icon: RefreshCw, color: Colors.primary, description: 'Ligues → Équipes → Matchs → Events → Classement' },
    { type: 'scores', label: 'Scores Rapide', icon: Zap, color: '#F59E0B', description: "Scores du jour uniquement (1 requête)" },
    { type: 'events', label: 'Événements', icon: Activity, color: '#10B981', description: 'Buts & pénalités des matchs terminés' },
    { type: 'standings', label: 'Classement', icon: BarChart3, color: '#8B5CF6', description: 'Mise à jour du classement' },
    { type: 'status', label: 'Statut API', icon: Calendar, color: Colors.textSecondary, description: 'Config et logs récents (0 requête)' },
];

export default function AdminSyncScreen() {
    const triggerSync = useStore((s) => s.triggerSync);
    const matches = useStore((s) => s.matches);
    const [loading, setLoading] = useState<SyncType | null>(null);
    const [lastResult, setLastResult] = useState<SyncResult | null>(null);
    const [livePolling, setLivePolling] = useState(false);
    const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const hasLiveMatches = matches.some((m) => m.status === 'live');

    // Live polling every 60 seconds (Secured with AppState)
    useEffect(() => {
        let subscription: any;

        const startPolling = () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
            if (livePolling && AppState.currentState === 'active') {
                pollingRef.current = setInterval(async () => {
                    console.log('[Live Polling] Fetching scores...');
                    const result = await triggerSync('scores');
                    setLastResult(result);
                }, 60000); // Every 1 minute
            }
        };

        const stopPolling = () => {
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
                pollingRef.current = null;
            }
        };

        if (livePolling) {
            startPolling();
            subscription = AppState.addEventListener('change', nextAppState => {
                if (nextAppState === 'active') {
                    startPolling();
                } else {
                    stopPolling();
                }
            });
        } else {
            stopPolling();
        }

        return () => {
            stopPolling();
            if (subscription) subscription.remove();
        };
    }, [livePolling, triggerSync]);

    const handleSync = useCallback(async (type: SyncType) => {
        setLoading(type);
        try {
            const result = await triggerSync(type);
            setLastResult(result);

            if (result.success) {
                Alert.alert('✅ Sync réussie', `Type: ${type}\n${JSON.stringify(result.data, null, 2).substring(0, 300)}`);
            } else {
                Alert.alert('❌ Erreur', result.error || 'Erreur inconnue');
            }
        } catch (err) {
            Alert.alert('❌ Erreur', String(err));
        }
        setLoading(null);
    }, [triggerSync]);

    const toggleLivePolling = useCallback(() => {
        setLivePolling((prev) => {
            const newVal = !prev;
            if (newVal) {
                Alert.alert('🔴 Live ON', 'Scores mis à jour toutes les 60 secondes');
            } else {
                Alert.alert('⏸️ Live OFF', 'Polling arrêté');
            }
            return newVal;
        });
    }, []);

    return (
        <LiquidContainer>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.header}>
                    <Typo variant="h1" weight="black" color={Colors.night}>
                        🏒 Sync API-Sports
                    </Typo>
                    <Typo variant="body" color={Colors.textSecondary}>
                        Synchroniser les données hockey depuis API-Sports
                    </Typo>
                </View>

                {/* Live Polling Toggle */}
                <TactileButton
                    style={[
                        styles.liveCard,
                        livePolling && styles.liveCardActive,
                    ]}
                    onPress={toggleLivePolling}
                >
                    <View style={styles.liveRow}>
                        <View style={[styles.liveDot, livePolling && styles.liveDotActive]} />
                        <View style={{ flex: 1 }}>
                            <Typo variant="body" weight="bold" color={livePolling ? '#FFFFFF' : Colors.night}>
                                {livePolling ? '🔴 LIVE — Polling actif' : '⏸️ Live Polling désactivé'}
                            </Typo>
                            <Typo variant="caption" color={livePolling ? 'rgba(255,255,255,0.8)' : Colors.textSecondary}>
                                {livePolling
                                    ? 'Scores rafraîchis toutes les 60s'
                                    : 'Appuyer pour activer (toutes les 60s)'
                                }
                            </Typo>
                        </View>
                        {hasLiveMatches && (
                            <View style={styles.liveMatchBadge}>
                                <Typo variant="caption" weight="bold" color="#FFFFFF">
                                    {matches.filter(m => m.status === 'live').length} LIVE
                                </Typo>
                            </View>
                        )}
                    </View>
                </TactileButton>

                {/* Sync Buttons */}
                {SYNC_BUTTONS.map((btn) => (
                    <TactileButton
                        key={btn.type}
                        style={styles.syncCard}
                        onPress={() => handleSync(btn.type)}
                        disabled={loading !== null}
                    >
                        <View style={styles.syncRow}>
                            <View style={[styles.syncIcon, { backgroundColor: btn.color + '15' }]}>
                                {loading === btn.type ? (
                                    <ActivityIndicator size="small" color={btn.color} />
                                ) : (
                                    <btn.icon size={24} color={btn.color} />
                                )}
                            </View>
                            <View style={styles.syncTextCol}>
                                <Typo variant="body" weight="bold" color={Colors.night}>
                                    {btn.label}
                                </Typo>
                                <Typo variant="caption" color={Colors.textSecondary}>
                                    {btn.description}
                                </Typo>
                            </View>
                        </View>
                    </TactileButton>
                ))}

                {/* Last Result */}
                {lastResult && (
                    <View style={[
                        styles.resultCard,
                        lastResult.success ? styles.resultSuccess : styles.resultError,
                    ]}>
                        <View style={styles.resultHeader}>
                            {lastResult.success ? (
                                <CheckCircle size={18} color="#16A34A" />
                            ) : (
                                <XCircle size={18} color="#EF4444" />
                            )}
                            <Typo
                                variant="body"
                                weight="bold"
                                color={lastResult.success ? '#16A34A' : '#EF4444'}
                                style={{ marginLeft: 8 }}
                            >
                                {lastResult.success ? 'Succès' : 'Erreur'}
                            </Typo>
                            <View style={{ flex: 1 }} />
                            <Clock size={14} color={Colors.textSecondary} />
                            <Typo variant="caption" color={Colors.textSecondary} style={{ marginLeft: 4 }}>
                                {new Date().toLocaleTimeString('fr-FR')}
                            </Typo>
                        </View>

                        {lastResult.data && (
                            <View style={styles.resultBody}>
                                {lastResult.data.type && (
                                    <ResultRow label="Type" value={lastResult.data.type} />
                                )}
                                {lastResult.data.teams !== undefined && (
                                    <ResultRow label="Équipes" value={`${lastResult.data.teams} synchronisées`} />
                                )}
                                {lastResult.data.matches !== undefined && (
                                    <ResultRow label="Matchs" value={`${lastResult.data.matches} synchronisés`} />
                                )}
                                {lastResult.data.events !== undefined && (
                                    <ResultRow label="Événements" value={`${lastResult.data.events} synchronisés`} />
                                )}
                                {lastResult.data.standings !== undefined && (
                                    <ResultRow label="Classement" value={`${lastResult.data.standings} équipes`} />
                                )}
                                {lastResult.data.rateLimit && (
                                    <ResultRow
                                        label="Quota API"
                                        value={`${lastResult.data.rateLimit.requestsRemaining}/${lastResult.data.rateLimit.requestsLimit} restantes`}
                                    />
                                )}
                            </View>
                        )}

                        {lastResult.error && (
                            <Typo variant="caption" color="#EF4444" style={{ marginTop: 8 }}>
                                {lastResult.error}
                            </Typo>
                        )}
                    </View>
                )}
            </ScrollView>
        </LiquidContainer>
    );
}

function ResultRow({ label, value }: { label: string; value: string }) {
    return (
        <View style={styles.resultRow}>
            <Typo variant="caption" weight="bold" color={Colors.textSecondary}>{label}</Typo>
            <Typo variant="caption" color={Colors.night}>{value}</Typo>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        gap: 12,
        paddingBottom: 40,
    },
    header: {
        marginTop: 20,
        marginBottom: 8,
    },
    liveCard: {
        padding: 16,
        borderRadius: 20,
        backgroundColor: Colors.white,
        borderWidth: 2,
        borderColor: '#E2E8F0',
    },
    liveCardActive: {
        backgroundColor: '#EF4444',
        borderColor: '#EF4444',
    },
    liveRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    liveDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#CBD5E1',
    },
    liveDotActive: {
        backgroundColor: '#FFFFFF',
    },
    liveMatchBadge: {
        backgroundColor: 'rgba(255,255,255,0.3)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    syncCard: {
        padding: 16,
        borderRadius: 20,
        backgroundColor: Colors.white,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    syncRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    syncIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    syncTextCol: {
        flex: 1,
    },
    resultCard: {
        padding: 16,
        borderRadius: 16,
        marginTop: 8,
    },
    resultSuccess: {
        backgroundColor: '#F0FDF4',
        borderWidth: 1,
        borderColor: '#BBF7D0',
    },
    resultError: {
        backgroundColor: '#FEF2F2',
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    resultHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    resultBody: {
        marginTop: 12,
        gap: 6,
    },
    resultRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
});
