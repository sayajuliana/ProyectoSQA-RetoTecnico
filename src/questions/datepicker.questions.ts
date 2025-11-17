import { Actor } from '../actors/actor';
import { DatePickerPage } from '../ui/datepicker.page';

export const IsCalendarVisible = () => async (actor: Actor): Promise<boolean> => {
  const datePicker = new DatePickerPage(actor.page);
  return await datePicker.calendarWidget.isVisible();
};

export const SelectedDateValue = () => async (actor: Actor): Promise<string> => {
  const datePicker = new DatePickerPage(actor.page);
  return await datePicker.dateInput.inputValue();
};

export const CurrentMonth = () => async (actor: Actor): Promise<string> => {
  const datePicker = new DatePickerPage(actor.page);
  const selectedOption = await datePicker.monthDropdown.locator('option:checked');
  return await selectedOption.textContent() || '';
};

export const CurrentYear = () => async (actor: Actor): Promise<string> => {
  const datePicker = new DatePickerPage(actor.page);
  const selectedOption = await datePicker.yearDropdown.locator('option:checked');
  return await selectedOption.textContent() || '';
};

export const IsDateEnabled = (day: string) => async (actor: Actor): Promise<boolean> => {
  const datePicker = new DatePickerPage(actor.page);
  try {
    const dayLink = datePicker.getDayLink(day);
    return await dayLink.isVisible();
  } catch {
    return false;
  }
};

export const IsDateDisabled = (day: string) => async (actor: Actor): Promise<boolean> => {
  const datePicker = new DatePickerPage(actor.page);
  const disabledDay = datePicker.getDisabledDay(day);
  return await disabledDay.isVisible();
};

export const DateInputFormat = () => async (actor: Actor): Promise<string> => {
  const datePicker = new DatePickerPage(actor.page);
  const value = await datePicker.dateInput.inputValue();

  // Verificar si el formato coincide con MM/DD/YYYY
  const datePattern = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
  return datePattern.test(value) ? 'MM/DD/YYYY' : 'INVALID';
};

export const IsMonthDropdownVisible = () => async (actor: Actor): Promise<boolean> => {
  const datePicker = new DatePickerPage(actor.page);
  return await datePicker.monthDropdown.isVisible();
};

export const IsYearDropdownVisible = () => async (actor: Actor): Promise<boolean> => {
  const datePicker = new DatePickerPage(actor.page);
  return await datePicker.yearDropdown.isVisible();
};

export const AvailableYears = () => async (actor: Actor): Promise<string[]> => {
  const datePicker = new DatePickerPage(actor.page);
  const options = await datePicker.yearDropdown.locator('option').allTextContents();
  return options;
};

export const AvailableMonths = () => async (actor: Actor): Promise<string[]> => {
  const datePicker = new DatePickerPage(actor.page);
  const options = await datePicker.monthDropdown.locator('option').allTextContents();
  return options;
};

export const DateFieldValue = () => async (actor: Actor): Promise<string> => {
  const datePicker = new DatePickerPage(actor.page);
  return await datePicker.dateInput.inputValue();
};
