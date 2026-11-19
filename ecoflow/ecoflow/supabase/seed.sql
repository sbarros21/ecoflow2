-- Ejecutar DESPUÉS de crear los usuarios desde Authentication > Users
-- (el trigger on_auth_user_created crea su fila en "instaladores").

-- 1) Promover al primer administrador
update public.instaladores set rol = 'admin' where email = 'admin@ecoflow.co';

-- 2) Proyectos de ejemplo (asignados al primer instalador no admin)
insert into public.proyectos (nombre, cliente, direccion, capacidad_kw, estado, fecha_inicio, fecha_fin_estimada, instalador_id, created_by)
select v.nombre, v.cliente, v.direccion, v.kw, v.estado::public.estado_proyecto, v.ini::date, v.fin::date,
       (select id from public.instaladores where rol = 'instalador' order by created_at limit 1),
       (select id from public.instaladores where rol = 'admin' order by created_at limit 1)
from (values
  ('Techo solar Bodega Norte', 'Logística Andina S.A.S.', 'Cra 15 # 120-30, Bogotá', 45.5, 'en_progreso', '2026-11-01', '2026-12-15'),
  ('Granja solar Tocancipá',   'AgroSol Ltda.',           'Km 3 vía Tocancipá',      250,  'pendiente',   '2026-12-01', '2027-03-30'),
  ('Residencial Cedritos',     'Familia Rojas',           'Cl 147 # 12-40, Bogotá',  6.2,  'completado',  '2026-09-10', '2026-09-25')
) as v(nombre, cliente, direccion, kw, estado, ini, fin);

insert into public.materiales (proyecto_id, nombre, tipo, cantidad, costo_unitario)
select p.id, 'Panel monocristalino 550 W', 'panel', 80, 620000
from public.proyectos p where p.nombre = 'Techo solar Bodega Norte';
