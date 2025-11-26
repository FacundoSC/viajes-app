# Kiora Colectivo Filtros

Esta es una aplicación web simple para filtrar y visualizar horarios de colectivos.

## Descripción

La aplicación permite a los usuarios consultar horarios de colectivos filtrando por:
- **Parada:** (Alderetes, Banda del Río Salí, W. Posse, Alternativa)
- **Origen y Destino:** (Florida, W. Posse, Banda del Río Salí, S. M. de Tucumán, Alderetes)
- **Tipo de viaje:** (Ida, Vuelta)

Actualmente, la aplicación es un prototipo frontend que simula las peticiones a una API.

## Estructura del Proyecto

- `index.html`: Página principal de la aplicación.
- `css/styles.css`: Estilos de la aplicación.
- `js/app.js`: Lógica de la aplicación (manejo de filtros, simulación de API).
- `assets/`: Directorio para imágenes y otros recursos estáticos.
- `data/`: Directorio para datos (actualmente vacío).

## Cómo correr la aplicación

### Opción 1: Usar Live Server (Recomendado)
Si utilizas Visual Studio Code, se recomienda usar la extensión **Live Server** para una mejor experiencia (recarga automática al guardar cambios).

1.  Instala la extensión "Live Server" en VS Code.
2.  Haz clic derecho en el archivo `index.html`.
3.  Selecciona "Open with Live Server".

### Opción 2: Abrir directamente
Para ejecutar la aplicación localmente sin servidor, simplemente abre el archivo `index.html` en tu navegador web preferido.

### Opción 3: Servidor local con Python
Si tienes Python instalado y prefieres usar la terminal:
1.  Abre una terminal en la carpeta del proyecto.
2.  Ejecuta: `python3 -m http.server`
3.  Abre `http://localhost:8000` en tu navegador.

## Uso

1.  Abre `index.html`.
2.  Verás la fecha y hora actual en la parte superior.
3.  Utiliza los diferentes contenedores de filtros para seleccionar tus preferencias de viaje.
4.  Al hacer clic en "Ida" o "Vuelta", se simulará una petición a la API y podrás ver los datos enviados en la consola del navegador (F12 -> Console).
