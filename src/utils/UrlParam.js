const urlParam = (name, defaultValue) => {
  const queryString = window.location.search
  const value       = new URLSearchParams(queryString).get(name)

  return value || defaultValue
}

export default urlParam
