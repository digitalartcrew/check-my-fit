import React, { useEffect, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { signUp, isUsernameAvailable } from '@/services/auth.service';
import {
  validateEmail,
  validatePassword,
  validateUsername,
} from '@/utils/validators';
import { COLORS, FONT_SIZES, SPACING } from '@/config/constants';
import type { AuthStackParamList } from '@/types/navigation.types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!username || validateUsername(username)) {
      setUsernameAvailable(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const available = await isUsernameAvailable(username);
        setUsernameAvailable(available);
      } catch {
        // If check fails (e.g. no network), optimistically allow proceeding
        setUsernameAvailable(true);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [username]);

  async function handleRegister() {
    const errs: Record<string, string> = {};
    const nameErr = displayName.trim() ? null : 'Name is required';
    const userErr = validateUsername(username);
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);

    if (nameErr) errs.displayName = nameErr;
    if (userErr) errs.username = userErr;
    if (usernameAvailable === false) errs.username = 'Username is already taken';
    if (emailErr) errs.email = emailErr;
    if (passErr) errs.password = passErr;

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    // If still checking, do it inline now
    if (!userErr && usernameAvailable === null) {
      setLoading(true);
      try {
        const available = await isUsernameAvailable(username);
        if (!available) {
          setErrors({ username: 'Username is already taken' });
          setLoading(false);
          return;
        }
        setUsernameAvailable(true);
      } catch {
        // Proceed optimistically if check fails
      }
      setLoading(false);
    }

    setErrors({});
    setLoading(true);
    try {
      await signUp(email.trim(), password, username.trim(), displayName.trim());
    } catch (e: any) {
      Alert.alert('Registration Failed', e.message ?? 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  const usernameHint =
    usernameAvailable === true
      ? '✓ Available'
      : usernameAvailable === false
      ? 'Already taken'
      : '';

  return (
    <ScreenWrapper scrollable>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join the community</Text>
        </View>

        <Input
          label="Display Name"
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="How you appear to others"
          error={errors.displayName}
        />
        <View>
          <Input
            label="Username"
            value={username}
            onChangeText={(t) => setUsername(t.toLowerCase())}
            autoCapitalize="none"
            placeholder="unique_handle"
            error={errors.username}
          />
          {usernameHint ? (
            <Text
              style={[
                styles.usernameHint,
                usernameAvailable ? styles.hintGood : styles.hintBad,
              ]}
            >
              {usernameHint}
            </Text>
          ) : null}
        </View>
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="you@example.com"
          error={errors.email}
        />
        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          showPasswordToggle
          placeholder="At least 6 characters"
          error={errors.password}
        />

        <Button
          label="Create Account"
          onPress={handleRegister}
          loading={loading}
          fullWidth
          style={styles.submitBtn}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
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
  header: {
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  usernameHint: {
    fontSize: FONT_SIZES.xs,
    marginTop: -SPACING.sm,
    marginBottom: SPACING.sm,
    marginLeft: 2,
  },
  hintGood: {
    color: COLORS.success,
  },
  hintBad: {
    color: COLORS.error,
  },
  submitBtn: {
    marginTop: SPACING.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.xl,
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.md,
  },
  footerLink: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
});
