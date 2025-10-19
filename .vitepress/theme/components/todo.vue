<script setup lang="ts">
import { ref, computed } from "vue";

interface TodoItem {
  id: number;
  text: string;
  done: boolean;
}

const props = defineProps<{ todos: TodoItem[] }>();
const input = ref("");
const todos = ref<TodoItem[]>(props.todos);
const editingId = ref<number | null>(null);
const editingText = ref("");

function addTodo() {
  const text = input.value && input.value.trim();
  if (!text) return;
  todos.value.unshift({ id: Date.now(), text, done: false });
  input.value = "";
}

function remove(id: number) {
  todos.value = todos.value.filter((t) => t.id !== id);
}

function clearCompleted() {
  todos.value = todos.value.filter((t) => !t.done);
}

function startEdit(item: TodoItem) {
  editingId.value = item.id;
  editingText.value = item.text;
}

function finishEdit(item: TodoItem) {
  if (!editingId.value) return;
  const text = editingText.value && editingText.value.trim();
  if (text) {
    const idx = todos.value.findIndex((t) => t.id === item.id);
    if (idx !== -1) todos.value[idx].text = text;
  }
  editingId.value = null;
  editingText.value = "";
}

const remaining = computed(() => todos.value.filter((t) => !t.done).length);

function exportJSON() {
  const blob = new Blob([JSON.stringify(todos.value, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "todos.json";
  a.click();
  URL.revokeObjectURL(url);
}
</script>

<template>
  <div class="todo">
    <h2>Simple Todo</h2>

    <form @submit.prevent="addTodo" class="todo-form">
      <input
        v-model.trim="input"
        placeholder="Add a task..."
        aria-label="New todo"
      />
      <button type="submit">Add</button>
    </form>

    <ul class="todo-list">
      <li v-for="item in todos" :key="item.id" :class="{ done: item.done }">
        <label>
          <input type="checkbox" v-model="item.done" />
          <span
            v-if="!editingId || editingId !== item.id"
            @dblclick="startEdit(item)"
            >{{ item.text }}</span
          >
          <input
            v-else
            v-model.trim="editingText"
            @keyup.enter="finishEdit(item)"
            @blur="finishEdit(item)"
            class="edit-input"
            autofocus
          />
        </label>

        <div class="actions">
          <button @click="startEdit(item)" title="Edit">✎</button>
          <button @click="remove(item.id)" title="Delete">🗑</button>
        </div>
      </li>
    </ul>

    <div class="footer">
      <span>{{ remaining }} remaining</span>
      <div class="footer-actions">
        <button @click="clearCompleted">Clear completed</button>
        <button @click="exportJSON">Export JSON</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.todo {
  max-width: 420px;
  margin: 16px auto;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue",
    Arial;
}

.todo h2 {
  margin: 0 0 8px 0;
  font-size: 18px;
}

.todo-form {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.todo-form input {
  flex: 1;
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.todo-form button {
  padding: 8px 12px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
}

.todo-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.todo-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px dashed #f0f0f0;
}

.todo-list li.done span {
  text-decoration: line-through;
  opacity: 0.6;
}

.actions button {
  background: transparent;
  border: none;
  cursor: pointer;
  margin-left: 8px;
}

.edit-input {
  padding: 4px 6px;
  border-radius: 4px;
  border: 1px solid #bbb;
}

.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  font-size: 13px;
}

.footer-actions {
  display: flex;
  gap: 8px;
}

.import-label {
  cursor: pointer;
  background: #f5f5f5;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #ddd;
}
</style>
