import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { resetPassword } from '@/services/auth.service';
import { validateEmail } from '@/utils/validators';
import { COLORS, FONT_SIZES, SPACING } from '@/config/constants';
import type { AuthStackParamList } from '@/types/navigation.types';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleReset() {
    const err = validateEmail(email);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await resetPassword(email.trim());
      setSent(true);
    } catch (e: any) {
      setError(e.message ?? 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenWrapper scrollable>
      <View style={styles.container}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          Enter your email address and we'll send you a link to reset your
          password.
        </Text>

        {sent ? (
          <View style={styles.successBox}>
            <Text style={styles.successText}>
              Check your email for a password reset link.
            </Text>
            <Button
              label="Back to Sign In"
              onPress={() => navigation.navigate('Login')}
              variant="ghost"
              style={styles.backBtn}
            />
          </View>
        ) : (
          <>
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="you@example.com"
              error={error}
            />
            <Button
              label="Send Reset Link"
              onPress={handleReset}
              loading={loading}
              fullWidth
            />
          </>
        )}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.lg,
    paddingTop: SPACING.xxl,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  successBox: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  successText: {
    color: COLORS.success,
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
    lineHeight: 22,
  },
  backBtn: {
    marginTop: SPACING.lg,
  },
});
