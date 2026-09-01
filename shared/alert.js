import { execFile } from 'child_process';
import { createHash } from 'crypto';

const COOLDOWN_MS = 5 * 60 * 1000;
const sentAlerts = new Map();

function fingerprint(subject) {
    return createHash('md5').update(subject).digest('hex');
}

function isThrottled(key) {
    const lastSent = sentAlerts.get(key);
    if (lastSent && Date.now() - lastSent < COOLDOWN_MS) {
        return true;
    }
    return false;
}

function markSent(key) {
    sentAlerts.set(key, Date.now());
}

setInterval(() => {
    const now = Date.now();
    for (const [key, timestamp] of sentAlerts) {
        if (now - timestamp > COOLDOWN_MS * 2) {
            sentAlerts.delete(key);
        }
    }
}, COOLDOWN_MS);

export function sendAlert(subject, body) {
    const alertTo = process.env.ALERT_EMAIL_TO || 'site.islam.ms@gmail.com';
    const alertFrom = process.env.ALERT_EMAIL_FROM || 'alerts@mail.islam.ms';
    const alertEnabled = process.env.ALERT_ENABLED !== 'false';

    if (!alertEnabled) return;

    const fp = fingerprint(subject);
    if (isThrottled(fp)) return;
    markSent(fp);

    const hostname = process.env.HOSTNAME || 'vmi3427337';
    const fullSubject = `[${hostname}] ${subject}`;
    const timestamp = new Date().toISOString();
    const bodyWithTime = `Time: ${timestamp}\nHost: ${hostname}\n\n${body}`;

    const message = [
        `From: ${alertFrom}`,
        `To: ${alertTo}`,
        `Subject: ${fullSubject}`,
        `Content-Type: text/plain; charset=utf-8`,
        ``,
        bodyWithTime
    ].join('\r\n');

    const child = execFile('/usr/sbin/sendmail', ['-t'], (err) => {
        if (err) {
            console.error('Failed to send alert email:', err.message);
        }
    });

    child.stdin.write(message);
    child.stdin.end();
}
