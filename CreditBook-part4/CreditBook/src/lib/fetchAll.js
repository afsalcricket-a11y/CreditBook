// Supabase returns max 1000 rows per request. This keeps asking until all rows are loaded.
export async function fetchAll(build) {
  let all = [], from = 0
  for (;;) {
    const { data, error } = await build().range(from, from + 999)
    if (error) throw error
    all = all.concat(data)
    if (data.length < 1000) return all
    from += 1000
  }
}
