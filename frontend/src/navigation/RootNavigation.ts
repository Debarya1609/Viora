// src/navigation/RootNavigation.ts
import { createNavigationContainerRef } from "@react-navigation/native";
import { RootStackParamList } from "./RootNavigator";

export const rootNavigationRef =
  createNavigationContainerRef<RootStackParamList>();

export function navigateRoot(
  name: keyof RootStackParamList,
  params?: RootStackParamList[keyof RootStackParamList]
) {
  if (rootNavigationRef.isReady()) {
    // fully relax types here
    (rootNavigationRef.navigate as any)(name, params);
  }
}
