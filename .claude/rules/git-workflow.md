# Git Workflow

## 1. Strategie de branches

- `main` = production stable, protegee, jamais de push direct
- `dev` = integration, branche par defaut sur GitHub, cible des PRs feature
- Branches feature depuis `dev`, nommees `feature/{epic-id}-{story-id}-{slug}` (ex: `feature/1-1-init-monorepo`, `feature/1-2-auth-google-oauth`, `feature/2-1-household-creation`)
- Branches fix depuis `dev`, nommees `fix/{slug}` (ex: `fix/auth-redirect-loop`)
- Branches hotfix depuis `main`, nommees `hotfix/{slug}` (ex: `hotfix/critical-auth-bypass`)

## 2. Strategie de merge

- Feature/fix → `dev` : **squash merge** (un seul commit propre par feature)
- `dev` → `main` : **merge commit** (preserve l'historique des releases)
- Hotfix → `main` : **merge commit**, puis cherry-pick ou merge vers `dev`

## 3. Conventional commits

- Format : `type(scope): description` — anglais, lowercase, imperatif, pas de point final
- Types : `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `ci`, `style`
- Scopes = packages/apps du monorepo : `api`, `web`, `mobile`, `shared`, `db`, `emails`, `tokens`, `config-eslint`, `config-ts`
- Scope omis si le changement touche la racine ou plusieurs packages
- Body optionnel, separe par une ligne vide, explique le "pourquoi"
- Breaking changes : `type(scope)!: description` ou footer `BREAKING CHANGE: explication`

## 4. Versioning semantique (gere par Claude Code)

- Format : `vMAJOR.MINOR.PATCH` (ex: `v0.1.0`)
- Demarrage a `v0.1.0` (pre-MVP, le MAJOR reste a 0)
- Regles de bump :
  - `feat` → bump MINOR (v0.1.0 → v0.2.0)
  - `fix` → bump PATCH (v0.1.0 → v0.1.1)
  - `BREAKING CHANGE` → bump MAJOR (v0.1.0 → v1.0.0)
- Quand Claude Code merge `dev` → `main` :
  1. Analyser tous les commits depuis le dernier tag
  2. Determiner le bump approprie (le type le plus eleve l'emporte)
  3. Creer un tag git `vX.Y.Z` sur le merge commit
  4. Creer une GitHub Release avec les changements listes

## 5. Regles pour les PRs

- Feature/fix branches → PR vers `dev` (squash merge)
- `dev` → PR vers `main` (merge commit = release)
- Titre de PR au format conventional commit
- Description avec sections `## Summary` (bullet points) + `## Test plan` (checklist)

## 6. Garde-fous Claude Code

- Ne jamais commit sans demande explicite de l'utilisateur
- Toujours `git add` fichiers specifiques (jamais `git add .` ou `git add -A`)
- Ne jamais push sans demande explicite
- Ne jamais force push (sauf demande explicite et justifiee)
- Ne jamais amend un commit existant sauf demande explicite
- Toujours verifier la branche courante avant de commit
