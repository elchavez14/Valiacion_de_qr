# QR Verify – Django + React + SQLite3

Este proyecto es un sistema de gestión de órdenes con **backend en Django** y **frontend en React (Vite)**.  
Soporta autenticación JWT, generación de PDF con QR y flujos para administrador/técnico.

---

## ⚙️ Requisitos previos

### General
- Git
- Python 3.12+
- Node.js 20.19+ (recomendado LTS)
- npm 10+

### Windows
- [Descargar Python](https://www.python.org/downloads/windows/)
- Verificar instalación:
  ```powershell
  python --version
  pip --version

Instalar con pacman:

sudo pacman -S python python-pip nodejs npm git sqlite

🛠️ Configuración del proyecto
1. Clonar el repositorio
git clone https://github.com/tu-usuario/qr_verify.git
cd qr_verify

2. Crear entorno virtual
Windows (PowerShell o Git Bash)
python -m venv .venv
.venv\Scripts\activate

Arch Linux
python -m venv .venv
source .venv/bin/activate


Para desactivar:

deactivate

3. Instalar dependencias
pip install -r requirements.txt


En Arch Linux asegúrate de que sqlite esté instalado:

sudo pacman -S sqlite

4. Configuración de base de datos (SQLite3)

La base de datos NO está incluida en el repo (ignoramos db.sqlite3).
Debes generarla con las migraciones:

python manage.py migrate


Esto creará automáticamente un archivo db.sqlite3 en tu proyecto.

Opcional: crear un superusuario:Entra al shell de Django:
En la terminal se debe entrar al shell

python manage.py shell


Dentro del shell, escribe:

from accounts.models import User

# Crear usuario administrador
admin_user = User.objects.create_user(
    username="miadmin",
    password="123456",
    role="ADMIN",   
    email="admin@example.com"
)

print("Usuario admin creado:", admin_user.username, admin_user.role)


Salir del shell:

exit()

o tambien puedes hacer esto, pero solo te seras tecnico.
python manage.py createsuperuser

5. Backend (Django)

Levantar servidor en modo desarrollo:

python manage.py runserver 0.0.0.0:8000


Esto permite acceder desde tu PC y también desde tu celular en la misma red:

http://<TU-IP-LOCAL>:8000


Ejemplo:

http://192.168.0.7:8000

6. Frontend (React + Vite)

Instalar dependencias (una vez):

cd frontend
npm install


Levantar en modo desarrollo:

npm run dev -- --host


Se abrirá en:

http://<TU-IP-LOCAL>:5173

7. Variables de entorno

📂 backend/.env

DEBUG=True
SECRET_KEY=tu_clave_secreta
ALLOWED_HOSTS=127.0.0.1,localhost,192.168.0.7


📂 frontend/.env.development

VITE_API_URL=http://192.168.0.7:8000/api
