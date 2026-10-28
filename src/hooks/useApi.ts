import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';

/**
 * Tải dữ liệu khi màn hình được mở và tải lại mỗi lần quay về màn hình (focus).
 * - loading: chỉ true ở lần tải đầu tiên
 * - refreshing: dùng cho kéo để làm mới (RefreshControl)
 */
export function useApi<T>(fetcher: () => Promise<T>, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const reqId = useRef(0);

  const run = useCallback(async () => {
    const id = ++reqId.current;
    try {
      const result = await fetcher();
      if (id !== reqId.current) return; // bỏ kết quả cũ
      setData(result);
      setError('');
    } catch (e: any) {
      if (id !== reqId.current) return;
      setError(e.message ?? 'Đã có lỗi xảy ra');
    } finally {
      if (id === reqId.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useFocusEffect(
    useCallback(() => {
      run();
    }, [run]),
  );

  const refresh = useCallback(() => {
    setRefreshing(true);
    run();
  }, [run]);

  const retry = useCallback(() => {
    setLoading(true);
    run();
  }, [run]);

  return { data, setData, loading, refreshing, error, refresh, retry, reload: run };
}
