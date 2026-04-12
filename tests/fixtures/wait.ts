export async function wait(ms = 17) {
  await new Promise(res => setTimeout(res, ms))
}
