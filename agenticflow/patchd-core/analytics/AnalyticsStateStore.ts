export interface AnalyticsState {
  trafficWeight: number;
  policyWeight: number;
  recoveryTimeMs?: number;
}

export class AnalyticsStateStore {
  private state: AnalyticsState = {
    trafficWeight: 1.0,
    policyWeight: 1.0,
  };

  snapshot(): AnalyticsState {
    return { ...this.state };
  }

  setTrafficWeight(trafficWeight: number): void {
    this.state = { ...this.state, trafficWeight };
  }

  setRecoveryTime(recoveryTimeMs: number): void {
    this.state = { ...this.state, recoveryTimeMs };
  }

  setPolicyWeight(policyWeight: number): void {
    this.state = { ...this.state, policyWeight };
  }
}
