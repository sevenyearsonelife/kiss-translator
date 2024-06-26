import {
  APP_LCNAME,
  KV_SETTING_KEY,
  KV_RULES_KEY,
  KV_WORDS_KEY,
  KV_RULES_SHARE_KEY,
  KV_SALT_SHARE,
  OPT_SYNCTYPE_WEBDAV,
} from "../config";
import {
  getSyncWithDefault,
  updateSync,
  getSettingWithDefault,
  getRulesWithDefault,
  getWordsWithDefault,
  setSetting,
  setRules,
  setWords,
} from "./storage";
import { apiSyncData } from "../apis";
import { sha256, removeEndchar } from "./utils";
import { createClient, getPatcher } from "webdav";
import { fetchPatcher } from "./fetch";
import { kissLog } from "./log";

getPatcher().patch("request", (opts) => {
  return fetchPatcher(opts.url, {
    method: opts.method,
    headers: opts.headers,
    body: opts.data,
  });
});

const syncByWebdav = async (data, { syncUrl, syncUser, syncKey }) => {
  const client = createClient(syncUrl, {
    username: syncUser,
    password: syncKey,
  });
  const pathname = `/${APP_LCNAME}`;
  const filename = `/${APP_LCNAME}/${data.key}`;

  if ((await client.exists(pathname)) === false) {
    await client.createDirectory(pathname);
  }

  const isExist = await client.exists(filename);
  if (isExist) {
    const cont = await client.getFileContents(filename, { format: "text" });
    const webData = JSON.parse(cont);
    if (webData.updateAt >= data.updateAt) {
      return webData;
    }
  }

  await client.putFileContents(filename, JSON.stringify(data, null, 2));
  return data;
};

const syncByWorker = async (data, { syncUrl, syncKey }) => {
  syncUrl = removeEndchar(syncUrl, "/");
  return await apiSyncData(`${syncUrl}/sync`, syncKey, data);
};

const syncData = async (key, valueFn) => {
  const {
    syncType,
    syncUrl,
    syncUser,
    syncKey,
    syncMeta = {},
  } = await getSyncWithDefault();
  if (!syncUrl || !syncKey || (syncType === OPT_SYNCTYPE_WEBDAV && !syncUser)) {
    return;
  }

  let { updateAt = 0, syncAt = 0 } = syncMeta[key] || {};
  syncAt === 0 && (updateAt = 0);

  const value = await valueFn();
  const data = {
    key,
    value: JSON.stringify(value),
    updateAt,
  };
  const args = {
    syncUrl,
    syncUser,
    syncKey,
  };

  const res =
    syncType === OPT_SYNCTYPE_WEBDAV
      ? await syncByWebdav(data, args)
      : await syncByWorker(data, args);

  syncMeta[key] = {
    updateAt: res.updateAt,
    syncAt: Date.now(),
  };
  await updateSync({ syncMeta });

  return { value: JSON.parse(res.value), isNew: res.updateAt > updateAt };
};

/**
 * 同步设置
 * @returns
 */
const syncSetting = async () => {
  const res = await syncData(KV_SETTING_KEY, getSettingWithDefault);
  if (res?.isNew) {
    await setSetting(res.value);
  }
};

export const trySyncSetting = async () => {
  try {
    await syncSetting();
  } catch (err) {
    kissLog(err, "sync setting");
  }
};

/**
 * 同步规则
 * @returns
 */
const syncRules = async () => {
  const res = await syncData(KV_RULES_KEY, getRulesWithDefault);
  if (res?.isNew) {
    await setRules(res.value);
  }
};

export const trySyncRules = async () => {
  try {
    await syncRules();
  } catch (err) {
    kissLog(err, "sync user rules");
  }
};

/**
 * 同步词汇
 * @returns
 */
const syncWords = async () => {
  const res = await syncData(KV_WORDS_KEY, getWordsWithDefault);
  if (res?.isNew) {
    await setWords(res.value);
  }
};

export const trySyncWords = async () => {
  try {
    await syncWords();
  } catch (err) {
    kissLog(err, "sync fav words");
  }
};

/**
 * 同步分享规则
 * @param {*} param0
 * @returns
 */
export const syncShareRules = async ({ rules, syncUrl, syncKey }) => {
  const data = {
    key: KV_RULES_SHARE_KEY,
    value: JSON.stringify(rules, null, 2),
    updateAt: Date.now(),
  };
  const args = {
    syncUrl,
    syncKey,
  };
  await syncByWorker(data, args);
  const psk = await sha256(syncKey, KV_SALT_SHARE);
  const shareUrl = `${syncUrl}/rules?psk=${psk}`;
  return shareUrl;
};

/**
 * 同步个人设置和规则
 * @returns
 */
export const syncSettingAndRules = async () => {
  await syncSetting();
  await syncRules();
  await syncWords();
};

export const trySyncSettingAndRules = async () => {
  await trySyncSetting();
  await trySyncRules();
  await trySyncWords();
};
