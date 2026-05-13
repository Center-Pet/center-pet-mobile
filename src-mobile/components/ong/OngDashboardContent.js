import React, { useEffect, useMemo, useState } from "react";
import { Pressable, RefreshControl, ScrollView, Text, View, useWindowDimensions } from "react-native";
import TopNavBar from "../layout/TopNavBar";
import AppButton from "../ui/AppButton";
import PinkCard from "../ui/PinkCard";
import { ROUTES } from "../../navigation/routeNames";
import { buildOngDashboardModel } from "../../utils/buildOngDashboardModel";

const BRAND = "#D14D72";
const CARD_BG = "#FEF2F4";
const GREEN = "#4CAF50";
const RED = "#FF3030";
const BLUE = "#060FF0";

function TotalInfoCard({ label, value }) {
  return (
    <View
      className="mb-3 min-w-[46%] flex-1 rounded-[10px] p-3"
      style={{
        backgroundColor: CARD_BG,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4
      }}
    >
      <Text className="text-center text-sm font-semibold" style={{ color: BRAND }}>
        {label}
      </Text>
      <Text className="mt-1 text-center text-3xl font-bold" style={{ color: BRAND }}>
        {value}
      </Text>
    </View>
  );
}

function MonthBars({ title, approved, rejected, completed }) {
  const months = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
  const COL_H = 100;
  const totals = approved.map((a, i) => (a || 0) + (rejected[i] || 0) + (completed[i] || 0));
  const maxT = Math.max(1, ...totals);

  return (
    <PinkCard className="mb-3" style={{ backgroundColor: CARD_BG }}>
      <Text className="mb-3 text-center text-base font-bold text-[#3E3540]">{title}</Text>
      <View className="flex-row items-end justify-between px-1" style={{ height: COL_H + 24 }}>
        {months.map((m, i) => {
          const a = approved[i] || 0;
          const r = rejected[i] || 0;
          const c = completed[i] || 0;
          const t = a + r + c;
          const colH = (t / maxT) * COL_H;
          const ha = t > 0 ? (a / t) * colH : 0;
          const hr = t > 0 ? (r / t) * colH : 0;
          const hc = t > 0 ? (c / t) * colH : 0;
          return (
            <View key={`adoptions-month-${i}`} className="mx-0.5 flex-1 items-center">
              <View style={{ height: COL_H, width: "100%", justifyContent: "flex-end", alignItems: "center" }}>
                <View
                  style={{
                    height: Math.max(colH, 2),
                    width: "78%",
                    borderRadius: 4,
                    overflow: "hidden",
                    flexDirection: "column-reverse"
                  }}
                >
                  <View style={{ height: ha, backgroundColor: GREEN }} />
                  <View style={{ height: hr, backgroundColor: RED }} />
                  <View style={{ height: hc, backgroundColor: BLUE }} />
                </View>
              </View>
              <Text className="mt-1 text-[9px] text-[#6B5A64]">{m}</Text>
            </View>
          );
        })}
      </View>
      <View className="mt-2 flex-row flex-wrap justify-center gap-3">
        <View className="flex-row items-center">
          <View className="mr-1 h-2 w-2 rounded-full" style={{ backgroundColor: GREEN }} />
          <Text className="text-[10px] text-[#4C3A42]">Aprovadas</Text>
        </View>
        <View className="flex-row items-center">
          <View className="mr-1 h-2 w-2 rounded-full" style={{ backgroundColor: RED }} />
          <Text className="text-[10px] text-[#4C3A42]">Rejeitadas</Text>
        </View>
        <View className="flex-row items-center">
          <View className="mr-1 h-2 w-2 rounded-full" style={{ backgroundColor: BLUE }} />
          <Text className="text-[10px] text-[#4C3A42]">Concluidas</Text>
        </View>
      </View>
    </PinkCard>
  );
}

function RescueBars({ title, monthlyRescues }) {
  const max = Math.max(1, ...monthlyRescues);
  const months = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
  const COL_H = 100;
  return (
    <PinkCard className="mb-3" style={{ backgroundColor: CARD_BG }}>
      <Text className="mb-3 text-center text-base font-bold text-[#3E3540]">{title}</Text>
      <View className="flex-row items-end justify-between px-1" style={{ height: COL_H + 24 }}>
        {months.map((m, i) => {
          const v = monthlyRescues[i] || 0;
          const barH = max > 0 ? (v / max) * COL_H : 0;
          return (
            <View key={`rescues-month-${i}`} className="mx-0.5 flex-1 items-center">
              <View style={{ height: COL_H, width: "100%", justifyContent: "flex-end", alignItems: "center" }}>
                <View
                  style={{
                    height: Math.max(barH, v > 0 ? 4 : 2),
                    width: "70%",
                    backgroundColor: BRAND,
                    borderTopLeftRadius: 5,
                    borderTopRightRadius: 5
                  }}
                />
              </View>
              <Text className="mt-1 text-[9px] text-[#6B5A64]">{m}</Text>
            </View>
          );
        })}
      </View>
    </PinkCard>
  );
}

function DistributionCard({ title, mapObj, colors }) {
  const entries = Object.entries(mapObj || {}).filter(([, v]) => v > 0);
  const max = Math.max(1, ...entries.map(([, v]) => v));
  if (!entries.length) {
    return (
      <PinkCard className="mb-3" style={{ backgroundColor: CARD_BG }}>
        <Text className="mb-2 text-center text-base font-bold text-[#3E3540]">{title}</Text>
        <Text className="text-center text-sm text-textMuted">Sem dados</Text>
      </PinkCard>
    );
  }
  return (
    <PinkCard className="mb-3" style={{ backgroundColor: CARD_BG }}>
      <Text className="mb-3 text-center text-base font-bold text-[#3E3540]">{title}</Text>
      {entries.map(([label, value], idx) => (
        <View key={label} className="mb-2">
          <View className="mb-1 flex-row justify-between">
            <Text className="flex-1 pr-2 text-xs text-[#3E3540]" numberOfLines={1}>
              {label}
            </Text>
            <Text className="text-xs font-bold text-brand">{value}</Text>
          </View>
          <View className="h-2 overflow-hidden rounded-full bg-white">
            <View
              className="h-2 rounded-full"
              style={{
                width: `${Math.round((value / max) * 100)}%`,
                backgroundColor: colors[idx % colors.length]
              }}
            />
          </View>
        </View>
      ))}
    </PinkCard>
  );
}

const DOUGH_COLORS = [BRAND, "rgb(255, 217, 0)", "rgb(0, 110, 255)", "rgb(0, 124, 37)", "#9E9E9E", "#FFA726"];

/**
 * Dashboard ONG com layout inspirado no web (Dashboard.module.css): cards rosa, sombras, blocos de graficos.
 */
export default function OngDashboardContent({
  navigation,
  ong,
  pets,
  adoptions,
  user,
  refreshing,
  onRefresh,
  showFooterNav = true,
  activeTab = "home"
}) {
  const { width } = useWindowDimensions();
  const defaultYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(defaultYear);

  const model = useMemo(() => buildOngDashboardModel(pets, adoptions, selectedYear), [pets, adoptions, selectedYear]);

  const years = model.availableYears.length ? model.availableYears : [defaultYear];

  useEffect(() => {
    const { availableYears } = buildOngDashboardModel(pets, adoptions, selectedYear);
    if (availableYears.length && !availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[0]);
    }
    // Ajusta ano quando chegam pets/adocoes; nao depende só de selectedYear para evitar loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- selectedYear lido no fechamento
  }, [pets, adoptions]);

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      refreshControl={onRefresh ? <RefreshControl refreshing={Boolean(refreshing)} onRefresh={onRefresh} /> : null}
      contentContainerStyle={{ paddingBottom: 32 }}
      keyboardShouldPersistTaps="handled"
    >
      <TopNavBar navigation={navigation} activeTab={activeTab} />
      <View className="mb-4 rounded-[10px] border-2 border-[#F1C9D6] bg-white px-3 py-4" style={{ maxWidth: width }}>
        <Text className="text-center text-xl font-bold" style={{ color: BRAND }}>
          Dashboard da ONG
        </Text>
        <Text className="mt-1 text-center text-sm text-[#6B5A64]">
          {ong?.name || user?.name || "Sua organizacao"} — indicadores como no painel web
        </Text>
      </View>

      <View className="mb-2 flex-row flex-wrap justify-between">
        <TotalInfoCard label="Numero de pets" value={model.totalPets} />
        <TotalInfoCard label="Pets especiais" value={model.specialPets} />
        <TotalInfoCard label="Pets castrados" value={model.castratedPets} />
        <TotalInfoCard label="Pets vermifugados" value={model.dewormedPets} />
        <TotalInfoCard label="Pets vacinados" value={model.vaccinatedPets} />
      </View>

      <View className="mb-3 flex-row flex-wrap items-center justify-center gap-2">
        <Text className="text-sm font-semibold text-[#4C3A42]">Ano:</Text>
        {years.map((y) => (
          <Pressable
            key={y}
            onPress={() => setSelectedYear(y)}
            className="rounded-lg border-2 px-3 py-1"
            style={{
              borderColor: BRAND,
              backgroundColor: selectedYear === y ? BRAND : "#fff"
            }}
          >
            <Text className="text-sm font-semibold" style={{ color: selectedYear === y ? "#fff" : BRAND }}>
              {y}
            </Text>
          </Pressable>
        ))}
      </View>

      <MonthBars
        title="Adocoes por mes (aprovadas / rejeitadas / concluidas)"
        approved={model.monthlyAdoptions.approved}
        rejected={model.monthlyAdoptions.rejected}
        completed={model.monthlyAdoptions.completed}
      />

      <RescueBars title="Pets registrados por mes (resgates)" monthlyRescues={model.monthlyRescues} />

      <DistributionCard title="Especies de pets" mapObj={model.petsByType} colors={DOUGH_COLORS} />
      <DistributionCard title="Status dos pets" mapObj={model.petsByStatus} colors={["#D14D72", "#4CAF50", "#FFA726", "#9E9E9E"]} />
      <DistributionCard title="Pets por idade" mapObj={model.petsByAge} colors={DOUGH_COLORS} />

      {showFooterNav ? (
        <View className="mt-2 gap-2">
          <AppButton title="Area da ONG (pets e solicitacoes)" onPress={() => navigation.navigate(ROUTES.HomeOng)} />
          <AppButton title="Cadastrar pet" variant="secondary" onPress={() => navigation.navigate(ROUTES.RegisterPet)} />
          <AppButton title="Perfil publico da ONG" variant="secondary" onPress={() => navigation.navigate(ROUTES.OngProfile, { ongId: user?._id, ongSlug: ong?.slug })} />
          <AppButton title="Catalogo publico" variant="secondary" onPress={() => navigation.navigate(ROUTES.Catalog)} />
        </View>
      ) : null}
    </ScrollView>
  );
}
