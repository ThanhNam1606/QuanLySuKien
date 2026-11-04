import { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '@/components/BackButton';
import LanguageSwitch from '@/components/LanguageSwitch';
import { colors } from '@/constants/theme';

type Props = { title: string; subtitle?: string; children: ReactNode; /** Hiện mũi tên quay lại ở góc trên bên trái. */ back?: boolean };

export default function AuthShell({ title, subtitle, children, back }: Props) {
  const router = useRouter();
  // Có trang trước thì quay lại; mở thẳng vào trang này (không có trang trước) thì về trang chủ cho khách.
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/attendee' as any));
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24, gap: 14 }} keyboardShouldPersistTaps="handled">
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            {back ? (
              <BackButton onPress={goBack} />
            ) : (
              <View />
            )}
            <LanguageSwitch />
          </View>
          <View style={{ marginBottom: 8, gap: 6 }}>
            <Text style={{ fontSize: 30, fontWeight: '800', color: colors.primaryDark }}>{title}</Text>
            {!!subtitle && <Text style={{ fontSize: 15, color: colors.muted }}>{subtitle}</Text>}
          </View>
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
