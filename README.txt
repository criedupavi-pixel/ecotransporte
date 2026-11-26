====================================================================
ECOTRANSPORTE - DESPLIEGUE PRODUCCION (HEROKU, ATLAS, SENDGRID,
OAUTH GOOGLE/FACEBOOK Y NEW RELIC)
====================================================================

Este proyecto cumple con los 10 requisitos solicitados:

1. App publicada en Heroku (`Procfile` incluido).
2. Usuarios almacenados en MongoDB (verificable en MongoDB Compass o Atlas Data Explorer).
3. Variables de entorno `NODE_ENV="production"` y `MONGO_URI="[conexión Mongo Atlas]"`.
4. Uso de MongoDB local en ambiente de desarrollo (`mongodb://127.0.0.1:27017/ecotransporte`).
5. Despliegue a Heroku conectando automaticamente a MongoDB Atlas cuando `NODE_ENV=production`.
6. Ambiente local envia correos mediante Ethereal (`mailer/mailer.js`).
7. Ambiente productivo envia correos reales mediante SendGrid (`nodemailer-sendgrid`).
8. Metodo `findOneOrCreateByGoogle` implementado en `models/usuario.js` y conectado en `config/passport.js`.
9. Validacion del token de Facebook mediante `passport-facebook-token` en `POST /api/auth/facebook_token`.
10. Libreria `newrelic` requerida en la primera linea de `app.js` (`require('newrelic');`) + `newrelic.js`.

--------------------------------------------------------------------
PASO 1: EJECUCION EN AMBIENTE LOCAL (MONGO LOCAL + ETHEREAL)
--------------------------------------------------------------------
1. Copia `.env.example` a `.env`:
   copy .env.example .env
2. Asegurate de que en `.env` tengas:
   NODE_ENV=development
   MONGO_URI=mongodb://127.0.0.1:27017/ecotransporte
3. Instala dependencias (en PowerShell usa npm.cmd si hay restriccion de scripts):
   npm.cmd install
4. Inicia el servidor:
   npm.cmd run devstart
5. Abre http://localhost:3000/usuarios/create, registra un usuario y revisa la consola:
   Veras el enlace `[Ethereal] Email enviado! Vista previa en: https://ethereal.email/message/...`
   y en MongoDB Compass veras el usuario creado en la base local `ecotransporte`.

--------------------------------------------------------------------
PASO 2: CONFIGURACION Y DEPLOY EN HEROKU (MONGO ATLAS + SENDGRID)
--------------------------------------------------------------------
1. Crea un cluster gratuito en MongoDB Atlas y copia tu cadena de conexion SRV:
   mongodb+srv://<usuario>:<password>@cluster0.xxxxx.mongodb.net/ecotransporte?retryWrites=true&w=majority
2. Crea una cuenta en SendGrid, verifica un "Single Sender" (tu correo personal) y genera una API Key (`SG.xxxx`).
3. Inicia sesion en Heroku CLI y crea la app:
   heroku login
   heroku create ecotransporte-cristobal
4. Configura las variables de entorno en Heroku (Requisito 3):
   heroku config:set NODE_ENV="production"
   heroku config:set MONGO_URI="mongodb+srv://<usuario>:<password>@cluster0.xxxxx.mongodb.net/ecotransporte?retryWrites=true&w=majority"
   heroku config:set SENDGRID_API_KEY="SG.tu_api_key_real"
   heroku config:set MAIL_FROM="tu_correo_verificado_en_sendgrid@gmail.com"
   heroku config:set HOST="https://ecotransporte-cristobal.herokuapp.com"
   heroku config:set SESSION_SECRET="secreto_prod_123"
   heroku config:set JWT_SECRET="jwt_prod_123"
   heroku config:set GOOGLE_CLIENT_ID="tu_google_client_id"
   heroku config:set GOOGLE_CLIENT_SECRET="tu_google_client_secret"
   heroku config:set FACEBOOK_APP_ID="tu_facebook_app_id"
   heroku config:set FACEBOOK_APP_SECRET="tu_facebook_app_secret"
   heroku config:set NEW_RELIC_LICENSE_KEY="tu_new_relic_license_key"
   heroku config:set NEW_RELIC_APP_NAME="ecotransporte-prod"
5. Sube el codigo a Heroku:
   git init
   git add .
   git commit -m "Deploy produccion EcoTransporte"
   heroku git:remote -a ecotransporte-cristobal
   git push heroku main
6. Abre la app publicada (`heroku open`), crea un usuario con tu correo real, verifica que te llegue el email por SendGrid y comprueba el registro en MongoDB Atlas (visor web o MongoDB Compass).

--------------------------------------------------------------------
PASO 3: VALIDAR TOKEN DE FACEBOOK (REQUISITO 9)
--------------------------------------------------------------------
1. Importa `EcoTransporte_Prod.postman_collection.json` en Postman.
2. Obten un Access Token de prueba en https://developers.facebook.com/tools/explorer/
3. Envia un `POST` a `/api/auth/facebook_token` con el body:
   { "access_token": "TU_TOKEN_DE_FACEBOOK" }
4. El servidor validara el token contra Facebook Graph API, creara/buscara el usuario en MongoDB y devolvera el JWT de sesion.
