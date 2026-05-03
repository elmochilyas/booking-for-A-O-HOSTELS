import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/MainNavigator';
import { useAuthStore } from '../stores/authStore';
import { Spacing, Colors } from '../theme';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    try {
      await login(email, password);
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    } catch (error: any) {
      const message = error.response?.data?.error || 'Login failed. Please try again.';
      Alert.alert('Error', message);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            <Text variant="headlineMedium" style={styles.title}>Welcome Back</Text>
            <Text variant="bodyMedium" style={styles.subtitle}>Sign in to continue</Text>
            
            <View style={styles.form}>
              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                style={styles.input}
              />
              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                secureTextEntry
                style={styles.input}
                right={<TextInput.Icon icon="eye" onPress={() => {}} />}
              />
              
              <TouchableOpacity onPress={() => Alert.alert('Password Reset', 'Please contact support@aohostels.com to reset your password.')}>
                <Text variant="bodySmall" style={styles.forgotPassword}>Forgot Password?</Text>
              </TouchableOpacity>
              
              <Button 
                mode="contained" 
                onPress={handleLogin} 
                style={styles.primaryButton}
                loading={isLoading}
                disabled={isLoading}
                contentStyle={styles.buttonContent}
              >
                Log In
              </Button>
              
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text variant="labelSmall" style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>
              
              <Button 
                mode="outlined" 
                onPress={() => navigation.navigate('Register')}
                style={styles.secondaryButton}
                contentStyle={styles.buttonContent}
              >
                Don't have an account? Sign Up
              </Button>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  content: { flex: 1, paddingHorizontal: Spacing.lg, justifyContent: 'center' },
  title: { textAlign: 'center', marginBottom: Spacing.xs, color: Colors.text.primary },
  subtitle: { textAlign: 'center', marginBottom: Spacing.xxl, color: Colors.text.secondary },
  form: { width: '100%' },
  input: { marginBottom: Spacing.md },
  forgotPassword: { color: Colors.primary, textAlign: 'right', marginBottom: Spacing.lg },
  primaryButton: { marginTop: Spacing.sm, marginBottom: Spacing.lg },
  buttonContent: { paddingVertical: Spacing.xs },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: Spacing.lg },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border.default },
  dividerText: { marginHorizontal: Spacing.md, color: Colors.text.tertiary },
  secondaryButton: { marginBottom: Spacing.lg },
});