import { test, expect } from "@playwright/test";
import { isUpcoming } from "../scripts/lib/events.ts";

const TODAY = new Date(2026, 9, 19, 15, 30);

test.describe("isUpcoming", () => {
  test("rejects past dates", () => {
    expect(isUpcoming("18/10/2026", TODAY)).toBe(false);
    expect(isUpcoming("01/01/2026", TODAY)).toBe(false);
  });

  test("accepts today regardless of the time of day", () => {
    expect(isUpcoming("19/10/2026", TODAY)).toBe(true);
  });

  test("accepts future dates, including later years", () => {
    expect(isUpcoming("20/10/2026", TODAY)).toBe(true);
    expect(isUpcoming("05/03/2027", TODAY)).toBe(true);
  });
});
