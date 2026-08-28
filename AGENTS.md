# 🤖 AGENTS.md - Harness Engineering & Directivas de Desarrollo

Este archivo define las reglas de arquitectura, estándares de código, patrones de integración, comandos de verificación y directivas operativas para todos los agentes de Inteligencia Artificial (y desarrolladores) que contribuyan al proyecto **SEPISAC Frontend (`sepisac-f`)**.

---

## 1. 📌 Visión General del Proyecto y Tech Stack

- **Proyecto:** `sepisac-f` (Sistema de Gestión SEPISAC - Frontend)
- **Ecosistema:** React 19 + TypeScript + Vite
- **Integración Backend:** Spring Boot (REST API / JWT Auth)
- **Tecnologías Clave:**
  - **UI & Estilos:** Tailwind CSS + Shadcn/ui (Radix UI) + Lucide React + Sonner (Toasts)
  - **Navegación:** React Router DOM v7 (Con Guards RBAC)
  - **Cliente HTTP:** Axios (Con interceptores para JWT y manejo de errores Spring)
  - **Estado de Servidor:** TanStack Query v5 (Query Keys Factory)
  - **Estado de Cliente UI:** Zustand
  - **Formularios & Validación:** React Hook Form + Zod (`@hookform/resolvers/zod`)

---

## 2. 🏗️ Arquitectura Modular (Feature-Driven Architecture)

El código del proyecto debe organizarse siguiendo estrictamente una **arquitectura basada en características de negocio (*Feature-Driven*)**.

### 📁 Estructura de Directorios (`src/`)

```plaintext
src/
├── app/                       # Providers globales y stores UI (e.g. QueryClient, AuthStore)
├── assets/                    # Assets estáticos (imágenes, SVGs globales)
├── components/                # Componentes transversales compartidos
│   ├── ui/                    # Primitivas de UI de Shadcn (Button, Card, Dialog, Form, Input, etc.)
│   ├── common/                # Componentes genéricos de alto nivel (DataTable, ConfirmModal)
│   ├── feedback/              # Loaders, EmptyState, ErrorBoundary
│   └── layout/                # Header, Sidebar, Footer, UserMenu
├── config/                    # Configuración global y variables de entorno validadas con Zod (`env.ts`)
├── features/                  # Módulos de dominio de negocio (Feature-Driven)
│   ├── auth/                  # Módulo de Autenticación
│   │   ├── api/               # Peticiones Axios y custom hooks/mutaciones de TanStack Query
│   │   ├── components/        # Componentes UI exclusivos del módulo
│   │   ├── hooks/             # Custom hooks internos de la feature
│   │   ├── pages/             # Vistas/páginas asociadas a rutas del módulo
│   │   ├── schemas/           # Esquemas de validación Zod
│   │   ├── types/             # Interfaces TypeScript y DTOs del módulo
│   │   └── index.ts           # Barrel Export (Punto de entrada público del módulo)
│   └── [feature_name]/        # Nuevos módulos (e.g., usuarios, operaciones, reportes)
├── hooks/                     # Custom hooks globales (useDebounce, useMediaQuery)
├── layouts/                   # Layouts principales (AppLayout, AuthLayout)
├── lib/                       # Instancias y configuración de librerías (`axios.ts`, `query-client.ts`, `utils.ts`)
├── routes/                    # Configuración de React Router DOM (`ProtectedRoute`, `RoleGuard`)
└── types/                     # Tipos globales de API (`ApiResponse<T>`, `PageResponse<T>`, `ApiErrorResponse`)
```

### 🔒 Reglas Estrictas de Encapsulamiento y Barrilería

1. **Cada Feature debe incluir su propio `index.ts` (Barrel Export)**. Solo exporta los componentes, hooks y tipos que deban ser públicos para el resto de la aplicación.
2. **Prohibido importar archivos privados internos de una feature desde otra feature**.
   - ✅ `import { useAuth } from '@/features/auth';`
   - ❌ `import { LoginForm } from '@/features/auth/components/LoginForm';` (Salvo que esté expuesto en `index.ts`).
3. Componentes genéricos o reutilizables entre 2 o más módulos deben residir en `src/components/common/` o `src/components/ui/`, NO dentro de una feature específica.

---

## 3. 🎨 Sistema de Diseño y Directivas de Shadcn/ui

- **Primitivas UI:** Residen en `src/components/ui/` y son componentes headless/accesibles de Shadcn/ui impulsados por Radix UI y Tailwind.
- **Instalación de Nuevos Componentes:** Siempre utiliza la CLI oficial de Shadcn en lugar de construir componentes de UI básicos desde cero:
  ```powershell
  npx shadcn@latest add <component_name>
  ```
- **Combinación de Clases:** Utiliza la utilidad `cn(...)` de `@/lib/utils` (basada en `clsx` y `tailwind-merge`) para fusionar clases de Tailwind de forma segura:
  ```tsx
  import { cn } from '@/lib/utils';
  ```
- **Reutilización:** Prioriza el uso de primitivas Shadcn (`Button`, `Card`, `Dialog`, `Form`, `Input`, `Select`, `Table`, `Badge`, `Skeleton`, `Sonner`) sobre elementos HTML nativos sin estilizar.

---

## 4. 🛠️ Harness de Verificación y Comandos de Desarrollo

Todo agente o desarrollador DEBE verificar sus cambios ejecutando los siguientes comandos antes de dar por completada cualquier tarea:

| Acción | Comando | Descripción |
| :--- | :--- | :--- |
| **Servidor de Dev** | `npm run dev` | Inicia el servidor de desarrollo Vite. |
| **Verificación de Tipos y Build** | `npm run build` | Ejecuta `tsc -b && vite build`. Garantiza 0 errores de TypeScript. |
| **Linter** | `npm run lint` | Ejecuta ESLint (`eslint .`). Garantiza cumplimiento de código limpio. |
| **Preview** | `npm run preview` | Previsualiza el build de producción localmente. |

### ⚠️ Regla de Oro de Verificación
**Ningún agente puede declarar una tarea como finalizada si `npm run build` o `npm run lint` arrojan errores**.

---

## 5. 🌐 Integración con Backend Spring Boot & DTOs

### Cliente HTTP (`src/lib/axios.ts`)
- Utiliza la instancia exportada `apiClient`.
- Maneja interceptores globales:
  - Inyección automática del Bearer JWT Token desde `useAuthStore`.
  - Redirección automática a `/login` en respuestas `401 Unauthorized`.
  - Notificaciones Toasts elegantes con `Sonner` para `403 Forbidden`, `500 Server Error` y errores de negocio.

### Estructura de DTOs Estándar (`src/types/api.ts`)
Respetar los tipos genéricos alineados con las respuestas del backend Spring Boot:

```typescript
// Respuesta genérica envuelta
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    timestamp: string;
}

// Respuesta paginada (Spring Data Pageable)
export interface PageResponse<T> {
    content: T[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
}

// Errores de API
export interface ApiErrorResponse {
    status: number;
    message: string;
    errors?: Record<string, string>; // Errores de validación @Valid
    timestamp: string;
}
```

---

## 6. ⚡ Manejo de Estado (TanStack Query v5 & Zustand)

### Server State (TanStack Query v5)
- Utiliza el patrón **Query Keys Factory** por cada feature para evitar colisiones de caché:
  ```typescript
  export const userKeys = {
      all: ['users'] as const,
      lists: () => [...userKeys.all, 'list'] as const,
      list: (filters: string) => [...userKeys.lists(), { filters }] as const,
      details: () => [...userKeys.all, 'detail'] as const,
      detail: (id: string) => [...userKeys.details(), id] as const,
  };
  ```
- Tras mutaciones que alteren datos (`useMutation`), **inválida explícitamente la caché** usando `queryClient.invalidateQueries(...)`.

### Client State (Zustand)
- Zustand debe usarse únicamente para estado UI global ligero o sesión de usuario (e.g. `useAuthStore`, toggle de sidebar, tema).

---

## 7. 📝 Formularios y Validación (React Hook Form + Zod)

- Todos los formularios deben definirse con esquemas Zod en `src/features/[feature]/schemas/`.
- Integración obligatoria con `@hookform/resolvers/zod`.
- Usar la abstracción de componentes `<Form>`, `<FormField>`, `<FormItem>`, `<FormLabel>`, `<FormControl>`, `<FormMessage>` de Shadcn para mantener accesibilidad ARIA y manejo uniforme de errores.

---

## 8. 🚨 Directivas de Calidad y Directivas de Agente

1. **Cero Tolerancia a Ignorar Errores:** Queda prohibido el uso de `@ts-ignore`, `@ts-nocheck` o `eslint-disable` salvo caso extremo explícitamente justificado.
2. **Preservación de Contratos:** Si modificas la firma de un hook, función o API cliente, debes actualizar todos sus puntos de llamada en la aplicación.
3. **Internacionalización y Mensajes:** Todos los mensajes de error en UI, esquemas Zod y toasters deben redactarse en **Español**.
4. **Documentación:** Mantener actualizados los documentos en `docs/` (`SPEC.md` y `MANUAL_PASO_A_PASO.md`) si se introducen cambios de arquitectura o flujos principales.
