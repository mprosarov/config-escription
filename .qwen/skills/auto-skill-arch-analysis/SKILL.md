---
name: arch-analysis
description: Systematically analyze a codebase and produce a comprehensive ARCHITECTURE.md covering project overview, directory structure, component hierarchy, data flow, technology stack, and extension points.
source: auto-skill
extracted_at: '2026-07-08T17:37:47.601Z'
---

# Architecture Analysis & Documentation

## When to use
When the user asks to analyze a project, create an architecture description, or document the codebase structure.

## Approach

### Phase 1: Discovery
1. **List top-level directory** — get the overall shape of the project.
2. **Read README.md** — understand the project's purpose from existing documentation.
3. **Read package.json / config files** — identify build tools, dependencies, scripts.
4. **List all subdirectories** — drill into each major folder (src, server, lib, etc.).

### Phase 2: Deep read
5. **Read all source files** — every `.js`, `.ts`, `.css`, `.html`, `.json` config. Focus on:
   - Entry points (index files, main modules)
   - Core orchestrator / central module
   - Base classes and inheritance hierarchies
   - Component registration patterns
   - Data flow (parameters, subscriptions, pub/sub)
6. **Read example/config files** — understand the input format and real usage.

### Phase 3: Synthesize
7. **Identify the architectural pattern** (Module Pattern, MVC, component-based, etc.).
8. **Map the component hierarchy** — who inherits from whom, who uses whom.
9. **Trace the data flow** — how data moves from input to rendering.
10. **Identify technology stack** — frameworks, libraries, build tools.

### Phase 4: Write ARCHITECTURE.md
Structure the document with these sections:

```markdown
# Архитектура проекта <name>

## Обзор
One-paragraph summary of what the project does.

## Структура проекта
Full directory tree with annotations for each file/folder.

## Архитектура <subsystem 1>
- Build process
- Core module: key methods table
- Component hierarchy (ASCII tree or bullet list)
- Patterns and conventions
- Data flow diagram (ASCII)

## Архитектура <subsystem 2>
(same structure)

## Формат <input/config> (кратко)
Brief format reference.

## Технологический стек
| Layer | Technologies |
|-------|-------------|
| ...   | ...         |

## Точки расширения
How to add new types/modules/actions.
```

### Key conventions for the document
- Use **Russian** for the document body (matching the project's README language).
- Use **ASCII diagrams** for hierarchy and flow (no external tools needed).
- Include **tables** for method summaries, type registrations, and technology stacks.
- Provide **concrete file paths** and **code examples** where helpful.
- End with **extension points** — how to add new components/types.