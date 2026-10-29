// src/modules/WelcomeImage.js
import React from 'react';
import {Image, StyleSheet, View, Dimensions} from 'react-native';
import {spacing} from '../styles/spacing';

const {width} = Dimensions.get('window');
const IMAGE_SIZE = Math.min(width * 0.75, 280);

const WelcomeImage = () => {
  return (
    <View style={styles.imageContainer}>
      <Image
        style={[styles.mainImage, {width: IMAGE_SIZE, height: IMAGE_SIZE}]}
        source={require('../assets/GOTaskWelcomeImage.webp')}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    alignSelf: 'center',
    marginVertical: spacing.MARGIN_20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainImage: {
    borderRadius: 20,
  },
});

export default WelcomeImage;
