type SanityQuery = string

const bondBasicQuery: SanityQuery = '*[_type == "bond"]{_id, title, "slug": slug.current}'

function bondScheduleQuery(params: { slug: string }): SanityQuery {
  const slug = params.slug

  const query: SanityQuery = `*[_type == "bond" && slug.current == '${slug}'][0]{
    ...
    }`

  return query
}

const bondCouponQuery: SanityQuery =
  '*[_type == "bond"]{_id, title, issuer, coupon, maturityDate, "slug": slug.current, customCouponSchedule}'

const guidePagesQuery: SanityQuery = '*[_type == "guidePage"]{...}'

export { bondCouponQuery, bondScheduleQuery, bondBasicQuery, guidePagesQuery }
