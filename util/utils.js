export function padNumberWithZeros(number) {
  const paddedNumber = String(number).padStart(10, '0')
  return paddedNumber
}
