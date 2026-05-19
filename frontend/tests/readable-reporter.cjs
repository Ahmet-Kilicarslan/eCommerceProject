class ReadablePlaywrightReporter {
  constructor() {
    this.results = [];
  }

  onTestEnd(test, result) {
    const projectName = test.parent.project()?.name || 'default';
    const status = result.status === 'passed' ? 'PASS' : result.status.toUpperCase();
    const duration = `${(result.duration / 1000).toFixed(1)}s`;

    this.results.push({
      projectName,
      title: test.title,
      status,
      duration,
      errors: result.errors || [],
    });
  }

  onEnd(result) {
    const lines = [
      '',
      'Readable Playwright usability-test summary',
      '------------------------------------------',
    ];

    for (const testResult of this.results) {
      lines.push(`  ${testResult.status} [${testResult.projectName}] ${testResult.title} (${testResult.duration})`);

      for (const error of testResult.errors) {
        const message = error.message?.split('\n').find(Boolean);
        if (message) {
          lines.push(`       ${message}`);
        }
      }
    }

    lines.push('');
    lines.push(`Overall result: ${result.status.toUpperCase()}`);
    lines.push('');

    process.stdout.write(`${lines.join('\n')}\n`);
  }
}

module.exports = ReadablePlaywrightReporter;
