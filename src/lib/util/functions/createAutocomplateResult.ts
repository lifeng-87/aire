export function createAutocomplateResult(
  results: {
    name: string;
    value: string;
  }[]
) {
  return results.map((result, i) => ({
    name: `${i + 1}. ${result.name}`.substring(0, 100),
    value: result.value,
  }));
}
