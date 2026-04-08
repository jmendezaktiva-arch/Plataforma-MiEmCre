# 💳 XPERTPAY API INTEGRATION PROTOCOL (v1.0.0)

Este documento constituye la **Fuente de Verdad Técnica** para la integración del carrito de compra en la Dreams Platform. Todo Agente o desarrollador debe seguir estos esquemas para garantizar transacciones exitosas y seguras.

---

## 🛠️ CONFIGURACIÓN GLOBAL

### Endpoints Base
* **Producción:** `https://xpertpay.com.mx/dcriteria/` 

### Encabezados Obligatorios (Headers)
Para todas las solicitudes AJAX, los siguientes headers son estrictamente necesarios para evitar errores 400:

| Header | Valor | Descripción |
| :--- | :--- | :--- |
| `X-Requested-With` | `xmlhttprequest` | Identifica la solicitud como AJAX. |
| `Cookie` | `PHPSESSID=[valor]` | Cookie de sesión activa del comercio. |
| `Content-Type` | *Variable* | Ver especificaciones por paso. |

---

## 🔄 FLUJO DE INTEGRACIÓN (3 PASOS)

### Paso 1: Generar Instrucción de Pago
Crea una instrucción genérica o específica que devuelve un token único.

* **URL:** `/generador` 
* **Método:** `POST` 
* **Formato:** `application/x-www-form-urlencoded` 

**Cuerpo de la Solicitud (Request Body):**
* `instruccion_pago[id_tienda]`: Identificador único de la tienda (Integer).
* `instruccion_pago[id_pago]`: ID interno del pago (Integer).
* `instruccion_pago[nombre_pago]`: Título del concepto (String).
* `instruccion_pago[monto_pago]`: Monto total (Decimal).
* `token_tienda`: Token de autenticación de la tienda.

**Respuesta Exitosa:** Retorna `token_id` (ej. `miempresacrece-127380...`).

---

### Paso 2: Asociar Cliente y Link Personalizado
Asocia a un usuario de la Dreams Platform con la instrucción y genera el enlace final.

* **URL:** `/login/h/{token_id}` 
* **Método:** `POST` 
* **Formato:** `application/x-www-form-urlencoded` 

**Cuerpo de la Solicitud:**
* `clientes[clientes_email]`: Correo electrónico del cliente.
* `clientes[clientes_nombres]`: Nombre(s).
* `clientes[clientes_apellido_paterno]`: Apellido paterno.
* `token_tienda`: Token de autenticación.

> **Nota Crítica:** Al completar este paso, XpertPay envía automáticamente un correo al cliente con la URL de pago.

---

### Paso 3: Consultar Estado de Pago
Verifica si la transacción ha sido completada para liberar el acceso a cursos o apps.

* **URL:** `/consultar_pago` 
* **Método:** `POST` 
* **Formato:** **`application/json`** (Único endpoint que requiere JSON).

**Cuerpo de la Solicitud (JSON):**
```json
{
  "token_tienda": "MMSS2211&&",
  "token_id": "miempresacrece-XXXXX",
  "token_cliente": "2y10g8oXBTE...",
  "id_tienda": 18
}
```

---

## 🚦 ESTÁNDAR DE RESPUESTAS Y ERRORES

### Códigos HTTP
| Código | Categoría | Acción Requerida |
| :--- | :--- | :--- |
| **200** | Éxito/Lógico | Verificar campo `type` (`success` vs `error`). |
| **400** | Error Cliente | Datos inválidos o faltantes. Corregir y reintentar. |
| **500** | Error Servidor | Falla en XpertPay. Aplicar backoff exponencial (1s, 2s, 4s...). |

### Manejo del Objeto `detalle_pago`
Para liberar servicios, se debe validar que:
1. `type === "success"`.
2. `result.encontrado === "Si"`.
3. `result.detalle_pago.status_pago === "Pagado"`.

---

## 🤖 REGLAS PARA EL AGENTE (SENTINEL ADAPTATION)
1.  **Validación de Headers:** Antes de cualquier `fetch` a XpertPay, confirma la presencia de `X-Requested-With` y la sesión `PHPSESSID`.
2.  **Cero JSON en Pasos 1 y 2:** Utiliza exclusivamente `URLSearchParams` para enviar los datos como `form-urlencoded`.
3.  **Persistencia de Tokens:** El `token_id` y `token_cliente` deben almacenarse en el expediente del usuario en Firestore para consultas recurrentes del Paso 3.