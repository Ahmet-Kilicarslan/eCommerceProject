class ReadableFunctionalReporter {
    onRunComplete(_, results) {
        const lines = [
            '',
            'Readable functional-test summary',
            '--------------------------------',
        ];

        for (const testFile of results.testResults) {
            const fileName = testFile.testFilePath.split('/').slice(-1)[0];
            lines.push('');
            lines.push(fileName);

            for (const assertion of testFile.testResults) {
                const status = assertion.status === 'passed' ? 'PASS' : assertion.status.toUpperCase();
                const fullName = [...assertion.ancestorTitles, assertion.title].join(' > ');
                lines.push(`  ${status} ${fullName}`);

                if (assertion.status === 'failed') {
                    for (const failureMessage of assertion.failureMessages) {
                        const firstLine = failureMessage.split('\n').find(Boolean);
                        if (firstLine) {
                            lines.push(`       ${firstLine}`);
                        }
                    }
                }
            }
        }

        lines.push('');
        lines.push(`Suites: ${results.numPassedTestSuites} passed, ${results.numFailedTestSuites} failed, ${results.numTotalTestSuites} total`);
        lines.push(`Tests: ${results.numPassedTests} passed, ${results.numFailedTests} failed, ${results.numPendingTests} skipped, ${results.numTotalTests} total`);
        lines.push('');

        process.stdout.write(`${lines.join('\n')}\n`);
    }
}

module.exports = ReadableFunctionalReporter;
