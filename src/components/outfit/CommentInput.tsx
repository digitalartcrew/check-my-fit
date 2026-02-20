import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, LIMITS, SPACING } from '@/config/constants';

interface CommentInputProps {
  onSubmit: (text: string) => Promise<void>;
}

export function CommentInput({ onSubmit }: CommentInputProps) {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const remaining = LIMITS.MAX_COMMENT_LENGTH - text.length;
  const canSubmit = text.trim().length > 0 && !submitting;

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await onSubmit(text.trim());
      setText('');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Add a comment..."
        placeholderTextColor={COLORS.textTertiary}
        value={text}
        onChangeText={setText}
        maxLength={LIMITS.MAX_COMMENT_LENGTH}
        multiline
        returnKeyType="send"
        onSubmitEditing={handleSubmit}
        selectionColor={COLORS.primary}
      />
      {remaining < 100 && (
        <Text style={[styles.counter, remaining < 20 && styles.counterWarn]}>
          {remaining}
        </Text>
      )}
      <TouchableOpacity
        onPress={handleSubmit}
        disabled={!canSubmit}
        style={[styles.sendBtn, !canSubmit && styles.sendDisabled]}
      >
        <Ionicons
          name="send"
          size={20}
          color={canSubmit ? COLORS.primary : COLORS.textTertiary}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  input: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.md,
    maxHeight: 100,
    paddingVertical: SPACING.sm,
  },
  counter: {
    color: COLORS.textTertiary,
    fontSize: FONT_SIZES.xs,
    alignSelf: 'center',
  },
  counterWarn: {
    color: COLORS.warning,
  },
  sendBtn: {
    padding: SPACING.sm,
    alignSelf: 'flex-end',
  },
  sendDisabled: {
    opacity: 0.5,
  },
});
