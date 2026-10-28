import { ReactNode, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { colors, radius, statusMeta } from '@/constants/theme';
import { EventStatus } from '@/types';

// ---------------- Button ----------------
interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'outline' | 'danger' | 'ghost' | 'soft';
  loading?: boolean;
  disabled?: boolean;
  small?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({ title, onPress, variant = 'primary', loading, disabled, small, style }: ButtonProps) {
  const v = buttonVariants[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        s.btn,
        small && s.btnSmall,
        { backgroundColor: v.bg, borderColor: v.border },
        (disabled || loading) && { opacity: 0.55 },
        pressed && { opacity: 0.8 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} size="small" />
      ) : (
        <Text style={[s.btnText, small && { fontSize: 13 }, { color: v.fg }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const buttonVariants = {
  primary: { bg: colors.primary, fg: '#fff', border: colors.primary },
  outline: { bg: 'transparent', fg: colors.primary, border: colors.primary },
  danger: { bg: colors.danger, fg: '#fff', border: colors.danger },
  ghost: { bg: 'transparent', fg: colors.muted, border: 'transparent' },
  soft: { bg: colors.primarySoft, fg: colors.primaryDark, border: colors.primarySoft },
};

// ---------------- Input ----------------
interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, style, ...props }: InputProps) {
  return (
    <View style={{ gap: 6 }}>
      {!!label && <Text style={s.label}>{label}</Text>}
      <TextInput
        placeholderTextColor="#98a2a0"
        {...props}
        style={[s.input, props.multiline && { minHeight: 90, textAlignVertical: 'top' }, !!error && { borderColor: colors.danger }, style]}
      />
      {!!error && <Text style={s.error}>{error}</Text>}
    </View>
  );
}

// ---------------- Chip / Badge ----------------
export function Chip({ label, active, onPress }: { label: string; active?: boolean; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={[s.chip, active && s.chipActive]}>
      <Text style={[s.chipText, active && { color: '#fff' }]}>{label}</Text>
    </Pressable>
  );
}

export function Badge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <View style={[s.badge, { backgroundColor: bg }]}>
      <Text style={[s.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

export function StatusBadge({ status }: { status: EventStatus }) {
  const m = statusMeta[status];
  return <Badge label={m.label} color={m.color} bg={m.bg} />;
}

// ---------------- Trạng thái màn hình ----------------
export function Loading() {
  return (
    <View style={s.center}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

export function Empty({ text, hint }: { text: string; hint?: string }) {
  return (
    <View style={s.center}>
      <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, textAlign: 'center' }}>{text}</Text>
      {!!hint && <Text style={{ color: colors.muted, textAlign: 'center', marginTop: 4 }}>{hint}</Text>}
    </View>
  );
}

export function ErrorView({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={s.center}>
      <Text style={{ color: colors.danger, textAlign: 'center', marginBottom: 12 }}>{message}</Text>
      {onRetry && <Button title="Thử lại" variant="outline" small onPress={onRetry} />}
    </View>
  );
}

// ---------------- Bố cục ----------------
export function Page({
  children,
  refreshing,
  onRefresh,
  gap = 14,
}: {
  children: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  gap?: number;
}) {
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 16, gap, paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
      refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} /> : undefined}
    >
      {children}
    </ScrollView>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[s.card, style]}>{children}</View>;
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <Text style={s.sectionTitle}>{children}</Text>;
}

export function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <View style={{ flexDirection: 'row', gap: 10 }}>
      <Text style={{ width: 96, color: colors.muted }}>{label}</Text>
      <Text style={{ flex: 1, color: colors.text, fontWeight: '500' }}>{value}</Text>
    </View>
  );
}

export function StatBox({ label, value, tone }: { label: string; value: string | number; tone?: 'warn' | 'good' }) {
  const fg = tone === 'warn' ? colors.warning : tone === 'good' ? colors.success : colors.primaryDark;
  return (
    <View style={s.stat}>
      <Text style={{ fontSize: 26, fontWeight: '800', color: fg }}>{value}</Text>
      <Text style={{ color: colors.muted, fontSize: 13 }}>{label}</Text>
    </View>
  );
}

export function ProgressBar({ value, max, color = colors.primary }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <View style={{ height: 8, borderRadius: 4, backgroundColor: colors.neutralSoft, overflow: 'hidden' }}>
      <View style={{ width: `${pct}%`, height: 8, backgroundColor: color }} />
    </View>
  );
}

// ---------------- Hộp nhập nội dung (thay Alert.prompt) ----------------
export function PromptModal({
  visible,
  title,
  placeholder,
  submitLabel = 'Gửi',
  initialValue = '',
  onCancel,
  onSubmit,
}: {
  visible: boolean;
  title: string;
  placeholder?: string;
  submitLabel?: string;
  initialValue?: string;
  onCancel: () => void;
  onSubmit: (text: string) => Promise<void> | void;
}) {
  const [text, setText] = useState(initialValue);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (visible) setText(initialValue);
  }, [visible, initialValue]);

  const submit = async () => {
    if (!text.trim()) return;
    setBusy(true);
    try {
      await onSubmit(text.trim());
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={s.overlay}>
        <View style={s.modal}>
          <Text style={{ fontSize: 17, fontWeight: '700', color: colors.text }}>{title}</Text>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={placeholder}
            placeholderTextColor="#98a2a0"
            multiline
            autoFocus
            style={[s.input, { minHeight: 90, textAlignVertical: 'top' }]}
          />
          <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'flex-end' }}>
            <Button title="Hủy" variant="ghost" small onPress={onCancel} />
            <Button title={submitLabel} small loading={busy} disabled={!text.trim()} onPress={submit} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  btn: {
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1.5,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSmall: { minHeight: 38, paddingHorizontal: 14, borderRadius: radius.sm },
  btnText: { fontSize: 15, fontWeight: '700' },
  label: { fontSize: 13, fontWeight: '600', color: colors.text },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
  },
  error: { color: colors.danger, fontSize: 12 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.text },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, alignSelf: 'flex-start' },
  badgeText: { fontSize: 12, fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: colors.bg },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: colors.text },
  stat: {
    flexGrow: 1,
    flexBasis: '45%',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 24 },
  modal: { backgroundColor: '#fff', borderRadius: radius.lg, padding: 18, gap: 14 },
});
