https://mentoria.softwarecrafters.io/l/102-arquitectura-y-testing-de-backend-con-agentes/ 
40:52 Poner Cursor en modo Plan

En el chat ejecutar:

Quiero desarrollar un módulo `auth` con registro y login OTP usando JWT (sin refresh token).

## Antes de implementar

1. Repasa las reglas del proyecto, especialmente `practices-tdd.mdc`,`practices-testing.mdc` y `practices-inside-out.mdc`
2. Usa el módulo `health` como referencia de estructura
3. Genera un diagrama de flujo del registro y del login
4. Preséntame el plan completo antes de escribir código

## Flujos

### Registro

- El usuario se registra solo con su email (sin validación OTP)
- Si el email ya existe, error

### Login

- El usuario introduce su email
- El sistema genera un OTP y lo envía (por consola)
- El usuario introduce el OTP
- Si es válido, recibe un JWT

### Reglas del OTP
- 6 dígitos numéricos
- Validez: 5 minutos
- Máximo 3 intentos fallidos por sesión
- Tras 3 fallos: bloqueo de 10 minutos antes de poder solicitar nuevo OTP

## Reglas del JWT
- Claim solo el email
- Expiración: 24 horas
- Algoritmo: HS256 con secret desde variable  de entorno

## Importante

- Sigue TDD estricto (Reason-Red-Green-Refactor-Reevaluate)
- Desarrolla Inside-Out (dominio -> casos de uso -> adpatadores -> HTTP)
- Hazme las preguntas que necesites antes de empezar




# Comprobaciones

MONGO_URI=mongodb+srv://user-Proyecto-softwarecraftersMPL:pass@cluster0.byobino.mongodb.net/backend-template?retryWrites=true&w=majority

npm start -> en un terminal debo ver

PS C:\mirepositorio\backend-auth-otp-jwt> npm start

> backend-template@1.0.0 start
> tsx watch src/main.ts

{"level":30,"time":1780163202929,"pid":12968,"hostname":"EQUIPO","msg":"Connected to MongoDB"}


1. Registrar un usuario...

Invoke-RestMethod -Method POST -Uri http://localhost:3001/auth/register -ContentType "application/json" -Body '{"email":"test5@example.com"}'
id                                   email            createdAt
--                                   -----            ---------
4e38055e-38d5-4131-9915-18b6c5796609 test5@example.com 2026-05-30T17:48:35....





2. Solicitar OTP
Invoke-RestMethod -Method POST -Uri http://localhost:3001/auth/login/request-otp -ContentType "application/json" -Body '{"email":"test5@example.com"}'



3. Verificar OTP (usa el código de la consola)

$result= Invoke-RestMethod -Method POST -Uri http://localhost:3001/auth/login/verify-otp -ContentType "application/json" -Body {"email":"test5@example.com","otp":"229675"}'

$result.token