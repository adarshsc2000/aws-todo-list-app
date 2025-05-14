import { useState, useEffect } from "react";
import { createTodo, getTodos, updateTodo, deleteTodo } from '../services/todoServices';
import type { Todo } from "../types/todo";
import toast from "react-hot-toast";
import { useTokenGuard } from "../hooks/useTokenGuard";

export default function TodoList() {

  const { token, requireToken } = useTokenGuard();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

    useEffect(() => {
    const fetchTodos = async () => {
      if(!token) return;

      try {
        const data = await getTodos(token);
        setTodos(data);
      } catch (err) {
        setError("Could not load todos.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTodos();
  }, [token]);

  const handleCreateTodo = async () => {
    const token = requireToken();
    if (!token || !input.trim()) {
      return toast.error("Please enter a todo.");
    }

    setLoading(true);
    try {
      const data = await createTodo(input, token);
      toast.success("Todo created!");
      setTodos([...todos, {
        'todoId': data.todoId,
        'title': data.title,
        'completed': data.completed,
      }]);
      setInput("");
    } catch (err) {
      console.error(err);
      toast.error("Error creating todo.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (todoId: string) => {
    const token = requireToken();
    if (!token) return;

    const todo = todos.find((t) => t.todoId === todoId);
    if (!todo) {
      return toast.error("Todo not found");
    }

    try {
      await updateTodo(todoId, todo.title, !todo.completed, token);
      setTodos((prevTodos) =>
        prevTodos.map((t) =>
          t.todoId === todoId ? { ...t, completed: !t.completed } : t
      ));
    } catch (err) {
      console.error(err);
      toast.error("Failed to update todo.");
    }
  };

  const handleEditTitle = async (todoId: string) => {
    const token = requireToken();
    if (!token) return;

    const todo = todos.find((t) => t.todoId === todoId);
    if (!todo) {
      return toast.error("Todo not found.");
    }

    const newTitle = prompt("Edit your todo", todo.title)?.trim();
    if (!newTitle) return;

    try {
      await updateTodo(todoId, newTitle, todo.completed, token);
      setTodos((prevTodos) =>
      prevTodos.map((t) =>
        t.todoId === todoId ? { ...t, title: newTitle } : t
      ));
      toast.success("Todo title updated!");
    } catch (err) {
      console.error(err);
      toast.error("Error updating todo.");
    }

  };

  const handleDeleteTodo = async (todoId: string) => {
    const token = requireToken();
      if (!token) return;


    const index = todos.findIndex((t) => t.todoId === todoId);
    if (index === -1) {
      toast.error("Invalid Todo ID");
      return;
    }

    const confirmed = window.confirm("Are you sure you want to delete this?");
    if (!confirmed) return;

    try {
      await deleteTodo(todoId, token);
      setTodos((prevTodos) => prevTodos.filter(t => t.todoId !== todoId));
      toast.success("Todo deleted.");
    } catch (err) {
      console.error(err);
      toast.error("Error deleting todo.");
    }

  };

  return (
    <div className="max-w-md mx-auto space-y-4">
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border border-gray-300 px-3 py-2 rounded"
          placeholder="Enter a new task"
        />
        <button
          onClick={handleCreateTodo}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add
        </button>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-6">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-500 py-6">{error}</div>
      ) : todos.length === 0 ? (
        <div className="text-center text-gray-400 py-6">No todos yet.</div>
      ) : (
        <ul className="space-y-2">
          {todos.map((todo) => (
            <li
              key={todo.todoId}
              className="bg-white px-4 py-2 rounded shadow flex justify-between items-center"
            >
              <input
                type="checkbox"
                checked={todo.completed}
                className="mr-2"
                onChange={() => handleToggleComplete(todo.todoId)}
              />
              <span className={todo.completed ? "line-through text-gray-500" : ""}>{todo.title}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditTitle(todo.todoId)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteTodo(todo.todoId)}
                  className="text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
