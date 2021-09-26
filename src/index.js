const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "User not found" });
  }

  request.todos = user.todos;
  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  if (users.some((user) => user.username === username)) {
    return response.status(400).json({ error: "User already exists" });
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { todos } = request;

  return response.json(todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { todos } = request;
  const { title, deadline } = request.body;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  todos.push(newTodo);

  return response.status(201).json(newTodo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { todos } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const todo = todos.find((todo) => todo.id === id);

  if (!todo) return response.status(404).json({ error: "Todo not found" });

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.json(todo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { todos } = request;
  const { id } = request.params;

  const todo = todos.find((todo) => todo.id === id);

  if (!todo) return response.status(404).json({ error: "Todo not found" });

  todo.done = true;

  return response.json(todo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { todos } = request;
  const { id } = request.params;

  const todo = todos.find((todo) => todo.id === id);

  if (!todo) return response.status(404).json({ error: "Todo not found" });

  todos.splice(todo, 1);

  return response.sendStatus(204);
});

module.exports = app;
