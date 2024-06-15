import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import HomeIcon from "@mui/icons-material/Home";
import Stack from "@mui/material/Stack";
import DarkModeButton from "../Options/DarkModeButton";
import Typography from "@mui/material/Typography";

// 这就是翻译弹出窗口的header部分

/*
该代码是一个名为 Header 的 React 组件，它使用 Material-UI (MUI) 组件构建了一个弹出窗口的标题栏。
标题栏包含一个主页按钮、一个标题，以及根据 setShowPopup 的状态显示的关闭按钮或深色模式切换按钮。

Stack: A layout component for arranging elements in a row or column.
HomeIcon: An icon representing a home action.
Typography: A component for displaying text with various styles.
*/

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
            color: "green", // 设置颜色
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
