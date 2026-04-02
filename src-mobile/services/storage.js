import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  USER: "user",
  TOKEN: "token",
  USER_TYPE: "userType"
};

export async function saveAuthSession(user, token, userType) {
  await AsyncStorage.multiSet([
    [KEYS.USER, JSON.stringify(user)],
    [KEYS.TOKEN, token],
    [KEYS.USER_TYPE, userType]
  ]);
}

export async function loadAuthSession() {
  const values = await AsyncStorage.multiGet([KEYS.USER, KEYS.TOKEN, KEYS.USER_TYPE]);
  const mapped = Object.fromEntries(values);

  if (!mapped[KEYS.USER] || !mapped[KEYS.TOKEN]) {
    return null;
  }

  return {
    user: JSON.parse(mapped[KEYS.USER]),
    token: mapped[KEYS.TOKEN],
    userType: mapped[KEYS.USER_TYPE] || null
  };
}

export async function clearAuthSession() {
  await AsyncStorage.multiRemove([KEYS.USER, KEYS.TOKEN, KEYS.USER_TYPE]);
}
