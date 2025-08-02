import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors, shadows } from '../theme/colors';
import { LinearGradient } from 'expo-linear-gradient';

const TaskHeader = ({ totalTasks, completedTasks }) => {
  const progressWidth = React.useRef(new Animated.Value(0)).current;
  
  React.useEffect(() => {
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) : 0;
    Animated.spring(progressWidth, {
      toValue: progress,
      tension: 40,
      friction: 8,
      useNativeDriver: false,
      extrapolate: 'clamp'
    }).start();
  }, [totalTasks, completedTasks]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.surfacePrimary, colors.surfaceSecondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.titleContainer}>
          <Text style={styles.title}>My Tasks</Text>
          <Text style={styles.subtitle}>
            {completedTasks} of {totalTasks} completed
          </Text>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBackground}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progressWidth.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {Math.round((completedTasks / totalTasks) * 100) || 0}%
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    borderRadius: 24,
    ...shadows.medium,
  },
  header: {
    padding: 20,
    borderRadius: 24,
  },
  titleContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBackground: {
    flex: 1,
    height: 8,
    backgroundColor: colors.divider,
    borderRadius: 4,
    marginRight: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    minWidth: 45,
  },
});

export default TaskHeader;
