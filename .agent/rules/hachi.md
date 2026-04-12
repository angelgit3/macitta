# Hachi Agent Framework — Bootstrap Rule

> Esta regla se activa **automáticamente** al inicio de cada sesión en este proyecto.
> No cargues todas las reglas Hachi de golpe. Usa el índice para lazy-loading.

---

## 🔴 ACCIÓN OBLIGATORIA AL INICIO DE SESIÓN

**ANTES de cualquier tarea**, ejecutar:

```
view_file en: A:\Cloud code\hachi\HACHI_INDEX.md
```

Esto carga el índice maestro con las 30 reglas disponibles bajo demanda.
No cargar más de **3 reglas activas** simultáneamente.

---

## 🔒 Hard Enforcement — Reglas No Negociables

### 1. Validación de Bash (OBLIGATORIO antes de `run_command`)

Antes de ejecutar CUALQUIER comando que modifique estado o ejecute binarios:

```powershell
python "A:\Cloud code\hachi\cli_tools\hachi_guard.py" bash "<tu-comando>"
```

- Si devuelve `{"allowed": false}` → **COMANDO BLOQUEADO**. Buscar alternativa.
- Si el script Python falla → **fail-closed**: abortar y reportar al usuario.

### 2. Validación de Escritura Crítica (OBLIGATORIO antes de `write_to_file`)

Antes de escribir en archivos críticos de producción:

```powershell
python "A:\Cloud code\hachi\cli_tools\hachi_guard.py" write "<ruta-del-archivo>"
```

Archivos críticos = migraciones SQL, configs de producción, archivos de entorno, `package.json`, `turbo.json`.

---

## 📋 Reglas Hachi por Área (Lazy Loading)

Consulta `HACHI_INDEX.md` para la lista completa. Carga estas bajo demanda:

| Área | Cuándo cargar |
|------|--------------|
| `bash_security` | Antes de cualquier `run_command` con variables dinámicas |
| `atomic_write_guard` | Antes de `write_to_file` en archivos críticos |
| `virtual_git` | Cambios no triviales en archivos de configuración |
| `secret_scanner` | Antes de subir contenido a APIs externas |
| `engram_protocol` | Al tomar decisiones de diseño o corregir bugs |
| `coordinator_mode` | Al lanzar `browser_subagent` u otros sub-agentes |

---

## 🗂️ SDD Workflows (diseño de código nuevo)

Cuando el usuario pida una feature nueva o tarea no trivial, proponer el flujo SDD:

| Comando | Cuándo |
|---------|--------|
| `/sdd-explore` | Al inicio de cualquier tarea no trivial |
| `/sdd-propose` | Tras exploración, antes de diseñar |
| `/sdd-design` | Antes de escribir código productivo |
| `/sdd-tasks` | Para convertir diseño en checklist |

Los workflows SDD están en: `A:\Cloud code\hachi\workflows\sdd\`

---

## ⚠️ Comportamiento Fail-Closed

Si **cualquier script Python** de Hachi falla o retorna error:
1. **NO asumir éxito**
2. **Abortar la operación planeada**
3. **Reportar al usuario** el error exacto y esperar instrucciones

---

*Hachi Framework v2.0 — Integrado en Macitta | Reglas: 30 | Skills: 6 | Workflows: 9*
