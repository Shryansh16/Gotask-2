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
import {fontFamily} from '../common/fonts';

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
          Focus Categories
        </Text>
        {selectedCategory !== 'All' && (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={`Open ${selectedCategory} category view`}
            onPress={() => handleOpenCategoryScreen(selectedCategory)}
            style={styles.viewDetailBtn}>
            <Text style={[styles.viewDetailText, {color: theme.primary}]}>
              View {selectedCategory} →
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
    marginBottom: 18,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: fontFamily.bold,
    letterSpacing: -0.3,
  },
  viewDetailBtn: {
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  viewDetailText: {
    fontSize: 13,
    fontFamily: fontFamily.bold,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 6, // Prevents drop shadow clipping on Android
  },
});

export default Categories;
