import { afterEach, describe, expect, it, vi } from "vitest";
import { formatLocaleDate } from "./dateFormatting";

function spyOnDateTimeFormat() {
  const RealDateTimeFormat = Intl.DateTimeFormat;
  function DateTimeFormatMock(
    locale?: Intl.LocalesArgument,
    options?: Intl.DateTimeFormatOptions,
  ) {
    return new RealDateTimeFormat(locale, options);
  }

  return vi
    .spyOn(Intl, "DateTimeFormat")
    .mockImplementation(DateTimeFormatMock as typeof Intl.DateTimeFormat);
}

describe("formatLocaleDate", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("defaults to the runtime locale", () => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    const spy = spyOnDateTimeFormat();

    formatLocaleDate("2026-05-08T12:00:00Z", options);

    expect(spy).toHaveBeenCalledWith(undefined, options);
  });

  it("allows an explicit locale override", () => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    const spy = spyOnDateTimeFormat();

    formatLocaleDate("2026-05-08T12:00:00Z", options, "fr-FR");

    expect(spy).toHaveBeenCalledWith("fr-FR", options);
  });

  it("returns a fallback for invalid date input", () => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };

    expect(formatLocaleDate("not-a-date", options)).toBe("Invalid Date");
  });

  it("returns a fallback for an invalid locale override", () => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };

    expect(
      formatLocaleDate("2026-05-08T12:00:00Z", options, "bad_locale"),
    ).toBe("Invalid Date");
  });
});
