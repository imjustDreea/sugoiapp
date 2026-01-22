# Componentes UI Reutilizables

## Button

Componente de botón reutilizable con estilos pixel art (tipo teclado mecánico).

### Importación

```tsx
import Button from '../ui/Button';
```

### Props

| Prop | Tipo | Por defecto | Descripción |
|------|------|-------------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'danger' \| 'default'` | `'default'` | Estilo del botón |
| `size` | `'sm' \| 'md' \| 'icon' \| 'icon-sm'` | `'md'` | Tamaño del botón |
| `fullWidth` | `boolean` | `false` | Si el botón ocupa todo el ancho |
| `children` | `ReactNode` | - | Contenido del botón |
| `...props` | `ButtonHTMLAttributes` | - | Todas las props nativas de `<button>` |

### Variantes

#### Primary (Verde neón - accent lime)
```tsx
<Button variant="primary">
  Aceptar
</Button>
```

#### Secondary (Violeta - accent violet)
```tsx
<Button variant="secondary">
  Cancelar
</Button>
```

#### Danger (Rojo para acciones destructivas)
```tsx
<Button variant="danger">
  Eliminar
</Button>
```

#### Default (Gris oscuro)
```tsx
<Button variant="default">
  Opción
</Button>
```

### Tamaños

#### Small (para botones compactos)
```tsx
<Button size="sm">
  Pequeño
</Button>
```

#### Medium (tamaño por defecto)
```tsx
<Button size="md">
  Normal
</Button>
```

#### Icon (cuadrado 48x48px para iconos)
```tsx
<Button size="icon">
  ✕
</Button>
```

#### Icon Small (cuadrado 36x36px)
```tsx
<Button size="icon-sm">
  ✓
</Button>
```

### Ancho completo

```tsx
<Button fullWidth variant="primary">
  Botón a todo el ancho
</Button>
```

### Ejemplos completos

#### Botón de envío de formulario
```tsx
<Button 
  type="submit" 
  variant="primary" 
  fullWidth
  disabled={loading}
>
  {loading ? 'Cargando...' : 'Enviar'}
</Button>
```

#### Botón de seguir/siguiendo
```tsx
<Button
  variant={isFollowing ? 'secondary' : 'primary'}
  size="sm"
  onClick={handleFollow}
>
  {isFollowing ? 'Siguiendo' : '+ Seguir'}
</Button>
```

#### Botón de eliminar
```tsx
<Button
  variant="danger"
  size="icon-sm"
  onClick={handleDelete}
  title="Eliminar"
>
  ✕
</Button>
```

#### Botón de búsqueda
```tsx
<Button 
  type="submit" 
  variant="primary" 
  size="sm"
>
  Buscar
</Button>
```

### Combinación con className

Puedes agregar clases adicionales para personalización específica:

```tsx
<Button 
  variant="primary"
  className="opacity-0 group-hover:opacity-100"
>
  Acción oculta
</Button>
```

### Estilos CSS aplicados

El componente usa las siguientes clases CSS definidas en `index.css`:

- `.pixel-btn` - Estilos base (efecto 3D de tecla)
- `.pixel-btn-primary` - Verde neón
- `.pixel-btn-secondary` - Violeta
- `.pixel-btn-danger` - Rojo
- `.pixel-btn-sm` - Tamaño pequeño
- `.pixel-btn-icon` - Icono 48x48
- `.pixel-btn-icon-sm` - Icono 36x36
- `.pixel-btn-full` - Ancho completo

### Características visuales

- ✅ Gradiente 3D que simula teclas reales
- ✅ Bordes negros pronunciados
- ✅ Sombra elevada con efecto de profundidad
- ✅ Animación de "presión" al hacer clic
- ✅ Brillo neón en hover según el color
- ✅ Fuente pixel art ('Press Start 2P')
- ✅ Estados disabled con opacidad reducida
