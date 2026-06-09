# mundial-landing

Landing page promocional del **Mundial 2026** ⚽ — la primera Copa del Mundo
disputada por tres países (Estados Unidos, México y Canadá) con 48 selecciones
y 104 partidos.

## Qué incluye

- **Hero** con datos clave del torneo (48 selecciones, 104 partidos, 16 ciudades).
- **Cuenta regresiva** en vivo hasta el partido inaugural (11 jun 2026, Estadio Azteca).
- **Sedes** de los tres países anfitriones.
- **Formato** histórico del torneo (12 grupos, ronda de 32, etc.).
- **Fechas clave** desde la inauguración hasta la final (19 jul 2026).
- **Newsletter** de demostración (validación en cliente, sin backend).

## Stack

Sitio estático sin dependencias ni paso de build:

```
index.html   → estructura y contenido
styles.css   → estilos (responsive, tipografía Anton + Inter)
script.js    → cuenta regresiva, menú móvil y formulario
```

## Desarrollo local

No requiere instalación. Basta con servir la carpeta:

```bash
python3 -m http.server 8000
# luego abre http://localhost:8000
```

O simplemente abre `index.html` en el navegador.

## Despliegue

Al ser estático, se publica en cualquier hosting de archivos:
GitHub Pages, Netlify, Vercel, Cloudflare Pages o un bucket S3.
Para GitHub Pages, activa Pages apuntando a la raíz de la rama.

---

> Sitio promocional no oficial. Fechas y sedes sujetas a confirmación oficial.
