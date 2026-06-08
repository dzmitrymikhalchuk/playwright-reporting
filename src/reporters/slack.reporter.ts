import { readFileSync, existsSync } from "fs";
import { join } from "path";

interface TestStats {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  passRate: number;
}

interface FailedTest {
  name: string;
  classname: string;
  time: string;
  failure?: string;
}

class SlackReporter {
  private testStats: TestStats = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    duration: 0,
    passRate: 0,
  };

  private failedTests: FailedTest[] = [];

  private parseJUnitXML(xmlPath: string): void {
    if (!existsSync(xmlPath)) {
      throw new Error(`JUnit XML file not found: ${xmlPath}`);
    }

    const xmlContent = readFileSync(xmlPath, "utf-8");
    const tag = xmlContent.match(/<testsuites[^>]*>/)?.[0] ?? xmlContent.match(/<testsuite[^>]*>/)?.[0];

    if (tag) {
      const n = (re: RegExp) => parseInt(tag.match(re)?.[1] ?? "0", 10);
      const f = (re: RegExp) => parseFloat(tag.match(re)?.[1] ?? "0");

      this.testStats.total = n(/tests="(\d+)"/);
      this.testStats.failed = n(/failures="(\d+)"/) + n(/errors="(\d+)"/);
      this.testStats.skipped = n(/skipped="(\d+)"/);
      this.testStats.duration = f(/time="([\d.]+)"/);
      this.testStats.passed = this.testStats.total - this.testStats.failed - this.testStats.skipped;
      this.testStats.passRate =
        this.testStats.total > 0 ? Math.round((this.testStats.passed / this.testStats.total) * 100) : 0;
    }

    for (const match of xmlContent.matchAll(/<testcase[^>]*>(.*?)<\/testcase>/gs)) {
      const tc = match[0];
      if (!tc.includes("<failure") && !tc.includes("<error")) continue;

      this.failedTests.push({
        name: tc.match(/name="([^"]*)"/)?.[1] ?? "Unknown",
        classname: tc.match(/classname="([^"]*)"/)?.[1] ?? "Unknown",
        time: tc.match(/time="([^"]*)"/)?.[1] ?? "0",
        failure: (
          tc.match(/<failure[^>]*>(.*?)<\/failure>/s)?.[1] ??
          tc.match(/<error[^>]*>(.*?)<\/error>/s)?.[1]
        )?.substring(0, 200),
      });
    }
  }

  async sendSlackNotification(): Promise<void> {
    if (process.env.CI !== "true") {
      console.log("Not in CI environment. Skipping Slack notification.");
      return;
    }

    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (!webhookUrl) {
      console.warn("SLACK_WEBHOOK_URL is not set. Skipping Slack notification.");
      return;
    }

    const isSuccess = this.testStats.failed === 0;
    const statusIcon = this.testStats.failed > 0 ? "❌" : this.testStats.total > 0 ? "✅" : "⚠️";
    const statusColor = isSuccess ? "#36a64f" : "#ff0000";
    const durationFormatted = this.formatDuration(this.testStats.duration * 1000);
    const passRateBar = this.getPassRateBar(this.testStats.passRate);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const blocks: any[] = [
      {
        type: "header",
        text: { type: "plain_text", text: `${statusIcon} E2E Regression Report` },
      },
      {
        type: "context",
        elements: [
          { type: "mrkdwn", text: `🔀 *${this.getBranchName()}*` },
          { type: "mrkdwn", text: `by @${this.getStartedBy()}` },
          { type: "mrkdwn", text: `⏱ ${durationFormatted}` },
        ],
      },
      { type: "divider" },
      {
        type: "section",
        text: { type: "mrkdwn", text: `*Pass Rate:* ${passRateBar}` },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `▶️ *${this.testStats.total}* total   ✅ *${this.testStats.passed}* passed   ❌ *${this.testStats.failed}* failed   ⏭ *${this.testStats.skipped}* skipped`,
        },
      },
    ];

    if (this.failedTests.length > 0) {
      blocks.push({ type: "divider" });
      blocks.push({
        type: "section",
        text: { type: "mrkdwn", text: `*❌ Failed Tests (${this.failedTests.length}):*` },
      });

      const list = this.failedTests
        .slice(0, 5)
        .map((t) => `• \`${t.classname}\` → ${t.name} (${t.time}s)`)
        .join("\n");

      blocks.push({ type: "section", text: { type: "mrkdwn", text: list } });

      if (this.failedTests.length > 5) {
        blocks.push({
          type: "context",
          elements: [{ type: "mrkdwn", text: `_... and ${this.failedTests.length - 5} more. See full report._` }],
        });
      }
    }

    const allureUrl = process.env.ALLURE_REPORT_URL ?? null;
    const pwUrl = process.env.PW_REPORT_URL ?? null;
    const lineUrl = process.env.LINE_REPORT_URL ?? null;
    const actionsUrl = this.getActionsUrl();

    if (allureUrl || pwUrl || lineUrl || actionsUrl) {
      blocks.push({ type: "divider" });
      blocks.push({
        type: "actions",
        elements: [
          ...(allureUrl
            ? [{ type: "button", text: { type: "plain_text", text: "📊 Allure Report" }, url: allureUrl, style: "primary" }]
            : []),
          ...(pwUrl
            ? [{ type: "button", text: { type: "plain_text", text: "🎭 Playwright Report" }, url: pwUrl }]
            : []),
          ...(lineUrl
            ? [{ type: "button", text: { type: "plain_text", text: "📄 Line Report" }, url: lineUrl }]
            : []),
          ...(actionsUrl
            ? [{ type: "button", text: { type: "plain_text", text: "⚙️ GitHub Actions" }, url: actionsUrl }]
            : []),
        ],
      });
    }

    const message = {
      text: `Playwright Tests ${isSuccess ? "Passed ✅" : "Failed ❌"} — ${this.testStats.passRate}% (${this.testStats.passed}/${this.testStats.total})`,
      blocks,
      attachments: [{ color: statusColor }],
    };

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      console.error(`Failed to send Slack notification: ${response.status} ${response.statusText}`);
      process.exit(1);
    }

    console.log(`Slack sent: ${this.testStats.passed}/${this.testStats.total} passed (${this.testStats.passRate}%)`);
  }

  private getPassRateBar(passRate: number): string {
    const filled = Math.round(passRate / 10);
    const empty = 10 - filled;
    return `${"█".repeat(filled)}${"░".repeat(empty)} *${passRate}%*`;
  }

  private formatDuration(ms: number): string {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    if (h > 0) return `${h}h ${m % 60}m ${s % 60}s`;
    if (m > 0) return `${m}m ${s % 60}s`;
    return `${s}s`;
  }

  private getStartedBy(): string {
    return process.env.GITHUB_ACTOR ?? "CI/CD";
  }

  private getBranchName(): string {
    return process.env.GITHUB_REF_NAME ?? process.env.BRANCH_NAME ?? "N/A";
  }

  private getActionsUrl(): string | null {
    const repo = process.env.GITHUB_REPOSITORY;
    const runId = process.env.GITHUB_RUN_ID;
    return repo && runId ? `https://github.com/${repo}/actions/runs/${runId}` : null;
  }

  public async run(junitXmlPath?: string): Promise<void> {
    const xmlPath = junitXmlPath ?? process.env.JUNIT_XML_PATH ?? join(process.cwd(), "test-results/results.xml");
    this.parseJUnitXML(xmlPath);
    await this.sendSlackNotification();
  }
}

const reporter = new SlackReporter();
reporter.run(process.argv[2]).catch(() => process.exit(1));

export { SlackReporter };
