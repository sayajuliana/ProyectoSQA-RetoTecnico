import { Actor } from '../actors/actor';
import { DatePickerPage } from '../ui/datepicker.page';

export const ClickOnDateField = () => async (actor: Actor): Promise<void> => {
  const datePicker = new DatePickerPage(actor.page);
  await datePicker.dateInput.click();
};

export const SelectDate = (day: string) => async (actor: Actor): Promise<void> => {
  const datePicker = new DatePickerPage(actor.page);
  await datePicker.getDayLink(day).click();
};

export const NavigateToPreviousMonth = () => async (actor: Actor): Promise<void> => {
  const datePicker = new DatePickerPage(actor.page);
  await datePicker.prevButton.click();
};

export const NavigateToNextMonth = () => async (actor: Actor): Promise<void> => {
  const datePicker = new DatePickerPage(actor.page);
  await datePicker.nextButton.click();
};

export const SelectMonthFromDropdown = (month: string) => async (actor: Actor): Promise<void> => {
  const datePicker = new DatePickerPage(actor.page);
  await datePicker.selectMonth(month);
};

export const SelectYearFromDropdown = (year: string) => async (actor: Actor): Promise<void> => {
  const datePicker = new DatePickerPage(actor.page);
  await datePicker.selectYear(year);
};

export const SelectCompleteDate = (month: string, year: string, day: string) =>
  async (actor: Actor): Promise<void> => {
    await ClickOnDateField()(actor);
    await SelectMonthFromDropdown(month)(actor);
    await SelectYearFromDropdown(year)(actor);
    await SelectDate(day)(actor);
  };

export const ChangeExistingDate = (newMonth: string, newYear: string, newDay: string) =>
  async (actor: Actor): Promise<void> => {
    await ClickOnDateField()(actor);
    await SelectMonthFromDropdown(newMonth)(actor);
    await SelectYearFromDropdown(newYear)(actor);
    await SelectDate(newDay)(actor);
  };

export const NavigateMonthsBackward = (numberOfMonths: number) =>
  async (actor: Actor): Promise<void> => {
    const datePicker = new DatePickerPage(actor.page);
    for (let i = 0; i < numberOfMonths; i++) {
      await datePicker.prevButton.click();
    }
  };

export const NavigateMonthsForward = (numberOfMonths: number) =>
  async (actor: Actor): Promise<void> => {
    const datePicker = new DatePickerPage(actor.page);
    for (let i = 0; i < numberOfMonths; i++) {
      await datePicker.nextButton.click();
    }
  };
