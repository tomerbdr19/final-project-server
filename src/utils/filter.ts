export const getTruthyFilters = (object: any) =>
    Object.keys(object).reduce((result: any, key) => {
        if (object[key]) {
            result[key] = object[key];
        }
        return result;
    }, {});
