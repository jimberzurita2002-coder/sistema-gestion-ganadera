# Sistema de Gestión Ganadera — Estancia Los Hermanos Z

MVP web adaptable a computadoras y celulares.

## Funciones incluidas
- Panel principal con indicadores y actividad reciente.
- Registro, búsqueda, edición y eliminación de bovinos.
- Sanidad animal: vacunas, desparasitaciones, tratamientos y fechas futuras.
- Reproducción: servicios, inseminación, diagnósticos, partos y nacimientos.
- Pesajes y actualización del peso actual.
- Registro básico de potreros y superficie.
- Reportes por raza, sexo e inventario.
- Exportación de respaldo JSON.
- Diseño responsive para móvil y escritorio.

## Probar localmente
Abre `index.html` en un navegador moderno. No necesita compilación ni dependencias.

## Publicar con GitHub Pages
1. Sube `index.html`, `styles.css`, `app.js` y `README.md` a la raíz del repositorio.
2. En GitHub abre **Settings → Pages**.
3. En **Build and deployment**, elige **Deploy from a branch**.
4. Selecciona la rama `main` y la carpeta `/(root)`, y pulsa **Save** si está habilitado.
5. Espera a que se publique y abre el enlace que GitHub muestre en la sección Pages.

## Limitación importante de esta versión
Los datos se guardan en `localStorage` del navegador de ese dispositivo. No se sincronizan entre usuarios o dispositivos y no hay autenticación. Antes de usarlo como sistema operativo de la estancia, conecta una base de datos remota con autenticación, configura respaldos y prueba los flujos con datos no críticos.

## Privacidad
No introduzcas datos personales sensibles ni uses esta versión local como único respaldo de registros productivos.
