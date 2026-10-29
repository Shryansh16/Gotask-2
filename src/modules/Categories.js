// src/modules/Categories.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTasks} from '../context/TaskContext';
import {useTheme} from '../context/ThemeContext';
import CategoryCard from '../components/CategoryCard';
import {textScale} from '../styles/responsiveStyles';
import {fontFamily} from '../common/fonts';
import {spacing} from '../styles/spacing';

export const Categories = () => {
  const navigation = useNavigation();
  const {theme} = useTheme();
  const {categories, selectedCategory, setSelectedCategory, getCategoryStats} =
    useTasks();

  const handleCategoryPress = cat => {
    setSelectedCategory(cat);
  };

  const handleOpenCategoryScreen = cat => {
    navigation.navigate('CategoryScreen', {categoryName: cat});
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.sectionTitle, {color: theme.textPrimary}]}>
          Categories
        </Text>
        {selectedCategory !== 'All' && (
          <TouchableOpacity
            onPress={() => handleOpenCategoryScreen(selectedCategory)}
            style={styles.viewDetailBtn}>
            <Text style={[styles.viewDetailText, {color: theme.primary}]}>
              Open {selectedCategory} →
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {categories.map(cat => {
          const stats = getCategoryStats(cat);
          const isSelected = selectedCategory === cat;

          return (
            <CategoryCard
              key={cat}
              category={cat}
              isSelected={isSelected}
              taskCount={stats.total}
              pendingCount={stats.pending}
              onPress={() => handleCategoryPress(cat)}
            />
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.MARGIN_8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.PADDING_16,
    marginBottom: spacing.MARGIN_10,
  },
  sectionTitle: {
    fontSize: textScale(18),
    fontFamily: fontFamily.bold,
  },
  viewDetailBtn: {
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  viewDetailText: {
    fontSize: textScale(12),
    fontFamily: fontFamily.bold,
  },
  scrollContent: {
    paddingHorizontal: spacing.PADDING_16,
  },
});

export default Categories;
