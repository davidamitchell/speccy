'use strict';

const should = require('should');
const common = require('../lib/common.js');

describe('common.js', () => {
    describe('hasDuplicates()', () => {
        it('considers [a, b, c] to not contain duplicates', () => {
            should(common.hasDuplicates(['a', 'b', 'c'])).be.eql(false);
        });
        it('considers [a, b, b] to comtain duplicates', () => {
            should(common.hasDuplicates(['a', 'b', 'b'])).be.eql(true);
        });
    });
});
