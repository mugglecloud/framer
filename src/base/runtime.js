import installedModules from "./runtime-deps";

window.exports = window.exports || {};

const globalRequire = id => {
  return installedModules.get(id) || window.exports[id];
};

window.require = globalRequire;

class JModule {
  constructor(id, code, require) {
    this.id = id;
    this.code = code;
    this.require = require;

    this.exports = {};

    this.installed = false;
  }

  init() {
    if (typeof window === "undefined") return;
    // console.log(this.code);
    // eslint-disable-next-line
    let fn = new Function("module", "exports", "require", this.code || "");
    fn(this, this.exports, this.require);
  }
}

export function installPlugin(id, source) {
  let mod = installedModules.get(id);
  if (mod == null) {
    const m = new JModule(id, source, globalRequire);
    m.init();
    mod = m.exports;
    installedModules.set(id, mod);
  }
  return mod;
}
