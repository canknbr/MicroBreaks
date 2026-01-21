/**
 * Jest Setup File for MicroBreaks
 * Premium-level mocks and global test utilities
 */

import '@testing-library/react-native/extend-expect';

// ============================================
// React Native Core Mocks
// ============================================

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock Appearance API
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Appearance: {
      getColorScheme: jest.fn(() => 'dark'),
      addChangeListener: jest.fn(() => ({ remove: jest.fn() })),
    },
  };
});

// ============================================
// Expo Module Mocks
// ============================================

// Expo Haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));

// Expo Speech
jest.mock('expo-speech', () => ({
  speak: jest.fn(),
  stop: jest.fn(),
  isSpeakingAsync: jest.fn(() => Promise.resolve(false)),
  getAvailableVoicesAsync: jest.fn(() => Promise.resolve([])),
}));

// Expo Notifications
jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted', canAskAgain: true })
  ),
  requestPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted', canAskAgain: true })
  ),
  setNotificationHandler: jest.fn(),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve('notification-id')),
  cancelAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve()),
  cancelScheduledNotificationAsync: jest.fn(() => Promise.resolve()),
  getAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve([])),
  setNotificationChannelAsync: jest.fn(() => Promise.resolve()),
  AndroidImportance: {
    DEFAULT: 3,
    HIGH: 4,
    LOW: 2,
    MAX: 5,
    MIN: 1,
  },
}));

// Expo Device
jest.mock('expo-device', () => ({
  isDevice: true,
  brand: 'Apple',
  manufacturer: 'Apple',
  modelName: 'iPhone 14 Pro',
  osName: 'iOS',
  osVersion: '17.0',
}));

// Expo Constants
jest.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      name: 'MicroBreaks',
      slug: 'MicroBreaks',
      version: '1.0.0',
    },
    manifest: {
      name: 'MicroBreaks',
      slug: 'MicroBreaks',
    },
  },
}));

// Expo Router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn(() => true),
  }),
  useLocalSearchParams: () => ({}),
  useGlobalSearchParams: () => ({}),
  useSegments: () => [],
  usePathname: () => '/',
  Link: 'Link',
  Stack: {
    Screen: 'Screen',
  },
  Tabs: {
    Screen: 'Screen',
  },
}));

// Expo Linear Gradient
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

// Expo Blur
jest.mock('expo-blur', () => ({
  BlurView: 'BlurView',
}));

// Expo Image
jest.mock('expo-image', () => ({
  Image: 'Image',
}));

// ============================================
// Third-party Library Mocks
// ============================================

// React Native Reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');

  // Override the default mock
  Reanimated.default.call = () => {};
  Reanimated.useSharedValue = jest.fn((initial) => ({ value: initial }));
  Reanimated.useAnimatedStyle = jest.fn(() => ({}));
  Reanimated.withTiming = jest.fn((value) => value);
  Reanimated.withSpring = jest.fn((value) => value);
  Reanimated.withDelay = jest.fn((_, value) => value);
  Reanimated.withSequence = jest.fn((...values) => values[values.length - 1]);
  Reanimated.withRepeat = jest.fn((value) => value);
  Reanimated.Easing = {
    linear: jest.fn(),
    ease: jest.fn(),
    in: jest.fn(() => jest.fn()),
    out: jest.fn(() => jest.fn()),
    inOut: jest.fn(() => jest.fn()),
    bezier: jest.fn(() => jest.fn()),
  };
  Reanimated.interpolate = jest.fn((value) => value);
  Reanimated.runOnJS = jest.fn((fn) => fn);
  Reanimated.runOnUI = jest.fn((fn) => fn);

  return Reanimated;
});

// React Native Gesture Handler
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native').View;
  return {
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    ScrollView: View,
    Slider: View,
    Switch: View,
    TextInput: View,
    ToolbarAndroid: View,
    TouchableHighlight: View,
    TouchableNativeFeedback: View,
    TouchableOpacity: View,
    TouchableWithoutFeedback: View,
    Pressable: View,
    FlatList: View,
    BaseButton: View,
    RectButton: View,
    BorderlessButton: View,
    LongPressGestureHandler: View,
    PanGestureHandler: View,
    PinchGestureHandler: View,
    RotationGestureHandler: View,
    TapGestureHandler: View,
    GestureHandlerRootView: View,
    Directions: {},
    gestureHandlerRootHOC: jest.fn((Component) => Component),
  };
});

// Shopify Skia
jest.mock('@shopify/react-native-skia', () => ({
  Canvas: 'Canvas',
  Circle: 'Circle',
  Path: 'Path',
  Group: 'Group',
  Skia: {
    Path: {
      Make: jest.fn(),
    },
  },
  useFont: jest.fn(),
  useValue: jest.fn((initial) => ({ current: initial })),
  useTouchHandler: jest.fn(),
  vec: jest.fn((x, y) => ({ x, y })),
}));

// Gorhom Bottom Sheet
jest.mock('@gorhom/bottom-sheet', () => {
  const View = require('react-native').View;
  return {
    __esModule: true,
    default: View,
    BottomSheetModal: View,
    BottomSheetModalProvider: View,
    BottomSheetScrollView: View,
    BottomSheetView: View,
    BottomSheetBackdrop: View,
    useBottomSheet: () => ({
      expand: jest.fn(),
      collapse: jest.fn(),
      close: jest.fn(),
    }),
    useBottomSheetModal: () => ({
      present: jest.fn(),
      dismiss: jest.fn(),
    }),
  };
});

// Async Storage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Lottie
jest.mock('lottie-react-native', () => 'LottieView');

// Safe Area Context
jest.mock('react-native-safe-area-context', () => {
  const insets = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: ({ children }) => children,
    SafeAreaView: 'SafeAreaView',
    useSafeAreaInsets: () => insets,
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 390, height: 844 }),
  };
});

// ============================================
// Global Test Utilities
// ============================================

// Silence console errors during tests (optional)
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    // Filter out known harmless warnings
    if (
      args[0]?.includes?.('Warning: ReactDOM.render is no longer supported') ||
      args[0]?.includes?.('Warning: An update to') ||
      args[0]?.includes?.('act(...)')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Reset modules between tests for isolation
beforeEach(() => {
  jest.clearAllMocks();
});

// Global timeout for async operations
jest.setTimeout(10000);

// ============================================
// Custom Matchers (Optional)
// ============================================

expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});
