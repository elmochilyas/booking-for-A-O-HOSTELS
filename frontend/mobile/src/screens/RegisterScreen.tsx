import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/MainNavigator';
import { useAuthStore } from '../stores/authStore';
import { Spacing, Colors } from '../theme';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Register'>;
};

export default function RegisterScreen({ navigation }: Props) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const { register, isLoading } = useAuthStore();

  const handleFirstNameChange = (text: string) => {
    setFirstName(text);
    if (firstNameError) setFirstNameError('');
  };

  const handleLastNameChange = (text: string) => {
    setLastName(text);
    if (lastNameError) setLastNameError('');
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (emailError) setEmailError('');
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (passwordError) setPasswordError('');
    if (confirmPasswordError && text === confirmPassword) setConfirmPasswordError('');
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    if (confirmPasswordError) setConfirmPasswordError('');
  };

  const handleRegister = async () => {
    let hasError = false;

    if (!firstName) {
      setFirstNameError('First name is required');
      hasError = true;
    }

    if (!lastName) {
      setLastNameError('Last name is required');
      hasError = true;
    }

    if (!email) {
      setEmailError('Email is required');
      hasError = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email');
      hasError = true;
    }

    if (!password) {
      setPasswordError('Password is required');
      hasError = true;
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      hasError = true;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      hasError = true;
    }

    if (hasError) return;

    try {
      await register({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
      });
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed. Please try again.';
      setPasswordError(errorMessage);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            <Text variant="headlineMedium" style={styles.title}>Create Account</Text>
            <Text variant="bodyMedium" style={styles.subtitle}>Join us for a great stay</Text>
            
            <View style={styles.form}>
              <View style={styles.row}>
                <TextInput
                  label="First Name *"
                  value={firstName}
                  onChangeText={handleFirstNameChange}
                  mode="outlined"
                  style={[styles.input, styles.halfInput]}
                  error={!!firstNameError}
                  helperText={firstNameError}
                />
                <TextInput
                  label="Last Name *"
                  value={lastName}
                  onChangeText={handleLastNameChange}
                  mode="outlined"
                  style={[styles.input, styles.halfInput]}
                  error={!!lastNameError}
                  helperText={lastNameError}
                />
              </View>
              
              <TextInput
                label="Email *"
                value={email}
                onChangeText={handleEmailChange}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                style={styles.input}
                error={!!emailError}
                helperText={emailError}
              />
              
              <TextInput
                label="Password *"
                value={password}
                onChangeText={handlePasswordChange}
                mode="outlined"
                secureTextEntry={!showPassword}
                right={<TextInput.Icon icon={showPassword ? "eye-off" : "eye"} onPress={() => setShowPassword(!showPassword)} />}
                style={styles.input}
                error={!!passwordError}
                helperText={passwordError}
              >
                <HelperText type="info" visible={password.length > 0 && password.length < 8}>
                  Password must be at least 8 characters
                </HelperText>
              </TextInput>
              
              <TextInput
                label="Confirm Password *"
                value={confirmPassword}
                onChangeText={handleConfirmPasswordChange}
                mode="outlined"
                secureTextEntry={!showPassword}
                style={styles.input}
                error={!!confirmPasswordError}
                helperText={confirmPasswordError}
              />
              
              <HelperText type="error" visible={confirmPassword.length > 0 && password !== confirmPassword}>
                Passwords do not match
              </HelperText>
              
              <Button
                mode="contained"
                onPress={handleRegister}
                style={styles.primaryButton}
                loading={isLoading}
                disabled={isLoading}
                contentStyle={styles.buttonContent}
              >
                Sign Up
              </Button>
              
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text variant="labelSmall" style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>
              
              <Button
                mode="outlined"
                onPress={() => navigation.replace('Login')}
                style={styles.secondaryButton}
                contentStyle={styles.buttonContent}
              >
                Already have an account? Log In
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
  content: { flex: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.xxl },
  title: { textAlign: 'center', marginBottom: Spacing.xs, color: Colors.text.primary },
  subtitle: { textAlign: 'center', marginBottom: Spacing.xl, color: Colors.text.secondary },
  form: { width: '100%' },
  row: { flexDirection: 'row', gap: Spacing.md },
  halfInput: { flex: 1 },
  input: { marginBottom: Spacing.md },
  primaryButton: { marginTop: Spacing.sm, marginBottom: Spacing.lg },
  buttonContent: { paddingVertical: Spacing.xs },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: Spacing.lg },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border.default },
  dividerText: { marginHorizontal: Spacing.md, color: Colors.text.tertiary },
  secondaryButton: { marginBottom: Spacing.lg },
});