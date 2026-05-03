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
  const { register, isLoading } = useAuthStore();

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }

    try {
      await register({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
      });
      Alert.alert('Success', 'Registration successful! Welcome to A&O!');
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      Alert.alert('Error', errorMessage);
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
                  onChangeText={setFirstName}
                  mode="outlined"
                  style={[styles.input, styles.halfInput]}
                />
                <TextInput
                  label="Last Name *"
                  value={lastName}
                  onChangeText={setLastName}
                  mode="outlined"
                  style={[styles.input, styles.halfInput]}
                />
              </View>
              
              <TextInput
                label="Email *"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                style={styles.input}
              />
              
              <TextInput
                label="Password *"
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                secureTextEntry={!showPassword}
                right={<TextInput.Icon icon={showPassword ? "eye-off" : "eye"} onPress={() => setShowPassword(!showPassword)} />}
                style={styles.input}
              >
                <HelperText type="info" visible={password.length > 0 && password.length < 8}>
                  Password must be at least 8 characters
                </HelperText>
              </TextInput>
              
              <TextInput
                label="Confirm Password *"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                mode="outlined"
                secureTextEntry={!showPassword}
                style={styles.input}
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