export function formatTime(dateString: string) {
    const date = new Date(dateString);
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const hoursString = hours < 10 ? '0' + hours : hours;
    const minutesString = minutes < 10 ? '0' + minutes : minutes;
    return hoursString + ':' + minutesString;
}