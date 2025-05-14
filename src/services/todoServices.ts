import { API_INVOKE_URL } from "../constants/constants";

export const createTodo = async (title: string, token: string) => {
  const response = await fetch(API_INVOKE_URL+"/todos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify({ title }),
  });

  if (!response.ok) throw new Error("Failed to create todo");

  return await response.json();
};

export const getTodos = async (token: string) => {
  const response = await fetch(API_INVOKE_URL+"/todos", {
    method: "GET",
    headers: {
      Authorization: token,
    },
  });

  if (!response.ok) throw new Error("Failed to fetch todos");

  const data = await response.json();
    
  return data.map((todo: any) => ({
    todoId: todo.todoId,
    title: todo.title,
    completed: todo.completed,
  }));
};

export const updateTodo = async (todoId: string, title: string, completed: boolean, token: string) => {
  const response = await fetch(API_INVOKE_URL+"/todos/"+todoId, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify({ title, completed }),
  });

  if (!response.ok) throw new Error("Failed to update todo");

  return await response.json();
};

export const deleteTodo = async (todoId: string, token: string) => {
  const response = await fetch(API_INVOKE_URL+"/todos/"+todoId, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify({ todoId }),
  });

  if (!response.ok) throw new Error("Failed to delete todo");

  return await response.json();
};

