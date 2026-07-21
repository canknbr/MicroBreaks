/**
 * PhotoBackdrop — a lightly-blurred photo laid behind the dark editorial UI.
 *
 * Uses expo-image: RN's core <Image blurRadius> path on iOS breaks scaling
 * (it ignores resizeMode and mis-anchors the texture), so the subject would
 * render off-frame. expo-image composites `contentFit="cover"` together with
 * the blur correctly. The photos are also pre-cropped to the phone's portrait
 * aspect (subject centred, ~3.6MP) — see assets/images/backdrops/.
 *
 * A soft scrim + a vignette (darker at the very top behind the headline and at
 * the bottom behind the CTA, open through the middle) keeps text legible while
 * letting the centred subject read through.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import type { ImageSourcePropType } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

export function PhotoBackdrop({
  source,
  opacity = 0.72,
  blurRadius = 11,
}: {
  source: ImageSourcePropType;
  opacity?: number;
  blurRadius?: number;
}) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Image
        source={source}
        style={[StyleSheet.absoluteFill, { opacity }]}
        contentFit="cover"
        blurRadius={blurRadius}
        cachePolicy="memory-disk"
        accessibilityIgnoresInvertColors
      />
      {/* Soft flat scrim ties the photo into the dark canvas. */}
      <View style={[StyleSheet.absoluteFill, styles.scrim]} />
      {/* Dark behind the headline (top) and CTA (bottom); open through the
          middle so the centred subject stays visible. */}
      <LinearGradient
        colors={[
          'rgba(11,10,13,0.58)',
          'rgba(11,10,13,0.14)',
          'rgba(11,10,13,0.26)',
          'rgba(11,10,13,0.86)',
        ]}
        locations={[0, 0.32, 0.62, 1]}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  scrim: {
    backgroundColor: 'rgba(11,10,13,0.20)',
  },
});
