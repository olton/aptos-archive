import {n2f} from "./utils.js";


const areaDefaultOptions = {
    axis: {
        y: {
            showLabel: true,
            label: {
                count: 5,
                step: 'auto',
                fixed: 0,
                font: {
                    size: 10
                },
                color: '#adbaa9'
            },
            line: {
                color: '#444c56'
            }
        },
        x: {
            line: {
                color: '#444c56'
            },
            label: {
                count: 10
            }
        }
    },
    padding: {
        top: 10,
        left: 40,
        right: 10,
        bottom: 5
    },
    border: false,
    legend: {
        vertical: true,
        position: "top-right",
        margin: {
            top: 10
        },
        border: {
            color: 'transparent'
        }
    },
}

export const drawAvgGraph = (target, data = [], color = '#458fff') => {
    $(target).clear()
    const points = []

    let max = 100
    let min = 0

    let index = 1
    for(let r of data.reverse()) {
        const m = +(r.count)
        points.push([index, m])
        if (m > max) max = m
        if (m < min) min = m
        index++
    }

    const maxY = Math.round(max * 1.2)
    const minY = Math.round(min / 1.2)

    const areas = [
        {
            name: "Average value",
            dots: false,
            size: 2
        }
    ]

    const graph = chart.areaChart(target, [points], {
        ...areaDefaultOptions,
        background: "transparent",
        areas,
        colors: [Metro.colors.toRGBA(color, .5)],
        legend: false,
        height: 100,
        boundaries: {
            maxY,
            minY
        },
        graphSize: 60,
        onTooltipShow: (d) => {
            return `<span class="text-bold">${n2f(d[1])} <small class="text-light">TRANS</small></span>`
        }
    })

    return graph
}

export const drawTransactionsPerMinute = (target, data = [], color = '#458fff') => {
    if (!data.length) return
    const points = []

    let max = -Infinity
    let min = Infinity

    let index = 1
    for(let r of data.reverse()) {
        const m = +(r.count)
        points.push([index, m])
        if (m > max) max = m
        if (m < min) min = m
        index++
    }

    const maxY = Math.round(max * 1.2)
    const minY = 0

    const areas = [
        {
            name: "Trans per minute",
            dots: false,
            size: 2
        }
    ]

    const graph = chart.areaChart(target, [points], {
        ...areaDefaultOptions,
        background: "transparent",
        areas,
        colors: [Metro.colors.toRGBA(color, .5)],
        legend: false,
        height: 100,
        boundaries: {
            maxY,
            minY
        },
        onTooltipShow: (d) => {
            return `<span class="text-bold">${n2f(d[1])} <small class="text-light">TRANS</small></span>`
        }
    })

    $(target).siblings(".min-max").find('.max-value').text(n2f(max))
    $(target).siblings(".min-max").find('.min-value').text(n2f(min))

    return graph
}