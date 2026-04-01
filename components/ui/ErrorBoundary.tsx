import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Typo } from './Typography';
import { Colors } from '../../constants/Colors';
import { RefreshCcw } from 'lucide-react-native';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        // Ici on branchera Sentry plus tard
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    public render() {
        if (this.state.hasError) {
            return (
                <View style={styles.container}>
                    <View style={styles.iconContainer}>
                        <RefreshCcw size={32} color={Colors.france.red} />
                    </View>
                    <Typo variant="h2" weight="black" color={Colors.night} style={{ marginBottom: 10, textAlign: 'center' }}>
                        Oups ! Misa à rude épreuve !
                    </Typo>
                    <Typo variant="body" color={Colors.textSecondary} style={{ marginBottom: 24, textAlign: 'center', paddingHorizontal: 20 }}>
                        {this.state.error?.message || "Un problème inattendu s'est produit. L'application a rencontré une erreur."}
                    </Typo>
                    <TouchableOpacity style={styles.button} onPress={this.handleReset}>
                        <Typo variant="body" weight="bold" color={Colors.white}>Recharger</Typo>
                    </TouchableOpacity>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        padding: 24,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    button: {
        backgroundColor: Colors.night,
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 16,
    }
});
