import { StyleSheet } from "react-native";
import Colors from "../config/Colors";

export default StyleSheet.create({
  // layout
  container: {
    flex: 1,
    backgroundColor: Colors.White,
  },
  containerHorizontal: {
    flexDirection: "row",
    alignItems: "center",
  },
  row: {
    flex: 1,
    alignSelf: "stretch",
    flexDirection: "row",
  },
  cell: {
    flex: 1,
    alignSelf: "stretch",
  },
  // elements
  link: {
    color: Colors.Primary,
  },
  h1: {
    fontSize: 30,
    fontWeight: "bold",
  },
  h2: {
    fontSize: 25,
    fontWeight: "bold",
  },
  h3: {
    fontSize: 20,
  },
  // style
  i: {
    fontStyle: "italic",
  },
  b: {
    fontWeight: "bold",
  },
  hidden: {
    opacity: 0,
  },
  // spaces
  mr10: {
    marginRight: 10,
  },
  mla: {
    marginLeft: "auto",
  },
  ml10: {
    marginLeft: 10,
  },
  ml20: {
    marginLeft: 20,
  },
});
