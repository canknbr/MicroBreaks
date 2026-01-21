# Performance Optimization Guide

Best practices and optimization strategies for MicroBreaks.

---

## Bundle Size Optimization

### Current Target
- **Goal:** < 25MB (Android APK), < 30MB (iOS)
- **Critical limit:** < 50MB (OTA update limit)

### Measurement

```bash
# Check bundle size
npx expo export --platform android
npx expo export --platform ios

# Analyze bundle
npx react-native-bundle-visualizer
```

### Optimization Strategies

#### 1. Image Optimization
```bash
# Compress images with ImageOptim or similar
# Use WebP format where supported
# Use appropriate image sizes (no 4K images for 100px display)
```

**Checklist:**
- [ ] Compress all PNG/JPG assets
- [ ] Use vector graphics (SVG) where possible
- [ ] Implement proper image scaling (@1x, @2x, @3x)
- [ ] Lazy load images when possible

#### 2. Code Splitting
```typescript
// Dynamic imports for heavy components
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));

// Use Suspense for loading
<Suspense fallback={<Loading />}>
  <HeavyComponent />
</Suspense>
```

#### 3. Tree Shaking
```typescript
// BAD - imports entire library
import _ from 'lodash';

// GOOD - imports only what's needed
import debounce from 'lodash/debounce';
```

#### 4. Remove Unused Dependencies
```bash
# Find unused dependencies
npx depcheck

# Remove unused packages
npm uninstall unused-package
```

---

## Startup Performance

### Target Metrics
- **Cold start:** < 3 seconds
- **Warm start:** < 1 second
- **Time to interactive:** < 2 seconds

### Optimization Strategies

#### 1. Splash Screen Optimization
```typescript
// Keep splash visible until app is ready
SplashScreen.preventAutoHideAsync();

// Hide when ready
await SplashScreen.hideAsync();
```

#### 2. Defer Non-Critical Initialization
```typescript
// Initialize critical services first
await initializeCriticalServices();

// Defer non-critical initialization
setTimeout(() => {
  initializeAnalytics();
  initializeSentry();
}, 1000);
```

#### 3. Optimize Asset Loading
```typescript
// Preload fonts and images
await Asset.loadAsync([
  require('./assets/icon.png'),
  // ...other assets
]);

await Font.loadAsync({
  'Inter-Regular': require('./assets/fonts/Inter-Regular.ttf'),
});
```

---

## Runtime Performance

### React Optimization

#### 1. Memoization
```typescript
// Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return calculateExpensiveValue(data);
}, [data]);

// Memoize callbacks
const handlePress = useCallback(() => {
  // ...
}, [dependency]);

// Memoize components
const MemoizedComponent = React.memo(ExpensiveComponent);
```

#### 2. List Optimization
```typescript
// Use FlashList instead of FlatList for long lists
import { FlashList } from "@shopify/flash-list";

<FlashList
  data={items}
  renderItem={renderItem}
  estimatedItemSize={100}
  keyExtractor={keyExtractor}
/>
```

#### 3. Avoid Re-renders
```typescript
// Use selectors in Zustand
const breakCount = useStore((state) => state.breakCount);

// Instead of
const store = useStore(); // Causes re-render on any store change
```

### Animation Performance

#### 1. Use Reanimated for Smooth Animations
```typescript
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

const offset = useSharedValue(0);

const animatedStyles = useAnimatedStyle(() => {
  return {
    transform: [{ translateX: offset.value }],
  };
});
```

#### 2. Avoid Animated in JS Thread
```typescript
// GOOD - runs on UI thread
useAnimatedStyle(() => ({
  opacity: progress.value,
}));

// BAD - runs on JS thread
style={{ opacity: progress.value }}
```

---

## Memory Optimization

### Detection
```bash
# Check for memory leaks on Android
adb shell dumpsys meminfo com.cankanbur.MicroBreaks

# Use Flipper or React Native Debugger for profiling
```

### Common Memory Leaks

#### 1. Event Listeners
```typescript
useEffect(() => {
  const subscription = eventEmitter.addListener('event', handler);

  // Always clean up!
  return () => {
    subscription.remove();
  };
}, []);
```

#### 2. Timers
```typescript
useEffect(() => {
  const timer = setInterval(callback, 1000);

  return () => {
    clearInterval(timer);
  };
}, []);
```

#### 3. Async Operations
```typescript
useEffect(() => {
  let isMounted = true;

  fetchData().then((data) => {
    if (isMounted) {
      setData(data);
    }
  });

  return () => {
    isMounted = false;
  };
}, []);
```

---

## Battery Optimization

### Best Practices

#### 1. Minimize Background Activity
```typescript
// Only run essential tasks in background
TaskManager.defineTask(BACKGROUND_TASK, async () => {
  // Keep it minimal
  await scheduleNextNotification();
  return BackgroundFetch.BackgroundFetchResult.NewData;
});
```

#### 2. Optimize Notification Scheduling
```typescript
// Schedule multiple notifications at once
await Notifications.scheduleNotificationAsync({
  content: { ... },
  trigger: {
    seconds: interval,
    repeats: true, // Use repeating instead of rescheduling
  },
});
```

#### 3. Reduce Sensor Usage
- Only use sensors when needed
- Stop sensors when app is backgrounded
- Use lowest frequency that works

---

## Network Optimization

### Best Practices

#### 1. Minimize Network Requests
```typescript
// Batch requests where possible
const [data1, data2] = await Promise.all([
  fetchData1(),
  fetchData2(),
]);
```

#### 2. Cache Responses
```typescript
// Use AsyncStorage or MMKV for caching
const cachedData = await storage.getString('cached_data');
if (cachedData && !isStale(cachedData)) {
  return JSON.parse(cachedData);
}
```

#### 3. Handle Offline Gracefully
```typescript
// MicroBreaks is offline-first, but for any network features:
import NetInfo from '@react-native-community/netinfo';

const isConnected = await NetInfo.fetch().then(state => state.isConnected);
if (!isConnected) {
  // Use cached data or show offline message
}
```

---

## Testing Performance

### Tools

1. **React Native Debugger** - JS performance
2. **Flipper** - Native performance
3. **Instruments (iOS)** - Deep profiling
4. **Android Studio Profiler** - Android profiling

### Automated Testing

```typescript
// Performance test example
describe('Performance Tests', () => {
  it('should render main screen within 500ms', async () => {
    const start = Date.now();
    render(<MainScreen />);
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(500);
  });
});
```

---

## Performance Monitoring

### Production Monitoring

```typescript
// Use Sentry for performance tracking
import * as Sentry from '@sentry/react-native';

// Track startup time
const startTime = Date.now();
// ... app initialization
Sentry.addBreadcrumb({
  message: 'App started',
  data: { duration: Date.now() - startTime },
});

// Track screen transitions
navigation.addListener('state', (state) => {
  Sentry.addBreadcrumb({
    message: `Navigate to ${getCurrentRoute(state)}`,
    category: 'navigation',
  });
});
```

---

## Checklist

### Pre-Launch Performance Audit

- [ ] Bundle size under target (< 25MB)
- [ ] Cold start under 3 seconds
- [ ] No memory leaks detected
- [ ] All animations running at 60fps
- [ ] Battery usage acceptable
- [ ] App runs smoothly on low-end devices
- [ ] Offline functionality works correctly
- [ ] Error tracking configured (Sentry)
- [ ] Performance monitoring enabled

---

*Last Updated: January 2025*
