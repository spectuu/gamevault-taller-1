# Backend - Supabase

## Tabla: `games`

Almacena los 100 videojuegos del catálogo.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID (PK) | Identificador único generado por Supabase |
| `name` | TEXT NOT NULL | Nombre del videojuego |
| `image` | TEXT NOT NULL | URL de la imagen/portada |
| `description` | TEXT | Descripción del juego |
| `genre` | TEXT | Género (RPG, FPS, Aventura, etc.) |
| `platform` | TEXT | Plataformas disponibles |
| `release_year` | INTEGER | Ano de lanzamiento |
| `developer` | TEXT | Estudio desarrollador |
| `publisher` | TEXT | Distribuidor/publisher |
| `rating` | TEXT | Clasificación ESRB (E, T, M) |
| `min_cpu` | TEXT | CPU mínima requerida |
| `min_ram` | TEXT | RAM mínima requerida |
| `min_gpu` | TEXT | GPU mínima requerida |
| `min_storage` | TEXT | Almacenamiento mínimo |
| `rec_cpu` | TEXT | CPU recomendada |
| `rec_ram` | TEXT | RAM recomendada |
| `rec_gpu` | TEXT | GPU recomendada |
| `user_id` | UUID (FK) | Referencia al usuario creador (`auth.users.id`) |
| `created_at` | TIMESTAMPTZ | Fecha de creación (automatica) |

---

## Tabla: `profiles`

Gestiona los roles de usuario (admin o usuario normal).

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID (PK, FK) | Referencia a `auth.users.id` |
| `email` | TEXT | Correo del usuario |
| `role` | TEXT | Rol: `user` o `admin` |
| `created_at` | TIMESTAMPTZ | Fecha de creación |

Se crea automáticamente al registrarse un usuario mediante un trigger en la base de datos.

---

## Trigger: `on_auth_user_created`

Función: `handle_new_user()`

Se ejecuta automáticamente después de cada `INSERT` en `auth.users`. Crea un registro en `profiles` con rol `user` por defecto.

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Row Level Security (RLS)

Ambas tablas tienen RLS habilitado. Las políticas controlan el acceso a los datos.

### Políticas de `games`

| Política | Operación | Regla |
|----------|-----------|-------|
| `games_select` | SELECT | Cualquier usuario autenticado puede leer todos los juegos |
| `games_insert` | INSERT | Solo puede insertar si `user_id` coincide con `auth.uid()` |
| `games_update` | UPDATE | Solo el creador del juego (`user_id = auth.uid()`) o un admin |
| `games_delete` | DELETE | Solo el creador del juego (`user_id = auth.uid()`) o un admin |

La verificación de admin se hace consultando la tabla `profiles`:

```sql
EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
```

### Políticas de `profiles`

| Política | Operación | Regla |
|----------|-----------|-------|
| Lectura | SELECT | Cualquier usuario autenticado |
| Actualización | UPDATE | Solo el propio usuario (`auth.uid() = id`) |

---

## Autenticación

Se utiliza **Supabase Auth** con email y contraseña.

- **Registro**: `supabase.auth.signUp({ email, password })`
- **Login**: `supabase.auth.signInWithPassword({ email, password })`
- **Logout**: `supabase.auth.signOut()`
- **Sesión**: `supabase.auth.getSession()` y `supabase.auth.onAuthStateChange()`

---

## Sistema de roles

| Rol | Permisos |
|-----|----------|
| `user` | Puede ver todos los juegos. Solo puede crear, editar y eliminar sus propios juegos. |
| `admin` | Puede ver, crear, editar y eliminar cualquier juego. |

Para asignar un admin manualmente:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'correo@ejemplo.com';
```

---

## Archivos SQL (orden de ejecución)

1. **`seed.sql`** - Inserta los 100 videojuegos iniciales (nombre e imagen)
2. **`migration-final.sql`** - Agrega columnas extras, crea tabla `profiles`, trigger, y políticas RLS
3. **`seed-details-v2.sql`** - Actualiza los 100 juegos con descripción, género, plataforma, developer, publisher, rating y requisitos del sistema
4. **`fix-broken-images-final.sql`** - Corrige las URLs de imágenes rotas usando CDNs verificados (Steam, Nintendo, PlayStation)
5. **`make-admin.sql`** - Asigna rol admin a un usuario especifico
