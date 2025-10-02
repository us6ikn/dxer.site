// moon_ephemeris.js
const YEAR = 2026;
const PERIGEE_DISTANCE_KM = 356352.93;
const COLOR_DECLINATION = '#fa4d56';
const COLOR_LOSS = '#1192e8';
const GC_RA_HOURS = 17 + 45/60 + 40/3600; // Galactic Center RA in hours
const GC_DEC = -(29 + 0/60 + 28/3600); // Galactic Center Dec in degrees

const quarters = [
    { start: new Date(Date.UTC(YEAR, 0, 1)), end: new Date(Date.UTC(YEAR, 3, 0)) },
    { start: new Date(Date.UTC(YEAR, 3, 1)), end: new Date(Date.UTC(YEAR, 6, 0)) },
    { start: new Date(Date.UTC(YEAR, 6, 1)), end: new Date(Date.UTC(YEAR, 9, 0)) },
    { start: new Date(Date.UTC(YEAR, 9, 1)), end: new Date(Date.UTC(YEAR + 1, 0, 0)) }
];

// Function to compute angular separation between two equatorial coordinates
function angularSeparation(ra1, dec1, ra2, dec2) {
    const ra1Rad = ra1 * Math.PI / 12; // Convert hours to radians
    const dec1Rad = dec1 * Math.PI / 180; // Convert degrees to radians
    const ra2Rad = ra2 * Math.PI / 12;
    const dec2Rad = dec2 * Math.PI / 180;

    const cosSep = Math.sin(dec1Rad) * Math.sin(dec2Rad) +
                   Math.cos(dec1Rad) * Math.cos(dec2Rad) * Math.cos(ra1Rad - ra2Rad);
    const sepRad = Math.acos(Math.min(Math.max(cosSep, -1), 1));
    return sepRad * 180 / Math.PI; // Convert to degrees
}

function computeMoonData(start, end) {
    const data = [];

    // Helper to format date as "YYYY-MM-DD HH:mm UTC"
    function formatDateNatural(date) {
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        const hours = String(date.getUTCHours()).padStart(2, '0');
        const minutes = String(date.getUTCMinutes()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes} UTC`;
    }

    for (let dt = new Date(start); dt <= end; dt.setUTCDate(dt.getUTCDate() + 1)) {
        [0, 12].forEach(hour => {
            const dtSample = new Date(dt);
            dtSample.setUTCHours(hour, 0, 0, 0);

            try {
                const astroTime = Astronomy.MakeTime(dtSample);
                const libration = Astronomy.Libration(astroTime);
                const dist_km = libration.dist_km;
                const moonGeo = Astronomy.GeoVector(Astronomy.Body.Moon, astroTime, true);
                const sunGeo = Astronomy.GeoVector(Astronomy.Body.Sun, astroTime, true);
                const moonEq = Astronomy.EquatorFromVector(moonGeo);
                const sunEq = Astronomy.EquatorFromVector(sunGeo);
                const dec = moonEq.dec;
                const moon_ra = moonEq.ra;
                const extra_loss = 40 * Math.log10(dist_km / PERIGEE_DISTANCE_KM);
                const sun_sep = angularSeparation(moon_ra, dec, sunEq.ra, sunEq.dec);
                const gc_sep = angularSeparation(moon_ra, dec, GC_RA_HOURS, GC_DEC);

                data.push({
                    date: new Date(dtSample),
                    dateStr: formatDateNatural(dtSample),
                    dec,
                    dist: dist_km,
                    extra_loss,
                    sun_sep,
                    gc_sep
                });
                console.log(`Date: ${dtSample.toISOString()}, Declination: ${dec.toFixed(4)}`);
            } catch (e) {
                console.warn(`Error computing data for ${dtSample.toISOString()}: ${e.message}`);
            }
        });
    }
    data.sort((a, b) => a.date - b.date);
    return data;
}

function createAnnotations(data, start, end) {
    const annotations = [];

    // Helper to format date with hours for precise bar boundaries
    function dateToStrWithHours(date) {
        return date.toISOString().slice(0, 16); // e.g., 2026-01-01T00:00
    }

    // Helper for linear interpolation to find exact crossing time
    function interpolateCrossingTime(d1, d2, sep1, sep2, threshold) {
        const t1 = d1.date.getTime();
        const t2 = d2.date.getTime();
        const fraction = (threshold - sep1) / (sep2 - sep1);
        const interpolatedTime = t1 + fraction * (t2 - t1);
        return new Date(interpolatedTime);
    }

    // Orange bars: Moon-Sun <10°
    let is_close_sun = data.map(d => d.sun_sep < 10);
    let startIdx = null;
    for (let i = 0; i < data.length; i++) {
        if (is_close_sun[i] && startIdx === null) {
            startIdx = i;
        } else if (!is_close_sun[i] && startIdx !== null) {
            let barStart = data[startIdx].date;
            let barEnd = data[i - 1].date;

            if (startIdx > 0 && data[startIdx - 1].sun_sep >= 10) {
                barStart = interpolateCrossingTime(
                    data[startIdx - 1], data[startIdx],
                    data[startIdx - 1].sun_sep, data[startIdx].sun_sep,
                    10
                );
            }

            if (i < data.length && data[i].sun_sep >= 10) {
                barEnd = interpolateCrossingTime(
                    data[i - 1], data[i],
                    data[i - 1].sun_sep, data[i].sun_sep,
                    10
                );
            } else {
                barEnd = new Date(data[i - 1].date);
                barEnd.setUTCHours(barEnd.getUTCHours() + 12);
            }

            annotations.push({
                type: 'box',
                xScaleID: 'x',
                xMin: dateToStrWithHours(barStart),
                xMax: dateToStrWithHours(barEnd),
                yScaleID: 'yDec',
                yMin: -30,
                yMax: 30,
                backgroundColor: 'rgba(255, 165, 0, 0.4)',
                borderWidth: 0
            });
            startIdx = null;
        }
    }
    if (startIdx !== null) {
        let barStart = data[startIdx].date;
        let barEnd = new Date(data[data.length - 1].date);
        barEnd.setUTCHours(barEnd.getUTCHours() + 12);

        if (startIdx > 0 && data[startIdx - 1].sun_sep >= 10) {
            barStart = interpolateCrossingTime(
                data[startIdx - 1], data[startIdx],
                data[startIdx - 1].sun_sep, data[startIdx].sun_sep,
                10
            );
        }

        annotations.push({
            type: 'box',
            xScaleID: 'x',
            xMin: dateToStrWithHours(barStart),
            xMax: dateToStrWithHours(barEnd),
            yScaleID: 'yDec',
            yMin: -30,
            yMax: 30,
            backgroundColor: 'rgba(255, 165, 0, 0.4)',
            borderWidth: 0
        });
    }

    // Grey bars: Moon-GC <10°
    let is_high_temp = data.map(d => d.gc_sep < 10);
    startIdx = null;
    for (let i = 0; i < data.length; i++) {
        if (is_high_temp[i] && startIdx === null) {
            startIdx = i;
        } else if (!is_high_temp[i] && startIdx !== null) {
            let barStart = data[startIdx].date;
            let barEnd = data[i - 1].date;

            if (startIdx > 0 && data[startIdx - 1].gc_sep >= 10) {
                barStart = interpolateCrossingTime(
                    data[startIdx - 1], data[startIdx],
                    data[startIdx - 1].gc_sep, data[startIdx].gc_sep,
                    10
                );
            }

            if (i < data.length && data[i].gc_sep >= 10) {
                barEnd = interpolateCrossingTime(
                    data[i - 1], data[i],
                    data[i - 1].gc_sep, data[i].gc_sep,
                    10
                );
            } else {
                barEnd = new Date(data[i - 1].date);
                barEnd.setUTCHours(barEnd.getUTCHours() + 12);
            }

            annotations.push({
                type: 'box',
                xScaleID: 'x',
                xMin: dateToStrWithHours(barStart),
                xMax: dateToStrWithHours(barEnd),
                yScaleID: 'yDec',
                yMin: -30,
                yMax: 30,
                backgroundColor: 'rgba(128, 128, 128, 0.4)',
                borderWidth: 0
            });
            startIdx = null;
        }
    }
    if (startIdx !== null) {
        let barStart = data[startIdx].date;
        let barEnd = new Date(data[data.length - 1].date);
        barEnd.setUTCHours(barEnd.getUTCHours() + 12);

        if (startIdx > 0 && data[startIdx - 1].gc_sep >= 10) {
            barStart = interpolateCrossingTime(
                data[startIdx - 1], data[startIdx],
                data[startIdx - 1].gc_sep, data[startIdx].gc_sep,
                10
            );
        }

        annotations.push({
            type: 'box',
            xScaleID: 'x',
            xMin: dateToStrWithHours(barStart),
            xMax: dateToStrWithHours(barEnd),
            yScaleID: 'yDec',
            yMin: -30,
            yMax: 30,
            backgroundColor: 'rgba(128, 128, 128, 0.4)',
            borderWidth: 0
        });
    }

    // Month separators and labels, skipping chart boundaries
    let month_start = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
    while (month_start < end) {
        const monthStr = dateToStrWithHours(month_start);
        if (month_start.getTime() !== start.getTime() && month_start.getTime() !== end.getTime()) {
            annotations.push({
                type: 'line',
                xScaleID: 'x',
                xMin: monthStr,
                xMax: monthStr,
                yScaleID: 'yDec',
                yMin: -30,
                yMax: 30,
                borderColor: 'gray',
                borderWidth: 1.5
            });
        }
        const ndays = new Date(Date.UTC(month_start.getUTCFullYear(), month_start.getUTCMonth() + 1, 0)).getUTCDate();
        const mid_month = new Date(Date.UTC(month_start.getUTCFullYear(), month_start.getUTCMonth(), Math.floor(ndays / 2)));
        const midStr = dateToStrWithHours(mid_month);
        annotations.push({
            type: 'label',
            xScaleID: 'x',
            yScaleID: 'yDec',
            xValue: midStr,
            yValue: 38,
            content: month_start.toLocaleString('default', { month: 'long' }),
            font: { size: 8, weight: 'bold' },
            color: 'black'
        });
        month_start = new Date(Date.UTC(month_start.getUTCFullYear(), month_start.getUTCMonth() + 1, 1));
    }

    // Weekend dashed lines and labels
    let current = new Date(start.getTime());
    while (current < end) {
        const wd = current.getUTCDay();
        const currentStr = dateToStrWithHours(current);
        if (wd === 0 || wd === 6) {
            annotations.push({
                type: 'line',
                xScaleID: 'x',
                xMin: currentStr,
                xMax: currentStr,
                yScaleID: 'yDec',
                yMin: -30,
                yMax: 30,
                borderColor: 'gray',
                borderWidth: 1.5,
                borderDash: [5, 5],
                borderDashOffset: 0
            });

            if (wd === 6) {
                const sunday = new Date(current.getTime());
                sunday.setUTCDate(sunday.getUTCDate() + 1);
                const label = `${current.getUTCDate()}/${sunday.getUTCDate()}`;
                const mid = new Date(current.getTime());
                mid.setUTCHours(12);
                const midStr = dateToStrWithHours(mid);
                annotations.push({
                    type: 'label',
                    xScaleID: 'x',
                    yScaleID: 'yDec',
                    xValue: midStr,
                    yValue: 33,
                    content: label,
                    font: { size: 8 },
                    color: 'black'
                });
            }
        }
        current.setUTCDate(current.getUTCDate() + 1);
    }

    return annotations;
}

// Wait for DOM to load before accessing canvas elements
document.addEventListener('DOMContentLoaded', () => {
    quarters.forEach((quarter, index) => {
        const data = computeMoonData(quarter.start, quarter.end);
        if (!data || data.length === 0) {
            console.warn(`No data for quarter ${index + 1}`);
            return;
        }
        const annotations = createAnnotations(data, quarter.start, quarter.end);
        const canvas = document.getElementById(`chart${index + 1}`);
        if (!canvas) {
            console.error(`Canvas element chart${index + 1} not found`);
            return;
        }
        const ctx = canvas.getContext('2d');

        new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [
                    {
                        label: 'Declination',
                        data: data.map(d => ({ x: d.date, y: d.dec })),
                        borderColor: COLOR_DECLINATION,
                        borderWidth: 1.5,
                        pointRadius: 0,
                        yAxisID: 'yDec'
                    },
                    {
                        label: 'Extra Loss',
                        data: data.map(d => ({ x: d.date, y: d.extra_loss })),
                        borderColor: COLOR_LOSS,
                        borderWidth: 1.5,
                        pointRadius: 0,
                        yAxisID: 'yLoss'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'time',
                        time: { unit: 'day', parser: 'yyyy-MM-dd\'T\'HH:mm', displayFormats: { day: 'MMM d' } },
                        min: quarter.start,
                        max: quarter.end,
                        position: 'top',
                        ticks: { display: false },
                        grid: { display: false },
                        border: { display: false }
                    },
                    yDec: {
                        min: -30,
                        max: 30,
                        position: 'left',
                        ticks: { color: COLOR_DECLINATION, font: { size: 9 }, drawTicks: true, tickLength: 10 },
                        grid: { display: true, color: 'rgba(0,0,0,0.3)', borderDash: [2,2], drawBorder: false },
                        border: { display: true, color: COLOR_DECLINATION, width: 1.2 }
                    },
                    yLoss: {
                        min: 0,
                        max: 2.4,
                        reverse: true,
                        position: 'right',
                        ticks: {
                            color: COLOR_LOSS,
                            font: { size: 9 },
                            drawTicks: true,
                            tickLength: 10,
                            stepSize: 0.4,
                            callback: function(value) {
                                const allowedTicks = [0, 0.4, 0.8, 1.2, 1.6, 2, 2.4];
                                if (allowedTicks.includes(Number(value.toFixed(1)))) {
                                    return value.toFixed(1);
                                }
                                return null;
                            }
                        },
                        grid: { display: false, drawBorder: false },
                        border: { display: true, color: COLOR_LOSS, width: 1.2 }
                    }
                },
                interaction: {
                    mode: 'index',
                    intersect: false,
                    axis: 'x'
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        enabled: false,
                        displayColors: false,
                        external: function(context) {
                            const tooltipModel = context.tooltip;
                            const chart = context.chart;
                            const canvas = chart.canvas;
                            const container = canvas.parentNode;
                            const tooltipId = 'chartjs-tooltip-' + canvas.id;

                            let tooltipEl = container.querySelector('#' + tooltipId);
                            if (!tooltipEl) {
                                tooltipEl = document.createElement('div');
                                tooltipEl.id = tooltipId;
                                tooltipEl.className = 'chartjs-tooltip';
                                tooltipEl.style.position = 'absolute';
                                tooltipEl.style.pointerEvents = 'none';
                                tooltipEl.style.background = 'rgba(255,255,255,0.98)';
                                tooltipEl.style.border = '1px solid #ccc';
                                tooltipEl.style.borderRadius = '4px';
                                tooltipEl.style.padding = '6px 8px';
                                tooltipEl.style.fontSize = '11px';
                                tooltipEl.style.boxShadow = '0 2px 6px rgba(0,0,0,0.12)';
                                tooltipEl.style.transition = 'opacity 0.04s ease';
                                tooltipEl.style.whiteSpace = 'nowrap';
                                tooltipEl.style.zIndex = 1000;
                                tooltipEl.style.opacity = '0';
                                container.appendChild(tooltipEl);
                            }

                            if (tooltipModel.opacity === 0 || !tooltipModel.dataPoints || tooltipModel.dataPoints.length === 0) {
                                tooltipEl.style.opacity = '0';
                                return;
                            }

                            const dataIndex = tooltipModel.dataPoints[0].dataIndex;
                            if (dataIndex == null || !data[dataIndex]) {
                                tooltipEl.style.opacity = '0';
                                return;
                            }
                            const d = data[dataIndex];

                            tooltipEl.innerHTML = `
                                <div style="font-weight:700;margin-bottom:4px;">${d.dateStr}</div>
                                <div style="color:${COLOR_DECLINATION};margin-bottom:2px;">Declination: ${d.dec.toFixed(2)}°</div>
                                <div style="color:${COLOR_LOSS};margin-bottom:2px;">Extra Loss: ${d.extra_loss.toFixed(2)} dB</div>
                                <div style="color:#000;margin-bottom:2px;">Distance: ${d.dist.toFixed(0)} km</div>
                                <div style="color:orange;margin-bottom:2px;">Moon-Sun Sep: ${d.sun_sep.toFixed(2)}°</div>
                                <div style="color:gray;">Moon-GC Sep: ${d.gc_sep.toFixed(2)}°</div>
                            `;

                            const caretX = tooltipModel.caretX;
                            const caretY = tooltipModel.caretY;
                            tooltipEl.style.left = caretX + 'px';
                            tooltipEl.style.top = caretY + 'px';
                            tooltipEl.style.transform = 'translate(-50%, -120%)';
                            tooltipEl.style.opacity = '1';
                        }
                    },
                    annotation: {
                        clip: false,
                        annotations: annotations
                    }
                },
                layout: {
                    padding: { top: 50, bottom: 10, left: 20, right: 30 }
                },
                elements: { line: { tension: 0 } }
            }
        });
    });
});
