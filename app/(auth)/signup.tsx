import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Image, Dimensions } from 'react-native';
import { Link, router } from 'expo-router';
import { LiquidContainer } from '../../components/ui/LiquidContainer';
import { Typo } from '../../components/ui/Typography';
import { TactileButton } from '../../components/ui/TactileButton';
import { Colors, Layout } from '../../constants/Colors';
import { useStore } from '../../store/useStore';
import { ArrowLeft, User, Mail, Lock } from 'lucide-react-native';

const { width } = Dimensions.get('window');

/**
 * Écran d'Inscription - Thème clair.
 */
export default function SignupScreen() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { signUp } = useStore();

    const handleSignup = async () => {
        if (!email || !password || !username) {
            return Alert.alert('Erreur', 'Veuillez tout remplir');
        }

        setLoading(true);
        const { error } = await signUp(email, password, username);
        setLoading(false);

        if (error) {
            Alert.alert('Erreur d\'inscription', error.message);
        } else {
            router.replace('/onboarding');
        }
    };

    return (
        <LiquidContainer>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Link href="/" asChild>
                        <TactileButton style={styles.backBtn}>
                            <ArrowLeft color={Colors.night} size={24} />
                        </TactileButton>
                    </Link>
                </View>

                {/* Content */}
                <View style={styles.content}>
                    {/* Logo */}
                    <Image
                        source={require('../../assets/images/logo-hf.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />

                    <View style={styles.titleSection}>
                        <Typo variant="h1" weight="black" color={Colors.night}>
                            Créer un compte
                        </Typo>
                        <Typo variant="body" color={Colors.textSecondary}>
                            Rejoignez la communauté Hockey Fan
                        </Typo>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputContainer}>
                            <View style={styles.inputIcon}>
                                <User size={20} color={Colors.textSecondary} />
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder="Pseudo"
                                placeholderTextColor={Colors.textSecondary}
                                value={username}
                                onChangeText={setUsername}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <View style={styles.inputIcon}>
                                <Mail size={20} color={Colors.textSecondary} />
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder="Email"
                                placeholderTextColor={Colors.textSecondary}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                value={email}
                                onChangeText={setEmail}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <View style={styles.inputIcon}>
                                <Lock size={20} color={Colors.textSecondary} />
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder="Mot de passe (6+ caractères)"
                                placeholderTextColor={Colors.textSecondary}
                                secureTextEntry
                                value={password}
                                onChangeText={setPassword}
                            />
                        </View>

                        <TactileButton onPress={handleSignup} style={styles.mainBtn}>
                            {loading ? (
                                <ActivityIndicator color={Colors.white} />
                            ) : (
                                <Typo weight="black" color={Colors.white}>CRÉER MON COMPTE</Typo>
                            )}
                        </TactileButton>
                    </View>

                    <View style={styles.footer}>
                        <Typo variant="body" color={Colors.textSecondary}>
                            Déjà un compte ?{' '}
                        </Typo>
                        <Link href="/(auth)/login">
                            <Typo variant="body" weight="bold" color={Colors.france.blue}>
                                Se connecter
                            </Typo>
                        </Link>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </LiquidContainer>
    );
}

const styles = StyleSheet.create({
    keyboardView: {
        flex: 1,
    },
    header: {
        padding: 24,
        paddingTop: 20,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: Colors.slate,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 60,
    },
    logo: {
        width: width * 0.35,
        height: width * 0.2,
        marginBottom: 24,
    },
    titleSection: {
        alignItems: 'center',
        gap: 8,
        marginBottom: 32,
    },
    form: {
        width: '100%',
        gap: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.slate,
    },
    inputIcon: {
        paddingLeft: 16,
    },
    input: {
        flex: 1,
        padding: 16,
        fontSize: 16,
        color: Colors.night,
        fontFamily: 'Inter_500Medium',
    },
    mainBtn: {
        backgroundColor: Colors.night,
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
});
