import { Page } from '@playwright/test';

export class Actor {
  constructor(public readonly name: string, public readonly page: Page) {}

  async attemptsTo(...tasks: Array<(actor: Actor) => Promise<void>>) {
    for (const task of tasks) {
      await task(this);
    }
  }

  async asks<T>(question: (actor: Actor) => Promise<T>): Promise<T> {
    return question(this);
  }
}

