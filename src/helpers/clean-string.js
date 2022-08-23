export const cleanString127 = (input) => {
    let output = "";
    for (let i=0; i<input.length; i++) {
        if (input.charCodeAt(i) <= 127) {
            output += input.charAt(i);
        }
    }
    return output;
}

export const cleanValue = (s) => {
    return s
        .replaceAll(null, "")
        .replaceAll("\\u0000", "")
        .replaceAll("0x00", "")
        .replaceAll("\x00", "")
}

export const cleanObj = (obj) => {
    for(let key in obj) {
        if (typeof obj[key] === 'string' && (obj[key].includes("\u0000") || obj[key] === "\x00" || obj[key] === "0x00")) {
            obj[key] = cleanValue(obj[key])
        } else
        if (Array.isArray(obj[key]) && (obj[key].includes("\u0000") || obj[key].includes("0x00") || obj[key].includes("\x00"))) {
            for (let i = 0; i < obj[key].length; i++){
                if (obj[key][i].includes("\u0000") || obj[key][i].includes("0x00") ) {
                    obj[key].splice(i, 1)
                }
            }
        } else
        if (typeof obj[key] === 'object') {
            obj[key] = cleanObj(obj[key])
        }
    }

    return obj
}