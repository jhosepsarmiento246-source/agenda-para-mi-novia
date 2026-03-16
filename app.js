let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

const home = document.getElementById('home');
const content = document.getElementById('content');
const listSection = document.getElementById('listSection');
const addSection = document.getElementById('addSection');
const taskList = document.getElementById('taskList');
const form = document.getElementById('taskForm');

function showSection(section) {
  home.style.display = 'none';
  content.style.display = 'block';
  listSection.style.display = 'none';
  addSection.style.display = 'none';

  if (section === 'home') {
    home.style.display = 'block';
    content.style.display = 'none';
  } else if (section === 'list') {
    listSection.style.display = 'block';
    renderTasks();
  } else if (section === 'add') {
    addSection.style.display = 'block';
  }
}

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function renderTasks() {
  taskList.innerHTML = '';
  const now = new Date();
  const pendientes = tasks.filter(t => !t.done);
  const completadas = tasks.filter(t => t.done);

  // Pendientes
  const h3Pend = document.createElement('h3');
  h3Pend.textContent = pendientes.length > 0 ? 'Pendientes 📌' : '¡Todo listo! 🌟🤎';
  taskList.appendChild(h3Pend);

  if (pendientes.length > 0) {
    pendientes.sort((a,b) => new Date(a.fecha) - new Date(b.fecha));
    pendientes.forEach(task => {
      const index = tasks.indexOf(task);
      appendTask(task, index);
    });
  }

  // Completadas
  if (completadas.length > 0) {
    const h3Comp = document.createElement('h3');
    h3Comp.textContent = 'Completadas ✅';
    taskList.appendChild(h3Comp);
    completadas.forEach(task => {
      const index = tasks.indexOf(task);
      appendTask(task, index);
    });
  }
}

function appendTask(task, index) {
  const due = new Date(task.fecha);
  const diffDays = Math.floor((due - new Date()) / 86400000);
  let status = diffDays > 1 ? `Faltan ${diffDays} días` : diffDays === 1 ? 'Mañana' : diffDays === 0 ? '¡Hoy!' : 'Atrasada';
  let colorClass = diffDays < 0 ? 'overdue' : diffDays <= 1 ? 'due-soon' : '';

  const li = document.createElement('li');
  li.innerHTML = `
    <div style="display:flex; align-items:center; gap:12px;">
      <input type="checkbox" ${task.done ? 'checked' : ''} onchange="toggleDone(${index})" style="width:24px;height:24px;accent-color:#2ecc71;">
      <div style="flex:1;">
        <strong>${task.materia} - ${task.tarea}</strong><br>
        ${task.notas ? `<small>${task.notas}</small><br>` : ''}
        <small>Entrega: ${due.toLocaleString('es-ES')}</small><br>
        <small class="${colorClass}">${status} • ${task.prioridad}</small>
      </div>
    </div>
  `;
  taskList.appendChild(li);
}

function toggleDone(index) {
  tasks[index].done = !tasks[index].done;
  saveTasks();
  renderTasks();
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const newTask = {
    materia: document.getElementById('materia').value,
    tarea: document.getElementById('tarea').value,
    notas: document.getElementById('notas').value,
    prioridad: document.getElementById('prioridad').value,
    fecha: document.getElementById('fecha').value,
    done: false,
    notified: false
  };
  tasks.push(newTask);
  saveTasks();
  form.reset();
  showSection('list');
});

// === NOTIFICACIONES PUSH FIREBASE ===
async function subscribeToPush() {
  if (!window.messaging) {
    alert('Espera a que cargue Firebase');
    return;
  }
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(window.messaging, { 
        vapidKey: 'BDz36LZ1cPmBbXtQFvXxtIVbRHx9XXFgCzydPZQZKFrzTL00sUsej2jKoOlt5JA7wqMP92CcKr3Iqf7ai2Gf0wA'   // ← PEGA AQUÍ LA CLAVE PÚBLICA VAPID
      });
      console.log('Token:', token);
      localStorage.setItem('fcmToken', token);
      alert('✅ Notificaciones activadas! Ahora puedes recibir recordatorios en tu iPhone.');
    }
  } catch (err) {
    console.error(err);
    alert('Error al activar notificaciones. Asegúrate de que la app esté en pantalla de inicio.');
  }
}

// Iniciar
showSection('home');