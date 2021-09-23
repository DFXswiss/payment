import { DefaultTheme } from "react-native-paper";
import Colors from "../config/Colors";

const AppTheme = DefaultTheme;
AppTheme.colors = {
  ...DefaultTheme.colors,
  ...{
    primary: Colors.Primary,
    accent: Colors.Primary,
    text: Colors.White,
    background: Colors.LightBlue,
    placeholder: Colors.Grey,
    surface: Colors.LightBlue,
    onSurface: Colors.LightBlue,
  },
};

export default AppTheme;
