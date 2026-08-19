# Instructivo — Secretaría de Investigación: habilitar la edición al director para que modifique el proyecto

**Alcance:** proyectos en estado **Publicado**, **Evaluación metodológica** o **Evaluación científica** (las tesis de docente, solo mientras están en _Publicado_). Cubre el caso "el proyecto ya fue publicado pero todavía no tiene metodólogo y hay que pedirle un cambio al director", y también los pedidos de cambio durante las evaluaciones.

**Idea general:** el proyecto **no cambia de estado**. La SI (o un Administrador) usa la acción **"Habilitar edición al director"**, indica el **motivo** (obligatorio), y a partir de ahí el director puede editar el proyecto. Cuando termina, el director usa **"Finalizar correcciones"**: se cierra la edición y le llega un email automático a quien la habilitó. El motivo y el cierre quedan registrados en los logs del proyecto.

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
                        El director edita → Acciones → "Finalizar correcciones" (email automático a la SI).
                        Si no finaliza, cualquier cambio de estado también vuelve a bloquear la edición.
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

### Paso 3 — El director corrige y finaliza

- El director corrige y guarda las secciones. Al terminar, usa **Acciones → "Finalizar correcciones"** (puede agregar un comentario opcional). Eso cierra la edición y **envía automáticamente un email** a quien la habilitó (con fallback a las secretarías de la unidad académica).
- La SI recibe ese email, verifica los cambios y puede volver a revisar el checklist y pasar los ítems observados a **Sí / N/A**. Si falta algo, repite el Paso 2 con un nuevo motivo.

### Paso 4 — Continuar el circuito

- En _Publicado_: **Evaluadores → Metodólogo → Asignar**. Al pasar a _Evaluación metodológica_ la habilitación especial se **desactiva automáticamente** (en las etapas de evaluación el director puede editar igual, por regla general del sistema).
- En las etapas de evaluación: continuar normalmente (asignar evaluador científico, aceptar, etc.). Cualquier cambio de estado apaga la habilitación.

---

## 3. Preguntas frecuentes

- **¿Vuelve el proyecto a "Borrador"?** No. Se mantiene el estado; solo se habilita la edición al dueño.
- **¿Cómo se cierra la edición?** La cierra el director con "Finalizar correcciones" (avisa por email a la SI), o se apaga sola en el próximo cambio de estado (por ejemplo, al asignar el metodólogo).
- **¿Quién puede usar cada acción?** "Habilitar edición al director": secretarios y administradores. "Finalizar correcciones": solo el director/dueño del proyecto, y solo mientras la edición está habilitada.
- **¿Aplica a tesis de docente (TT)?** No: las TT no tienen etapa de evaluación (van de Publicado a Aceptar) y no muestran esta acción.
- **¿Dónde veo el motivo después?** Administradores: en los logs del proyecto. El director: en el email recibido.
