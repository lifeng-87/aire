import { Time } from "@sapphire/duration";

export function second(second: number) {
  return second * Time.Second;
}

export function minutes(minutes: number): number {
  return minutes * Time.Minute;
}

export function hours(hours: number): number {
  return hours * Time.Hour;
}

export function days(days: number): number {
  return days * Time.Day;
}

export function months(months: number): number {
  return months * Time.Month;
}

export function years(years: number): number {
  return years * Time.Year;
}
