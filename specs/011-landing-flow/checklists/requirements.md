# Specification Quality Checklist: Reordenar la landing y mantener cabecera y pie en el juego

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-09-21
**Feature**: [spec.md](../spec.md)

## Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

## Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Success criteria are technology-agnostic (no implementation details)
- [x] All acceptance scenarios are defined
- [x] Edge cases are identified
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

## Feature Readiness

- [x] All functional requirements have clear acceptance criteria
- [x] User scenarios cover primary flows
- [x] Feature meets measurable outcomes defined in Success Criteria
- [x] No implementation details leak into specification

## Notes

- **Resueltas (2026-09-21)**: cabecera y pie en **todas** las páginas (incluida `/r/[codigo]`); cabecera con la marca (estática) que cambia con el sexo del personaje; pie con la estructura de acordesgaditanos y redes reutilizadas; la página de jugar mantiene su pantalla de inicio y no repite «qué es»; ancho común de 680 px priorizando móvil; se elimina el contenido retirado de la portada y la FAQ pasa a `/como-jugar`; `/como-jugar` entra en alcance; se crean las páginas legales.
- **Cerradas (2026-09-21)**: marca **«Coplero»/«Coplera»/«Coplere»** según el sexo del personaje (FR-006) y **marco común de 680 px con el bucle jugable en 420–480** (FR-017, constitución intacta).
- La spec está acotada y es verificable; lista para `/speckit.plan`.
