export const styleToString = (style) => {
    return typeof style === "string" ? style
        : typeof style === "object" ? Object.entries(style).reduce((acc, key) => acc +
            key[0]
                .split(/(?=[A-Z])/)
                .join("-")
                .toLowerCase() +
            ":" +
            key[1] +
            ";", "")
        : "";
};
export const setAttribute = (element, key, value) => {
    // Convert Style Object
    console.log('setAttribute', key, value);
    if (key === "style") {
        const attr = styleToString(value);
        element.setAttribute(key, attr);
        return;
    }
    if (typeof value === "number") {
        if (key === "tabIndex") {
            element.setAttribute("tabindex", value.toString());
            return;
        }
    }
    // Set String Attribute
    if (typeof value === "string") {
        if (key === "class" || key === "className") {
            element.setAttribute("class", value);
            return;
        }
        if (key === "htmlFor" || key === "for") {
            element.setAttribute("for", value);
            return;
        }
        element.setAttribute(key, value);
        return;
    }
};
