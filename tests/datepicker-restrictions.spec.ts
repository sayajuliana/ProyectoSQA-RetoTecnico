import { test, expect } from '@playwright/test';
import { Actor } from '../src/actors/actor';
import {
  ClickOnDateField,
  SelectMonthFromDropdown,
  SelectYearFromDropdown,
} from '../src/task/datepicker.tasks';
import { IsDateEnabled, IsDateDisabled, DateFieldValue } from '../src/questions/datepicker.questions';


test.describe('Verificar persistencia de fecha seleccionada al enviar formulario', () => {
  test('Verificar que la fecha persiste en el campo de entrada', async ({ page }) => {
    const actor = new Actor('Usuario', page);

    await page.goto('https://jqueryui.com/datepicker/#dropdown-month-year');

    // Seleccionar una fecha
    await actor.attemptsTo(ClickOnDateField());
    await actor.attemptsTo(
      SelectMonthFromDropdown('4'),
      SelectYearFromDropdown('2025'),
    );

    const frame = page.locator('iframe').contentFrame();
    await frame.getByRole('link', { name: '18', exact: true }).click();

    // Verificar que la fecha está en el campo
    const selectedDate = await actor.asks(DateFieldValue());
    expect(selectedDate).toBeTruthy();

    // Simular que el usuario hace clic fuera del calendario
    await frame.locator('body').click({ position: { x: 10, y: 10 } });

    // Verificar que la fecha todavía está presente después de cerrar el calendario
    const persistedDate = await actor.asks(DateFieldValue());
    expect(persistedDate).toBe(selectedDate);
    expect(persistedDate).toContain('18');
  });

  test('Verificar que la fecha se mantiene después de reabrir el calendario', async ({ page }) => {
    const actor = new Actor('Usuario', page);

    await page.goto('https://jqueryui.com/datepicker/#dropdown-month-year');

    // Primera selección
    await actor.attemptsTo(ClickOnDateField());
    await actor.attemptsTo(
      SelectMonthFromDropdown('3'),
      SelectYearFromDropdown('2025'),
    );

    const frame = page.locator('iframe').contentFrame();
    await frame.getByRole('link', { name: '25', exact: true }).click();

    const firstDate = await actor.asks(DateFieldValue());

    // Cerrar el calendario haciendo clic fuera
    await frame.locator('body').click({ position: { x: 10, y: 10 } });

    // Esperar un momento
    await page.waitForTimeout(500);

    // Reabrir el calendario
    await actor.attemptsTo(ClickOnDateField());

    // Verificar que la fecha sigue siendo la misma
    const dateAfterReopen = await actor.asks(DateFieldValue());
    expect(dateAfterReopen).toBe(firstDate);
  });

  test('Verificar que el valor del campo se puede enviar en un formulario', async ({ page }) => {
    const actor = new Actor('Usuario', page);

    await page.goto('https://jqueryui.com/datepicker/#dropdown-month-year');

    // Seleccionar una fecha
    await actor.attemptsTo(ClickOnDateField());
    await actor.attemptsTo(
      SelectMonthFromDropdown('5'),
      SelectYearFromDropdown('2025'),
    );

    const frame = page.locator('iframe').contentFrame();
    await frame.getByRole('link', { name: '12', exact: true }).click();

    // Obtener el valor final
    const finalDate = await actor.asks(DateFieldValue());

    // Verificar que el campo tiene un valor válido que se puede enviar
    expect(finalDate).toBeTruthy();
    expect(finalDate).toMatch(/\d{2}\/\d{2}\/\d{4}/);

    // En un escenario real, aquí verificarías que al enviar el formulario
    // el valor se transmite correctamente al servidor
    const dateInput = frame.locator('#datepicker');
    const inputValue = await dateInput.inputValue();
    expect(inputValue).toBe(finalDate);
  });
});
