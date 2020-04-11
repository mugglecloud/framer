export const loginSuccess = async ({ state, effects }, data) => {
  try {
    Object.assign(state.user, data);

    effects.jwt.store(data.jwt);
    effects.browser.reload();
  } catch (error) {
    console.log("An error occurred:", error);
  }
};

export const loginWithGithub = async ({ state, effects }, host = "") => {
  const popup = effects.browser.openPopup(`${host}/connect/github`, "sign in");

  return effects.browser.waitForMessage("signin").then(data => {
    Object.assign(state.user, data);
    popup.close();

    if (state.user.error) {
      throw state.user.error;
    } else {
      effects.jwt.store(state.user.jwt);
      effects.browser.reload();
    }
  });
};

export const logout = ({ state, effects }) => {
  state.user = {};
  effects.jwt.reset();
  effects.browser.reload();
};
