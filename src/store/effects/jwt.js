export function get() {
  return window.localStorage.getItem('jwt');
}

export function store(jwt) {
  window.localStorage.setItem('jwt', jwt);
}

export function reset() {
  window.localStorage.clear();
}