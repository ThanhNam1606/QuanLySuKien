import { EventApi } from "@/api/services";
import { AppText as Text } from "@/components/AppText";
import EventCard from "@/components/EventCard";
import FeaturedCard from "@/components/FeaturedCard";
import {
  Button,
  Chip,
  Empty,
  ErrorView,
  Loading,
  SectionTitle,
} from "@/components/ui";
import { useApi } from "@/hooks/useApi";
import { useTheme } from "@/hooks/useTheme";
import { useT } from "@/i18n";
import { useAuth } from "@/store/authStore";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Home() {
  const t = useT();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, cardStyle } = useTheme();
  const user = useAuth((s) => s.user);
  const [categoryId, setCategoryId] = useState<string | undefined>();

  const cats = useApi(EventApi.categories, []);
  const popular = useApi(
    () => EventApi.list({ sort: "popular", limit: 4 }),
    [],
  );
  const list = useApi(() => EventApi.list({ categoryId }), [categoryId]);

  if (list.loading) return <Loading />;
  if (list.error)
    return <ErrorView message={list.error} onRetry={list.retry} />;

  const refresh = () => {
    cats.reload();
    popular.reload();
    list.refresh();
  };

  const grid = cardStyle === "grid";
  const initial = user ? user.name.trim().charAt(0).toUpperCase() : "?";
  const goProfile = () =>
    router.push((user ? "/attendee/profile" : "/(auth)/login") as any);

  return (
    <FlatList
      // numColumns không đổi được khi đang chạy, nên đổi key để FlatList dựng lại khi chuyển Lưới <-> khác.
      key={grid ? "grid" : "single"}
      numColumns={grid ? 2 : 1}
      columnWrapperStyle={grid ? { gap: 12 } : undefined}
      style={{ backgroundColor: colors.bg }}
      data={list.data ?? []}
      keyExtractor={(e) => e.id}
      contentContainerStyle={{
        padding: 16,
        paddingTop: 16 + insets.top,
        gap: 12,
        paddingBottom: 40,
      }}
      refreshControl={
        <RefreshControl refreshing={list.refreshing} onRefresh={refresh} />
      }
      renderItem={({ item }) => <EventCard event={item} variant={cardStyle} />}
      ListEmptyComponent={
        <Empty
          text={t("Chưa có sự kiện phù hợp")}
          hint={t("Thử chọn danh mục khác hoặc quay lại sau.")}
        />
      }
      ListHeaderComponent={
        <View style={{ gap: 16, marginBottom: 4 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flex: 1, gap: 2 }}>
              {!!user && (
                <Text style={{ color: colors.muted, fontSize: 14 }}>
                  {t("Xin chào, {name}", {
                    name: user.name.split(" ").slice(-1)[0],
                  })}
                </Text>
              )}
              <Text
                style={{ fontSize: 28, fontWeight: "800", color: colors.text }}
              >
                {t("Khám phá sự kiện")}
              </Text>
            </View>
            <Pressable
              onPress={goProfile}
              accessibilityRole="button"
              accessibilityLabel={t("Cá nhân")}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: colors.primary,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: colors.onPrimary,
                  fontSize: 18,
                  fontWeight: "800",
                }}
              >
                {initial}
              </Text>
            </Pressable>
          </View>

          <Pressable
            onPress={() => router.push("/attendee/search" as any)}
            accessibilityRole="search"
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              height: 48,
              paddingHorizontal: 16,
              borderRadius: 24,
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ fontSize: 16 }}>🔍</Text>
            <Text style={{ color: colors.placeholder, fontSize: 15 }}>
              {t("Tìm sự kiện, địa điểm…")}
            </Text>
          </Pressable>

          {!user && (
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Button
                title={t("Đăng nhập")}
                small
                onPress={() => router.push("/(auth)/login" as any)}
                style={{ flex: 1 }}
              />
              <Button
                title={t("Tạo tài khoản")}
                small
                variant="outline"
                onPress={() => router.push("/(auth)/register" as any)}
                style={{ flex: 1 }}
              />
            </View>
          )}

          {!!popular.data?.length && (
            <View style={{ gap: 10 }}>
              <SectionTitle>{t("Nổi bật")}</SectionTitle>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 12 }}
              >
                {popular.data.map((e) => (
                  <FeaturedCard key={e.id} event={e} />
                ))}
              </ScrollView>
            </View>
          )}

          <View style={{ gap: 10 }}>
            <SectionTitle>{t("Sắp diễn ra")}</SectionTitle>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              <Chip
                label={t("Tất cả")}
                active={!categoryId}
                onPress={() => setCategoryId(undefined)}
              />
              {cats.data?.map((c) => (
                <Chip
                  key={c.id}
                  label={`${c.icon} ${c.name}`}
                  active={categoryId === c.id}
                  onPress={() => setCategoryId(c.id)}
                />
              ))}
            </ScrollView>
          </View>
        </View>
      }
    />
  );
}
