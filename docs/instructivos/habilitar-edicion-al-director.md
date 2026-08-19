# Instructivo — Secretaría de Investigación: habilitar la edición al director para que modifique el proyecto

**Alcance:** proyectos estándar en estado **Publicado**, **Evaluación metodológica** o **Evaluación científica**. Cubre el caso "el proyecto ya fue publicado pero todavía no tiene metodólogo y hay que pedirle un cambio al director", y también los pedidos de cambio durante las evaluaciones.

**Idea general:** el proyecto **no cambia de estado**. La SI (o un Administrador) usa la acción **"Habilitar edición al director"**, indica el **motivo** (obligatorio), y a partir de ahí el director puede editar el proyecto hasta el próximo cambio de estado (por ejemplo, cuando se asigna el metodólogo). El motivo queda registrado en los logs del proyecto y se le envía por email al director.

---

## 1. Dónde estamos en el circuito

```
Director completa el proyecto → Acciones → Publicar
        ▼
   PUBLICADO ──── SI revisa (Checklist de Secretaría) ────► Evaluadores → Metodólogo → Asignar
        │                                                              ▼
        │  ¿Hay algo que el director debe corregir?          EVALUACIÓN METODOLÓGICA → EVALUACIÓN CIENTÍFICA
        │                                                              │
        └── Acciones → "Habilitar edición al director" ◄───────────────┘  (disponible en los tres estados)
                        (motivo obligatorio → log + email)
                        El director edita; al próximo cambio de estado la edición se vuelve a bloquear.
```

---

## 2. Paso a paso

### Paso 1 — Detectar qué hay que corregir

1. Ingresar al proyecto y revisar. En _Publicado_, usar el panel **Checklist** (botón flotante abajo a la derecha): marcar los ítems observados como **No** y anotar en _Comentario (opcional)_ qué falta. Recordar que los ítems **Críticos** en _No/Pendiente_ bloquean la asignación del metodólogo.

### Paso 2 — Habilitar la edición al director

1. En el proyecto, abrir el menú **Acciones** → **Habilitar edición al director** (ícono de candado abierto).
2. Se abre el diálogo _"Habilitar edición al director"_. Escribir el **Motivo** (qué debe modificar el director). Es obligatorio: sin motivo no se puede continuar.
3. Confirmar con **Habilitar edición**. Aparece la notificación _"Edición habilitada — El director del proyecto ya puede editarlo y fue notificado por email"_.

Qué pasa al confirmar:

- El proyecto **sigue en el mismo estado** (Publicado / Evaluación metodológica / Evaluación científica).
- El director ve la acción **Editar** en su menú _Acciones_ y puede entrar a las secciones del formulario.
- Se registra en los **logs** del proyecto: _"[SI] ha habilitado la edición del proyecto al director — Motivo: …"_ (visible para administradores en _Acciones → Ver logs / registros_).
- El director recibe el email **"Se habilitó la edición de tu proyecto"** con el motivo y el link al proyecto.

Se puede repetir la acción si hace falta agregar otro motivo: cada vez queda un log nuevo y se envía otro email.

### Paso 3 — Seguimiento

- El director corrige y guarda las secciones. No hay una acción de "listo": conviene acordar por **chat del proyecto** o email que avise cuando termine (o revisar el proyecto directamente).
- La SI puede volver a revisar el checklist y pasar los ítems observados a **Sí / N/A**.

### Paso 4 — Continuar el circuito

- En _Publicado_: **Evaluadores → Metodólogo → Asignar**. Al pasar a _Evaluación metodológica_ la habilitación especial se **desactiva automáticamente** (en las etapas de evaluación el director puede editar igual, por regla general del sistema).
- En las etapas de evaluación: continuar normalmente (asignar evaluador científico, aceptar, etc.). Cualquier cambio de estado apaga la habilitación.

---

## 3. Preguntas frecuentes

- **¿Vuelve el proyecto a "Borrador"?** No. Se mantiene el estado; solo se habilita la edición al dueño.
- **¿Puedo deshabilitar la edición antes de que cambie el estado?** No hay botón para eso hoy; se apaga sola en el próximo cambio de estado (por ejemplo, al asignar el metodólogo).
- **¿Quién puede usar la acción?** Secretarios y Administradores. Investigadores, metodólogos y evaluadores no la ven.
- **¿Aplica a tesis de docente (TT)?** No: las TT no tienen etapa de evaluación (van de Publicado a Aceptar) y no muestran esta acción.
- **¿Dónde veo el motivo después?** Administradores: en los logs del proyecto. El director: en el email recibido.
