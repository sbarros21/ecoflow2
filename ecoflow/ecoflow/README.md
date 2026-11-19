# ☀️ EcoFlow

Aplicación interna para gestionar proyectos de instalación de paneles solares.

**Stack:** React 19 · TypeScript · Vite · Tailwind CSS v4 · componentes estilo shadcn/ui · Supabase (PostgreSQL, Auth, RLS, Realtime) · Zod

📄 Documento de arquitectura: [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md)

## Funcionalidades

- Inicio de sesión con Supabase Auth y roles **admin** e **instalador**.
- Dashboard con conteo por estado (Pendiente, En progreso, Completado), capacidad total en kW, búsqueda y filtro.
- Cambio de estado con actualización optimista y sincronización en tiempo real.
- Formulario de nuevo proyecto (solo admin) validado con Zod antes de enviarse.
- Seguridad con RLS: cada instalador solo ve sus proyectos asignados.

## Puesta en marcha

### 1. Base de datos (Supabase)

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. En **SQL Editor**, ejecuta `supabase/migrations/20261119000000_esquema_inicial.sql`.
3. En **Authentication → Users**, crea al menos dos usuarios (un admin y un instalador).
4. Cambia el correo del admin en `supabase/seed.sql` y ejecútalo.

> Con la CLI de Supabase: `supabase link --project-ref <ref>` y luego `supabase db push`.

### 2. Frontend

```bash
cp .env.example .env   # completa VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
npm install
npm run dev
```

### 3. Regenerar tipos (si cambia el esquema)

```bash
npx supabase gen types typescript --project-id <ref> > src/types/database.ts
```

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Verificación de tipos y build de producción |
| `npm run lint` | Linter (oxlint) |

## Estructura

```
src/
├── components/ui/     Componentes base (Button, Card, Input, Badge, Alert)
├── features/auth/     AuthProvider y LoginPage
├── features/proyectos/ Dashboard, tabla, tarjetas y formulario
├── hooks/             useProyectos, useInstaladores
├── lib/               Cliente Supabase, validaciones Zod, utilidades
└── types/             Tipos generados del esquema
supabase/
├── migrations/        Esquema, RLS, triggers y vista
└── seed.sql           Datos de ejemplo
```
