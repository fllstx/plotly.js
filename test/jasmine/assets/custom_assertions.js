'use strict';

var d3 = require('d3');

exports.assertDims = function(dims) {
    var traces = d3.selectAll('.trace');

    expect(traces.size())
        .toEqual(dims.length, 'to have correct number of traces');

    traces.each(function(_, i) {
        var trace = d3.select(this);
        var points = trace.selectAll('.point');

        expect(points.size())
            .toEqual(dims[i], 'to have correct number of pts in trace ' + i);
    });
};

exports.assertStyle = function(dims, color, opacity) {
    var N = dims.reduce(function(a, b) {
        return a + b;
    });

    var traces = d3.selectAll('.trace');
    expect(traces.size())
        .toEqual(dims.length, 'to have correct number of traces');

    expect(d3.selectAll('.point').size())
        .toEqual(N, 'to have correct total number of points');

    traces.each(function(_, i) {
        var trace = d3.select(this);
        var points = trace.selectAll('.point');

        expect(points.size())
            .toEqual(dims[i], 'to have correct number of pts in trace ' + i);

        points.each(function() {
            expect(this.style.fill)
                .toEqual(color[i], 'to have correct pt color');
            var op = this.style.opacity;
            expect(op === undefined ? 1 : +op)
                .toEqual(opacity[i], 'to have correct pt opacity');
        });
    });
};

exports.assertHoverLabelStyle = function(g, expectation, msg, textSelector) {
    if(!msg) msg = '';

    var pathStyle = window.getComputedStyle(g.select('path').node());
    expect(pathStyle.fill).toBe(expectation.bgcolor, msg + ': bgcolor');
    expect(pathStyle.stroke).toBe(expectation.bordercolor, msg + ': bordercolor');

    var textStyle = window.getComputedStyle(g.select(textSelector || 'text.nums').node());
    expect(textStyle.fontFamily.split(',')[0]).toBe(expectation.fontFamily, msg + ': font.family');
    expect(parseInt(textStyle.fontSize)).toBe(expectation.fontSize, msg + ': font.size');
    expect(textStyle.fill).toBe(expectation.fontColor, msg + ': font.color');
};

function assertLabelContent(label, expectation, msg) {
    var lines = label.selectAll('tspan');
    var lineCnt = lines.size();
    var expectMultiLine = Array.isArray(expectation);

    function extract(sel) {
        return sel.node() ? sel.html() : null;
    }

    if(lineCnt > 0) {
        if(expectMultiLine) {
            expect(lines.size()).toBe(expectation.length, msg + ': # of lines');
            lines.each(function(_, i) {
                var l = d3.select(this);
                expect(extract(l)).toBe(expectation[i], msg + ': tspan line ' + i);
            });
        } else {
            fail('Expected a single-line label, found multiple lines');
        }
    } else {
        if(!expectMultiLine) {
            expect(extract(label)).toBe(expectation, msg + ': text content');
        } else {
            fail('Expected a multi-line label, found single');
        }
    }
}

function count(selector) {
    return d3.selectAll(selector).size();
}

exports.assertHoverLabelContent = function(expectation, msg) {
    if(!msg) msg = '';

    var ptSelector = 'g.hovertext';
    var ptExpectation = expectation[0];
    var ptMsg = msg + ' point hover label';
    var ptCnt = count(ptSelector);

    var axSelector = 'g.axistext';
    var axExpectation = expectation[1];
    var axMsg = 'common axis hover label';
    var axCnt = count(axSelector);

    if(ptCnt === 1) {
        assertLabelContent(
            d3.select(ptSelector + '> text.nums'),
            ptExpectation[0],
            ptMsg + ' (nums)'
        );
        assertLabelContent(
            d3.select(ptSelector + '> text.name'),
            ptExpectation[1],
            ptMsg + ' (name)'
        );
    } else if(ptCnt > 1) {
        expect(ptCnt).toBe(ptExpectation.length, ptMsg + ' # of visible nodes');

        d3.selectAll(ptSelector).each(function(_, i) {
            assertLabelContent(
                d3.select(this).select('text.nums'),
                ptExpectation[i][0],
                ptMsg + ' (nums ' + i + ')'
            );
            assertLabelContent(
                d3.select(this).select('text.name'),
                ptExpectation[i][1],
                ptMsg + ' (name ' + i + ')'
            );
        });
    } else {
        expect(ptExpectation).toBe(null, ptMsg + ' should not be displayed');
    }

    if(axCnt > 0) {
        assertLabelContent(
            d3.select(axSelector + '> text'),
            axExpectation,
            axMsg
        );
    } else {
        expect(axExpectation).toBe(null, axMsg + ' should not be displayed');
    }
};

exports.assertClip = function(sel, isClipped, size, msg) {
    expect(sel.size()).toBe(size, msg + ' clip path (selection size)');

    sel.each(function(d, i) {
        var clipPath = d3.select(this).attr('clip-path');

        if(isClipped) {
            expect(String(clipPath).substr(0, 4))
                .toBe('url(', msg + ' clip path ' + '(item ' + i + ')');
        } else {
            expect(clipPath)
                .toBe(null, msg + ' clip path ' + '(item ' + i + ')');
        }
    });

};

exports.assertNodeDisplay = function(sel, expectation, msg) {
    expect(sel.size())
        .toBe(expectation.length, msg + ' display (selection size)');

    sel.each(function(d, i) {
        expect(d3.select(this).attr('display'))
            .toBe(expectation[i], msg + ' display ' + '(item ' + i + ')');
    });
};

exports.checkTicks = function(axLetter, vals, msg) {
    var selection = d3.selectAll('.' + axLetter + 'tick text');
    expect(selection.size()).toBe(vals.length);
    selection.each(function(d, i) {
        expect(d3.select(this).text()).toBe(vals[i], msg + ': ' + i);
    });
};
