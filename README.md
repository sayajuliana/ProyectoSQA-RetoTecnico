# Proyecto de Automatización - DatePicker con Screenplay Pattern

## Descripción
Este proyecto implementa pruebas automatizadas para la funcionalidad de selección de fechas usando el patrón Screenplay con Playwright.

## Estructura del Proyecto

```
pruebaOnboardingSQA/
├── src/
│   ├── actors/
│   │   └── actor.ts                 # Actor principal (quien ejecuta las acciones)
│   ├── abilities/
│   │   └── visitWeb.ts              # Habilidad para navegar en la web
│   ├── ui/
│   │   └── datepicker.page.ts       # Page Object del DatePicker
│   ├── task/
│   │   └── datepicker.tasks.ts      # Tareas/Acciones del DatePicker
│   └── questions/
│       └── datepicker.questions.ts  # Preguntas/Verificaciones del DatePicker
├── tests/
│   ├── datepicker.spec.ts           # CP01-CP05, CP10
│   ├── datepicker-cross-browser.spec.ts  # CP06-CP07
│   └── datepicker-restrictions.spec.ts   # CP08-CP09
├── playwright.config.ts
└── package.json
```

## Patrón Screenplay

### Componentes

1. **Actor** ([src/actors/actor.ts](src/actors/actor.ts))
   - Representa al usuario que interactúa con el sistema
   - Método `attemptsTo()`: Ejecuta tareas/acciones
   - Método `asks()`: Realiza preguntas/verificaciones

2. **Tasks** ([src/task/datepicker.tasks.ts](src/task/datepicker.tasks.ts))
   - Acciones de alto nivel que el actor puede realizar
   - Ejemplos: `ClickOnDateField()`, `SelectCompleteDate()`, `NavigateToPreviousMonth()`

3. **Questions** ([src/questions/datepicker.questions.ts](src/questions/datepicker.questions.ts))
   - Consultas sobre el estado del sistema
   - Ejemplos: `IsCalendarVisible()`, `SelectedDateValue()`, `DateInputFormat()`

4. **Page Objects** ([src/ui/datepicker.page.ts](src/ui/datepicker.page.ts))
   - Encapsulan los locators y elementos de la página
   - Mantienen la lógica de ubicación de elementos

## Casos de Prueba Implementados

### Funcionalidad Básica ([tests/datepicker.spec.ts](tests/datepicker.spec.ts))
- **CP01**: Verificar apertura del calendario al hacer clic en el campo de fecha
- **CP02**: Verificar selección de fecha dentro del rango permitido
- **CP03**: Verificar formato correcto de la fecha en el campo de entrada
- **CP04**: Verificar navegación entre meses en el selector
- **CP05**: Verificar navegación entre años en el selector
- **CP10**: Verificar que se puede cambiar una fecha ya seleccionada

### Cross-Browser y Móvil ([tests/datepicker-cross-browser.spec.ts](tests/datepicker-cross-browser.spec.ts))
- **CP06**: Verificar accesibilidad en navegadores modernos (Chrome, Firefox, Edge)
- **CP07**: Verificar accesibilidad en dispositivos móviles (iPhone, Android, iPad)

### Restricciones y Persistencia ([tests/datepicker-restrictions.spec.ts](tests/datepicker-restrictions.spec.ts))
- **CP08**: Verificar restricción de fechas fuera del rango permitido
- **CP09**: Verificar persistencia de fecha seleccionada al enviar formulario

## Instalación

```bash
npm install
```

## Ejecución de Pruebas

### Ejecutar todas las pruebas
```bash
npx playwright test
```

### Ejecutar pruebas específicas
```bash
# Funcionalidad básica
npx playwright test datepicker.spec.ts

# Cross-browser y móvil
npx playwright test datepicker-cross-browser.spec.ts

# Restricciones
npx playwright test datepicker-restrictions.spec.ts
```

### Ejecutar en un navegador específico
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Ejecutar en dispositivos móviles
```bash
npx playwright test --project="Mobile Chrome"
npx playwright test --project="Mobile Safari"
npx playwright test --project="iPad"
```

### Modo UI (interactivo)
```bash
npx playwright test --ui
```

### Modo Debug
```bash
npx playwright test --debug
```

### Ver reporte
```bash
npx playwright show-report
```

## Navegadores Configurados

- **Desktop**: Chrome, Firefox, Safari (WebKit), Edge
- **Mobile**: Pixel 5 (Android), iPhone 12 (iOS), iPad Pro

## Características de Configuración

- **Base URL**: https://jqueryui.com/datepicker/#dropdown-month-year
- **Video**: Grabación activada para todas las pruebas
- **Screenshots**: Capturas activadas para todas las pruebas
- **Trace**: Activado en el primer reintento
- **Parallel**: Ejecución paralela activada

## Criterios de Aceptación Cubiertos

✅ El usuario debe hacer clic en el campo de fecha para que aparezca un calendario emergente
✅ El usuario debe poder seleccionar cualquier fecha dentro del rango permitido
✅ La fecha seleccionada debe reflejarse correctamente en el campo de entrada en el formato esperado
✅ El usuario debe poder cambiar de mes y año dentro del selector de fecha
✅ La funcionalidad debe ser accesible en navegadores modernos y dispositivos móviles
✅ Si se define un rango de fechas restringido, las fechas fuera del rango no deben ser seleccionables
✅ La fecha seleccionada debe persistir y enviarse correctamente al sistema cuando el formulario sea enviado

## Extensión del Framework

### Agregar nuevas Tasks
```typescript
// src/task/datepicker.tasks.ts
export const NuevaTarea = (parametro: string) => async (actor: Actor): Promise<void> => {
  // Implementación
};
```

### Agregar nuevas Questions
```typescript
// src/questions/datepicker.questions.ts
export const NuevaPregunta = () => async (actor: Actor): Promise<TipoRetorno> => {
  // Implementación
};
```

### Usar en Tests
```typescript
test('Nuevo caso de prueba', async ({ page }) => {
  const actor = new Actor('Usuario', page);

  await actor.attemptsTo(NuevaTarea('parametro'));
  const resultado = await actor.asks(NuevaPregunta());

  expect(resultado).toBe(valorEsperado);
});
```

## Notas Técnicas

- El DatePicker de jQuery UI está dentro de un iframe, por lo que todos los locators usan `contentFrame()`
- Los formatos de fecha pueden variar según la configuración del datepicker
- Para pruebas de restricción de fechas, se requiere configurar `minDate` y `maxDate` en el datepicker
