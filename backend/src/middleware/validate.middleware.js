/**
 * Validation middleware factory.
 * Accepts a schema object describing required/optional fields and their constraints.
 *
 * Usage:
 *   validate({
 *     body: {
 *       gameId:          { required: true,  type: 'string' },
 *       durationMinutes: { required: true,  type: 'number', min: 1 },
 *       platform:        { required: true,  type: 'string' },
 *       note:            { required: false, type: 'string', maxLength: 500 },
 *     },
 *   })
 */
export function validate(schema) {
    return (req, _res, next) => {
        const errors = [];

        for (const [source, fields] of Object.entries(schema)) {
            const data = req[source]; // req.body, req.query, req.params

            if (!data && Object.values(fields).some((f) => f.required)) {
                errors.push(`Missing request ${source}`);
                continue;
            }

            for (const [field, rules] of Object.entries(fields)) {
                const value = data?.[field];

                // --- required ---
                if (rules.required && (value === undefined || value === null || value === '')) {
                    errors.push(`${field} is required`);
                    continue;
                }

                // Skip further checks if value is absent and not required
                if (value === undefined || value === null) continue;

                // --- type ---
                if (rules.type) {
                    const actual = typeof value;
                    if (rules.type === 'number' && actual !== 'number') {
                        errors.push(`${field} must be a number`);
                        continue;
                    }
                    if (rules.type === 'string' && actual !== 'string') {
                        errors.push(`${field} must be a string`);
                        continue;
                    }
                    if (rules.type === 'boolean' && actual !== 'boolean') {
                        errors.push(`${field} must be a boolean`);
                        continue;
                    }
                    if (rules.type === 'array' && !Array.isArray(value)) {
                        errors.push(`${field} must be an array`);
                        continue;
                    }
                }

                // --- min / max (numbers) ---
                if (rules.min !== undefined && typeof value === 'number' && value < rules.min) {
                    errors.push(`${field} must be at least ${rules.min}`);
                }
                if (rules.max !== undefined && typeof value === 'number' && value > rules.max) {
                    errors.push(`${field} must be at most ${rules.max}`);
                }

                // --- minLength / maxLength (strings) ---
                if (rules.minLength !== undefined && typeof value === 'string' && value.length < rules.minLength) {
                    errors.push(`${field} must be at least ${rules.minLength} characters`);
                }
                if (rules.maxLength !== undefined && typeof value === 'string' && value.length > rules.maxLength) {
                    errors.push(`${field} must be at most ${rules.maxLength} characters`);
                }

                // --- pattern (regex) ---
                if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
                    errors.push(rules.patternMessage || `${field} has an invalid format`);
                }

                // --- enum ---
                if (rules.enum && !rules.enum.includes(value)) {
                    errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
                }
            }
        }

        if (errors.length > 0) {
            const error = new Error(errors.join('; '));
            error.statusCode = 400;
            return next(error);
        }

        next();
    };
}
