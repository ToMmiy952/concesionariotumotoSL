Concesionaria TuMoto SL

 Requisitos Previos

Node.js v18.x o superior
PostgreSQL v14.x o superior

---

Guía de Instalación y Ejecución

1. Crear y llenar la Base de Datos

Abrir la terminal en la carpeta raíz del proyecto (concesionariotumotoSL/):

dropdb -U postgres --if-exists tumotosl_db; createdb -U postgres tumotosl_db; psql -U postgres -d tumotosl_db -f database/schema.sql; psql -U postgres -d tumotosl_db -f database/seed.sql

/**El comando anterior elimina la bd si existiera y la crea nuevamente, luego crea el esquema y la llena con datos**/

2. Configurar y Levantar el Backend
navegar hasta la carpeta backend e instalar las dependencias necesaris

cd backend
npm install (solo se hace la primera vez)

luego abrir el archivo /backend/.env.example y copiar su contenido. Luego crear un archivo nuevo en el mismo directorio
llamado ".env" completando las variables de conexión propias.
luego inicamos el servidor backend con: npm run dev (deberíamos ver un mensaje en consola que diga "escuchando en http://localhost:3000")

3. Configurar y Levantar el Frontend
EN OTRA VENTANA DE TERMINAL (UNA DIFERENTE A LA USADA DEL BACK), navegar a la carpeta del frontend e instalar dependencias:
cd frontend
npm install
y luego iniciamos la app react 
npm run dev
IMPORTANTE!!!! cabe aclarar que ambas terminales(back y front) deben permanecer abiertas, de lo contrario no funciona


Usuarios de prueba:
	CLIENTE
email: cliente@tumoto.com 
password: 123
-----
	VENDEDOR
email: vendedor@tumoto.com 
password: 123
---
	ADMINISTRADOR
email: admin@tumoto.com 
password: 123

