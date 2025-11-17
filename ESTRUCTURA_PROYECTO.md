# Estructura del Proyecto - Patrón Screenplay

## Vista General de Archivos

```
pruebaOnboardingSQA/
│
├── src/                                    # Código fuente del framework
│   │
│   ├── actors/                            # Actores (quiénes realizan las acciones)
│   │   └── actor.ts                       # Actor base con métodos attemptsTo() y asks()
│   │
│   ├── abilities/                         # Habilidades que los actores pueden tener
│   │   └── visitWeb.ts                    # Habilidad para navegar en la web
│   │
│   ├── ui/                                # Page Objects (elementos de UI)
│   │   └── datepicker.page.ts             # Locators del DatePicker
│   │
│   ├── task/                              # Tareas/Acciones (qué hacen los actores)
│   │   └── datepicker.tasks.ts            # Tareas para interactuar con DatePicker
│   │
│   └── questions/                         # Preguntas/Verificaciones (qué consultan)
│       └── datepicker.questions.ts        # Questions sobre el estado del DatePicker
│
├── tests/                                  # Casos de prueba (specs)
│   ├── datepicker.spec.ts                 # Tests de funcionalidad básica
│   ├── datepicker-cross-browser.spec.ts   # Tests cross-browser y móvil
│   └── datepicker-restrictions.spec.ts    # Tests de restricciones y persistencia
│
├── playwright.config.ts                    # Configuración de Playwright
├── package.json                            # Dependencias y scripts
├── README.md                               # Documentación principal
├── GUIA_SCREENPLAY.md                      # Guía de uso del patrón
└── ESTRUCTURA_PROYECTO.md                  # Este archivo
```

## Flujo de Datos

```
Test (tests/*.spec.ts)
    ↓
Actor (src/actors/actor.ts)
    ↓
    ├── attemptsTo() → Tasks (src/task/*.tasks.ts)
    │                      ↓
    │                  Page Objects (src/ui/*.page.ts)
    │                      ↓
    │                  Playwright Page API
    │
    └── asks() → Questions (src/questions/*.questions.ts)
                     ↓
                 Page Objects (src/ui/*.page.ts)
                     ↓
                 Playwright Page API
```

## Responsabilidades por Capa

### 1. Tests (`tests/`)
**Responsabilidad**: Definir escenarios de prueba en lenguaje de negocio

```typescript
test('CP01 - Usuario selecciona una fecha', async ({ page }) => {
  const actor = new Actor('Usuario', page);

  await actor.attemptsTo(
    AbrirCalendario(),
    SeleccionarFecha('15')
  );

  const fecha = await actor.asks(FechaSeleccionada());
  expect(fecha).toContain('15');
});
```

**NO debe**:
- Contener locators directos
- Tener lógica de negocio compleja
- Interactuar directamente con `page`

### 2. Actor (`src/actors/`)
**Responsabilidad**: Representar al usuario que ejecuta acciones y hace preguntas

```typescript
export class Actor {
  async attemptsTo(...tasks: Array<(actor: Actor) => Promise<void>>) {
    for (const task of tasks) {
      await task(this);
    }
  }

  async asks<T>(question: (actor: Actor) => Promise<T>): Promise<T> {
    return question(this);
  }
}
```

**NO debe**:
- Contener lógica específica de dominio
- Tener locators o selectores

### 3. Tasks (`src/task/`)
**Responsabilidad**: Implementar acciones de alto nivel que un usuario puede realizar

```typescript
export const SeleccionarFechaCompleta = (mes: string, año: string, dia: string) =>
  async (actor: Actor): Promise<void> => {
    const datePicker = new DatePickerPage(actor.page);

    await datePicker.monthDropdown.selectOption(mes);
    await datePicker.yearDropdown.selectOption(año);
    await datePicker.getDayLink(dia).click();
  };
```

**NO debe**:
- Contener assertions (expect)
- Retornar valores para verificación (usar Questions para eso)

### 4. Questions (`src/questions/`)
**Responsabilidad**: Consultar y retornar información sobre el estado del sistema

```typescript
export const FechaSeleccionada = () => async (actor: Actor): Promise<string> => {
  const datePicker = new DatePickerPage(actor.page);
  return await datePicker.dateInput.inputValue();
};
```

**NO debe**:
- Modificar el estado del sistema
- Realizar acciones (clicks, fills, etc.)
- Contener assertions

### 5. Page Objects (`src/ui/`)
**Responsabilidad**: Encapsular locators y proporcionar acceso a elementos de UI

```typescript
export class DatePickerPage {
  get dateInput() {
    return this.frame.locator('#datepicker');
  }

  getDayLink(day: string) {
    return this.frame.getByRole('link', { name: day, exact: true });
  }
}
```

**NO debe**:
- Contener lógica de negocio
- Tener assertions
- Ejecutar flujos completos de acciones

### 6. Abilities (`src/abilities/`)
**Responsabilidad**: Proporcionar capacidades que los actores pueden usar

```typescript
export class VisitWeb {
  async to(url: string) {
    await this.page.goto(url);
  }
}
```

## Cuando Crear Nuevos Archivos

### Nueva Funcionalidad = Nuevo Page Object
Si vas a probar un nuevo componente (ej: Modal, Form, Menu):

```
src/ui/modal.page.ts
src/task/modal.tasks.ts
src/questions/modal.questions.ts
tests/modal.spec.ts
```

### Ejemplo: Agregar Pruebas de Modal

#### 1. Crear Page Object
```typescript
// src/ui/modal.page.ts
export class ModalPage {
  constructor(private readonly page: Page) {}

  get modalContainer() {
    return this.page.locator('.modal');
  }

  get closeButton() {
    return this.page.locator('.modal .close');
  }

  get confirmButton() {
    return this.page.locator('.modal .confirm');
  }
}
```

#### 2. Crear Tasks
```typescript
// src/task/modal.tasks.ts
export const AbrirModal = () => async (actor: Actor): Promise<void> => {
  await actor.page.click('#open-modal-btn');
};

export const CerrarModal = () => async (actor: Actor): Promise<void> => {
  const modal = new ModalPage(actor.page);
  await modal.closeButton.click();
};

export const ConfirmarModal = () => async (actor: Actor): Promise<void> => {
  const modal = new ModalPage(actor.page);
  await modal.confirmButton.click();
};
```

#### 3. Crear Questions
```typescript
// src/questions/modal.questions.ts
export const ModalEstaVisible = () => async (actor: Actor): Promise<boolean> => {
  const modal = new ModalPage(actor.page);
  return await modal.modalContainer.isVisible();
};

export const TituloDelModal = () => async (actor: Actor): Promise<string> => {
  const modal = new ModalPage(actor.page);
  return await modal.modalContainer.locator('.title').textContent() || '';
};
```

#### 4. Crear Tests
```typescript
// tests/modal.spec.ts
test('Usuario puede abrir y cerrar modal', async ({ page }) => {
  const actor = new Actor('Usuario', page);

  await actor.attemptsTo(AbrirModal());
  expect(await actor.asks(ModalEstaVisible())).toBeTruthy();

  await actor.attemptsTo(CerrarModal());
  expect(await actor.asks(ModalEstaVisible())).toBeFalsy();
});
```

## Organización para Proyectos Grandes

Para proyectos con múltiples módulos:

```
src/
├── actors/
│   └── actor.ts
│
├── modules/                          # Organizar por módulos de negocio
│   │
│   ├── authentication/               # Módulo de autenticación
│   │   ├── ui/
│   │   │   ├── login.page.ts
│   │   │   └── register.page.ts
│   │   ├── tasks/
│   │   │   ├── login.tasks.ts
│   │   │   └── register.tasks.ts
│   │   └── questions/
│   │       └── auth.questions.ts
│   │
│   ├── datepicker/                   # Módulo de datepicker
│   │   ├── ui/
│   │   │   └── datepicker.page.ts
│   │   ├── tasks/
│   │   │   └── datepicker.tasks.ts
│   │   └── questions/
│   │       └── datepicker.questions.ts
│   │
│   └── shopping-cart/                # Módulo de carrito
│       ├── ui/
│       ├── tasks/
│       └── questions/
│
└── shared/                           # Utilidades compartidas
    ├── helpers/
    ├── constants/
    └── types/
```

## Convenciones de Nombres

### Tasks
- Verbos en infinitivo
- Nombres descriptivos de la acción
- Ejemplos:
  - `ClickOnDateField()`
  - `SelectMonth(month: string)`
  - `NavigateToPreviousMonth()`
  - `FillRegistrationForm(data: FormData)`

### Questions
- Nombres como propiedades o estados
- Ejemplos:
  - `SelectedDateValue()` → retorna string
  - `IsCalendarVisible()` → retorna boolean
  - `CurrentMonth()` → retorna string
  - `ListOfAvailableDates()` → retorna array

### Page Objects
- Nombres con sufijo `.page.ts`
- Clases con sufijo `Page`
- Ejemplos:
  - `DatePickerPage`
  - `LoginPage`
  - `ShoppingCartPage`

### Tests
- Nombres con sufijo `.spec.ts`
- Descripciones claras del caso de prueba
- Ejemplos:
  - `datepicker.spec.ts`
  - `login.spec.ts`
  - `checkout-flow.spec.ts`

## Archivos de Configuración

### `playwright.config.ts`
Configuración centralizada de Playwright:
- Navegadores a probar
- Configuración de dispositivos móviles
- Timeouts
- Base URL
- Reporters

### `package.json`
Scripts útiles para ejecutar pruebas:
- `npm test` → Todas las pruebas
- `npm run test:ui` → Modo interactivo
- `npm run test:chrome` → Solo Chrome
- `npm run test:mobile` → Dispositivos móviles

## Ejemplos de Extensión

### Agregar Soporte para API Testing

```typescript
// src/abilities/consumeAPI.ts
export class ConsumeAPI {
  constructor(private readonly request: APIRequestContext) {}

  async get(endpoint: string) {
    return await this.request.get(endpoint);
  }

  async post(endpoint: string, data: any) {
    return await this.request.post(endpoint, { data });
  }
}

// src/actors/api-actor.ts
export class APIActor {
  constructor(
    public readonly name: string,
    public readonly request: APIRequestContext
  ) {}

  async attemptsTo(...tasks: Array<(actor: APIActor) => Promise<void>>) {
    for (const task of tasks) {
      await task(this);
    }
  }
}
```

### Agregar Logger Personalizado

```typescript
// src/shared/logger.ts
export class TestLogger {
  log(actorName: string, action: string, details?: any) {
    console.log(`[${new Date().toISOString()}] ${actorName} - ${action}`, details);
  }
}

// Modificar Actor
export class Actor {
  private logger = new TestLogger();

  async attemptsTo(...tasks: Array<(actor: Actor) => Promise<void>>) {
    for (const task of tasks) {
      this.logger.log(this.name, `Attempting: ${task.name}`);
      await task(this);
    }
  }
}
```

## Mejores Prácticas de Organización

1. **Un Page Object por componente de UI**
2. **Agrupar Tasks relacionadas en el mismo archivo**
3. **Agrupar Questions relacionadas en el mismo archivo**
4. **Un archivo de test por funcionalidad o historia de usuario**
5. **Usar subdirectorios para módulos grandes**
6. **Mantener los nombres consistentes entre capas**

## Checklist para Nuevo Componente

- [ ] Crear Page Object en `src/ui/[nombre].page.ts`
- [ ] Crear Tasks en `src/task/[nombre].tasks.ts`
- [ ] Crear Questions en `src/questions/[nombre].questions.ts`
- [ ] Crear Tests en `tests/[nombre].spec.ts`
- [ ] Agregar exports necesarios si usas barrel files
- [ ] Documentar casos de prueba en README
- [ ] Agregar scripts en package.json si es necesario
