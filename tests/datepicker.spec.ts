import { test, expect } from '@playwright/test';
import { Actor } from '../src/actors/actor';
import {
  ClickOnDateField,
  SelectCompleteDate,
  NavigateToPreviousMonth,
  NavigateToNextMonth,
  SelectMonthFromDropdown,
  SelectYearFromDropdown,
  SelectDate,
  ChangeExistingDate,
} from '../src/task/datepicker.tasks';
import {
  IsCalendarVisible,
  SelectedDateValue,
  CurrentMonth,
  CurrentYear,
  DateInputFormat,
  IsMonthDropdownVisible,
  IsYearDropdownVisible,
  DateFieldValue,
} from '../src/questions/datepicker.questions';

test.describe('Selección de fecha en campo de formulario', () => {
  let actor: Actor;

  test.beforeEach(async ({ page }) => {
    actor = new Actor('Usuario', page);
    await page.goto('https://jqueryui.com/datepicker/#dropdown-month-year');
  });

  test('Verificar apertura del calendario al hacer clic en el campo de fecha', async () => {
    // Given: El usuario está en la página con el datepicker
    // When: El usuario hace clic en el campo de fecha
    await actor.attemptsTo(ClickOnDateField());

    // Then: El calendario emergente debe aparecer
    const isVisible = await actor.asks(IsCalendarVisible());
    expect(isVisible).toBeTruthy();
  });

  test('Verificar selección de fecha dentro del rango permitido', async () => {
    // Given: El usuario abre el calendario
    await actor.attemptsTo(ClickOnDateField());

    // When: El usuario selecciona una fecha válida (ejemplo: día 15)
    await actor.attemptsTo(
      SelectMonthFromDropdown('5'), // Junio (índice 5)
      SelectYearFromDropdown('2025'),
      SelectDate('15')
    );

    // Then: La fecha debe ser seleccionada correctamente
    const selectedDate = await actor.asks(SelectedDateValue());
    expect(selectedDate).toBeTruthy();
    expect(selectedDate).toContain('15');
  });

  test('Verificar navegación entre meses en el selector', async () => {
    // Given: El usuario abre el calendario
    await actor.attemptsTo(ClickOnDateField());

    // When: El usuario navega hacia atrás en los meses
    const initialMonth = await actor.asks(CurrentMonth());
    await actor.attemptsTo(NavigateToPreviousMonth());

    // Then: El mes debe cambiar
    const newMonth = await actor.asks(CurrentMonth());
    expect(newMonth).not.toBe(initialMonth);

    // When: El usuario navega hacia adelante
    await actor.attemptsTo(NavigateToNextMonth());

    // Then: El mes debe regresar al mes inicial
    const returnedMonth = await actor.asks(CurrentMonth());
    expect(returnedMonth).toBe(initialMonth);
  });

  test('Verificar navegación entre años en el selector', async () => {
    // Given: El usuario abre el calendario
    await actor.attemptsTo(ClickOnDateField());

    // When: El usuario cambia el año usando el dropdown
    await actor.attemptsTo(SelectYearFromDropdown('2024'));

    // Then: El año debe cambiar correctamente
    const currentYear = await actor.asks(CurrentYear());
    expect(currentYear).toBe('2024');

    // When: El usuario cambia a otro año
    await actor.attemptsTo(SelectYearFromDropdown('2026'));

    // Then: El año debe actualizarse
    const newYear = await actor.asks(CurrentYear());
    expect(newYear).toBe('2026');
  });

  test('Verificar que se puede cambiar una fecha ya seleccionada', async () => {
    // Given: El usuario ya ha seleccionado una fecha
    await actor.attemptsTo(SelectCompleteDate('2', '2025', '10')); // Marzo 10, 2025

    const firstDate = await actor.asks(SelectedDateValue());
    expect(firstDate).toBeTruthy();

    // When: El usuario selecciona una nueva fecha diferente
    await actor.attemptsTo(ChangeExistingDate('5', '2025', '25')); // Junio 25, 2025

    // Then: La fecha debe actualizarse correctamente
    const secondDate = await actor.asks(SelectedDateValue());
    expect(secondDate).not.toBe(firstDate);
    expect(secondDate).toContain('25');
  });
});
