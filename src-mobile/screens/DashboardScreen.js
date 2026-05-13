import React from "react";
import AppScreen from "../components/ui/AppScreen";
import LoadingView from "../components/ui/LoadingView";
import OngDashboardContent from "../components/ong/OngDashboardContent";
import { useAuth } from "../hooks/useAuth";
import { useAsyncTask } from "../hooks/useAsyncTask";
import { getAdoptionsByOng } from "../services/adoptionService";
import { getOngById } from "../services/ongService";
import { getPetsByOng } from "../services/petService";

export default function DashboardScreen({ navigation }) {
  const { user, token } = useAuth();
  const { data, loading, reload } = useAsyncTask(async () => {
    if (!user?._id || !token) {
      return { pets: [], adoptions: [], ong: null };
    }
    let ong = null;
    try {
      ong = await getOngById(user._id, token);
    } catch {
      ong = null;
    }
    const [pets, adoptions] = await Promise.all([
      getPetsByOng(user._id, token),
      getAdoptionsByOng(user._id, token)
    ]);
    return { pets, adoptions, ong };
  }, [token, user?._id]);

  if (loading && data == null) return <LoadingView />;

  return (
    <AppScreen navigation={navigation} activeTab="form" showTopNav={false}>
      <OngDashboardContent
        navigation={navigation}
        activeTab="form"
        ong={data?.ong}
        pets={data?.pets || []}
        adoptions={data?.adoptions || []}
        user={user}
        refreshing={Boolean(loading && data)}
        onRefresh={() => reload().catch(() => {})}
        showFooterNav
      />
    </AppScreen>
  );
}
