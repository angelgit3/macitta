# Git & Deployment Rules

## REGLA ABSOLUTA: El usuario controla Git

**NUNCA** ejecutar los siguientes comandos sin aprobación EXPLÍCITA del usuario:

- `git push` (de cualquier tipo)
- `git merge`
- `git rebase`
- `git checkout main` / `git checkout develop` (cambiar a ramas protegidas)
- `git branch -d` / `git branch -D` (eliminar ramas)
- `git tag`
- `git reset --hard`
- Cualquier deploy a producción o staging

## Commits

- Se permite hacer `git add` y `git commit` en la rama de feature/trabajo activa en la que se está trabajando.
- **NO** se permite hacer commit directamente en `main` ni en `develop`.
- Todos los commits deben hacerse en la rama de feature indicada por el usuario.

## Push & Merge

- **SIEMPRE** preguntar antes de hacer `git push`, incluso en ramas de feature.
- **NUNCA** hacer merge de ramas por cuenta propia. El usuario decide cuándo y cómo se fusionan.
- Si se necesita un push, describir exactamente qué se va a pushear (rama, commits) y esperar aprobación.

## Ramas

- Solo crear ramas nuevas cuando el usuario lo solicite explícitamente.
- Nombrar las ramas según la convención que el usuario indique.
- No cambiar entre ramas sin avisar y recibir aprobación.

## Producción

- **NUNCA** tocar `main` sin autorización directa.
- **NUNCA** ejecutar deployments automáticos.
- **NUNCA** modificar la base de datos de producción con migraciones destructivas (DROP, DELETE masivo, ALTER que rompa compatibilidad) sin aprobación explícita.

## Flujo correcto

1. El usuario indica la rama de trabajo
2. Se hacen commits en esa rama
3. Cuando el trabajo está listo, se **notifica** al usuario
4. El usuario decide si se hace push, merge, o cualquier otra operación git
5. Solo tras aprobación explícita se ejecuta

> **Resumen**: Commit local = OK. Todo lo demás = pedir permiso primero.
