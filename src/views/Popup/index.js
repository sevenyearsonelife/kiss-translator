import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import MenuItem from "@mui/material/MenuItem";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Button from "@mui/material/Button";
import { sendBgMsg, sendTabMsg, getCurTab } from "../../libs/msg";
import { browser } from "../../libs/browser";
import { isExt } from "../../libs/client";
import { useI18n } from "../../hooks/I18n";
import TextField from "@mui/material/TextField";
import Divider from "@mui/material/Divider";
import Header from "./Header";
import {
  MSG_TRANS_TOGGLE,
  MSG_TRANS_GETRULE,
  MSG_TRANS_PUTRULE,
  MSG_OPEN_OPTIONS,
  MSG_SAVE_RULE,
  MSG_COMMAND_SHORTCUTS,
  OPT_TRANS_ALL,
  OPT_LANGS_FROM,
  OPT_LANGS_TO,
  OPT_STYLE_ALL,
} from "../../config";
import { sendIframeMsg } from "../../libs/iframe";
import { saveRule } from "../../libs/rules";
import { tryClearCaches } from "../../libs";
import { kissLog } from "../../libs/log";

/*
const props = {
  setShowPopup: () => console.log('Popup shown'),
  translator: 'Google Translate'
};

function Popup({ setShowPopup, translator: tran }) {
  console.log(setShowPopup); // Logs the function
  console.log(tran); // Logs 'Google Translate'
}

Popup(props);
*/
export default function Popup({ setShowPopup, translator: tran }) {

  const i18n = useI18n();
  const [rule, setRule] = useState(tran?.rule);
  const [commands, setCommands] = useState({});

  const handleOpenSetting = () => {
    if (!tran) {
      browser?.runtime.openOptionsPage();
    } else if (isExt) {
      sendBgMsg(MSG_OPEN_OPTIONS);
    } else {
      window.open(process.env.REACT_APP_OPTIONSPAGE, "_blank");
    }
    setShowPopup && setShowPopup(false);
  };

  const handleTransToggle = async (e) => {
    try {
      setRule({ ...rule, transOpen: e.target.checked ? "true" : "false" });

      if (!tran) {
        await sendTabMsg(MSG_TRANS_TOGGLE);
      } else {
        tran.toggle();
        sendIframeMsg(MSG_TRANS_TOGGLE);
      }
    } catch (err) {
      kissLog(err, "toggle trans");
    }
  };

  const handleChange = async (e) => {
    try {
      const { name, value } = e.target;
      setRule((pre) => ({ ...pre, [name]: value }));

      if (!tran) {
        await sendTabMsg(MSG_TRANS_PUTRULE, { [name]: value });
      } else {
        tran.updateRule({ [name]: value });
        sendIframeMsg(MSG_TRANS_PUTRULE, { [name]: value });
      }
    } catch (err) {
      kissLog(err, "update rule");
    }
  };

  const handleClearCache = () => {
    tryClearCaches();
  };

  const handleSaveRule = async () => {
    try {
      let href = window.location.href;
      if (!tran) {
        const tab = await getCurTab();
        href = tab.url;
      }
      const newRule = { ...rule, pattern: href.split("/")[2] };
      if (isExt && tran) {
        sendBgMsg(MSG_SAVE_RULE, newRule);
      } else {
        saveRule(newRule);
      }
    } catch (err) {
      kissLog(err, "save rule");
    }
  };

  useEffect(() => {
    if (tran) {
      return;
    }
    (async () => {
      try {
        const res = await sendTabMsg(MSG_TRANS_GETRULE);
        if (!res.error) {
          setRule(res.data);
        }
      } catch (err) {
        kissLog(err, "query rule");
      }
    })();
  }, [tran]);

  useEffect(() => {
    (async () => {
      try {
        const commands = {};
        if (isExt) {
          const res = await sendBgMsg(MSG_COMMAND_SHORTCUTS);
          res.forEach(({ name, shortcut }) => {
            commands[name] = shortcut;
          });
        } else {
          const shortcuts = tran.setting.shortcuts;
          if (shortcuts) {
            Object.entries(shortcuts).forEach(([key, val]) => {
              commands[key] = val.join("+");
            });
          }
        }
        setCommands(commands);
      } catch (err) {
        kissLog(err, "query cmds");
      }
    })();
  }, [tran]);


  // 在某些页面确实会返回这个UI
  // rule和tran是否有值会决定这个UI的显现与否
  // rule和tran归根结底是输入参数
  // 在某些页面打开popup，其输入参数会不一样
  if (!rule) {
    return (
      <Box minWidth={300}>
        {!tran && (
          <>
            <Header />
            <Divider />
          </>
        )}
        <Stack sx={{ p: 2 }} spacing={3}>
          <Button variant="text" onClick={handleOpenSetting}>
            {i18n("setting")}
          </Button>
        </Stack>
      </Box>
    );
  }

  // 修改rule的默认值
  rule.translator = "Google";
  rule.fromLang = "auto";
  rule.toLang = "zh-CN";
  rule.textStyle = "style_none";
  
  // 使得修改后的rule立马生效
const updateRule = () => {
  const newRule = {
    ...rule,
    translator: "Google",
    fromLang: "auto",
    toLang: "zh-CN",
    textStyle: "style_none"
  };
  saveRule(newRule);
};
updateRule();

  const { transOpen, translator, fromLang, toLang, textStyle } = rule;
  // console.log("---linus---:");
  // console.log("transOpen:", transOpen);
  // console.log("translator:", translator);
  // console.log("fromLang:", fromLang);
  // console.log("toLang:", toLang);
  // console.log("textStyle:", textStyle);
  
  // console.log(typeof transOpen);
  // console.log(typeof translator);
  // console.log(typeof fromLang);
  // console.log(typeof toLang);
  // console.log(typeof textStyle);

  console.log(rule);
  console.log(typeof rule)

  return (
    <Box minWidth={300}>
      {!tran && (
        <>
          <Header />
          <Divider />
        </>
      )}
      <Stack sx={{ p: 2 }} spacing={2}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
        >
          <FormControlLabel
            control={
              <Switch
                checked={transOpen === "true"}
                onChange={handleTransToggle}
              />
            }
            label={
              commands["toggleTranslate"]
                ? `${i18n("translate_alt")}(${commands["toggleTranslate"]})`
                : i18n("translate_alt")
            }
          />
        </Stack>

        <TextField
          select
          SelectProps={{ MenuProps: { disablePortal: true } }}
          size="small"
          value={translator}
          name="translator"
          label={i18n("translate_service")}
          onChange={handleChange}
        >
          {OPT_TRANS_ALL.map((item) => (
            <MenuItem key={item} value={item}>
              {item}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          SelectProps={{ MenuProps: { disablePortal: true } }}
          size="small"
          value={fromLang}
          name="fromLang"
          label={i18n("from_lang")}
          onChange={handleChange}
        >
          {OPT_LANGS_FROM.map(([lang, name]) => (
            <MenuItem key={lang} value={lang}>
              {name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          SelectProps={{ MenuProps: { disablePortal: true } }}
          size="small"
          value={toLang}
          name="toLang"
          label={i18n("to_lang")}
          onChange={handleChange}
        >
          {OPT_LANGS_TO.map(([lang, name]) => (
            <MenuItem key={lang} value={lang}>
              {name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          SelectProps={{ MenuProps: { disablePortal: true } }}
          size="small"
          value={textStyle}
          name="textStyle"
          label={
            commands["toggleStyle"]
              ? `${i18n("text_style_alt")}(${commands["toggleStyle"]})`
              : i18n("text_style_alt")
          }
          onChange={handleChange}
        >
          {OPT_STYLE_ALL.map((item) => (
            <MenuItem key={item} value={item}>
              {i18n(item)}
            </MenuItem>
          ))}
        </TextField>

        {/* {OPT_STYLE_USE_COLOR.includes(textStyle) && (
          <TextField
            size="small"
            name="bgColor"
            value={bgColor}
            label={i18n("bg_color")}
            onChange={handleChange}
          />
        )} */}

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
        >
          <Button variant="text" onClick={handleSaveRule}>
            {i18n("save_rule")}
          </Button>
          {/*!isExt && (
            <Button variant="text" onClick={handleClearCache}>
              {i18n("clear_cache")}
            </Button>
          )*/}
          {true && (
            <Button variant="text" onClick={handleClearCache}>
              {i18n("clear_cache")}
            </Button>
          )}
          <Button variant="text" onClick={handleOpenSetting}>
            {i18n("setting")}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
