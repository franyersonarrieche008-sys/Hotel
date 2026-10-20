# Cliente de Casa Serena

Frontend responsive para administrar reservas con React, Vite, React Router,
Axios y Tailwind CSS. La interfaz conserva el diseño de Casa Serena y organiza
las páginas, componentes y servicios de API por responsabilidad.

## Estructura

```text
src/
├── api/
│   ├── client.js
│   └── reservas.js
├── components/
│   ├── Navbar.jsx
│   ├── TaskCard.jsx
│   └── TaskList.jsx
├── pages/
│   ├── Homepage.jsx
│   └── TaskForm.jsx
├── App.jsx
└── index.css
```

## Ejecutar

Inicia el backend siguiendo las instrucciones de `../Backend/README.md`.
Después, desde la carpeta del cliente:

```powershell
npm install
npm run dev
```

Vite reenvía `/reservas` al backend en `http://localhost:8000`. Para usar otra
URL directamente desde el cliente, configura `VITE_API_URL` en un archivo
`.env` local. No incluyas ese archivo en el repositorio.

La página principal lista, crea y elimina reservas, permite cambiar su estado
de confirmación y navega a formularios para crear o editar registros.
