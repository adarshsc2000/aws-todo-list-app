import { useState, useEffect } from "react";
import { createTodo, getTodos, updateTodo, deleteTodo } from '../services/todoServices';
import type { Todo } from "../types/todo";
import toast from "react-hot-toast";
import { useTokenGuard } from "../hooks/useTokenGuard";

export default function TodoList() {

  const { token, requireToken } = useTokenGuard();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [loading, setLoading] = useState(true);
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
      toast.success("Todo updated!");
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
    const todo = todos.find((t) => t.todoId === todoId);
    if (!todo) {
      return toast.error("Todo not found.");
    }

    setEditingTodo(todo);
    setInput(todo.title);
  };

  const handleSaveEdit = async () => {
    const token = requireToken();
    if (!token || !editingTodo) return;

    const newTitle = input.trim();
    if (!newTitle) return toast.error("The field cannot be empty");

    try {
      await updateTodo(editingTodo.todoId, newTitle, editingTodo.completed, token);
      setTodos((prevTodos) =>
        prevTodos.map((t) =>
          t.todoId === editingTodo.todoId ? { ...t, title: newTitle } : t
        )
      );
      toast.success("Todo updated!");
      setEditingTodo(null);
      setInput("");
    } catch (err) {
      console.error(err);
      toast.error("Error updating todo.");
    }
  };

  const cancelEdit = () => {
    setEditingTodo(null);
    setInput("");
  };

  const handleDeleteTodo = async (todoId: string) => {
    const token = requireToken();
      if (!token) return;


    const index = todos.findIndex((t) => t.todoId === todoId);
    if (index === -1) {
      toast.error("Invalid Todo ID");
      return;
    }

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
          className="flex-1 border border-primary focus-visible:outline-secondary px-3 py-2 rounded"
          placeholder={editingTodo ? "Edit your todo" : "Enter a new todo"}
        />
        <button
          onClick={editingTodo ? handleSaveEdit : handleCreateTodo}
          className="px-4 py-2 cursor-pointer rounded text-white bg-primary hover:bg-secondary"
        >
          {editingTodo ? "Save" : "Add"}
        </button>

        {editingTodo && (
          <button
            onClick={cancelEdit}
            className="px-2 py-2 cursor-pointer rounded bg-red-300 hover:bg-red-400 text-white"
          >
            <svg className="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18 17.94 6M18 18 6.06 6"/>
            </svg>
          </button>
      )}
      </div>

      {loading ? (
        <div className="text-center text-secondary py-6 flex justify-center">
          <div className="animate-spin h-10 w-10 border-2 border-secondary border-t-transparent rounded-full"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-800 py-6">{error}</div>
      ) : todos.length === 0 ? (
        <div className="text-center text-gray-400 py-6">You're all caught up! Add a new Todo.🎉</div>
      ) : (
        <ul className="space-y-2 border-l-6 border-primary">
          {todos.map((todo) => (
            <li
              key={todo.todoId}
              className="bg-white px-4 py-2 border-b-3 border-primary/20 flex justify-between items-center"
            >
              <div className="flex items-center">
                <label className="relative inline-flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => handleToggleComplete(todo.todoId)}
                    className="sr-only peer"
                  />
                  <div
                    className="w-5 h-5 rounded border-2 border-primary hover:border-secondary peer-checked:border-primary 
                             hover:peer-checked:bg-secondary peer-checked:bg-primary transition-all duration-200 flex items-center justify-center"
                  >
                    <svg className="w-6 h-6 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M5 11.917 9.724 16.5 19 7.5"/>
                    </svg>
                  </div>
                  <span className="ml-3 text-gray-800 group-hover:text-green-600 transition"> {/* Optional label text */} </span>
                </label>

                <span className={todo.completed ? "line-through text-gray-500" : ""}>{todo.title}</span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleEditTitle(todo.todoId)}
                  className="cursor-pointer opacity-30 text-blue-800 hover:opacity-100 hover:scale-110 fan-shake-on-hover"
                >
                  <svg className="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m14.304 4.844 2.852 2.852M7 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-4.5m2.409-9.91a2.017 2.017 0 0 1 0 2.853l-6.844 6.844L8 14l.713-3.565 6.844-6.844a2.015 2.015 0 0 1 2.852 0Z"/>
                  </svg>
                </button>
                <button
                  onClick={() => handleDeleteTodo(todo.todoId)}
                  className="cursor-pointer opacity-30 text-red-800 hover:opacity-100 hover:scale-110 fan-shake-on-hover"
                >
                  <svg className="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z"/>
                  </svg>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
