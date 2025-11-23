const STORAGE_KEY = 'task_manager_tasks_v1';

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2,8);
}

function getTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to read tasks from localStorage', e);
    return [];
  }
}

function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  renderCounts(tasks);
}

function renderCounts(tasks) {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const active = total - completed;
  const counts = document.getElementById('counts');
  counts.textContent = `${total} total • ${active} active • ${completed} completed`;
}

function createTaskElement(task) {
  const li = document.createElement('li');
  li.className = 'task-item' + (task.completed ? ' completed' : '');
  li.setAttribute('data-id', task.id);

  const checkbox = document.createElement('button');
  checkbox.className = 'checkbox';
  checkbox.setAttribute('aria-pressed', task.completed ? 'true' : 'false');
  checkbox.title = task.completed ? 'Mark as active' : 'Mark as completed';
  checkbox.innerHTML = task.completed ? '✓' : '';

  checkbox.addEventListener('click', () => {
    toggleComplete(task.id);
  });

  const content = document.createElement('div');
  content.className = 'content';
  const title = document.createElement('div');
  title.className = 'title';
  title.textContent = task.text;
  const meta = document.createElement('div');
  meta.className = 'meta';
  const date = new Date(task.created);
  meta.textContent = date.toLocaleString();

  content.appendChild(title);
  content.appendChild(meta);

  const actions = document.createElement('div');
  actions.className = 'actions';
  const del = document.createElement('button');
  del.className = 'icon-btn';
  del.title = 'Delete task';
  del.innerHTML = '🗑️';
  del.addEventListener('click', () => {
    deleteTask(task.id);
  });

  actions.appendChild(del);

  li.appendChild(checkbox);
  li.appendChild(content);
  li.appendChild(actions);

  return li;
}

function renderTasks(filter = 'all') {
  const list = document.getElementById('taskList');
  list.innerHTML = '';
  const tasks = getTasks();
  const filtered = tasks.filter(t => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });
  filtered.forEach(t => {
    list.appendChild(createTaskElement(t));
  });
  renderCounts(tasks);
}

function addTask(text) {
  if (!text || !text.trim()) return;
  const tasks = getTasks();
  const task = {
    id: uid(),
    text: text.trim(),
    completed: false,
    created: Date.now()
  };
  tasks.unshift(task);
  saveTasks(tasks);
  renderTasks(currentFilter);
}

function deleteTask(id) {
  let tasks = getTasks();
  tasks = tasks.filter(t => t.id !== id);
  saveTasks(tasks);
  renderTasks(currentFilter);
}

function toggleComplete(id) {
  const tasks = getTasks();
  const idx = tasks.findIndex(t => t.id === id);
  if (idx === -1) return;
  tasks[idx].completed = !tasks[idx].completed;
  saveTasks(tasks);
  renderTasks(currentFilter);
}

function clearCompleted() {
  let tasks = getTasks();
  tasks = tasks.filter(t => !t.completed);
  saveTasks(tasks);
  renderTasks(currentFilter);
}

let currentFilter = 'all';

// Setup event listeners
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('taskForm');
  const input = document.getElementById('taskInput');
  const clearBtn = document.getElementById('clearCompleted');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    addTask(input.value);
    form.reset();
    input.focus();
  });

  // Keyboard accessibility: Enter on input adds task; Ctrl+Enter for quick add
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.ctrlKey && !e.shiftKey) {
      e.preventDefault();
      form.requestSubmit();
    }
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      addTask(input.value + ' (quick)');
      form.reset();
    }
  });

  document.querySelectorAll('.filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderTasks(currentFilter);
    });
  });

  clearBtn.addEventListener('click', () => {
    clearCompleted();
  });

  // Initial render
  renderTasks(currentFilter);
});