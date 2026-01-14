# 🚀 Funnelhot AI Forge - Gestión de Asistentes (Next.js Edition)

Este proyecto es un Dashboard de Alta Gama diseñado para la creación, entrenamiento y gestión de asistentes de IA personalizados. Ha sido evolucionado a una arquitectura de **Senior Frontend Engineering** utilizando **Next.js 15**, **React 19** y **Zustand 5**, priorizando la robustez, la estética y una experiencia de usuario (UX) de "Cero Latencia".

## 🛠 Instrucciones para Correr el Proyecto (Entorno Local)

Para ejecutar esta aplicación en tu máquina local, sigue estos pasos:

1. **Requisitos**: Node.js v18.17.0 o superior.
2. **Instalación de Dependencias**:
   ```bash
   npm install
   ```
3. **Configuración de API Key** (opcional):

Crea un archivo `.env.local` en la raíz y añade tu llave si vas a probar la integración con una API externa:

```env
NEXT_PUBLIC_API_KEY=tu_api_key_aqui
```

Si no proporcionas `NEXT_PUBLIC_API_KEY`, el chat usará respuestas simuladas locales.

---

## 📁 Estructura del proyecto (resumen)

Raíz del proyecto (principales carpetas y archivos):

```text
my-app/
├─ app/                  # Rutas, layouts y estilos globales (App Router)
├─ components/           # Componentes UI reutilizables
├─ hooks/                # Hooks con React Query y lógica cliente
├─ services/             # Servicios mock (CRUD con delays)
├─ store/                # Zustand store
├─ constants.tsx         # Datos iniciales y mocks
├─ types.ts              # Tipos TypeScript
├─ postcss.config.mjs
├─ tailwind.config.js
└─ package.json
```

---

## 🧠 Decisiones técnicas (resumen)

- Utilizo **React Query** para las operaciones asíncronas (queries y mutations) con invalidación y optimistic updates.
- Uso **Zustand** para el estado UI (modal, selección y chat por asistente).
- Los servicios son mocks en memoria con delays (100–600ms) y 10% de probabilidad de error en eliminaciones para probar rollback/errores.
- El chat simulado usa el array `CHAT_MOCK_RESPONSES` cuando no hay `NEXT_PUBLIC_API_KEY`, con delay de 1–2s y un indicador de "escribiendo".

---

## ✨ Características implementadas

- Listado de asistentes (dashboard) con tarjetas.
- Modal de creación/edición en 2 pasos con validaciones (nombre mínimo 3, suma de porcentajes = 100).
- Creación, edición y eliminación (confirmación + optimistic updates).
- Página de entrenamiento por asistente con editor de `rules` y simulador de chat.
- Reproductor de audio y manejo básico de dispositivos (Web Audio API).

---

## 🔗 Despliegue / Netlify

Si despliegas en Netlify, pega aquí el enlace de la URL de producción para que quede referenciado:

**Netlify URL:** [link_de_Netlify](https://assitsaifunnelhot.netlify.app/)

Ejemplo:

```text
https://mi-proyecto-funnelhot.netlify.app
```

---

## 📝 Notas y mejoras pendientes

- Añadir tests automáticos (unit/e2e).
- Reemplazar el parser README simple por `react-markdown` para un renderizado más robusto.
- Mejoras de accesibilidad (a11y) y pruebas de contraste.

---

Desarrollado por una sola persona para la prueba técnica.
