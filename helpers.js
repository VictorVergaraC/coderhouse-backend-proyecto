// ? Archivo creado para exportar funciones que se puedan reutilizar

// * Recibimos un objeto y un array de los atributos requeridos
// * Si uno de los atributos no existe, retornamos false.
export const isValidObject = (obj, arrAttributes) => {
    for (const atributo of arrAttributes) {
        if (!obj[atributo] || (typeof obj[atributo] === 'string' && obj[atributo].trim() === '')) {
            return false;
        }
        if (typeof obj[atributo] === 'number' && obj[atributo] <= 0) {
            return false;
        }
    }
    return true;
}

// * Recibimos un objeto y un array de atributos requeridos
// * Y retornamos un array con los atributos que no tenemos
export const findMissingAttributes = (obj, requiredAttributes) => {
    const missingAttributes = [];

    for (const attribute of requiredAttributes) {
        if (!obj.hasOwnProperty(attribute) ||
            (typeof obj[attribute] === 'string' && obj[attribute].trim() === '') ||
            (typeof obj[attribute] === 'number' && obj[attribute] <= 0)) {
            missingAttributes.push(attribute);
        }
    }

    return missingAttributes;
};

// * Esta función retorna un número en peso chileno.
export const formatCLP = strNumber => {

    const number = parseFloat(strNumber)

    const format = new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });

    return format.format(number);
}