const getMonthName = (num) => {
  const monthNames = {
    1: 'January',
    2: 'February',
    3: 'March',
    4: 'April',
    5: 'May',
    6: 'June',
    7: 'July',
    8: 'August',
    9: 'September',
    10: 'October',
    11: 'November',
    12: 'December'
  };
  return monthNames[num];
};

const yearMonthDate = () => {
  let now = new Date();
  let year = now.getFullYear();
  let monthName = getMonthName(now.getMonth() + 1);
  let date = now.getDate();
  return (`${monthName} ${date} ${year}`);
};

const today = yearMonthDate();

module.exports = today;