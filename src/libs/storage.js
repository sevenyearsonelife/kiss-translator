import { browser, isExt, isGm } from "./browser";

async function set(key, val) {
  if (isExt) {
    await browser.storage.local.set({ [key]: val });
  } else if (isGm) {
    await (window.GM_setValue || window.GM.setValue)(key, val);
  } else {
    const oldValue = window.localStorage.getItem(key);
    window.localStorage.setItem(key, val);
    // 手动唤起事件
    window.dispatchEvent(
      new StorageEvent("storage", {
        key,
        oldValue,
        newValue: val,
      })
    );
  }
}

async function get(key) {
  if (isExt) {
    const val = await browser.storage.local.get([key]);
    return val[key];
  } else if (isGm) {
    const val = await (window.GM_getValue || window.GM.getValue)(key);
    return val;
  }
  return window.localStorage.getItem(key);
}

async function del(key) {
  if (isExt) {
    await browser.storage.local.remove([key]);
  } else if (isGm) {
    await (window.GM_deleteValue || window.GM.deleteValue)(key);
  } else {
    const oldValue = window.localStorage.getItem(key);
    window.localStorage.removeItem(key);
    // 手动唤起事件
    window.dispatchEvent(
      new StorageEvent("storage", {
        key,
        oldValue,
        newValue: null,
      })
    );
  }
}

async function setObj(key, obj) {
  await set(key, JSON.stringify(obj));
}

async function trySetObj(key, obj) {
  if (!(await get(key))) {
    await setObj(key, obj);
  }
}

async function getObj(key) {
  const val = await get(key);
  return val && JSON.parse(val);
}

async function putObj(key, obj) {
  const cur = (await getObj(key)) ?? {};
  await setObj(key, { ...cur, ...obj });
}

/**
 * 监听storage事件
 * @param {*} handleChanged
 */
function onChanged(handleChanged) {
  if (isExt) {
    browser.storage.onChanged.addListener(handleChanged);
  } else if (isGm) {
    (window.GM_addValueChangeListener || window.GM.addValueChangeListener)(
      "storage",
      handleChanged
    );
  } else {
    window.addEventListener("storage", handleChanged);
  }
}

/**
 * 对storage的封装
 */
const storage = {
  get,
  set,
  del,
  setObj,
  trySetObj,
  getObj,
  putObj,
  onChanged,
};

export default storage;
