import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, shadows } from '../theme/colors';

const SearchBar = ({ value, onChangeText }) => {
  const [isFocused, setIsFocused] = React.useState(false);
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused]);

  // Remove color interpolation and use opacity instead
const containerOpacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1]
  });

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          backgroundColor: colors.surfaceSecondary,
          opacity: containerOpacity
        }
      ]}
    >
      <MaterialCommunityIcons 
        name="magnify" 
        size={24} 
        color={isFocused ? colors.primary : colors.textSecondary} 
      />
      <TextInput
        style={styles.input}
        placeholder="Search tasks..."
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={colors.textSecondary}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.divider,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    height: 48,
    ...shadows.small
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    paddingVertical: 8,
  },
  clearButton: {
    padding: 4,
    marginLeft: 4,
  }
});

export default SearchBar;
