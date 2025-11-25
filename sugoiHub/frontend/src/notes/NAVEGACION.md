Resumen: implementación de la navegación SPA con React Router (v6)

Objetivo
- Convertir la navegación del proyecto a SPA para evitar recargas completas al cambiar de página.
- Mantener Sidebar y Topbar fijos (layout) y renderizar el contenido de cada ruta dentro del layout.
- Mostrar estado "activo" en los enlaces (NavLink) y aplicar estilos de hover/activo según la paleta Neon Noir.

Arquitectura y archivos clave

1) `src/App.tsx`
- Ahora envuelve la aplicación en un `BrowserRouter` y declara las rutas con `Routes` y `Route`.
- Ruta base (`/`) usa `MainLayout` como elemento padre; dentro de este `Route` se definen las rutas hijas:
  - index (`/`) → `HomePage`
  - `/manga` → `MangaPage`
  - `/games` → `GamesPage`
  - `/discover` → `DiscoverPage`
  - `/community` → `CommunityPage`
  - `/music` → `MusicPage`
  - `/profile` → `ProfilePage`

Por qué: así todas las páginas se renderizan dentro de la misma estructura (Sidebar + Topbar) y sólo cambia el contenido del `Outlet`.

2) `src/layouts/MainLayout.tsx`
- Contiene el layout persistente: `<Sidebar />`, `<Topbar />` y un `<Outlet />` dentro del `main`.
- `Outlet` es donde React Router inserta el componente correspondiente a la ruta actual.

3) `src/components/allPages/Sidebar.tsx` y `Topbar.tsx`
- Reemplacé los `<a href="...">` por `NavLink` (de `react-router-dom`) para navegación cliente.
- `NavLink` permite pasar una función a `className` que recibe `{ isActive }`. Usé esto para aplicar la clase `active` cuando la ruta coincide.
- Tip: para evitar errores de TypeScript añadí tipado explícito al parámetro de la función: `({ isActive }: { isActive?: boolean }) => ...`.

4) CSS y estilo activo
- Añadí utilidades en `src/index.css`:
  - `.sidebar-link:hover { background-color: var(--accent-violet); color: white; }` → hover morado
  - `.sidebar-link.active { background-color: var(--accent-violet); color: white; }` → estado activo
  - `.link.active { color: var(--accent-violet); font-weight: 600; }` → Topbar activo

5) Dependencias
- `react-router-dom@6` es la librería usada. Se instala con:
  ```powershell
  npm install react-router-dom@6
  ```
- Eliminé la dependencia obsoleta `@types/react-router-dom@5` del `package.json` porque su tipado entra en conflicto con v6 (v6 trae tipos propios).
- Si TypeScript exige tipos adicionales normalmente no es necesario porque `react-router-dom` publica sus tipos.

Flujo de navegación (qué ocurre cuando haces click en un enlace)
1. El usuario hace click en un `<NavLink to="/games">`.
2. React Router intercepta el click y actualiza la URL usando la History API del navegador sin recargar la página.
3. `BrowserRouter` detecta el cambio de ruta y renderiza el `Route` que coincide.
4. El `Route` hijo correspondiente (por ejemplo `GamesPage`) se monta dentro del `Outlet` en `MainLayout`.
5. Sidebar y Topbar permanecen montados (no se desmontan), por lo que la navegación parece instantánea.

Beneficios
- Sin recargas completas: la navegación es rápida y suave.
- Mantienes el estado de componentes persistentes (por ejemplo un estado de menú o un drawer) al cambiar de página.
- Fácil control de rutas protegidas o redirects puertas adelante.

Problemas comunes y cómo los resolví aquí
- Error: "Module not found: react-router-dom" → solución: instalar `react-router-dom` (npm install).
- Error de tipos: `@types/react-router-dom` en versión 5 causa conflicto con v6 → removee la entrada vieja del package.json y reinstalé deps.
- Error de TS: "implicit any" cuando usas la función `className` de `NavLink` → solución: escribir el parámetro con tipado explicíto `({ isActive }: { isActive?: boolean }) => ...`.

Cómo probar localmente (recuerda estos pasos)
1. Instalar dependencias (si no lo hiciste ya):
   ```powershell
   npm install
   ```
2. Arrancar dev server:
   ```powershell
   npm run dev
   ```
3. En el navegador, abre la app y prueba:
   - Hacer click en Sidebar / Topbar para ver que la URL cambia sin recargar.
   - Ver en DevTools → Network que no se solicita `index.html` de nuevo en cada navegación.
   - Ver en DevTools → Elements que la clase `.active` se aplica correctamente.

Archivos modificados importantes (resumen)
- `src/App.tsx` — configuración de rutas con `BrowserRouter` y `Routes`.
- `src/layouts/MainLayout.tsx` — layout con `Outlet`.
- `src/components/allPages/Sidebar.tsx` — `NavLink` y active class.
- `src/components/allPages/Topbar.tsx` — `NavLink`.
- `src/index.css` — utilidades de hover/active y tokens de paleta.
- `package.json` — eliminada la entrada obsoleta de `@types/react-router-dom`.

Notas finales
- Si quieres que la navegación tenga animaciones o un manejo de carga (loading) entre páginas puedo añadir `react-transition-group` o un state global de "loading" que muestre un skeleton.
- Si quieres rutas protegidas (p. ej. redirigir a /login cuando no hay usuario) lo integro con una ruta "guard" fácilmente.

Si quieres, agrego una sección con ejemplos de código concretos (por ejemplo: cómo proteger rutas o cómo usar `navigate()` programáticamente).