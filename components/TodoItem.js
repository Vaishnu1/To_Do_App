import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const TodoItem = ({ todo, onToggle, onEdit, onDelete }) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const opacityAnim = React.useRef(new Animated.Value(1)).current;

  const animateDelete = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      })
    ]).start(() => onDelete(todo.id));
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim
        }
      ]}
    >
      <TouchableOpacity
        style={styles.checkbox}
        onPress={() => onToggle(todo.id)}
      >
        <View style={[styles.checkboxInner, todo.completed && styles.checkboxChecked]}>
          {todo.completed && (
            <MaterialCommunityIcons name="check" size={16} color={colors.surface} />
          )}
        </View>
      </TouchableOpacity>
      
      <View style={styles.content}>
        <Text 
          style={[
            styles.title,
            todo.completed && styles.completedText
          ]}
          numberOfLines={1}
        >
          {todo.title}
        </Text>
        {todo.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {todo.description}
          </Text>
        ) : null}
        {todo.dueDate ? (
          <View style={styles.dateContainer}>
            <MaterialCommunityIcons name="calendar" size={14} color={colors.textSecondary} />
            <Text style={styles.dateText}>
              {new Date(todo.dueDate).toLocaleDateString()}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onEdit(todo)}
        >
          <MaterialCommunityIcons name="pencil" size={20} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={animateDelete}
        >
          <MaterialCommunityIcons name="delete-outline" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    marginVertical: 6,
    padding: 16,
    borderRadius: 16,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  checkbox: {
    marginRight: 16,
  },
  checkboxInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
  },
  content: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  completedText: {
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
});

export default TodoItem;
