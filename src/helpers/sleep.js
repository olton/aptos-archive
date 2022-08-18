export const sleep = async (timeMs) => {
    return new Promise((resolve) => {
        setTimeout(resolve, timeMs)
    })
}