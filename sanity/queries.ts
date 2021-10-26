export type SanityQuery = string

const bondQuery: SanityQuery = '*[_type == "bond"]{_id, title}'

export default bondQuery
