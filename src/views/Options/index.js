import { Routes, Route, HashRouter } from "react-router-dom";
import About from "./About";
import Rules from "./Rules";
import Setting from "./Setting";
import Layout from "./Layout";
import SyncSetting from "./SyncSetting";
import { SettingProvider } from "../../hooks/Setting";
import ThemeProvider from "../../hooks/Theme";
import { useEffect, useState } from "react";
import { isGm } from "../../libs/client";
import { sleep } from "../../libs/utils";
import CircularProgress from "@mui/material/CircularProgress";
import { trySyncSettingAndRules } from "../../libs/sync";
import { AlertProvider } from "../../hooks/Alert";
import Link from "@mui/material/Link";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import { adaptScript } from "../../libs/gm";
import Alert from "@mui/material/Alert";
import Apis from "./Apis";
import InputSetting from "./InputSetting";
import Tranbox from "./Tranbox";
import FavWords from "./FavWords";

export default function Options() {
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      if (isGm) {
        // 等待GM注入
        let i = 0;
        for (;;) {
          if (window?.APP_INFO?.name === process.env.REACT_APP_NAME) {
            const { version, eventName } = window.APP_INFO;

            // 检查版本是否一致
            if (version !== process.env.REACT_APP_VERSION) {
              setError(
                `The version of the local script(v${version}) is not the latest version(v${process.env.REACT_APP_VERSION}). 本地脚本之版本(v${version})非最新版(v${process.env.REACT_APP_VERSION})。`
              );
              return;
            }

            if (eventName) {
              // 注入GM接口
              adaptScript(eventName);
            }

            break;
          }

          if (++i > 8) {
            setError(
              "Time out. Please confirm whether to install or enable KISS Translator GreaseMonkey script? 连接超时，请检查是否安装或启用简约翻译油猴脚本。"
            );
            return;
          }

          await sleep(1000);
        }
      }

      // 同步数据
      await trySyncSettingAndRules();
      setReady(true);
    })();
  }, []);

  if (error) {
    return (
      <center>
        <Divider>
          <Link
            href={process.env.REACT_APP_HOMEPAGE}
          >{`KISS Translator v${process.env.REACT_APP_VERSION}`}</Link>
        </Divider>
        <Alert severity="error">{error}</Alert>
        <Stack spacing={2}>
          <Link href={process.env.REACT_APP_USERSCRIPT_DOWNLOADURL}>
            Install/Update Userscript for Tampermonkey/Violentmonkey
          </Link>
          <Link href={process.env.REACT_APP_USERSCRIPT_IOS_DOWNLOADURL}>
            Install/Update Userscript for iOS Safari
          </Link>
        </Stack>
      </center>
    );
  }

  if (!ready) {
    return (
      <center>
        <Divider>
          <Link
            href={process.env.REACT_APP_HOMEPAGE}
          >{`KISS Translator v${process.env.REACT_APP_VERSION}`}</Link>
        </Divider>
        <CircularProgress />
      </center>
    );
  }

  // 设置页面的整体布局
  return (
    <SettingProvider>
      <ThemeProvider>
        <AlertProvider>
          <HashRouter>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Setting />} />
                <Route path="rules" element={<Rules />} />
                <Route path="input" element={<InputSetting />} />
                <Route path="tranbox" element={<Tranbox />} />
                <Route path="apis" element={<Apis />} />
                <Route path="sync" element={<SyncSetting />} />
                <Route path="words" element={<FavWords />} />
                <Route path="about" element={<About />} />
              </Route>
            </Routes>
          </HashRouter>
        </AlertProvider>
      </ThemeProvider>
    </SettingProvider>
  );
}
