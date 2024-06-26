import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { useI18n } from "../../hooks/I18n";
import { useSync } from "../../hooks/Sync";
import Alert from "@mui/material/Alert";
import Link from "@mui/material/Link";
import MenuItem from "@mui/material/MenuItem";
import LoadingButton from "@mui/lab/LoadingButton";
import {
  URL_KISS_WORKER,
  OPT_SYNCTYPE_ALL,
  OPT_SYNCTYPE_WORKER,
  OPT_SYNCTYPE_WEBDAV,
} from "../../config";
import { useState } from "react";
import { syncSettingAndRules } from "../../libs/sync";
import { useAlert } from "../../hooks/Alert";
import SyncIcon from "@mui/icons-material/Sync";
import { useSetting } from "../../hooks/Setting";
import { kissLog } from "../../libs/log";

export default function SyncSetting() {
  const i18n = useI18n();
  const { sync, updateSync } = useSync();
  const alert = useAlert();
  const [loading, setLoading] = useState(false);
  const { reloadSetting } = useSetting();

  const handleChange = async (e) => {
    e.preventDefault();
    const { name, value } = e.target;
    await updateSync({
      [name]: value,
    });
  };

  const handleSyncTest = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await syncSettingAndRules();
      await reloadSetting();
      alert.success(i18n("sync_success"));
    } catch (err) {
      kissLog(err, "sync all");
      alert.error(i18n("sync_failed"));
    } finally {
      setLoading(false);
    }
  };

  if (!sync) {
    return;
  }

  const {
    syncType = OPT_SYNCTYPE_WORKER,
    syncUrl = "",
    syncUser = "",
    syncKey = "",
  } = sync;

  return (
    <Box>
      <Stack spacing={3}>
        <Alert severity="warning">{i18n("sync_warn")}</Alert>

        <TextField
          select
          size="small"
          name="syncType"
          value={syncType}
          label={i18n("data_sync_type")}
          onChange={handleChange}
        >
          {OPT_SYNCTYPE_ALL.map((item) => (
            <MenuItem key={item} value={item}>
              {item}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          size="small"
          label={i18n("data_sync_url")}
          name="syncUrl"
          value={syncUrl}
          onChange={handleChange}
          helperText={
            syncType === OPT_SYNCTYPE_WORKER && (
              <Link href={URL_KISS_WORKER} target="_blank">
                {i18n("about_sync_api")}
              </Link>
            )
          }
        />

        {syncType === OPT_SYNCTYPE_WEBDAV && (
          <TextField
            size="small"
            label={i18n("data_sync_user")}
            name="syncUser"
            value={syncUser}
            onChange={handleChange}
          />
        )}

        <TextField
          size="small"
          type="password"
          label={i18n("data_sync_key")}
          name="syncKey"
          value={syncKey}
          onChange={handleChange}
        />

        <Stack
          direction="row"
          alignItems="center"
          spacing={2}
          useFlexGap
          flexWrap="wrap"
        >
          <LoadingButton
            size="small"
            variant="contained"
            disabled={!syncUrl || !syncKey || loading}
            onClick={handleSyncTest}
            startIcon={<SyncIcon />}
            loading={loading}
          >
            {i18n("sync_now")}
          </LoadingButton>
        </Stack>
      </Stack>
    </Box>
  );
}
