export const getTruthyFilters = (object: any) =>
    Object.keys(object).reduce((result: any, key) => {
        if (object[key]) {
            result[key] = object[key];
        }
        return result;
    }, {});

export const filterToQuery = (object: any) =>
    Object.keys(object).reduce((filters: any, key) => {
        const filterValue = object[key];
        let res = {};
        if (filterValue) {
            if (key === 'age') {
                if (filterValue.from) {
                    filterValue.from = getDateFromAge(filterValue.from);
                }
                if (filterValue.to) {
                    filterValue.to = getDateFromAge(filterValue.to);
                }

                res = {
                    birthDate: {
                        ...(filterValue.to ? { $gte: filterValue.to } : {}),
                        ...(filterValue.from ? { $lte: filterValue.from } : {})
                    }
                };
            } else {
                res = {
                    [key]:
                        filterValue.from || filterValue.true
                            ? {
                                  ...(filterValue.to
                                      ? { $lte: filterValue.to }
                                      : {}),
                                  ...(filterValue.from
                                      ? {
                                            $gte: filterValue.from
                                        }
                                      : {})
                              }
                            : filterValue
                };
            }
        }

        res = getTruthyFilters(res);

        return { ...filters, ...res };
    }, {});

export const getDateFromAge = (age: number) => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - age);
    return date;
};
