/**
 * Type declarations for @react-native-community/netinfo
 * This module provides network connectivity information
 */

declare module '@react-native-community/netinfo' {
  export interface NetInfoState {
    type: string;
    isConnected: boolean | null;
    isInternetReachable: boolean | null;
    details: unknown;
  }

  export interface NetInfoConfiguration {
    reachabilityUrl?: string;
    reachabilityTest?: (response: Response) => Promise<boolean>;
    reachabilityLongTimeout?: number;
    reachabilityShortTimeout?: number;
    reachabilityRequestTimeout?: number;
    reachabilityShouldRun?: () => boolean;
    shouldFetchWiFiSSID?: boolean;
    useNativeReachability?: boolean;
  }

  export function configure(configuration: NetInfoConfiguration): void;
  export function fetch(requestedInterface?: string): Promise<NetInfoState>;
  export function refresh(): Promise<NetInfoState>;
  export function addEventListener(
    listener: (state: NetInfoState) => void
  ): () => void;
  export function useNetInfo(
    configuration?: Partial<NetInfoConfiguration>
  ): NetInfoState;
  export function useNetInfoInstance(
    isPaused?: boolean,
    configuration?: Partial<NetInfoConfiguration>
  ): { netInfo: NetInfoState; refresh: () => void };

  const NetInfo: {
    configure: typeof configure;
    fetch: typeof fetch;
    refresh: typeof refresh;
    addEventListener: typeof addEventListener;
    useNetInfo: typeof useNetInfo;
    useNetInfoInstance: typeof useNetInfoInstance;
  };

  export default NetInfo;
}
