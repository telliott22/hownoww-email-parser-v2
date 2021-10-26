export type SanityQuery = string
// export type SanityQueryWithParam = (param: { slug: string }) => SanityQuery

export const bondBasicQuery: SanityQuery = '*[_type == "bond"]{_id, title, "slug": slug.current}'

export function bondScheduleQuery(params: { slug: string }): SanityQuery {
  const slug = params.slug

  const query: SanityQuery = `*[_type == "bond" && slug.current == '${slug}'][0]{
    ...
    }`

  return query
}
