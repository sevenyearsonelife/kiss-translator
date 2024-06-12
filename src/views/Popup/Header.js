import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import HomeIcon from "@mui/icons-material/Home";
import Stack from "@mui/material/Stack";
import DarkModeButton from "../Options/DarkModeButton";
import Typography from "@mui/material/Typography";

// 这就是翻译弹出窗口

export default function Header({ setShowPopup }) {
  const handleHomepage = () => {
    window.open(process.env.REACT_APP_HOMEPAGE, "_blank");
  };

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      spacing={2}
    >
      <Stack direction="row" justifyContent="flex-start" alignItems="center">
        <IconButton onClick={handleHomepage}>
          <HomeIcon />
        </IconButton>
        <Typography
          component="div"
          sx={{
            userSelect: "none",
            WebkitUserSelect: "none",
            fontWeight: "bold",
          }}
        >
          {`${process.env.REACT_APP_NAME} v${process.env.REACT_APP_VERSION}`}
        </Typography>
      </Stack>

      {setShowPopup ? (
        <IconButton
          onClick={() => {
            setShowPopup(false);
          }}
        >
          <CloseIcon />
        </IconButton>
      ) : (
        <DarkModeButton />
      )}
    </Stack>
  );
}
