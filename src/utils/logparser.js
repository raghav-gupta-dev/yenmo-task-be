const logRegex = /^(?<date>\d{2}\/\d{2})\s(?<time>\d{2}:\d{2}:\d{2})\s+(?<level>\w+)\s+:(?<message>.*)/;

const parseLogLine = (line) => {
    const match = line.match(logRegex);
    if (match) {
        const { date, time, level, message } = match.groups;
        return {
            timestamp: `${new Date().getFullYear()}/${date} ${time}`,
            level: level.trim(),
            message: message.trim(),
            isStructured: true
        };
    }

    // Fallback for lines that don't match the pattern (like multi-line stack traces)
    return {
        timestamp: new Date().toISOString(),
        level: 'OTHER',
        message: line.trim(),
        isStructured: false
    };
};

module.exports = { parseLogLine };