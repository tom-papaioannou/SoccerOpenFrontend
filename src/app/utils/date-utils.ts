/*
 * Copyright (c) 2026 Tom Papaioannou. All rights reserved.
 * Licensed under the MIT License
 */

/**
 * Calculate the age from a date of birth string using UTC dates
 * @param dateString The date of birth as a string (ISO format or parseable by Date constructor)
 * @returns The calculated age in years, or null if the input is invalid
 */
export function calculateAge(dateString: string | undefined): number | null {
  if (!dateString) return null;
  const birthDate = new Date(dateString);

  if (isNaN(birthDate.getTime())) return null;

  const today = new Date();
  const birthUTC = new Date(Date.UTC(
    birthDate.getUTCFullYear(),
    birthDate.getUTCMonth(),
    birthDate.getUTCDate()
  ));
  const todayUTC = new Date(Date.UTC(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate()
  ));

  let age = todayUTC.getUTCFullYear() - birthUTC.getUTCFullYear();
  const monthDiff = todayUTC.getUTCMonth() - birthUTC.getUTCMonth();

  if (monthDiff < 0 || (monthDiff === 0 && todayUTC.getUTCDate() < birthUTC.getUTCDate())) {
    age--;
  }

  return age;
}
