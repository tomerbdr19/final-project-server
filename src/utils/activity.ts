import moment from 'moment';

export type Activity = { from: Date; to: Date; label: string; value: number };
export const getActivityList = (
    period: 'day' | 'week' | 'month'
): Activity[] => {
    const currentDate = new Date();

    switch (period) {
        case 'day':
            const numOfDays = 7;
            return Array(numOfDays)
                .fill({ label: '', value: 0 })
                .map(({ value }, index) => {
                    const day = moment(currentDate).subtract(
                        numOfDays - (index + 1),
                        'days'
                    );
                    return {
                        from: day.startOf('day').toDate(),
                        to: day.endOf('day').toDate(),
                        label: day.format('ddd'),
                        value
                    };
                });
        case 'week':
            const numOfWeeks = 8;
            return Array(numOfWeeks)
                .fill({ label: '', value: 0 })
                .map(({ value }, index) => {
                    const day = moment(currentDate).subtract(
                        numOfWeeks - (index + 1),
                        'weeks'
                    );
                    return {
                        from: day.startOf('week').toDate(),
                        to: day.endOf('week').toDate(),
                        label: day.format('ww'),
                        value
                    };
                });
        case 'month':
            const numOfMonth = 6;
            return Array(numOfMonth)
                .fill({ label: '', value: 0 })
                .map(({ value }, index) => {
                    const day = moment(currentDate).subtract(
                        numOfMonth - (index + 1),
                        'months'
                    );
                    return {
                        from: day.startOf('month').toDate(),
                        to: day.endOf('month').toDate(),
                        label: day.format('MMM'),
                        value
                    };
                });
        default:
            return [];
    }
};
