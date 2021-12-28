export const formatDate = (date: string) => {
  const splitDate = date.split('-')

  return splitDate.reverse().join('/')
}

export const numberWithCommas = (x: number) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
