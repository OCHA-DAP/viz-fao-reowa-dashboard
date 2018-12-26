/**
 * Axis implementation.
 *
 * Examples:
 * - {@link http://dc-js.github.com/dc.js/ Nasdaq 100 Index}
 * @class rowChart
 * @memberof dc
 * @mixes dc.capMixin
 * @mixes dc.marginMixin
 * @mixes dc.colorMixin
 * @mixes dc.baseMixin
 * @example
 * // create a row chart under #chart-container1 element using the default global chart group
 * var chart1 = dc.rowChart('#chart-container1');
 * // create a row chart under #chart-container2 element using chart group A
 * var chart2 = dc.rowChart('#chart-container2', 'chartGroupA');
 * @param {String|node|d3.selection} parent - Any valid
 * {@link https://github.com/d3/d3-3.x-api-reference/blob/master/Selections.md#selecting-elements d3 single selector} specifying
 * a dom block element such as a div; or a dom element or d3 selection.
 * @param {String} [chartGroup] - The name of the chart group this chart instance should be placed in.
 * Interaction with a chart will only trigger events and redraws within the chart's group.
 * @returns {dc.rowChart}
 */
dc.axisChart = function (parent, chartGroup) {

    var _g;

    var _chart = dc.capMixin(dc.marginMixin(dc.baseMixin({})));

    var _x;

    var _elasticX;

    var _xAxis = d3.svg.axis().orient('bottom');

    var _rowData;

    _chart.rowsCap = _chart.cap;

    function calculateAxisScale () {
        if (!_x || _elasticX) {
            var extent = d3.extent(_rowData, _chart.cappedValueAccessor);
            if (extent[0] > 0) {
                extent[0] = 0;
            }
            if (extent[1] < 0) {
                extent[1] = 0;
            }
            _x = d3.scale.linear().domain(extent)
                .range([0, _chart.effectiveWidth()]);
        }
        _xAxis.scale(_x);
    }

    function drawAxis () {
        var axisG = _g.select('g.axis');

        calculateAxisScale();

        if (axisG.empty()) {
            axisG = _g.append('g').attr('class', 'axis');
        }
        dc.transition(axisG, _chart.transitionDuration(), 0)
            .call(_xAxis);
    }

    _chart._doRender = function () {
        _chart.resetSvg();

        _g = _chart.svg()
            .append('g')
            .attr('transform', 'translate(' + _chart.margins().left + ',' + _chart.margins().top + ')');

        drawChart();

        return _chart;
    };

    /**
     * Gets or sets the x scale. The x scale can be any d3
     * {@link https://github.com/d3/d3-3.x-api-reference/blob/master/Quantitative-Scales.md quantitive scale}.
     * @method x
     * @memberof dc.rowChart
     * @instance
     * @see {@link https://github.com/d3/d3-3.x-api-reference/blob/master/Quantitative-Scales.md quantitive scale}
     * @param {d3.scale} [scale]
     * @returns {d3.scale|dc.rowChart}
     */
    _chart.x = function (scale) {
        if (!arguments.length) {
            return _x;
        }
        _x = scale;
        return _chart;
    };

  /**
     * Get or set the elasticity on x axis. If this attribute is set to true, then the x axis will rescle to auto-fit the
     * data range when filtered.
     * @method elasticX
     * @memberof dc.rowChart
     * @instance
     * @param {Boolean} [elasticX]
     * @returns {Boolean|dc.rowChart}
     */
    _chart.elasticX = function (elasticX) {
        if (!arguments.length) {
            return _elasticX;
        }
        _elasticX = elasticX;
        return _chart;
    };

  /**
     * Get the x axis for the row chart instance.  Note: not settable for row charts.
     * See the {@link https://github.com/d3/d3-3.x-api-reference/blob/master/SVG-Axes.md#axis d3 axis object}
     * documention for more information.
     * @method xAxis
     * @memberof dc.rowChart
     * @instance
     * @see {@link https://github.com/d3/d3-3.x-api-reference/blob/master/SVG-Axes.md#axis d3.svg.axis}
     * @example
     * // customize x axis tick format
     * chart.xAxis().tickFormat(function (v) {return v + '%';});
     * // customize x axis tick values
     * chart.xAxis().tickValues([0, 100, 200, 300]);
     * @returns {d3.svg.axis}
     */
    _chart.xAxis = function () {
        return _xAxis;
    };

    function drawChart () {
        _rowData = _chart.data();
        drawAxis();
    }

    _chart._doRedraw = function () {
        drawChart();
        return _chart;
    };

    return _chart.anchor(parent, chartGroup);
};