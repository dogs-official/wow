module.exports = (template, ...args) => {
    let result = template;
    args.forEach((arg) => (result = result.replace("%s", arg)));
    return result;
};
