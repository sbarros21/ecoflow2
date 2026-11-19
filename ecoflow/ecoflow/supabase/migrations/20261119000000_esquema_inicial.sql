-- =====================================================================
-- EcoFlow · Esquema inicial
-- Tablas: instaladores, proyectos, materiales
-- Seguridad: RLS en todas las tablas. Un instalador solo ve sus proyectos
-- asignados (y sus materiales); un admin ve y gestiona todo.
-- =====================================================================

-- ---------- Tipos ----------
create type public.rol_usuario as enum ('admin', 'instalador');
create type public.estado_proyecto as enum ('pendiente', 'en_progreso', 'completado');
create type public.tipo_material as enum ('panel', 'inversor', 'bateria', 'estructura', 'cableado', 'otro');

-- ---------- Tabla: instaladores ----------
-- 1:1 con auth.users. Se crea automáticamente al registrarse (trigger abajo).
create table public.instaladores (
  id          uuid primary key references auth.users (id) on delete cascade,
  nombre      text not null check (char_length(nombre) between 2 and 120),
  email       text not null unique,
  telefono    text,
  rol         public.rol_usuario not null default 'instalador',
  activo      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ---------- Tabla: proyectos ----------
create table public.proyectos (
  id                  uuid primary key default gen_random_uuid(),
  nombre              text not null check (char_length(nombre) between 3 and 120),
  cliente             text not null check (char_length(cliente) between 2 and 120),
  direccion           text not null,
  capacidad_kw        numeric(8,2) not null check (capacidad_kw > 0 and capacidad_kw <= 10000),
  estado              public.estado_proyecto not null default 'pendiente',
  fecha_inicio        date not null,
  fecha_fin_estimada  date not null,
  instalador_id       uuid references public.instaladores (id) on delete set null,
  notas               text,
  created_by          uuid not null default auth.uid() references public.instaladores (id),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint fechas_validas check (fecha_fin_estimada >= fecha_inicio)
);

create index proyectos_instalador_idx on public.proyectos (instalador_id);
create index proyectos_estado_idx on public.proyectos (estado);

-- ---------- Tabla: materiales ----------
create table public.materiales (
  id              uuid primary key default gen_random_uuid(),
  proyecto_id     uuid not null references public.proyectos (id) on delete cascade,
  nombre          text not null,
  tipo            public.tipo_material not null default 'otro',
  cantidad        integer not null check (cantidad > 0),
  costo_unitario  numeric(12,2) not null default 0 check (costo_unitario >= 0),
  created_at      timestamptz not null default now()
);

create index materiales_proyecto_idx on public.materiales (proyecto_id);

-- ---------- Triggers ----------
-- updated_at automático
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger proyectos_updated_at
  before update on public.proyectos
  for each row execute function public.set_updated_at();

-- Perfil de instalador al registrarse un usuario en Supabase Auth
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.instaladores (id, nombre, email)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'nombre', split_part(new.email, '@', 1)), new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Un instalador (no admin) solo puede cambiar el estado y las notas de su proyecto.
create or replace function public.proteger_campos_proyecto()
returns trigger language plpgsql as $$
begin
  if not public.es_admin() then
    if new.nombre is distinct from old.nombre
       or new.cliente is distinct from old.cliente
       or new.direccion is distinct from old.direccion
       or new.capacidad_kw is distinct from old.capacidad_kw
       or new.fecha_inicio is distinct from old.fecha_inicio
       or new.fecha_fin_estimada is distinct from old.fecha_fin_estimada
       or new.instalador_id is distinct from old.instalador_id then
      raise exception 'Solo un administrador puede modificar estos campos';
    end if;
  end if;
  return new;
end;
$$;

-- ---------- Función auxiliar para RLS ----------
-- SECURITY DEFINER evita la recursión infinita que aparece si una política
-- de "instaladores" consulta la propia tabla "instaladores".
create or replace function public.es_admin()
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.instaladores
    where id = auth.uid() and rol = 'admin' and activo
  );
$$;

create trigger proyectos_proteger_campos
  before update on public.proyectos
  for each row execute function public.proteger_campos_proyecto();

-- ---------- RLS ----------
alter table public.instaladores enable row level security;
alter table public.proyectos    enable row level security;
alter table public.materiales   enable row level security;

-- instaladores
create policy "instaladores: ver el propio perfil o admin"
  on public.instaladores for select to authenticated
  using (id = auth.uid() or public.es_admin());

create policy "instaladores: editar el propio perfil"
  on public.instaladores for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid() and rol = (select i.rol from public.instaladores i where i.id = auth.uid()));

create policy "instaladores: admin gestiona"
  on public.instaladores for all to authenticated
  using (public.es_admin()) with check (public.es_admin());

-- proyectos
create policy "proyectos: ver asignados o admin"
  on public.proyectos for select to authenticated
  using (instalador_id = auth.uid() or public.es_admin());

create policy "proyectos: solo admin crea"
  on public.proyectos for insert to authenticated
  with check (public.es_admin() and created_by = auth.uid());

create policy "proyectos: asignado o admin actualiza"
  on public.proyectos for update to authenticated
  using (instalador_id = auth.uid() or public.es_admin())
  with check (instalador_id = auth.uid() or public.es_admin());

create policy "proyectos: solo admin elimina"
  on public.proyectos for delete to authenticated
  using (public.es_admin());

-- materiales: heredan la visibilidad del proyecto
create policy "materiales: ver si ve el proyecto"
  on public.materiales for select to authenticated
  using (exists (
    select 1 from public.proyectos p
    where p.id = materiales.proyecto_id
      and (p.instalador_id = auth.uid() or public.es_admin())
  ));

create policy "materiales: asignado o admin gestiona"
  on public.materiales for all to authenticated
  using (exists (
    select 1 from public.proyectos p
    where p.id = materiales.proyecto_id
      and (p.instalador_id = auth.uid() or public.es_admin())
  ))
  with check (exists (
    select 1 from public.proyectos p
    where p.id = materiales.proyecto_id
      and (p.instalador_id = auth.uid() or public.es_admin())
  ));

-- ---------- Vista para el dashboard ----------
-- security_invoker = true: la vista respeta el RLS de quien consulta.
create view public.resumen_proyectos
with (security_invoker = true) as
select
  p.id,
  p.nombre,
  p.cliente,
  p.estado,
  p.capacidad_kw,
  p.fecha_inicio,
  p.fecha_fin_estimada,
  p.instalador_id,
  i.nombre as instalador_nombre,
  count(m.id)::int as total_materiales,
  coalesce(sum(m.cantidad * m.costo_unitario), 0)::numeric(14,2) as costo_materiales
from public.proyectos p
left join public.instaladores i on i.id = p.instalador_id
left join public.materiales m on m.proyecto_id = p.id
group by p.id, i.nombre;

-- ---------- Realtime ----------
alter publication supabase_realtime add table public.proyectos;
