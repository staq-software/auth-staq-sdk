
const addHour = (date, hour) => date.setTime(date.getTime() + (hour*60*60*1000))

module.exports = { addHour }
