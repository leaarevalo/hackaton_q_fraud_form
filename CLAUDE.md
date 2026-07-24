# Fraud Detection Engine — Loyalty

Motor de evaluación de riesgo de fraude para operaciones de Loyalty. Evalúa cada
operación antes de ejecutarla y devuelve una decisión centralizada, reutilizable
por cualquier producto de la plataforma.

Operaciones cubiertas: carga, canje, descuento y transferencia de puntos.

Este repo se construye para el Q-Leap (hackathon interno). El criterio de
evaluación condiciona decisiones técnicas, así que está acá abajo.

## Ejes de evaluación (en orden de peso)

1. **Resuelve un problema real** — dolor concreto del producto o del flow del equipo.
2. **Basado en agentes** — no una app a mano con un LLM decorativo.
3. **Escala en prod** — el costo crece lineal, no explota. Cache, contexto chico,
   compilar una vez en vez de llamar al modelo mil veces.
4. **Mantenible por agentes** — reglas escritas, output revisable, contexto en el repo.
5. **Corre en vivo** — si no corre, no cuenta.

Ante cualquier duda de diseño, ganá el eje más alto. Si una decisión mejora la
demo pero rompe el eje 3, no la tomes.

## Decisiones tomadas

### El LLM nunca está en el camino sincrónico

La evaluación previa a la transacción es 100% determinística: reglas sobre
ventanas temporales en cache. Sin llamadas al modelo, sin excepciones.

Razón: una llamada al modelo por transacción hace explotar el costo con el
volumen (rompe el eje 3) y agrega latencia a un check que corre antes de ejecutar
la operación. Detectar anomalías en volumen es un problema resuelto con reglas y
estadística.

### El agente vive sobre las alertas, no sobre las transacciones

El motor determinístico produce alertas. El agente investiga las que quedan en
YELLOW y BLUE, de forma asincrónica y fuera del camino crítico.

Por cada alerta arma un legajo: trae el historial de la cuenta y del fingerprint,
busca cuentas vinculadas, mira el perfil del comercio, cruza con casos anteriores
confirmados. Devuelve veredicto + evidencia + nivel de confianza.

El costo escala con la cantidad de **alertas**, no de transacciones. Eso es lo que
hace que cumpla el eje 3, y hay que poder explicarlo en una frase.

### Las reglas son archivos declarativos, no código

Una regla se define una sola vez, en YAML, y la ejecutan dos consumidores: el
detector en vivo (ventana reciente) y el backtest (histórico completo).

Si una regla se escribe como función de TypeScript, se pierde el backtest. No lo
hagas.

Efecto secundario buscado: al ser declarativas, el agente puede escribirlas y
otro agente puede leerlas y extenderlas. Es el eje 4 cumplido por diseño.

### El backtest es entregable de primera clase, no un extra

Toda regla propuesta se corre contra el histórico y reporta cuántos casos
confirmados hubiera atrapado y cuántos falsos positivos hubiera generado.

Es la única salida del sistema que trae su propia métrica de calidad calculada
por código. Es la carta más fuerte para el eje 5.

### El agente recomienda, no bloquea

Escalera de acciones: observar → marcar → pedir verificación → bloquear. El
agente ejecuta autónomamente solo los escalones baratos. El bloqueo siempre lo
firma un humano.

### Contexto y playbooks van en el repo

El playbook de investigación (cómo se investiga cada tipo de alerta) es un `.md`
versionado, no un prompt hardcodeado. El equipo de riesgo tiene que poder
discutirlo y otro agente tiene que poder editarlo.

### Tope de llamadas por caso

El loop del agente tiene un máximo de iteraciones por alerta. Es control de costo
real y es la respuesta lista cuando pregunten por el eje 3.

### Trazabilidad

Cada tool call del agente se loguea. El legajo muestra el rastro completo: qué
miró, en qué orden, qué encontró. Eso es lo que se demuestra — no el veredicto,
sino el camino.

### El veredicto sale en JSON con esquema fijo

Nada de parsear prosa. El código de abajo tiene que poder actuar sobre la salida
del agente sin heurísticas.

## Decisiones abiertas

Están sin resolver. No las cierres solo: preguntá.

- **Persistencia**: Postgres o Mongo. Postgres facilita las window functions que
  piden varias reglas ("N operaciones en X minutos"); Mongo es el terreno conocido
  del equipo. Impacta el formato de `condicion` en las reglas.
- **Fail-open vs fail-closed**: qué pasa si el motor no responde o el cache está
  caído. Fail-open deja pasar fraude; fail-closed puede tirar abajo el checkout.
  Hay que decidirlo y sostenerlo — es la primera pregunta que va a hacer un senior.
- **Presupuesto de latencia**: cuál es el timeout duro del check sincrónico.
- **Modelo de resultado**: hoy GREEN / YELLOW / RED / BLUE mezcla dos ejes
  distintos — los tres primeros son nivel de riesgo y BLUE es un tipo de acción.
  Está propuesto separarlo en score de riesgo continuo + tabla de política que
  mapea score a acción, pero no está decidido.

## Limitaciones conocidas

El **device fingerprint es una señal, no la verdad**. Es inestable (cambia con
updates de browser, features de privacidad, reinstalación de app) y es
falsificable: un atacante que sabe que lo mirás, lo rota. Ninguna regla debe
depender exclusivamente de él.

Si se usan datos reales de clientes, revisar el ángulo de datos personales antes.

## Fuera de alcance

No construir, aunque parezca que suma:

- Configuración de reglas por cliente / multi-tenancy
- Autenticación y manejo de usuarios
- Streaming real (Kafka y similares)
- MFA
- Cualquier UI más allá del formulario de prueba y su dashboard

Nada de esto puntúa en ninguno de los cinco ejes.

### Dashboard de monitoreo (parte del harness)

El tab "Dashboard" del formulario de prueba incluye, además del historial
simple, un panel de monitoreo (KPIs del día, distribución de decisiones por
hora, donut de verificación, alertas y casos con reglas activadas). Todo se
deriva de los mismos `TransactionRecord` ya existentes (mock/localStorage) —
no se agregan campos de banco, cliente ni agente asignado que no existen en
el modelo real. Sigue siendo parte del harness de UI, no un producto de
investigación de casos.

## Formulario de prueba (harness)

Hay un mock de un formulario simple que dispara operaciones contra el motor y
muestra la respuesta. Es una herramienta de prueba, no un producto: cero minutos
invertidos en que quede lindo.

Tiene que permitir:

- Elegir el tipo de operación y la cantidad de puntos
- Indicar cuenta origen y destino
- **Falsear la identidad**: cambiar fingerprint, cuenta e IP a mano. Sin esto no
  se pueden disparar las reglas de multi-cuenta por dispositivo ni de cambio
  brusco de ubicación, que son la mitad del valor de la demo.
- **Disparar ráfagas**: repetir N operaciones en pocos segundos. Las reglas de
  frecuencia ("5 canjes en 2 minutos") no se prueban clickeando un botón.
- Ver la respuesta completa: decisión, reglas que dispararon y motivo.

## Orden de trabajo

El agente es la parte divertida y es la trampa: si se arranca por ahí, se llega
sin datos donde correrlo.

1. Esquema de datos y carga del histórico
2. Dos o tres reglas + el detector
3. El backtest — acá ya hay demo, aunque el agente no exista todavía
4. El agente investigador (rápido si los tools ya están)
5. El PR de regla nueva propuesta por el agente

Después del paso 3 ya hay algo demostrable. Todo lo que sigue mejora la demo pero
no la pone en riesgo.

## Convenciones

- Node + TypeScript
- Front en Vue 3 - Vite
- Agregar una regla = agregar un archivo YAML, nunca tocar código del motor
- Todo lo que el agente produce (legajos, reglas propuestas) va a disco como
  archivo revisable, no queda en memoria ni en logs
