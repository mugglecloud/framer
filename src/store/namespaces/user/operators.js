// @ts-ignore
import {catchError, map, mutate, run} from 'overmind'

export const reAuthenticate = () =>
  run(async ({effects}) => {
    await effects.api.reAuthenticate()
  })

export const handleAuthError = () =>
  catchError(({effects}) => {
    // effects.router.toLogin()
  })

export const login = () =>
  map(async ({effects}, values) => {
    return await effects.api.login({email: values.userName, password: values.password})
  })

export const handleLoginSuccess = () =>
  run(({effects}) => {
    effects.router.goBack()
  })

export const setAuthorityRoles = () =>
  run(({effects}, res) => {
    effects.user.setAuthority(res.user.roles)
  })

export const handleLoginError = () =>
  catchError(({state}, e) => {
    state.user.loginError = e
  })

// export const toLogin = () => run(({effects}) => effects.router.toLogin())
//
// export const getCaptcha = async ({state}) => {
//   state.user.captcha = Math.random().toString().substr(2, 4)
// }

export const getRoles = () => mutate(async ({effects, state}) => state.user.roles = effects.user.getAuthority())
