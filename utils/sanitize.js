/**
 * Strip HTML tags and trim whitespace from a string.
 * Prevents XSS via stored HTML in DB fields.
 */
function sanitize(value) {
  if (typeof value !== 'string') return value;
  return value.replace(/<[^>]*>/g, '').trim();
}

/**
 * Sanitize specific fields on an object.
 */
function sanitizeFields(obj, fields) {
  const result = { ...obj };
  fields.forEach((field) => {
    if (result[field]) result[field] = sanitize(result[field]);
  });
  return result;
}

module.exports = { sanitize, sanitizeFields };
