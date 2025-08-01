import React, { useState, useEffect } from "react";
import SafeViewAndroid from "../components/SafeViewAndroid";
import DatePickerButton from "../components/DatePickerButton";
import DateTimePickerModal from "../components/DateTimePickerModal";
import FAB from "../components/FAB";
import NoTasks from "../components/NoTasks";
import SearchBar from "../components/SearchBar";
import FilterTabs from "../components/FilterTabs";
import { MaterialCommunityIcons } from '@expo/vector-icons';

import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  Animated,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { db, auth } from "../firebaseConfig";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  orderBy,
} from "firebase/firestore";

const HomeScreen = () => {
  const [todoInput, setTodoInput] = useState("");
  const [todoDescription, setTodoDescription] = useState("");
  const [todos, setTodos] = useState([]);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const fadeAnims = React.useRef({});
  const translateY = React.useRef(new Animated.Value(0)).current;
  
  // Animation for the add modal
  useEffect(() => {
    Animated.spring(translateY, {
      toValue: isAddModalVisible ? 0 : 1000,
      useNativeDriver: true,
      tension: 65,
      friction: 11
    }).start();
  }, [isAddModalVisible]);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "todos"),
      where("userId", "==", auth.currentUser.uid)
      // orderBy("createdAt", "desc") // Temporarily removed until index is built
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const todoList = [];
      snapshot.forEach((doc) => {
        todoList.push({ id: doc.id, ...doc.data() });
      });
      // Sort todos by creation date until the Firestore index is ready
      todoList.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
      setTodos(todoList);
    });

    return () => unsubscribe();
  }, []);

  const filteredTodos = todos.filter(todo => {
    const matchesSearch = todo.title.toLowerCase().includes(searchQuery.toLowerCase());
    switch (activeFilter) {
      case "Active":
        return !todo.completed && matchesSearch;
      case "Completed":
        return todo.completed && matchesSearch;
      default:
        return matchesSearch;
    }
  });

  const addTodo = async () => {
    if (todoInput.trim() === "") return;

    try {
      await addDoc(collection(db, "todos"), {
        title: todoInput,
        description: todoDescription.trim(),
        completed: false,
        userId: auth.currentUser.uid,
        createdAt: new Date(),
        dueDate: null,
      });
      setTodoInput("");
      setTodoDescription("");
      setAddModalVisible(false);
    } catch (error) {
      console.error("Error adding todo:", error);
    }
  };

  const toggleTodo = async (id, completed) => {
    if (!fadeAnims.current[id]) {
      fadeAnims.current[id] = new Animated.Value(1);
    }

    Animated.sequence([
      Animated.timing(fadeAnims.current[id], {
        toValue: 0.5,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnims.current[id], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      await updateDoc(doc(db, "todos", id), {
        completed: !completed,
      });
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  };

  const deleteTodo = async (id) => {
    if (!fadeAnims.current[id]) {
      fadeAnims.current[id] = new Animated.Value(1);
    }

    try {
      // Start fade out animation
      Animated.timing(fadeAnims.current[id], {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(async () => {
        // Delete from Firestore after animation
        try {
          await deleteDoc(doc(db, "todos", id));
          // Clean up the animation value after successful deletion
          delete fadeAnims.current[id];
        } catch (error) {
          console.error("Error deleting todo:", error);
          Alert.alert("Error", "Failed to delete the task. Please try again.");
          // Reset opacity if delete fails
          if (fadeAnims.current[id]) {
            Animated.timing(fadeAnims.current[id], {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }).start();
          }
        }
      });
    } catch (error) {
      console.error("Error in animation:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const showDatePicker = (todo) => {
    setSelectedTodo(todo);
    setDatePickerVisible(true);
  };

  const handleConfirmDate = async (date) => {
    try {
      await updateDoc(doc(db, "todos", selectedTodo.id), {
        dueDate: date,
      });
      setDatePickerVisible(false);
      setSelectedTodo(null);
    } catch (error) {
      console.error("Error updating due date:", error);
    }
  };

  const handleCancelDate = () => {
    setDatePickerVisible(false);
    setSelectedTodo(null);
  };

  const handleEditTodo = async () => {
    if (todoInput.trim() === "") return;

    try {
      await updateDoc(doc(db, "todos", selectedTodo.id), {
        title: todoInput,
        description: todoDescription.trim(),
      });
      setTodoInput("");
      setTodoDescription("");
      setIsAddModalVisible(false);
      setSelectedTodo(null);
      setIsEditMode(false);
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  };

  const openEditModal = (todo) => {
    setSelectedTodo(todo);
    setTodoInput(todo.title);
    setTodoDescription(todo.description || "");
    setIsEditMode(true);
    setAddModalVisible(true);
  };

  const handleCloseModal = () => {
    setAddModalVisible(false);
    setTodoInput("");
    setTodoDescription("");
    setSelectedTodo(null);
    setIsEditMode(false);
  };

  const renderTodoItem = ({ item }) => {
    // Initialize fade animation for this item if it doesn't exist
    if (!fadeAnims.current[item.id]) {
      fadeAnims.current[item.id] = new Animated.Value(1);
    }

    return (
      <Animated.View style={[styles.todoItem, { opacity: fadeAnims.current[item.id] }]}>
        <View style={styles.todoContent}>
          <TouchableOpacity
            style={styles.todoCheckbox}
            onPress={() => toggleTodo(item.id, item.completed)}
          >
            {item.completed && (
              <MaterialCommunityIcons name="check" size={20} color="#4285F4" />
            )}
          </TouchableOpacity>
          <View style={styles.todoMainContent}>
            <View style={styles.todoTextContainer}>
              <Text
                style={[styles.todoText, item.completed && styles.completedTodoText]}
              >
                {item.title}
              </Text>
              {item.description ? (
                <Text
                  style={[styles.todoDescription, item.completed && styles.completedTodoText]}
                  numberOfLines={2}
                >
                  {item.description}
                </Text>
              ) : null}
            </View>
            <View style={styles.todoActions}>
              <DatePickerButton
                onPress={() => showDatePicker(item)}
                dueDate={item.dueDate ? new Date(item.dueDate.toDate()) : null}
              />
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => openEditModal(item)}
              >
                <MaterialCommunityIcons name="pencil-outline" size={20} color="#4285F4" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteTodo(item.id)}
              >
                <MaterialCommunityIcons name="delete-outline" size={20} color="#EA4335" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <DateTimePickerModal
          isVisible={isDatePickerVisible && selectedTodo?.id === item.id}
          date={item.dueDate ? new Date(item.dueDate.toDate()) : new Date()}
          onConfirm={handleConfirmDate}
          onCancel={handleCancelDate}
        />
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, SafeViewAndroid.AndroidSafeArea]}>
      <View style={styles.header}>
        <Text style={styles.title}>My Todos</Text>
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
        >
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
      <FilterTabs activeFilter={activeFilter} onFilterChange={setActiveFilter} />

      {filteredTodos.length === 0 ? (
        <NoTasks />
      ) : (
        <FlatList
          data={filteredTodos}
          renderItem={renderTodoItem}
          keyExtractor={(item) => item.id}
          style={styles.todoList}
        />
      )}

      <FAB onPress={() => setAddModalVisible(true)} />

      <Modal
        visible={isAddModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{isEditMode ? 'Edit Task' : 'Add New Task'}</Text>
            <TextInput
              style={styles.modalInput}
              value={todoInput}
              onChangeText={setTodoInput}
              placeholder="Task title..."
              autoFocus
            />
            <TextInput
              style={[styles.modalInput, styles.descriptionInput]}
              value={todoDescription}
              onChangeText={setTodoDescription}
              placeholder="Description (optional)"
              multiline
              numberOfLines={3}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCloseModal}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.addButton]}
                onPress={isEditMode ? handleEditTodo : addTodo}
              >
                <Text style={styles.addButtonText}>{isEditMode ? 'Save' : 'Add Task'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    backgroundColor: "#1a73e8",
    marginHorizontal: -20,
    marginTop: -40,
    padding: 24,
    paddingTop: 64,
    paddingBottom: 24,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  todoList: {
    flex: 1,
  },
  todoItem: {
    backgroundColor: "#fff",
    borderRadius: 24,
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#1a73e8",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(26,115,232,0.08)",
    marginHorizontal: 2,
    transform: [{ scale: 1 }],
    overflow: 'hidden',
    backdropFilter: 'blur(20px)',
  },
  todoContent: {
    flexDirection: "row",
    padding: 20,
    backgroundColor: "rgba(255,255,255,0.98)",
  },
  todoMainContent: {
    flex: 1,
    marginLeft: 18,
  },
  todoTextContainer: {
    flex: 1,
    marginBottom: 14,
  },
  todoActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginTop: 12,
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.06)",
  },
  todoCheckbox: {
    width: 28,
    height: 28,
    borderWidth: 2.5,
    borderColor: "#1a73e8",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    shadowColor: "#1a73e8",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    marginRight: 2,
  },
  todoText: {
    fontSize: 18,
    color: "#1f1f1f",
    flex: 1,
    marginRight: 8,
    fontWeight: "700",
    letterSpacing: 0.3,
    lineHeight: 24,
  },
  todoDescription: {
    fontSize: 15,
    color: "#5f6368",
    marginTop: 8,
    lineHeight: 22,
    letterSpacing: 0.2,
    opacity: 0.9,
    fontWeight: "400",
  },
  completedTodoText: {
    textDecorationLine: "line-through",
    color: "#9aa0a6",
    opacity: 0.8,
  },
  editButton: {
    padding: 10,
    marginRight: 10,
    backgroundColor: "rgba(66, 133, 244, 0.08)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(66, 133, 244, 0.12)",
    transform: [{ scale: 1 }],
  },
  deleteButton: {
    padding: 10,
    backgroundColor: "rgba(234, 67, 53, 0.08)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(234, 67, 53, 0.12)",
    transform: [{ scale: 1 }],
  },
  signOutButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  signOutButtonText: {
    color: "#202124",
    fontWeight: "500",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 32,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    elevation: 24,
    shadowColor: "#1a73e8",
    shadowOffset: {
      width: 0,
      height: -6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(26,115,232,0.1)",
  },
  modalTitle: {
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 28,
    color: "#1a73e8",
    letterSpacing: 0.5,
    textShadowColor: 'rgba(26,115,232,0.1)',
    textShadowOffset: {
      width: 0,
      height: 2,
    },
    textShadowRadius: 4,
  },
  modalInput: {
    borderWidth: 2,
    borderColor: "#e8f0fe",
    borderRadius: 18,
    padding: 20,
    fontSize: 17,
    marginBottom: 18,
    backgroundColor: "#F8F9FA",
    shadowColor: "#1a73e8",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
    color: "#1f1f1f",
    fontWeight: "500",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  modalButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginLeft: 12,
  },
  cancelButton: {
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#dadce0",
  },
  cancelButtonText: {
    color: "#5f6368",
    fontWeight: "600",
  },
  addButton: {
    backgroundColor: "#1a73e8",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});

export default HomeScreen;
