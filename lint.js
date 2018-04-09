#!/usr/bin/env node

'use strict'

const loader = require('./lib/loader.js');
const linter = require('./lib/linter.js');
const validator = require('./lib/validate.js');

const colors = process.env.NODE_DISABLE_COLORS ? {} : {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m'
};

const formatSchemaError = (err, context) => {
  const pointer = context.pop();
  const message = err.message;
  let output;

  output = `
${colors.yellow + pointer}
${colors.reset + message}
`;

  if (err.stack && err.name !== 'AssertionError') {
      output += colors.red + err.stack + colors.reset;
  }
  return output;
}

const formatLintResults = lintResults => {
    let output = '';
    lintResults.forEach(result => {
        const { rule, error, pointer } = result;

        output += `
${colors.yellow + pointer} ${colors.cyan} R: ${rule.name} ${colors.white} D: ${rule.description}
${colors.reset + error.message}
`;
    });

    return output;
}

const command = async (file, cmd) => {
    const verbose = cmd.quiet ? 1 : cmd.verbose;
    const spec = await loader.readOrError(file, { verbose, resolve: true });
    const rules = loader.loadRules(cmd.rules, cmd.skip);

    if (verbose > 1) {
        console.log('Found ' + rules.length + ' rules: ' + rules.map(x => x.name))
    };

    // Prep the linter with these rules
    linter.setRules(rules);

    validator.validate(spec, { verbose }, (err, _options) => {
        const { context, lintResults } = _options;

        // if (err) {
        //     console.error(colors.red + 'Specification schema is invalid.' + colors.reset);
        //     const output = formatSchemaError(err, context);
        //     console.error(output);
        //     process.exit(1);
        // }

        if (lintResults.length) {
            console.error(colors.red + 'Specification contains lint errors: ' + lintResults.length + colors.reset);
            const output = formatLintResults(lintResults);
            console.warn(output)
            process.exit(1);
        }

        console.log(colors.green + 'Specification is valid, with 0 lint errors' + colors.reset)
        process.exit(0);
    });
};

module.exports = { command }
