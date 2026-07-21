/**
 * Onboarding photo backdrops, keyed by step (1–7). Each is laid behind the
 * editorial UI, blurred + dimmed, by <PhotoBackdrop> in OnboardingLayout.
 * The splash screen uses assets/images/backdrops/bg.jpg (see SplashScreen).
 */

import type { ImageSourcePropType } from 'react-native';

// Pre-cropped to the phone's portrait aspect (subject centred, ~3.6MP) so the
// blur/scale render path stays stable — see assets/images/backdrops/.
export const ONBOARDING_BACKDROPS: Record<number, ImageSourcePropType> = {
  1: require('../../../assets/images/backdrops/karolabgwelcome.jpg'), // welcome
  2: require('../../../assets/images/backdrops/img2.jpg'), // work context
  3: require('../../../assets/images/backdrops/img3.jpg'), // pain assessment
  4: require('../../../assets/images/backdrops/img4.jpg'), // recommendation
  5: require('../../../assets/images/backdrops/img5.jpg'), // break demo
  6: require('../../../assets/images/backdrops/img6.jpg'), // notifications
  7: require('../../../assets/images/backdrops/img7.jpg'), // premium pitch
};
