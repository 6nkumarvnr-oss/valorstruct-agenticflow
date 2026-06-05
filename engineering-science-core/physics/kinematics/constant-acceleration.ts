export interface ConstantAccelerationInput {
  initialVelocityMps: number;
  accelerationMps2: number;
  timeSec: number;
}

export function solveConstantAcceleration(input: ConstantAccelerationInput) {
  const finalVelocityMps = input.initialVelocityMps + input.accelerationMps2 * input.timeSec;
  const displacementM = input.initialVelocityMps * input.timeSec + 0.5 * input.accelerationMps2 * input.timeSec ** 2;
  return { ...input, finalVelocityMps: Number(finalVelocityMps.toFixed(6)), displacementM: Number(displacementM.toFixed(6)) };
}
