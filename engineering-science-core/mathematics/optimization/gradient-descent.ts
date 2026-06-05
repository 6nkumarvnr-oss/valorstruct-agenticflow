export interface GradientDescentInput {
  initialX: number;
  learningRate: number;
  iterations: number;
  gradient: (x: number) => number;
}

export function gradientDescent(input: GradientDescentInput) {
  let x = input.initialX;
  for (let iteration = 0; iteration < input.iterations; iteration += 1) x -= input.learningRate * input.gradient(x);
  return { optimumX: Number(x.toFixed(6)), iterations: input.iterations };
}
