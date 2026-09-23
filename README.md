# Mi Agenda 🤎
> App web progresiva (PWA) de tareas académicas, paleta corazón marrón

## Archivos del proyecto

```
agenda-amor/
├── index.html        ← App principal
├── style.css         ← Estilos (paleta marrón)
├── app.js            ← Lógica, localStorage, notificaciones
├── sw.js             ← Service Worker (offline + PWA)
├── manifest.json     ← Configuración PWA para iPhone
├── vercel.json       ← Config para Vercel
└── icons/            ← Íconos generados automáticamente
    ├── icon-192.png
    ├── icon-512.png
    ├── icon-180.png
    └── icon-152.png
```


## 📱 Instalar en iPhone (como app nativa)

1. Abre la URL en **Safari** (obligatorio, no Chrome)
2. Toca el ícono de compartir **⎋**
3. Baja y toca **"Agregar a pantalla de inicio"**
4. Ponle nombre **"Mi Agenda"** → Agregar
5. ¡Aparece el ícono 🤎 en tu pantalla de inicio!

---

##  Características

- Agrega materias con nombre, descripción y fecha de entrega
-  Prioridad: Alta / Media / Baja
-  3 pestañas: Pendientes / Para Hoy / Completadas
- Notificaciones de recordatorio (tareas vencidas, de hoy, de mañana)
- Datos guardados en el teléfono (localStorage — sin servidor)
- Funciona sin internet después de la primera carga
- Paleta corazón marrón completa

---

## 💾 Los datos

No se necesita base de datos ni servidor. Los datos son **solo suyos**, en su teléfono.

> **Importante**: Si borra el historial/datos de Safari, los datos se perderán.
> Para evitar esto, usar siempre desde el ícono en pantalla de inicio.
