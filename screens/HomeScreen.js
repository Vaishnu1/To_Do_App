import React, { useState, useEffect } from "react";
import SafeViewAndroid from "../components/SafeViewAndroid";
import DatePickerButton from "../components/DatePickerButton";
import DateTimePickerModal from "../components/DateTimePickerModal";

import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
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
} from "firebase/firestore";

const HomeScreen = () => {
  const [todoInput, setTodoInput] = useState("");
  const [todos, setTodos] = useState([]);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "todos"),
      where("userId", "==", auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const todoList = [];
      snapshot.forEach((doc) => {
        todoList.push({ id: doc.id, ...doc.data() });
      });
      setTodos(todoList);
    });

    return () => unsubscribe();
  }, []);

  const addTodo = async () => {
    if (todoInput.trim() === "") return;

    try {
      await addDoc(collection(db, "todos"), {
        title: todoInput,
        completed: false,
        userId: auth.currentUser.uid,
        createdAt: new Date(),
        dueDate: null,
      });
      setTodoInput("");
    } catch (error) {
      console.error("Error adding todo:", error);
    }
  };

  const toggleTodo = async (id, completed) => {
    try {
      await updateDoc(doc(db, "todos", id), {
        completed: !completed,
      });
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await deleteDoc(doc(db, "todos", id));
    } catch (error) {
      console.error("Error deleting todo:", error);
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

  const renderTodoItem = ({ item }) => (
    <View style={styles.todoItem}>
      <TouchableOpacity
        style={styles.todoCheckbox}
        onPress={() => toggleTodo(item.id, item.completed)}
      >
        {item.completed && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>
      <View style={styles.todoContent}>
        <Text
          style={[styles.todoText, item.completed && styles.completedTodoText]}
        >
          {item.title}
        </Text>
        <DatePickerButton
          onPress={() => showDatePicker(item)}
          dueDate={item.dueDate ? new Date(item.dueDate.toDate()) : null}
        />
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteTodo(item.id)}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
      <DateTimePickerModal
        isVisible={isDatePickerVisible && selectedTodo?.id === item.id}
        date={item.dueDate ? new Date(item.dueDate.toDate()) : new Date()}
        onConfirm={handleConfirmDate}
        onCancel={handleCancelDate}
      />
    </View>
  );

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

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={todoInput}
            onChangeText={setTodoInput}
            placeholder="Add a new todo..."
            placeholderTextColor="#666"
          />
          <TouchableOpacity style={styles.addButton} onPress={addTodo}>
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={todos}
          renderItem={renderTodoItem}
          keyExtractor={(item) => item.id}
          style={styles.todoList}
        />
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  todoContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  inputContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: "#4285F4",
    paddingHorizontal: 20,
    justifyContent: "center",
    borderRadius: 5,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  todoList: {
    flex: 1,
  },
  todoItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  todoCheckbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#4285F4",
    borderRadius: 12,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  checkmark: {
    color: "#4285F4",
    fontSize: 16,
  },
  todoText: {
    flex: 1,
    fontSize: 16,
  },
  completedTodoText: {
    textDecorationLine: "line-through",
    color: "#666",
  },
  deleteButton: {
    backgroundColor: "#ff4444",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: "#fff",
  },
  signOutButton: {
    backgroundColor: "#666",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  signOutButtonText: {
    color: "#fff",
  },
});

export default HomeScreen;
