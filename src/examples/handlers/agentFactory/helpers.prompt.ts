// Generates a structured JSON output instruction prompt for LLM services.
export const jsonUsageIntentPrompt = (jsonRequirement: object) => `
Adhere strictly to the following JSON output guidelines:
  1. Ensure the entire response is a single, valid JSON object.
  2. Use double quotes for all keys and string values.
  3. Do not include any text outside the JSON object.
  4. Escape special characters in strings properly (e.g., \\n for newlines, \\" for quotes).
  5. Use true, false, and null as literals (not strings).
  6. Format numbers without quotes.
  7. If a schema is not provided, infer an appropriate schema based on the query context otherwise strictly adhere to the provided schema.
  8. Nest objects and arrays as needed for complex data structures.
  9. Use consistent naming conventions for keys (e.g., camelCase or snake_case).
  10. Do not use comments within the JSON.
The output will be parsed using 'json.loads()' in Python, so strict JSON compliance is crucial.
Return the final response in the following format:
${JSON.stringify(jsonRequirement)}
`;
