import { useCallback, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useFocusEffect } from 'expo-router';
import { OrganizerApi } from '@/api/services';
import { Button, Card, Input, Page } from '@/components/ui';
import { colors } from '@/constants/theme';
import { fmtTime } from '@/utils/format';

type Result = { ok: true; name: string; event: string; code: string; at: string } | { ok: false; message: string };

export default function Scan() {
  const [permission, requestPermission] = useCameraPermissions();
  const [active, setActive] = useState(true);
  const [busy, setBusy] = useState(false);
  const [manual, setManual] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const last = useRef({ code: '', at: 0 });

  // Chỉ bật camera khi đang ở tab này
  useFocusEffect(
    useCallback(() => {
      setActive(true);
      return () => setActive(false);
    }, []),
  );

  const submit = async (raw: string) => {
    const code = raw.trim().toUpperCase();
    if (!code || busy) return;
    const now = Date.now();
    if (last.current.code === code && now - last.current.at < 3000) return; // chống quét lặp liên tục
    last.current = { code, at: now };
    setBusy(true);
    try {
      const r = await OrganizerApi.checkin(code);
      setResult({ ok: true, name: r.userName, event: r.eventTitle, code: r.code, at: r.checkedInAt });
      setManual('');
    } catch (e: any) {
      setResult({ ok: false, message: e.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page>
      {!permission ? null : !permission.granted ? (
        <Card style={{ alignItems: 'center', gap: 12 }}>
          <Text style={{ textAlign: 'center', color: colors.text }}>Cho phép dùng camera để quét mã QR trên vé của người tham gia.</Text>
          <Button title="Cho phép camera" onPress={requestPermission} />
        </Card>
      ) : (
        <View style={{ height: 300, borderRadius: 16, overflow: 'hidden', backgroundColor: '#000' }}>
          {active && (
            <CameraView
              style={{ flex: 1 }}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={({ data }) => submit(data)}
            />
          )}
        </View>
      )}

      {result && (
        <Card style={{ backgroundColor: result.ok ? colors.successSoft : colors.dangerSoft, borderColor: result.ok ? colors.successSoft : colors.dangerSoft }}>
          {result.ok ? (
            <>
              <Text style={{ fontSize: 17, fontWeight: '800', color: colors.success }}>✓ Điểm danh thành công</Text>
              <Text style={{ color: colors.text, fontWeight: '700' }}>{result.name}</Text>
              <Text style={{ color: colors.text }}>{result.event}</Text>
              <Text style={{ color: colors.muted }}>Mã vé {result.code} · lúc {fmtTime(result.at)}</Text>
            </>
          ) : (
            <>
              <Text style={{ fontSize: 17, fontWeight: '800', color: colors.danger }}>✕ Không hợp lệ</Text>
              <Text style={{ color: colors.danger }}>{result.message}</Text>
            </>
          )}
        </Card>
      )}

      <Card style={{ gap: 10 }}>
        <Text style={{ fontWeight: '800', color: colors.text }}>Nhập mã vé thủ công</Text>
        <Input value={manual} onChangeText={setManual} placeholder="VD: EVT-A1B2C3" autoCapitalize="characters" />
        <Button title="Điểm danh" variant="outline" onPress={() => submit(manual)} loading={busy} disabled={!manual.trim()} />
        <Text style={{ color: colors.muted, fontSize: 12 }}>
          Mã mẫu để thử: EVT-K1L2M3 (Hội thảo AI), EVT-R7S8T9 (Ngày hội việc làm).
        </Text>
      </Card>
    </Page>
  );
}
