import { QuotaRestRecord, QuotaStatus, AiProviderType } from '../types/enterprise';

export class AiQuotaManager {
  private activeResting: Map<string, QuotaRestRecord> = new Map();
  private history: QuotaRestRecord[] = [];
  private listeners: Array<() => void> = [];

  /**
   * Put an agent into Rest / Sleep mode when hitting a rate limit or 429 quota exhaustion.
   */
  public triggerRateLimit(
    agentId: string,
    agentName: string,
    characterKey: string,
    provider: AiProviderType = 'groq',
    cooldownSec: number = 60,
    reason: string = 'Đạt giới hạn TPM/RPM của nhà cung cấp AI, tạm nghỉ để bảo vệ hạn mức'
  ): QuotaRestRecord {
    const now = new Date();
    const cooldownDate = new Date(now.getTime() + cooldownSec * 1000);

    const record: QuotaRestRecord = {
      id: `rest-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      agentId,
      agentName,
      characterKey,
      provider,
      status: 'resting',
      triggeredAt: now.toISOString(),
      cooldownUntil: cooldownDate.toISOString(),
      durationSec: cooldownSec,
      reason,
      autoRecovered: false
    };

    this.activeResting.set(agentId, record);
    this.history.unshift(record);
    if (this.history.length > 50) this.history.pop();

    this.notify();
    return record;
  }

  /**
   * Check if an agent is currently resting/sleeping due to quota cooldown.
   * Automatically cleans up and recovers if the cooldown duration has passed.
   */
  public isAgentResting(agentId: string): boolean {
    const record = this.activeResting.get(agentId);
    if (!record) return false;

    const expiry = new Date(record.cooldownUntil).getTime();
    if (Date.now() >= expiry) {
      // Cooldown finished: agent is auto-recovered!
      record.status = 'recovered';
      record.autoRecovered = true;
      this.activeResting.delete(agentId);
      this.notify();
      return false;
    }

    return true;
  }

  /**
   * Get detailed resting status and remaining seconds for a given agent.
   */
  public getAgentRestStatus(agentId: string): {
    isResting: boolean;
    remainingSec: number;
    reason: string;
    provider: AiProviderType;
    record?: QuotaRestRecord;
  } | null {
    if (!this.isAgentResting(agentId)) {
      return null;
    }

    const record = this.activeResting.get(agentId)!;
    const expiry = new Date(record.cooldownUntil).getTime();
    const remainingSec = Math.max(0, Math.ceil((expiry - Date.now()) / 1000));

    return {
      isResting: true,
      remainingSec,
      reason: record.reason,
      provider: record.provider,
      record
    };
  }

  /**
   * Manually wake up an agent before the cooldown timer expires.
   */
  public wakeAgent(agentId: string): boolean {
    const record = this.activeResting.get(agentId);
    if (!record) return false;

    record.status = 'recovered';
    record.autoRecovered = false;
    this.activeResting.delete(agentId);
    this.notify();
    return true;
  }

  /**
   * Get all currently resting agents with updated remaining cooldown seconds.
   */
  public getAllRestingAgents(): Array<QuotaRestRecord & { remainingSec: number }> {
    const result: Array<QuotaRestRecord & { remainingSec: number }> = [];
    const now = Date.now();

    for (const [agentId, record] of Array.from(this.activeResting.entries())) {
      const expiry = new Date(record.cooldownUntil).getTime();
      if (now >= expiry) {
        record.status = 'recovered';
        record.autoRecovered = true;
        this.activeResting.delete(agentId);
      } else {
        const remainingSec = Math.ceil((expiry - now) / 1000);
        result.push({ ...record, remainingSec });
      }
    }

    return result;
  }

  /**
   * Get audit log history of rate-limit incidents.
   */
  public getQuotaHistory(): QuotaRestRecord[] {
    return [...this.history];
  }

  /**
   * Clear all records (useful for testing and reset).
   */
  public clearAll(): void {
    this.activeResting.clear();
    this.history = [];
    this.notify();
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notify() {
    this.listeners.forEach((l) => {
      try {
        l();
      } catch {
        // safe ignore
      }
    });
  }
}

export const quotaManager = new AiQuotaManager();
