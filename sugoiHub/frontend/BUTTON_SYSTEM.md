# Sistema de Botones Pixel Art 🎮

Este documento describe el sistema unificado de botones con estilo pixel art (teclas de teclado) implementado en toda la aplicación.

## Clases Base

### `.pixel-btn`
Botón base con efecto 3D de tecla de teclado.

**Características:**
- Gradiente 3D gris oscuro
- Borde negro de 2px
- Sombra pronunciada (efecto elevado)
- Animación de presión al hacer clic
- Fuente: 'Press Start 2P'
- Texto en mayúsculas

**Uso:**
```tsx
<button className="pixel-btn">
  ACEPTAR
</button>
```

## Variantes de Color

### `.pixel-btn-primary`
Botón principal (verde neón - accent lime)
```tsx
<button className="pixel-btn pixel-btn-primary">
  CONFIRMAR
</button>
```

### `.pixel-btn-secondary`
Botón secundario (violeta - accent violet)
```tsx
<button className="pixel-btn pixel-btn-secondary">
  CANCELAR
</button>
```

### `.pixel-btn-danger`
Botón de peligro (rojo)
```tsx
<button className="pixel-btn pixel-btn-danger">
  ELIMINAR
</button>
```

## Variantes de Tamaño

### `.pixel-btn-sm`
Botón pequeño (para acciones secundarias)
```tsx
<button className="pixel-btn pixel-btn-primary pixel-btn-sm">
  Buscar
</button>
```

### `.pixel-btn-full`
Botón de ancho completo
```tsx
<button className="pixel-btn pixel-btn-primary pixel-btn-full">
  REGISTRARSE
</button>
```

## Botones de Icono

### `.pixel-btn-icon`
Botón cuadrado 48x48px para iconos
```tsx
<button className="pixel-btn pixel-btn-icon">
  ✕
</button>
```

### `.pixel-btn-icon-sm`
Botón cuadrado pequeño 36x36px
```tsx
<button className="pixel-btn pixel-btn-danger pixel-btn-icon-sm">
  ✕
</button>
```

## Botones de Icono Legacy

### `.pixel-icon-button`
Botón de icono con estilo pixel art
```tsx
<button className="pixel-icon-button">
  <PixelEyeIcon size={22} />
</button>
```

### `.pixel-icon-slot`
Contenedor visual de icono (sin interacción)
```tsx
<div className="pixel-icon-slot">
  <PixelMailIcon size={22} />
</div>
```

## Combinaciones Comunes

### Botón de envío de formulario
```tsx
<button type="submit" className="pixel-btn pixel-btn-primary pixel-btn-full">
  ENVIAR
</button>
```

### Botón de búsqueda
```tsx
<button type="submit" className="pixel-btn pixel-btn-primary pixel-btn-sm">
  Buscar
</button>
```

### Botón de cerrar modal
```tsx
<button 
  onClick={closeModal}
  className="pixel-btn pixel-btn-danger pixel-btn-icon-sm"
>
  ✕
</button>
```

### Botón de seguir/siguiendo
```tsx
<button 
  className={`pixel-btn pixel-btn-sm ${
    isFollowing ? 'pixel-btn-secondary' : 'pixel-btn-primary'
  }`}
>
  {isFollowing ? 'Siguiendo' : '+ Seguir'}
</button>
```

### Filtros/Tabs
```tsx
<button 
  className={`pixel-btn pixel-btn-sm ${
    activeTab === 'all' ? 'pixel-btn-primary' : ''
  }`}
>
  Todo
</button>
```

## Estados

### Deshabilitado
Los botones tienen estilo automático para estado disabled:
```tsx
<button 
  disabled={loading}
  className="pixel-btn pixel-btn-primary"
>
  {loading ? 'CARGANDO...' : 'ENVIAR'}
</button>
```

### Hover
Efecto de elevación adicional + brillo neón según el color

### Active (click)
Efecto de presión hacia abajo simulando tecla presionada

## Ejemplos de Uso por Página

### LoginPage / RegisterPage
- `pixel-btn pixel-btn-primary pixel-btn-full` - Botón principal
- `pixel-btn pixel-btn-secondary pixel-btn-full` - Botón secundario

### CommunityPage
- `pixel-btn pixel-btn-primary pixel-btn-sm` - Publicar/Enviar
- `pixel-btn pixel-btn-secondary pixel-btn-sm` - Subir imagen/Favorito
- `pixel-btn pixel-btn-danger pixel-btn-icon-sm` - Eliminar

### ProfileEditPage
- `pixel-btn pixel-btn-primary pixel-btn-sm` - Guardar cambios
- `pixel-btn pixel-btn-secondary pixel-btn-sm` - Subir archivos/Navegar

### MediaDetailPage
- `pixel-btn pixel-btn-primary pixel-btn-sm` - Enviar comentario

### Search Pages (Anime/Manga/Games/Music)
- `pixel-btn pixel-btn-primary pixel-btn-sm` - Buscar

## Notas de Diseño

1. **Consistencia**: Todos los botones comparten el mismo sistema visual
2. **Jerarquía**: Primary > Secondary > Default > Danger
3. **Accesibilidad**: Todos los botones tienen estados hover/focus/active claramente visibles
4. **Pixel Perfect**: El diseño está inspirado en teclas de teclado mecánico
5. **Animaciones**: Transiciones rápidas (80ms) para feedback inmediato

## Migración de Estilos Legacy

Si encuentras botones con estilos antiguos, reemplázalos así:

```tsx
// ❌ Antiguo
<button className="h-10 px-5 rounded-lg bg-accentLime/20 hover:bg-accentLime/30">
  Enviar
</button>

// ✅ Nuevo
<button className="pixel-btn pixel-btn-primary pixel-btn-sm">
  Enviar
</button>
```

---

**Última actualización:** Enero 2026  
**Sistema:** SugoiHub Pixel Art UI
