import moment from 'moment';
import { Model, ObjectId, Types } from 'mongoose';

export const getAverageFromDate = async (
    model: Model<any>,
    period: 'week' | 'day' | 'month',
    business: string,
    fromDate: Date,
    dateField = 'createdAt'
) => {
    const activityList = createActivityArray(period, fromDate);

    return await model
        .aggregate([
            {
                $match: {
                    business: new Types.ObjectId(business),
                    [dateField]: {
                        $gte: fromDate
                    }
                }
            },
            {
                $project: {
                    year: { $year: `$${dateField}` },
                    month: { $month: `$${dateField}` },
                    week: { $week: `$${dateField}` },
                    day: { $dayOfMonth: `$${dateField}` }
                }
            },
            {
                $group: {
                    _id: { ...accumlaterMap[period], year: '$year' },
                    count: { $sum: 1 }
                }
            }
        ])
        .then((agg) => {
            let sum = 0;
            console.log('🚀 ~ file: aggregate.ts ~ line 40 ~ .then ~ agg', agg);
            console.log(
                '🚀 ~ file: aggregate.ts ~ line 40 ~ .then ~ activity',
                activityList
            );

            agg.forEach((_) => {
                sum += _.count;
                updateActivityArray(_, activityList);
            });

            return {
                activityList,
                average: Math.round(sum / activityList.length)
            };
        });
};

const accumlaterMap: Record<'day' | 'month' | 'week', any> = {
    day: { day: '$day', week: '$week', month: '$month' },
    week: { week: '$week', month: '$month' },
    month: { month: '$month' }
};

const updateActivityArray = (
    { _id: { year, month, week, day }, count }: any,
    activityList: any[]
) => {
    const index = activityList.findIndex(
        ({ year: _year, month: _month, week: _week, day: _day }) =>
            _year === year &&
            _month === month &&
            (!week || _week === week) &&
            (!day || _day === day)
    );

    if (index !== -1) {
        activityList[index].value = count;
    }
};

const createActivityArray = (
    period: 'day' | 'week' | 'month',
    fromDate: Date
) => {
    const current = moment(fromDate).startOf(period);
    const today = new Date();
    const arr = [];

    while (current < moment(today)) {
        arr.push({
            label: getLabel(period, current.startOf(period).toDate()),
            day: Number(current.format('D')),
            week: Number(current.format('W')),
            month: Number(current.format('M')),
            year: Number(current.format('YYYY')),
            value: 0
        });

        current.add(1, period);
    }

    return arr;
};

const getLabel = (period: 'day' | 'week' | 'month', date: Date) => {
    switch (period) {
        case 'day':
            return moment(date).format('D.M');
        case 'week':
            return moment(date).format('W - YY');
        case 'month':
            return moment(date).format('MMM - YY');
    }
};

