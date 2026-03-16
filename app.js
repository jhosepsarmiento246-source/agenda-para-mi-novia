/* ============================================
   MI AGENDA 🤎 - App Logic
   localStorage + Notificaciones
   ============================================ */

// ─── STATE ────────────────────────────────────
const STORAGE_KEY = 'miAgenda_tareas_v1';
let tareas = [];
let tabActual = 'pendientes';
let editandoId = null;
let eliminandoId = null;

// ─── INIT ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  cargarTareas();
  iniciarApp();
  configurarEventos();
  actualizarFechaHeader();
  pedirPermisoNotificaciones();
  programarChecksNotificacion();
  registrarServiceWorker();
});

// ─── SPLASH → APP ─────────────────────────────
function iniciarApp() {
  setTimeout(() => {
    document.getElementById('splash').style.display = 'none';
    const app = document.getElementById('app');
    app.classList.remove('hidden');
    app.classList.add('fade-in');
    renderizar();
  }, 2200);
}

// ─── LOCALSTORAGE ─────────────────────────────
function cargarTareas() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    tareas = data ? JSON.parse(data) : [];
  } catch {
    tareas = [];
  }
}

function guardarTareas() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tareas));
}

// ─── FECHA HEADER ─────────────────────────────
function actualizarFechaHeader() {
  const dias = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  const meses = ['enero','febrero','marzo','abril','mayo','junio',
                 'julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const hoy = new Date();
  const texto = `${dias[hoy.getDay()]}, ${hoy.getDate()} de ${meses[hoy.getMonth()]}`;
  document.getElementById('headerDate').textContent = texto;
}

// ─── EVENTOS ──────────────────────────────────
function configurarEventos() {
  // Add button
  document.getElementById('btnAdd').addEventListener('click', abrirModalNuevo);

  // Modal
  document.getElementById('modalClose').addEventListener('click', cerrarModal);
  document.getElementById('btnCancel').addEventListener('click', cerrarModal);
  document.getElementById('btnSave').addEventListener('click', guardarTarea);
  document.getElementById('modalOverlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('modalOverlay')) cerrarModal();
  });

  // Delete modal
  document.getElementById('deleteCancelBtn').addEventListener('click', cerrarModalEliminar);
  document.getElementById('deleteConfirmBtn').addEventListener('click', confirmarEliminar);
  document.getElementById('deleteOverlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('deleteOverlay')) cerrarModalEliminar();
  });

  // Tabs
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      tabActual = tab.dataset.tab;
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderizar();
    });
  });

  // Keyboard
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      cerrarModal();
      cerrarModalEliminar();
    }
    if (e.key === 'Enter' && e.ctrlKey) {
      if (!document.getElementById('modalOverlay').classList.contains('hidden')) {
        guardarTarea();
      }
    }
  });
}

// ─── MODAL NUEVA/EDITAR TAREA ────────────────
function abrirModalNuevo() {
  editandoId = null;
  document.getElementById('modalTitle').textContent = 'Nueva Tarea ✨';
  limpiarFormulario();
  // Default date: mañana
  const manana = new Date();
  manana.setDate(manana.getDate() + 1);
  document.getElementById('inputFecha').value = formatearFechaInput(manana);
  abrirModal();
}

function abrirModalEditar(id) {
  const tarea = tareas.find(t => t.id === id);
  if (!tarea) return;
  editandoId = id;
  document.getElementById('modalTitle').textContent = 'Editar Tarea ✏️';
  document.getElementById('inputMateria').value = tarea.materia;
  document.getElementById('inputTrabajo').value = tarea.trabajo;
  document.getElementById('inputFecha').value = tarea.fecha;
  document.querySelector(`input[name="prioridad"][value="${tarea.prioridad}"]`).checked = true;
  abrirModal();
}

function abrirModal() {
  document.getElementById('modalOverlay').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  setTimeout(() => document.getElementById('inputMateria').focus(), 400);
}

function cerrarModal() {
  document.getElementById('modalOverlay').classList.add('hidden');
  document.body.style.overflow = '';
  editandoId = null;
}

function limpiarFormulario() {
  document.getElementById('inputMateria').value = '';
  document.getElementById('inputTrabajo').value = '';
  document.getElementById('inputFecha').value = '';
  document.querySelector('input[name="prioridad"][value="media"]').checked = true;
}

// ─── GUARDAR TAREA ─────────────────────────────
function guardarTarea() {
  const materia = document.getElementById('inputMateria').value.trim();
  const trabajo = document.getElementById('inputTrabajo').value.trim();
  const fecha   = document.getElementById('inputFecha').value;
  const prioridad = document.querySelector('input[name="prioridad"]:checked').value;

  if (!materia) {
    mostrarToast('⚠️ Escribe el nombre de la materia');
    document.getElementById('inputMateria').focus();
    return;
  }
  if (!trabajo) {
    mostrarToast('⚠️ Describe la tarea');
    document.getElementById('inputTrabajo').focus();
    return;
  }
  if (!fecha) {
    mostrarToast('⚠️ Selecciona la fecha de entrega');
    document.getElementById('inputFecha').focus();
    return;
  }

  if (editandoId) {
    // Editar existente
    const idx = tareas.findIndex(t => t.id === editandoId);
    if (idx !== -1) {
      tareas[idx] = { ...tareas[idx], materia, trabajo, fecha, prioridad };
    }
    mostrarToast('✅ Tarea actualizada 🤎');
  } else {
    // Nueva tarea
    const nueva = {
      id: Date.now().toString(),
      materia,
      trabajo,
      fecha,
      prioridad,
      completada: false,
      creadaEn: new Date().toISOString()
    };
    tareas.unshift(nueva);
    mostrarToast('🤎 Tarea guardada');
  }

  guardarTareas();
  renderizar();
  cerrarModal();
}

// ─── COMPLETAR TAREA ──────────────────────────
function toggleCompletada(id) {
  const tarea = tareas.find(t => t.id === id);
  if (!tarea) return;
  tarea.completada = !tarea.completada;
  guardarTareas();
  renderizar();
  mostrarToast(tarea.completada ? '✅ ¡Bien hecho, mi amor!' : '↩️ Tarea reactivada');
}

// ─── ELIMINAR TAREA ───────────────────────────
function pedirEliminar(id) {
  eliminandoId = id;
  document.getElementById('deleteOverlay').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function cerrarModalEliminar() {
  document.getElementById('deleteOverlay').classList.add('hidden');
  document.body.style.overflow = '';
  eliminandoId = null;
}

function confirmarEliminar() {
  if (!eliminandoId) return;
  tareas = tareas.filter(t => t.id !== eliminandoId);
  guardarTareas();
  renderizar();
  cerrarModalEliminar();
  mostrarToast('🗑️ Tarea eliminada');
}

// ─── RENDERIZAR ───────────────────────────────
function renderizar() {
  const hoy = fechaHoy();
  
  // Filtros por tab
  let lista = [];
  if (tabActual === 'pendientes') {
    lista = tareas.filter(t => !t.completada);
  } else if (tabActual === 'hoy') {
    lista = tareas.filter(t => !t.completada && t.fecha === hoy);
  } else if (tabActual === 'completadas') {
    lista = tareas.filter(t => t.completada);
  }

  // Ordenar: por fecha más próxima
  lista.sort((a, b) => {
    if (a.fecha < b.fecha) return -1;
    if (a.fecha > b.fecha) return 1;
    const prior = { alta: 0, media: 1, baja: 2 };
    return prior[a.prioridad] - prior[b.prioridad];
  });

  // Stats
  const pendientes = tareas.filter(t => !t.completada).length;
  const paraHoy = tareas.filter(t => !t.completada && t.fecha === hoy).length;
  const completadas = tareas.filter(t => t.completada).length;
  
  document.getElementById('statPending').textContent = pendientes;
  document.getElementById('statToday').textContent = paraHoy;
  document.getElementById('statDone').textContent = completadas;

  const container = document.getElementById('taskList');
  const empty = document.getElementById('emptyState');

  if (lista.length === 0) {
    container.innerHTML = '';
    empty.classList.remove('hidden');
  } else {
    empty.classList.add('hidden');
    container.innerHTML = lista.map(tarea => renderCard(tarea)).join('');
    
    // Attach events
    container.querySelectorAll('.btn-check, .btn-uncheck').forEach(btn => {
      btn.addEventListener('click', () => toggleCompletada(btn.dataset.id));
    });
    container.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', () => abrirModalEditar(btn.dataset.id));
    });
    container.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', () => pedirEliminar(btn.dataset.id));
    });
  }
}

function renderCard(tarea) {
  const { diasRestantes, etiqueta, clase } = calcularDias(tarea.fecha);
  
  const fechaLegible = formatearFechaLegible(tarea.fecha);
  
  const checkBtn = tarea.completada
    ? `<button class="task-btn btn-uncheck" data-id="${tarea.id}" title="Reactivar">↩️</button>`
    : `<button class="task-btn btn-check" data-id="${tarea.id}" title="Completar">✅</button>`;

  return `
    <div class="task-card priority-${tarea.prioridad} ${tarea.completada ? 'completed' : ''}">
      <div class="task-inner">
        <div class="task-top">
          <span class="task-materia">📚 ${escapeHtml(tarea.materia)}</span>
          <span class="priority-badge-small ${tarea.prioridad}">${prioridadLabel(tarea.prioridad)}</span>
        </div>
        <p class="task-trabajo">${escapeHtml(tarea.trabajo)}</p>
        <div class="task-footer">
          <div class="task-date-wrap">
            <span class="task-date ${tarea.completada ? '' : clase}">📅 ${fechaLegible}</span>
            ${!tarea.completada ? `<span class="days-badge ${clase}">${etiqueta}</span>` : ''}
          </div>
          <div class="task-actions">
            ${checkBtn}
            <button class="task-btn btn-edit" data-id="${tarea.id}" title="Editar">✏️</button>
            <button class="task-btn btn-delete" data-id="${tarea.id}" title="Eliminar">🗑️</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ─── UTILIDADES DE FECHA ──────────────────────
function fechaHoy() {
  const h = new Date();
  return `${h.getFullYear()}-${String(h.getMonth()+1).padStart(2,'0')}-${String(h.getDate()).padStart(2,'0')}`;
}

function formatearFechaInput(date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}

function formatearFechaLegible(fechaStr) {
  const [y, m, d] = fechaStr.split('-').map(Number);
  const meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  return `${d} ${meses[m-1]} ${y}`;
}

function calcularDias(fechaStr) {
  const hoy = new Date(); hoy.setHours(0,0,0,0);
  const [y, m, d] = fechaStr.split('-').map(Number);
  const fecha = new Date(y, m-1, d);
  fecha.setHours(0,0,0,0);
  const diff = Math.round((fecha - hoy) / (1000*60*60*24));

  if (diff < 0)  return { diasRestantes: diff, etiqueta: `${Math.abs(diff)}d tarde`, clase: 'urgente' };
  if (diff === 0) return { diasRestantes: 0,    etiqueta: '¡Hoy!',                    clase: 'hoy' };
  if (diff === 1) return { diasRestantes: 1,    etiqueta: 'Mañana',                   clase: 'pronto' };
  if (diff <= 3)  return { diasRestantes: diff, etiqueta: `${diff} días`,             clase: 'pronto' };
  return               { diasRestantes: diff, etiqueta: `${diff} días`,             clase: 'normal' };
}

function prioridadLabel(p) {
  return p === 'alta' ? '🔴 Alta' : p === 'media' ? '🤎 Media' : '🟢 Baja';
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ─── TOAST ────────────────────────────────────
let toastTimer = null;
function mostrarToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.remove('hidden');
  requestAnimationFrame(() => toast.classList.add('show'));
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.classList.add('hidden'), 300);
  }, 2800);
}

// ─── NOTIFICACIONES ───────────────────────────
function pedirPermisoNotificaciones() {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'default') {
    // Mostrar banner invitando
    const banner = document.createElement('div');
    banner.className = 'notif-banner';
    banner.innerHTML = '🔔 Activa notificaciones para recordatorios de tareas';
    banner.addEventListener('click', async () => {
      const perm = await Notification.requestPermission();
      banner.remove();
      if (perm === 'granted') {
        mostrarToast('🔔 ¡Notificaciones activadas!');
      }
    });
    document.getElementById('app').insertAdjacentElement('afterbegin', banner);
  }
}

function programarChecksNotificacion() {
  // Check al iniciar
  setTimeout(checkNotificaciones, 3000);
  // Check cada hora
  setInterval(checkNotificaciones, 60 * 60 * 1000);
}

function checkNotificaciones() {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  const hoy = fechaHoy();
  const manana = (() => {
    const d = new Date(); d.setDate(d.getDate() + 1);
    return formatearFechaInput(d);
  })();

  const tareasPendientes = tareas.filter(t => !t.completada);

  // Tareas vencidas
  const vencidas = tareasPendientes.filter(t => t.fecha < hoy);
  if (vencidas.length > 0) {
    enviarNotificacion(
      `⚠️ Tienes ${vencidas.length} tarea${vencidas.length>1?'s':''} vencida${vencidas.length>1?'s':''}`,
      `${vencidas.map(t=>t.materia).join(', ')} - ¡No olvides entregarlas!`
    );
  }

  // Tareas para hoy
  const paraHoy = tareasPendientes.filter(t => t.fecha === hoy);
  if (paraHoy.length > 0) {
    enviarNotificacion(
      `📅 Hoy tienes ${paraHoy.length} entrega${paraHoy.length>1?'s':''}`,
      `${paraHoy.map(t=>t.materia).join(', ')} 🤎`
    );
  }

  // Tareas para mañana
  const paraMañana = tareasPendientes.filter(t => t.fecha === manana);
  if (paraMañana.length > 0) {
    enviarNotificacion(
      `🌙 Mañana vence: ${paraMañana.map(t=>t.materia).join(', ')}`,
      '¡Prepárate con tiempo, mi amor! 🤎'
    );
  }
}

function enviarNotificacion(titulo, cuerpo) {
  if (Notification.permission !== 'granted') return;
  try {
    new Notification(titulo, {
      body: cuerpo,
      icon: 'icons/icon-192.png',
      badge: 'icons/icon-192.png',
      tag: 'agenda-recordatorio',
    });
  } catch (e) {
    console.warn('Notificación no enviada:', e);
  }
}

// ─── SERVICE WORKER ───────────────────────────
function registrarServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
      .then(() => console.log('SW registrado ✅'))
      .catch(err => console.warn('SW error:', err));
  }
}
