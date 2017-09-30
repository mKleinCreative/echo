export default function pruneAutoLoad(loadedModules) {
  if (!loadedModules) {
    return
  }
  return Object.keys(loadedModules).reduce((result, name) => {
    if (!name.startsWith('_') && name !== 'index') {
      result[name] = loadedModules[name]
    }
    return result
  }, {})
}
