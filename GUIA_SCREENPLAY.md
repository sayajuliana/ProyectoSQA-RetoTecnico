# Guía del Patrón Screenplay

## Conceptos Clave

El patrón Screenplay organiza el código de pruebas de forma que refleja las intenciones del usuario, no los detalles técnicos de implementación.

### 1. Actor (Quién)
El **Actor** representa a la persona que usa el sistema.

```typescript
const actor = new Actor('Usuario', page);
```

### 2. Tasks (Qué hace)
Las **Tasks** son acciones de alto nivel que el actor realiza.

```typescript
// Definición
export const SeleccionarFecha = (dia: string) => async (actor: Actor): Promise<void> => {
  const datePicker = new DatePickerPage(actor.page);
  await datePicker.getDayLink(dia).click();
};

// Uso
await actor.attemptsTo(SeleccionarFecha('15'));
```

### 3. Questions (Qué verifica)
Las **Questions** permiten al actor consultar el estado del sistema.

```typescript
// Definición
export const FechaSeleccionada = () => async (actor: Actor): Promise<string> => {
  const datePicker = new DatePickerPage(actor.page);
  return await datePicker.dateInput.inputValue();
};

// Uso
const fecha = await actor.asks(FechaSeleccionada());
expect(fecha).toBe('11/15/2025');
```

## Estructura de un Test Screenplay

```typescript
test('descripción del caso de prueba', async ({ page }) => {
  // Given - Preparación
  const actor = new Actor('Usuario', page);
  await page.goto('/');

  // When - Acción
  await actor.attemptsTo(
    ClickOnDateField(),
    SelectMonth('5'),
    SelectYear('2025'),
    SelectDate('15')
  );

  // Then - Verificación
  const fecha = await actor.asks(SelectedDateValue());
  expect(fecha).toContain('15');
});
```

## Creando Nuevas Tasks

### Template para Tasks Simples
```typescript
export const NombreDeLaTarea = (parametro?: string) =>
  async (actor: Actor): Promise<void> => {
    const pageObject = new MiPageObject(actor.page);

    // Lógica de la tarea
    await pageObject.elemento.click();

    if (parametro) {
      await pageObject.otroElemento.fill(parametro);
    }
  };
```

### Template para Tasks Compuestas
```typescript
export const TareaCompleja = (param1: string, param2: number) =>
  async (actor: Actor): Promise<void> => {
    // Combinar múltiples tareas simples
    await TareaSimple1(param1)(actor);
    await TareaSimple2()(actor);

    // Lógica adicional
    for (let i = 0; i < param2; i++) {
      await TareaRepetitiva()(actor);
    }
  };
```

## Creando Nuevas Questions

### Template para Questions Simples
```typescript
export const ObtenerValor = () => async (actor: Actor): Promise<string> => {
  const pageObject = new MiPageObject(actor.page);
  return await pageObject.elemento.textContent() || '';
};
```

### Template para Questions Booleanas
```typescript
export const EstaVisible = (selector: string) =>
  async (actor: Actor): Promise<boolean> => {
    const pageObject = new MiPageObject(actor.page);
    return await pageObject.elemento.isVisible();
  };
```

### Template para Questions Complejas
```typescript
export const ObtenerDatosCompletos = () =>
  async (actor: Actor): Promise<DatosInterface> => {
    const pageObject = new MiPageObject(actor.page);

    const nombre = await pageObject.campoNombre.textContent();
    const edad = await pageObject.campoEdad.textContent();
    const activo = await pageObject.estadoActivo.isChecked();

    return {
      nombre: nombre || '',
      edad: parseInt(edad || '0'),
      activo: activo
    };
  };
```

## Creando Page Objects

### Template de Page Object
```typescript
import { Page, FrameLocator } from '@playwright/test';

export class MiPageObject {
  constructor(private readonly page: Page) {}

  // Locators como getters
  get elemento1() {
    return this.page.locator('#id-elemento');
  }

  get elemento2() {
    return this.page.locator('.clase-elemento');
  }

  // Métodos para locators dinámicos
  getElementoPorNombre(nombre: string) {
    return this.page.locator(`[data-name="${nombre}"]`);
  }

  // Métodos de interacción complejos
  async seleccionarOpcion(opcion: string) {
    await this.elemento1.selectOption(opcion);
  }
}
```

### Page Object con Frame
```typescript
export class PageObjectConFrame {
  private frame: FrameLocator;

  constructor(private readonly page: Page) {
    this.frame = this.page.locator('iframe.mi-frame').contentFrame();
  }

  get elementoEnFrame() {
    return this.frame.locator('#elemento-id');
  }
}
```

## Mejores Prácticas

### 1. Nombres Descriptivos
```typescript
// ❌ Mal
export const Click = () => async (actor: Actor) => { ... };

// ✅ Bien
export const ClickEnCampoFecha = () => async (actor: Actor) => { ... };
```

### 2. Tasks de Alto Nivel
```typescript
// ❌ Mal - Demasiado técnico
await actor.attemptsTo(
  ClickElement('#date'),
  TypeText('11/15/2025'),
  PressEnter()
);

// ✅ Bien - Refleja la intención del usuario
await actor.attemptsTo(
  IngresarFecha('11/15/2025')
);
```

### 3. Questions Expresivas
```typescript
// ❌ Mal
const val = await actor.asks(GetValue());
expect(val).toBe('success');

// ✅ Bien
const mensajeExitoso = await actor.asks(MensajeDeConfirmacion());
expect(mensajeExitoso).toBe('Operación exitosa');
```

### 4. Composición de Tasks
```typescript
// Reutilizar tasks existentes
export const CompletarFormulario = (datos: FormData) =>
  async (actor: Actor): Promise<void> => {
    await IngresarNombre(datos.nombre)(actor);
    await SeleccionarFecha(datos.fecha)(actor);
    await MarcarCheckbox(datos.aceptaTerminos)(actor);
    await ClickEnEnviar()(actor);
  };
```

### 5. Manejo de Errores
```typescript
export const VerificarElementoExiste = (selector: string) =>
  async (actor: Actor): Promise<boolean> => {
    try {
      const elemento = actor.page.locator(selector);
      return await elemento.isVisible();
    } catch (error) {
      console.error(`Error verificando elemento ${selector}:`, error);
      return false;
    }
  };
```

## Ejemplos de Uso Real

### Escenario Completo
```typescript
test('Usuario completa formulario de registro', async ({ page }) => {
  const usuario = new Actor('Nuevo Usuario', page);

  // Given
  await page.goto('/registro');

  // When
  await usuario.attemptsTo(
    IngresarNombre('Juan Pérez'),
    IngresarEmail('juan@example.com'),
    SeleccionarFechaNacimiento('15', 'Enero', '1990'),
    AceptarTerminos(),
    EnviarFormulario()
  );

  // Then
  const mensajeExito = await usuario.asks(MensajeConfirmacion());
  const emailEnviado = await usuario.asks(EmailDeConfirmacionEnviado());

  expect(mensajeExito).toContain('Registro exitoso');
  expect(emailEnviado).toBeTruthy();
});
```

### Múltiples Actores
```typescript
test('Colaboración entre usuarios', async ({ browser }) => {
  const contexto1 = await browser.newContext();
  const contexto2 = await browser.newContext();

  const usuario1 = new Actor('Usuario 1', await contexto1.newPage());
  const usuario2 = new Actor('Usuario 2', await contexto2.newPage());

  // Usuario 1 crea un documento
  await usuario1.attemptsTo(
    CrearNuevoDocumento('Documento Compartido'),
    CompartirCon('usuario2@example.com')
  );

  // Usuario 2 lo ve
  await usuario2.attemptsTo(
    AbrirDocumentosCompartidos()
  );

  const documentoVisible = await usuario2.asks(
    DocumentoEstaVisible('Documento Compartido')
  );

  expect(documentoVisible).toBeTruthy();
});
```

## Integración con Playwright

### Esperando Elementos
```typescript
export const EsperarYClick = (selector: string) =>
  async (actor: Actor): Promise<void> => {
    await actor.page.waitForSelector(selector, { state: 'visible' });
    await actor.page.click(selector);
  };
```

### Trabajando con Múltiples Tabs
```typescript
export const AbrirNuevaTab = (url: string) =>
  async (actor: Actor): Promise<void> => {
    const [newPage] = await Promise.all([
      actor.page.context().waitForEvent('page'),
      actor.page.click('a[target="_blank"]')
    ]);
    await newPage.goto(url);
  };
```

## Debugging

### Agregar Logs
```typescript
export const TareaConLogs = (parametro: string) =>
  async (actor: Actor): Promise<void> => {
    console.log(`${actor.name} está ejecutando TareaConLogs con ${parametro}`);

    const pageObject = new MiPageObject(actor.page);
    await pageObject.elemento.click();

    console.log(`${actor.name} completó la tarea exitosamente`);
  };
```

### Screenshots en Questions
```typescript
export const CapturarEstado = () => async (actor: Actor): Promise<void> => {
  await actor.page.screenshot({
    path: `screenshots/${actor.name}-${Date.now()}.png`,
    fullPage: true
  });
};
```
