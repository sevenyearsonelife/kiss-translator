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

DarkModeButton: A custom component for toggling dark mode (assumed to be defined elsewhere in the project).
可以学习下DarkModeButton代码，看一下是如何自定义一个组件的

JSX (JavaScript Syntax Extension): JSX is a syntax extension that allows you to write HTML-like code 
within JavaScript files, making the code more readable and expressive.

When defining a new component using Material-UI, you do not necessarily have to define it as a function. 
However, defining components as functions is a common and recommended practice in modern React development. 
*/

/*
js解构赋值语法：
function Header(props) {
  const setShowPopup = props.setShowPopup;
  // Use setShowPopup directly
}

function Header({ setShowPopup }) {
  // Use setShowPopup directly
}
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

/*
{setShowPopup ? ( ... ) : ( ... )}
In summary, the curly braces {} are used to evaluate and embed the result of the JavaScript conditional expression 
within the JSX, allowing for dynamic component rendering based on the setShowPopup prop.

困惑：setShowPopup函数是如何起作用的？
*/