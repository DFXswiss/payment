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
  containerHorizontalWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
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
  error: {
    backgroundColor: Colors.Error,
    padding: 10,
    borderRadius: 5,
  },
  textError: {
    color: Colors.Error,
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
  noDisplay: {
    display: "none",
  },
  transparent: {
    opacity: 0.3,
  },
  center: {
    textAlign: "center",
  },
  // spaces
  mra: {
    marginRight: "auto",
  },
  mr10: {
    marginRight: 10,
  },
  mr20: {
    marginRight: 20,
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
  // form
  label: {
    paddingVertical: 5,
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.Grey,
  },
  control: {
    borderStyle: "solid",
    borderWidth: 1,
    borderRadius: 5,
    borderColor: Colors.Grey,
    paddingVertical: 5,
    paddingLeft: 5,
    height: 40,
    color: Colors.Black,
    fontSize: 14,
  },
  controlDisabled: {
    color: Colors.Grey,
    backgroundColor: Colors.LightGrey,
  },
});
